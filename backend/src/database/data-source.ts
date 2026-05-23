import { DataSource, DataSourceOptions } from 'typeorm';
import * as dotenv from 'dotenv';
import { User } from '../entities/user.entity';
import { Vendor } from '../entities/vendor.entity';
import { Department } from '../entities/department.entity';
import { VendorCategory } from '../entities/vendor-category.entity';
import { VendorCollection } from '../entities/vendor-collection.entity';
import { Product } from '../entities/product.entity';
import { ProductVariation } from '../entities/product-variation.entity';
import { ProductImage } from '../entities/product-image.entity';
import { Cart } from '../entities/cart.entity';
import { CartItem } from '../entities/cart-item.entity';
import { Order } from '../entities/order.entity';
import { OrderItem } from '../entities/order-item.entity';
import { OrderStatusLog } from '../entities/order-status-log.entity';
import { VendorPayout } from '../entities/vendor-payout.entity';
import { SystemSetting } from '../entities/system-setting.entity';
import { Address } from '../entities/address.entity';
import { Wishlist } from '../entities/wishlist.entity';
import { Category } from '../entities/category.entity';
import { ChatMessage } from '../entities/chat-message.entity';

dotenv.config({ path: '../.env' });

export const dataSourceOptions: DataSourceOptions = {
  type: 'postgres',
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT, 10),
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  entities: [
    User,
    Vendor,
    Department,
    VendorCategory,
    VendorCollection,
    Product,
    ProductVariation,
    ProductImage,
    Cart,
    CartItem,
    Order,
    OrderItem,
    OrderStatusLog,
    VendorPayout,
    SystemSetting,
    Address,
    Wishlist,
    Category,
    ChatMessage,
  ],
  migrations: ['dist/migrations/*.js'],
  synchronize: true, // Set to true for initial setup to create tables automatically
};

const dataSource = new DataSource(dataSourceOptions);
export default dataSource;
