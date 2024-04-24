import { utils } from '@coral-xyz/anchor';
import { associatedAddress } from '@coral-xyz/anchor/dist/cjs/utils/token';
import { Metadata, Nft } from '@metaplex-foundation/js';
import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { findProgramAddressSync } from '@project-serum/anchor/dist/cjs/utils/pubkey';
import * as spl from '@solana/spl-token';
import { ComputeBudgetProgram, PublicKey, Transaction } from '@solana/web3.js';
import axios from 'axios';
import { SolanaProvider } from 'src/solana-provider/solana-provider';
import { StakeDetail } from 'src/types/global.types';
import { PaginateQuery } from 'src/types/paginate.types';
import { chunkArray } from 'src/util/chunk.util';
import { paginate } from 'src/util/paginate.util';
import { CalculateReward } from './dto/calculate-reward.dto';
import { ClaimAllDto } from './dto/claimAll.dto';
import { GetUserNFTsDto } from './dto/nfts-list.dto';
import { StakeDto } from './dto/stake.dto';
import { StackedNFTsList } from './dto/staked-nfts-list.dto';
import { UnStakeDto } from './dto/unStake.dto';

@Injectable()
export class NftsService {
  constructor(private readonly solanaProvider: SolanaProvider) {}

  async getNFTList(userPublicKey: string) {
    const { metaplex } = this.solanaProvider;
    const owner = new PublicKey(userPublicKey);
    const allNFTs = (await metaplex
      .nfts()
      .findAllByOwner({ owner })) as Metadata[];

    const furryCollections = allNFTs.filter(
      (nft) =>
        nft.collection?.address.toString() === process.env.COLLECTION_ADDRESS,
    ) as Metadata[];

    return furryCollections;
  }

  async getStakedNFTsList(userPublicKey: string) {
    const { connection, programID, program, metaplex } = this.solanaProvider;
    const owner = new PublicKey(userPublicKey);
    const records = await connection.getProgramAccounts(programID, {
      filters: [
        {
          memcmp: {
            offset: 8,
            bytes: owner.toBase58(),
          },
        },
      ],
    });

    const addresses = records
      .map((records) => records.pubkey)
      .filter(
        (address) =>
          address.toBase58() !== 'G1FuBDRsuMH88wpbFu3nMzHMsm9TtBEmQRKPSwCVhfGd',
      );

    const StakingDetails = (await program.account.stakingRecord
      .fetchMultiple(addresses)
      .catch((err) => {
        console.log({ err: err.message });
      })
      .then((res) => res)) as StakeDetail[];

    let mintAddresses: PublicKey[] = StakingDetails.map((det) => det.nftMint);

    let stakedNfts: Metadata[] = [];

    await metaplex
      .nfts()
      .findAllByMintList({ mints: mintAddresses })
      .then((res: Metadata[]) => (stakedNfts = res))
      .catch((err) => {
        console.log(err.message);
      });

    return stakedNfts;
  }

  async getNftDetail(mint: PublicKey) {
    const { programID, STAKING_DETAILS, program } = this.solanaProvider;

    const [staking_record] = PublicKey.findProgramAddressSync(
      [
        utils.bytes.utf8.encode('staking-record'),
        STAKING_DETAILS.toBytes(),
        mint.toBytes(),
      ],
      programID,
    );
    const data = (await program.account.stakingRecord
      .fetch(staking_record)
      .then((res) => res)) as StakeDetail;
    return data;
  }

  async nftList(dto: GetUserNFTsDto, paginateQuery: PaginateQuery) {
    const userNftsWithMetaData: Nft[] = [];
    const furryCollections = await this.getNFTList(dto.up);

    const { data: paginatedNFTs, meta } = paginate(
      furryCollections,
      paginateQuery,
    );

    for (const metadata of paginatedNFTs) {
      try {
        await axios
          .get(metadata.uri)
          .then((res) => res.data)
          .then((res: Nft) => userNftsWithMetaData.push(res));
      } catch (error) {
        throw new InternalServerErrorException(error.message);
      }
    }

    return {
      message: 'success',
      data: userNftsWithMetaData,
      meta,
    };
  }

  async stakedNFTsList(dto: StackedNFTsList, paginateQuery: PaginateQuery) {
    const userStakedNftsWithMetaData = [];
    const stakedNfts = await this.getStakedNFTsList(dto.up);
    const { data: paginatedStakedNFTs, meta } = paginate(
      stakedNfts,
      paginateQuery,
    );

    for (const metadata of paginatedStakedNFTs as Metadata[]) {
      try {
        const nftDetail = await this.getNftDetail(metadata.mintAddress).catch(
          (err) => {
            throw new InternalServerErrorException(err.message);
          },
        );
        await axios
          .get(metadata.uri)
          .then((res) => res.data)
          .then((res: Nft) =>
            userStakedNftsWithMetaData.push({ ...res, detail: nftDetail }),
          );
      } catch (error) {
        throw new InternalServerErrorException(error.message);
      }
    }

    return {
      message: 'success',
      data: userStakedNftsWithMetaData,
      meta,
    };
  }

  async calculateReward(dto: CalculateReward) {
    let total = 0;
    const BASE_REWARD = process.env.BASE_REWARD || 500;
    const DECIMAL = process.env.DECIMAL || 5;
    const decimalNumber = Math.pow(10, +DECIMAL);
    const stakedNfts = await this.getStakedNFTsList(dto.up);
    for (const nft of stakedNfts) {
      try {
        const nftDetail = await this.getNftDetail(nft.mintAddress);
        if (nftDetail) {
          const lastClaimed = nftDetail.lastClaimed.toNumber() * 1000; // Convert to milliseconds
          const now = new Date().getTime();
          const base = +BASE_REWARD * nftDetail.stakingPeriod;
          const timeElapsedInSeconds = Math.max(now - lastClaimed, 0) / 1000; // Ensure non-negative time elapsed
          const calculatedReward = base * timeElapsedInSeconds;
          total += calculatedReward;
        }
      } catch (error) {
        console.error('Error fetching NFT detail:', error);
      }
    }

    return {
      message: 'success',
      data: {
        reward: total / decimalNumber,
      },
    };
  }

  async unStake(dto: UnStakeDto) {
    const { nftName, up: pubkey } = dto;
    const owner = new PublicKey(pubkey);

    const {
      STAKING_DETAILS,
      programID,
      metaplex,
      TOKEN_MINT_ACCOUNT,
      METADATA_PROGRAM,
      program,
      AUTH_PROGRAM,
      SYSVARINSTRUCTIONS,
      connection,
    } = this.solanaProvider;
    const stakedNfts = await this.getStakedNFTsList(pubkey);
    const [nft_authority] = PublicKey.findProgramAddressSync(
      [utils.bytes.utf8.encode('nft-authority'), STAKING_DETAILS.toBytes()],
      programID,
    );

    const nft = stakedNfts.find((nft) => nft.name === nftName);

    if (!nft || !owner) {
      throw new NotFoundException('Nft Not Found');
    }
    const nft_mint = new PublicKey(nft.mintAddress);
    const nft_By_mint = (await metaplex
      .nfts()
      .findByMint({ mintAddress: nft_mint })) as Nft;

    const nft_custody = await spl.getAssociatedTokenAddress(
      nft_mint,
      nft_authority,
      true,
    );
    const [staking_record] = PublicKey.findProgramAddressSync(
      [
        utils.bytes.utf8.encode('staking-record'),
        STAKING_DETAILS.toBytes(),
        nft_mint.toBytes(),
      ],
      programID,
    );
    const [token_authority] = findProgramAddressSync(
      [utils.bytes.utf8.encode('token-authority'), STAKING_DETAILS.toBytes()],
      programID,
    );

    const nft_token = await associatedAddress({
      mint: nft_mint,
      owner,
    });

    const user_token_address = await associatedAddress({
      mint: TOKEN_MINT_ACCOUNT,
      owner,
    });

    const [token_record] = findProgramAddressSync(
      [
        utils.bytes.utf8.encode('metadata'),
        new PublicKey(METADATA_PROGRAM).toBytes(),
        nft_mint.toBytes(),
        utils.bytes.utf8.encode('token_record'),
        nft_custody.toBytes(),
      ],
      new PublicKey(METADATA_PROGRAM),
    );

    const [token_record_dest] = findProgramAddressSync(
      [
        utils.bytes.utf8.encode('metadata'),
        new PublicKey(METADATA_PROGRAM).toBytes(),
        nft_mint.toBytes(),
        utils.bytes.utf8.encode('token_record'),
        nft_token.toBytes(),
      ],
      new PublicKey(METADATA_PROGRAM),
    );

    const token_account = associatedAddress({
      mint: TOKEN_MINT_ACCOUNT,
      owner,
    });

    const tr = new Transaction();
    const claimInstruction = await program.methods
      .claim()
      .accounts({
        stakeDetails: STAKING_DETAILS,
        stakingRecord: staking_record,
        rewardMint: TOKEN_MINT_ACCOUNT,
        rewardReceiveAccount: token_account,
        tokenAuthority: token_authority,
      })
      .instruction();
    const tx = await program.methods
      .unstake()
      .accounts({
        nftMetadata: nft_By_mint.metadataAddress,
        nftEdition: nft_By_mint.edition.address,
        stakeDetails: STAKING_DETAILS,
        stakingRecord: staking_record,
        nftAuthority: nft_authority,
        nftCustody: nft_custody,
        nftMint: nft_mint,
        nftReceiveAccount: nft_token,
        tokenRecord: token_record,
        tokenRecordDest: token_record_dest,
        metadataProgram: METADATA_PROGRAM,
        authRules: nft.programmableConfig?.ruleSet,
        authProgram: AUTH_PROGRAM,
        sysvarInstructions: SYSVARINSTRUCTIONS,
        //@ts-ignore
        rewardMint: TOKEN_MINT_ACCOUNT,
        rewardReceiveAccount: user_token_address,
        tokenAuthority: token_authority,
      })
      .instruction();

    tr.add(ComputeBudgetProgram.setComputeUnitLimit({ units: 300000 }));
    tr.add(claimInstruction);
    tr.add(tx);
    tr.feePayer = new PublicKey(owner);
    const recentBlockHash = await connection.getLatestBlockhash({
      commitment: 'processed',
    });
    tr.recentBlockhash = recentBlockHash.blockhash;
    return {
      message: 'success',
      data: tr,
    };
  }
  async stake(dto: StakeDto) {
    const { nftName, up, stakePeriod } = dto;
    const {
      programID,
      STAKING_DETAILS,
      metaplex,
      METADATA_PROGRAM,
      program,
      AUTH_PROGRAM,
      SYSVARINSTRUCTIONS,
      connection,
    } = this.solanaProvider;
    let [nft_authority] = PublicKey.findProgramAddressSync(
      [utils.bytes.utf8.encode('nft-authority'), STAKING_DETAILS.toBytes()],
      programID,
    );
    const nfts = await this.getNFTList(up);
    const owner = new PublicKey(up);

    const nft = nfts.find((nft) => nft.name === nftName);
    if (!nft || !owner) {
      throw new NotFoundException('NFT Not Found');
    }

    const nft_mint = new PublicKey(nft.mintAddress);
    const nft_By_mint = (await metaplex
      .nfts()
      .findByMint({ mintAddress: nft_mint })) as Nft;

    let nft_custody = await spl.getAssociatedTokenAddress(
      nft_mint,
      nft_authority,
      true,
    );
    let [staking_record] = PublicKey.findProgramAddressSync(
      [
        utils.bytes.utf8.encode('staking-record'),
        STAKING_DETAILS.toBytes(),
        nft_mint.toBytes(),
      ],
      programID,
    );

    const nft_token = await associatedAddress({
      mint: nft_mint,
      owner,
    });

    let [token_record] = findProgramAddressSync(
      [
        utils.bytes.utf8.encode('metadata'),
        new PublicKey(METADATA_PROGRAM).toBytes(),
        nft_mint.toBytes(),
        utils.bytes.utf8.encode('token_record'),
        nft_token.toBytes(),
      ],
      new PublicKey(METADATA_PROGRAM),
    );
    let [token_record_dest] = findProgramAddressSync(
      [
        utils.bytes.utf8.encode('metadata'),
        new PublicKey(METADATA_PROGRAM).toBytes(),
        nft_mint.toBytes(),
        utils.bytes.utf8.encode('token_record'),
        nft_custody.toBytes(),
      ],
      new PublicKey(METADATA_PROGRAM),
    );
    const tr = new Transaction();
    const tx = await program.methods
      .stake(stakePeriod)
      .accounts({
        stakeDetails: STAKING_DETAILS,
        nftAuthority: nft_authority,
        stakingRecord: staking_record,
        nftMint: nft_mint,
        nftEdition: nft_By_mint.edition.address,
        nftMetadata: nft_By_mint.metadataAddress,
        nftToken: nft_token,
        nftCustody: nft_custody,
        metadataProgram: METADATA_PROGRAM,
        //@ts-ignore
        authRules: nft.programmableConfig?.ruleSet,
        authProgram: new PublicKey(AUTH_PROGRAM),
        sysvarInstructions: new PublicKey(SYSVARINSTRUCTIONS),
        tokenRecord: token_record,
        tokenRecordDest: token_record_dest,
      })
      .instruction();

    tr.add(ComputeBudgetProgram.setComputeUnitLimit({ units: 300000 }));
    tr.add(tx);
    tr.feePayer = new PublicKey(owner);
    const recentBlockHash = await connection.getLatestBlockhash({
      commitment: 'processed',
    });
    tr.recentBlockhash = recentBlockHash.blockhash;
    return {
      message: 'success',
      data: tr,
    };
  }

  async claimAll(dto: ClaimAllDto) {
    const { up } = dto;
    const owner = new PublicKey(up);
    const { programID, program, TOKEN_MINT_ACCOUNT, STAKING_DETAILS } =
      this.solanaProvider;
    const stakedNfts = await this.getStakedNFTsList(up);

    const instructionGenerator = async (array: Metadata[]) => {
      const instructions = [];
      try {
        for (const nfts of array) {
          const { mintAddress } = nfts;
          let token_account = associatedAddress({
            mint: TOKEN_MINT_ACCOUNT,
            owner,
          });

          let [staking_record] = PublicKey.findProgramAddressSync(
            [
              utils.bytes.utf8.encode('staking-record'),
              STAKING_DETAILS.toBytes(),
              mintAddress.toBytes(),
            ],
            programID,
          );

          let [token_authority] = findProgramAddressSync(
            [
              utils.bytes.utf8.encode('token-authority'),
              STAKING_DETAILS.toBytes(),
            ],
            programID,
          );

          instructions.push(
            await program.methods
              .claim()
              .accounts({
                stakeDetails: STAKING_DETAILS,
                stakingRecord: staking_record,
                rewardMint: TOKEN_MINT_ACCOUNT,
                rewardReceiveAccount: token_account,
                tokenAuthority: token_authority,
              })
              .instruction(),
          );
        }
      } catch (error) {
        throw new InternalServerErrorException('Something went wrong!');
      }
      return instructions; // Return array of instructions for this chunk
    };

    const transactionInstructions = await instructionGenerator(stakedNfts);
    // Call the function to start processing chunks and return array of instructions
    const chunkedTransactions = chunkArray(transactionInstructions, 6);
    const totalTransactions = chunkedTransactions.length;
    return {
      message: 'success',
      transactionInstructions: chunkedTransactions,
      totalTransactions,
    };
  }
}
