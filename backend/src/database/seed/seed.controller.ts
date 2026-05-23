import { Controller, Get, Post, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { SeedService } from './seed.service';

@ApiTags('database')
@Controller('seed')
export class SeedController {
  constructor(private readonly seedService: SeedService) {}

  @Get()
  @ApiOperation({ summary: 'Seed database with realistic Cobra Store samples' })
  @ApiResponse({ status: 200, description: 'Seeding complete' })
  async seed() {
    return this.seedService.seed();
  }

  @Post('vendors')
  @ApiOperation({ summary: 'Wipe and seed 7 realistic vendors and their products' })
  async seedVendors() {
    return this.seedService.seedVendorsAndProducts();
  }

  @Get('test')
  async test() {
    return this.seedService.test();
  }
}
