import { Body, Controller, Post, UseInterceptors } from '@nestjs/common';
import { Paginate } from 'src/decorators/paginate.decorator';
import { PaginateInterceptor } from 'src/interceptors/paginate.interceptor';
import { PaginateQuery } from 'src/types/paginate.types';
import { CalculateReward } from './dto/calculate-reward.dto';
import { ClaimAllDto } from './dto/claimAll.dto';
import { GetUserNFTsDto } from './dto/nfts-list.dto';
import { StakeDto } from './dto/stake.dto';
import { UnStakeDto } from './dto/unStake.dto';
import { NftsService } from './nfts.service';

@Controller('nfts')
export class NftsController {
  constructor(private readonly nftsService: NftsService) {}
  // get All user nfts by user public key
  @Post('list')
  @UseInterceptors(PaginateInterceptor)
  getUserNfts(
    @Paginate() pagination: PaginateQuery,
    @Body() dto: GetUserNFTsDto,
  ) {
    return this.nftsService.nftList(dto, pagination);
  }

  @Post('list/staked')
  @UseInterceptors(PaginateInterceptor)
  getUserStakedNFTs(
    @Paginate() pagination: PaginateQuery,
    @Body() dto: GetUserNFTsDto,
  ) {
    return this.nftsService.stakedNFTsList(dto, pagination);
  }

  @Post('reward')
  getUserTotalReward(@Body() dto: CalculateReward) {
    return this.nftsService.calculateReward(dto);
  }
  @Post('unstake')
  unstakeNft(@Body() dto: UnStakeDto) {
    return this.nftsService.unStake(dto);
  }
  @Post('stake')
  stakeNft(@Body() dto: StakeDto) {
    return this.nftsService.stake(dto);
  }
  @Post('claimAll')
  claimAll(@Body() dto: ClaimAllDto) {
    return this.nftsService.claimAll(dto);
  }
}
