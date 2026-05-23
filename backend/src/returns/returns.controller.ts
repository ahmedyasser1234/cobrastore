import { Controller, Get, Post, Body, Param, Patch, UseGuards, Req } from '@nestjs/common';
import { ReturnsService } from './returns.service';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { UserRole } from '../entities/user.entity';

@UseGuards(AuthGuard('jwt'), RolesGuard)
@Controller('returns')
export class ReturnsController {
  constructor(private readonly returnsService: ReturnsService) {}

  @Roles(UserRole.CUSTOMER)
  @Post()
  async create(@Req() req: any, @Body() body: { orderId: string, reason: string }) {
    return this.returnsService.create(req.user.id, body.orderId, body.reason);
  }

  @Roles(UserRole.CUSTOMER)
  @Get('my-returns')
  async getMyReturns(@Req() req: any) {
    return this.returnsService.findByUser(req.user.id);
  }

  @Roles(UserRole.ADMIN)
  @Get()
  async getAll() {
    return this.returnsService.findAll();
  }

  @Roles(UserRole.ADMIN)
  @Patch(':id/process')
  async processReturn(@Param('id') id: string, @Body('action') action: 'approve' | 'reject') {
    return this.returnsService.processReturn(id, action);
  }
}
