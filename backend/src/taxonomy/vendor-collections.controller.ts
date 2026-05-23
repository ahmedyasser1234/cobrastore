import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards, HttpCode, HttpStatus } from '@nestjs/common';
import { VendorCollectionsService } from './vendor-collections.service';
import { AuthGuard } from '@nestjs/passport';

@Controller('vendor-collections')
export class VendorCollectionsController {
  constructor(private readonly vendorCollectionsService: VendorCollectionsService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @UseGuards(AuthGuard('jwt'))
  create(@Body() createVendorCollectionDto: any) {
    return this.vendorCollectionsService.create(createVendorCollectionDto);
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  findAll(@Query('vendorId') vendorId?: string) {
    return this.vendorCollectionsService.findAll(vendorId);
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  findOne(@Param('id') id: string) {
    return this.vendorCollectionsService.findOne(id);
  }

  @Patch(':id')
  @HttpCode(HttpStatus.OK)
  @UseGuards(AuthGuard('jwt'))
  update(@Param('id') id: string, @Body() updateVendorCollectionDto: any) {
    return this.vendorCollectionsService.update(id, updateVendorCollectionDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @UseGuards(AuthGuard('jwt'))
  remove(@Param('id') id: string) {
    return this.vendorCollectionsService.remove(id);
  }
}
