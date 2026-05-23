import { Module } from '@nestjs/common';
import { VirtualTryonService } from './virtual-tryon.service';
import { VirtualTryonController } from './virtual-tryon.controller';

@Module({
  controllers: [VirtualTryonController],
  providers: [VirtualTryonService],
})
export class VirtualTryonModule {}
