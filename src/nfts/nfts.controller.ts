import { Body, Controller, Get, UseInterceptors } from '@nestjs/common';
import { Paginate } from 'src/decorators/paginate.decorator';
import { PaginateInterceptor } from 'src/interceptors/paginate.interceptor';
import { PaginateQuery } from 'src/types/paginate.types';
import { CalculateReward } from './dto/calculate-reward.dto';
import { GetUserNFTsDto } from './dto/nfts-list.dto';
import { NftsService } from './nfts.service';

@Controller('nfts')
export class NftsController {
  constructor(private readonly nftsService: NftsService) {}
  // get All user nfts by user public key
  @Get('list')
  @UseInterceptors(PaginateInterceptor)
  getUserNfts(
    @Paginate() pagination: PaginateQuery,
    @Body() dto: GetUserNFTsDto,
  ) {
    return this.nftsService.nftList(dto, pagination);
  }

  @Get('list/staked')
  @UseInterceptors(PaginateInterceptor)
  getUserStakedNFTs(
    @Paginate() pagination: PaginateQuery,
    @Body() dto: GetUserNFTsDto,
  ) {
    return this.nftsService.stakedNFTsList(dto, pagination);
  }

  @Get('reward')
  getUserTotalReward(@Body() dto: CalculateReward) {
    return this.nftsService.calculateReward(dto);
  }
}
