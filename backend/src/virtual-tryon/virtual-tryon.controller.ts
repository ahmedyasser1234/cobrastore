import { Controller, Post, Body } from '@nestjs/common';
import { VirtualTryonService } from './virtual-tryon.service';

@Controller('virtual-tryon')
export class VirtualTryonController {
  constructor(private readonly virtualTryonService: VirtualTryonService) {}

  @Post()
  async generateTryOn(
    @Body() body: { personImageBase64: string; garmentImageBase64: string }
  ) {
    const { personImageBase64, garmentImageBase64 } = body;
    return this.virtualTryonService.generateTryOn(
      personImageBase64,
      garmentImageBase64,
    );
  }
}
