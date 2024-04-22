import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { NftsModule } from './nfts/nfts.module';
import { SolanaProvider } from './solana-provider/solana-provider';

@Module({
  imports: [NftsModule, ConfigModule.forRoot()],
  controllers: [AppController],
  providers: [AppService, SolanaProvider],
})
export class AppModule {}
