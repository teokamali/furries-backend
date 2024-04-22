import { AnchorProvider, Program, Provider, Wallet } from '@coral-xyz/anchor';
import { Metaplex, keypairIdentity } from '@metaplex-foundation/js';
import { Injectable } from '@nestjs/common';
import { Connection, Keypair, PublicKey, clusterApiUrl } from '@solana/web3.js';
import { mnemonicToSeedSync } from 'bip39';
import { StakingIDL } from 'src/program/idl';
import { Staking } from 'src/types/stakingIDL';

@Injectable()
export class SolanaProvider {
  public connection: Connection;
  public metaplex: Metaplex;
  public keyPair: Keypair;
  public provider: Provider;
  public program: Program<Staking>;
  public programID: PublicKey;
  public STAKING_DETAILS: PublicKey;
  public wallet: Wallet;

  constructor() {
    const programID = new PublicKey(process.env.PROGRAM_ID ?? '');
    const STAKING_DETAILS = new PublicKey(process.env.STAKING_DETAILS ?? '');

    this.connection = new Connection(clusterApiUrl('devnet'));
    const mnemonic = process.env.PHRASE || '';
    const seed = mnemonicToSeedSync(mnemonic, ''); // (mnemonic, password)
    const keypair = Keypair.fromSeed(seed.slice(0, 32));
    this.keyPair = keypair;
    this.metaplex = new Metaplex(this.connection);
    this.metaplex.use(keypairIdentity(this.keyPair));
    const wallet = new Wallet(keypair);
    const provider = new AnchorProvider(this.connection, wallet, {});
    const program = new Program(StakingIDL, programID, provider);
    this.program = program;
    this.provider = provider;
    this.programID = programID;
    this.STAKING_DETAILS = STAKING_DETAILS;
  }
}
