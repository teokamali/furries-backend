import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_FILTER, APP_GUARD } from '@nestjs/core';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { ThrottlerFilter } from './exeptions/ThrottlerExeptionFilter/throttlerExeptionFilter';
import { AllExceptionsFilter } from './exeptions/all-exception.filter';
import { NftsModule } from './nfts/nfts.module';
import { SolanaProvider } from './solana-provider/solana-provider';

@Module({
  imports: [
    NftsModule,
    ConfigModule.forRoot(),
    ThrottlerModule.forRoot([
      {
        ttl: 30000,
        limit: 10,
      },
    ]),
  ],
  controllers: [],
  providers: [
    SolanaProvider,
    { provide: APP_FILTER, useClass: AllExceptionsFilter },
    {
      provide: APP_FILTER,
      useClass: ThrottlerFilter,
    },
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
