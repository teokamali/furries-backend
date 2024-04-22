import { Module } from '@nestjs/common';
import { SolanaProvider } from 'src/solana-provider/solana-provider';
import { NftsController } from './nfts.controller';
import { NftsService } from './nfts.service';

@Module({
  controllers: [NftsController],
  providers: [NftsService, SolanaProvider],
})
export class NftsModule {}
