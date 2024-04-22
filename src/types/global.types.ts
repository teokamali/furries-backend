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
