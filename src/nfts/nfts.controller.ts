import { Body, Controller, Get, UseInterceptors } from '@nestjs/common';
import { Paginate } from 'src/decorators/paginate.decorator';
import { PaginateInterceptor } from 'src/interceptors/paginate.interceptor';
import { PaginateQuery } from 'src/types/paginate.types';
import { GetUserNFTsDto } from './dto/nfts-list.dto';
import { NftsService } from './nfts.service';

@Controller('nfts')
export class NftsController {
  constructor(private readonly nftsService: NftsService) {}
  // get All user nfts by user public key
  @Get('list')
  @UseInterceptors(PaginateInterceptor)
  findAll(@Paginate() pagination: PaginateQuery, @Body() dto: GetUserNFTsDto) {
    return this.nftsService.nftList(dto, pagination);
  }
}
