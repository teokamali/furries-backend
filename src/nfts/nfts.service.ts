import { utils } from '@coral-xyz/anchor';
import { Metadata, Nft } from '@metaplex-foundation/js';
import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { PublicKey } from '@solana/web3.js';
import axios from 'axios';
import { SolanaProvider } from 'src/solana-provider/solana-provider';
import { StakeDetail } from 'src/types/global.types';
import { PaginateQuery } from 'src/types/paginate.types';
import { paginate } from 'src/util/paginate.util';
import { CalculateReward } from './dto/calculate-reward.dto';
import { GetUserNFTsDto } from './dto/nfts-list.dto';
import { StackedNFTsList } from './dto/staked-nfts-list.dto';

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
    const addresses = records.map((records) => records.pubkey);
    let mintAddresses: PublicKey[] | [] = [];

    for (const address of addresses) {
      try {
        await program.account.stakingRecord
          .fetch(address)
          .then((res) => (mintAddresses = [...mintAddresses, res.nftMint]));
      } catch (err) {
        console.log({ address: address.toString(), err: err });
      }
    }
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
  async getNftDetail(userPublickey: string, nftName: string) {
    const { programID, STAKING_DETAILS, program } = this.solanaProvider;
    const stakedNfts = await this.getStakedNFTsList(userPublickey);

    const nft = stakedNfts.find((nft) => nft.name === nftName);

    if (!nft) {
      return;
    }
    const nft_mint = new PublicKey(nft.mintAddress);

    const [staking_record] = PublicKey.findProgramAddressSync(
      [
        utils.bytes.utf8.encode('staking-record'),
        STAKING_DETAILS.toBytes(),
        nft_mint.toBytes(),
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
    const userStakedNftsWithMetaData: Nft[] = [];
    const stakedNfts = await this.getStakedNFTsList(dto.up);
    const { data: paginatedStakedNFTs, meta } = paginate(
      stakedNfts,
      paginateQuery,
    );

    for (const metadata of paginatedStakedNFTs) {
      try {
        await axios
          .get(metadata.uri)
          .then((res) => res.data)
          .then((res: Nft) => userStakedNftsWithMetaData.push(res));
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
        const nftDetail = await this.getNftDetail(dto.up, nft.name);
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
}
