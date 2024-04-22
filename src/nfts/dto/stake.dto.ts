import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class StakeDto {
  @IsNotEmpty({ message: 'nftName is required' })
  @IsString({ message: 'nftName must be string' })
  nftName: string;

  @IsNotEmpty({ message: 'user public key is required' })
  @IsString({ message: 'user public key must be string' })
  up: string;

  @IsNotEmpty({ message: 'stakePeriod is required' })
  @IsNumber()
  stakePeriod: number;
}
