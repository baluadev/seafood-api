import { Module } from '@nestjs/common';
import { OrdersController } from './orders.controller';
import { OrdersService } from './orders.service';
import { CartModule } from '../cart/cart.module';
import { PaymentModule } from '../payment/payment.module';

@Module({
  imports: [CartModule, PaymentModule],
  controllers: [OrdersController],
  providers: [OrdersService],
})
export class OrdersModule {}
