import { Body, Controller, Get, Param, Patch, Post, Put } from '@nestjs/common';
import { ProductDto } from './products.dto';
import { ProductService } from './products.service';

@Controller('products')
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  @Post()
  async addProduct(@Body() product: ProductDto) {
    const response = await this.productService.insertProduct(product);
    console.log('PPP', response);
    return response;
  }

  @Get()
  getAllProducts(): any {
    return this.productService.getAllProduct();
  }

  @Get(':id')
  getProduct(@Param('id') productId: string) {
    return this.productService.getProduct(productId);
  }

  @Put()
  updateProduct(@Body() product: ProductDto) {
    return this.productService.updateProduct(product);
  }
}
