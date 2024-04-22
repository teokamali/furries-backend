import { IsNotEmpty, IsString } from 'class-validator';

export class ClaimAllDto {
  @IsNotEmpty({ message: 'user public key is required' })
  @IsString({ message: 'user public key must be string' })
  up: string;
}
