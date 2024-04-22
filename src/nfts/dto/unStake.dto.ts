import { IsNotEmpty, IsString } from 'class-validator';

export class UnStakeDto {
  @IsNotEmpty({ message: 'nftName is required' })
  @IsString({ message: 'nftName must be string' })
  nftName: string;

  @IsNotEmpty({ message: 'user public key is required' })
  @IsString({ message: 'user public key must be string' })
  up: string;
}
