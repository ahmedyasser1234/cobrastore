import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Vendor } from '../entities/vendor.entity';
import { VendorPayout } from '../entities/vendor-payout.entity';
import { Coupon } from '../entities/coupon.entity';
import { Offer } from '../entities/offer.entity';
import { VendorsService } from './vendors.service';
import { CouponsService } from './coupons.service';
import { OffersService } from './offers.service';
import { VendorsController } from './vendors.controller';
import { CouponsController } from './coupons.controller';
import { OffersController } from './offers.controller';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [TypeOrmModule.forFeature([Vendor, VendorPayout, Coupon, Offer]), UsersModule],
  providers: [VendorsService, CouponsService, OffersService],
  controllers: [VendorsController, CouponsController, OffersController],
  exports: [VendorsService, CouponsService, OffersService],
})
export class VendorsModule {}
