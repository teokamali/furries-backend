import { BN } from '@coral-xyz/anchor';
import { PublicKey } from '@metaplex-foundation/js';

export interface StakeDetail {
  bump: number;
  lastClaimed: BN;
  nftMint: PublicKey;
  stakedAt: BN;
  staker: PublicKey;
  stakingPeriod: number;
}
export interface HttpExceptionResponse {
  statusCode: number;
  error: string;
}

export interface CustomHttpExceptionResponse extends HttpExceptionResponse {
  path: string;
  method: string;
  timeStamp: Date;
}