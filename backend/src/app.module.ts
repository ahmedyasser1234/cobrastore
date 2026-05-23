import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { dataSourceOptions } from './database/data-source';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { VendorsModule } from './vendors/vendors.module';
import { ProductsModule } from './products/products.module';
import { CartModule } from './cart/cart.module';
import { OrdersModule } from './orders/orders.module';
import { PaymentsModule } from './payments/payments.module';
import { EmailModule } from './email/email.module';
import { TaxonomyModule } from './taxonomy/taxonomy.module';
import { AdminModule } from './admin/admin.module';
import { SeedModule } from './database/seed/seed.module';
import { NotificationsModule } from './notifications/notifications.module';
import { ChatModule } from './chat/chat.module';
import { BullModule } from '@nestjs/bull';
import { AddressesModule } from './addresses/addresses.module';
import { WishlistModule } from './wishlist/wishlist.module';
import { PublicController } from './public.controller';
import { Product } from './entities/product.entity';
import { Vendor } from './entities/vendor.entity';
import { UploadModule } from './upload/upload.module';

import { VirtualTryonModule } from './virtual-tryon/virtual-tryon.module';
import { AiModule } from './ai/ai.module';
import { AdsModule } from './ads/ads.module';
import { ThrottlerModule } from '@nestjs/throttler';

@Module({
  imports: [
    ThrottlerModule.forRoot([{
      ttl: 60000,
      limit: 20,
    }]),
    TypeOrmModule.forFeature([Product, Vendor]),
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    TypeOrmModule.forRoot({
      ...dataSourceOptions,
      autoLoadEntities: true,
    }),
    BullModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        redis: {
          host: configService.get('REDIS_HOST'),
          port: configService.get('REDIS_PORT'),
        },
      }),
    }),
    AuthModule,
    UsersModule,
    VendorsModule,
    TaxonomyModule,
    ProductsModule,
    CartModule,
    OrdersModule,
    PaymentsModule,
    AdminModule,
    SeedModule,
    EmailModule,
    NotificationsModule,
    ChatModule,
    AddressesModule,
    WishlistModule,
    UploadModule,
    VirtualTryonModule,
    AiModule,
    AdsModule,
  ],
  controllers: [PublicController],


})
export class AppModule {}
