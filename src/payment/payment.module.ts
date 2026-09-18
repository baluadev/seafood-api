import { Module } from '@nestjs/common';
import { PaymentController } from './payment.controller';
import { Pay2sService } from './pay2s.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [PaymentController],
  providers: [Pay2sService],
  exports: [Pay2sService],
})
export class PaymentModule {}
