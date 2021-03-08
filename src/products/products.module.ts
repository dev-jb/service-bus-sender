import { Module } from '@nestjs/common';
import { ServiceBusSenderModule } from 'src/service-bus-sender/service-bus-sender.module';
import { ProductController } from './products.controller';
import { ProductService } from './products.service';

@Module({
  imports: [ServiceBusSenderModule],
  controllers: [ProductController],
  providers: [ProductService],
})
export class ProductModule {}
