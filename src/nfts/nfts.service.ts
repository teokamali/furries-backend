import {
  Metadata,
  Metaplex,
  Nft,
  PublicKey,
  keypairIdentity,
} from '@metaplex-foundation/js';
import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { Connection, Keypair, clusterApiUrl } from '@solana/web3.js';
import axios from 'axios';
import { PaginateQuery } from 'src/types/paginate.types';
import { paginate } from 'src/util/paginate.util';
import { GetUserNFTsDto } from './dto/nfts-list.dto';

@Injectable()
export class NftsService {
  async nftList(dto: GetUserNFTsDto, paginateQuery: PaginateQuery) {
    const userNftsWithMetaData: Nft[] = [];

    const connection = new Connection(clusterApiUrl('devnet'));
    const keyPair = new Keypair();
    const metaplex = new Metaplex(connection);
    metaplex.use(keypairIdentity(keyPair));
    const owner = new PublicKey(dto.up);
    const allNFTs = (await metaplex
      .nfts()
      .findAllByOwner({ owner })) as Metadata[];

    const furryCollections = allNFTs.filter(
      (nft) =>
        nft.collection?.address.toString() === process.env.COLLECTION_ADDRESS,
    ) as Metadata[];

    if (!allNFTs.length) {
      return new NotFoundException();
    }

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
}
