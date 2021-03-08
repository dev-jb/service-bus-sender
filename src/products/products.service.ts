import { Injectable, NotFoundException } from '@nestjs/common';
import { ServiceBusSenderService } from 'src/service-bus-sender/service-bus-sender.service';
import { ProductDto } from './products.dto';
import { Product } from './products.model';

const topicName = 'topic-product';

@Injectable()
export class ProductService {
  products: Product[] = [];
  constructor(
    private readonly serviceBusSenderService: ServiceBusSenderService,
  ) {}

  async insertProduct(product: ProductDto) {
    const genRanHex = (size) =>
      [...Array(size)]
        .map(() => Math.floor(Math.random() * 16).toString(16))
        .join('');
    const productId = genRanHex(12);

    const dateTime = new Date();

    const newProduct = new Product(
      productId.toString(),
      product.title,
      product.desc,
      product.price,
      dateTime,
      null,
    );

    const serviceBusDto = {
      serviceType: 'insertProduct',
      body: newProduct,
    };

    const res = await this.serviceBusSenderService.sendMessage(
      topicName,
      serviceBusDto,
    );
    // console.log('RES---------------------_>', res);
    return {
      message: 'Product Added Success',
      statusCode: 200,
      result: productId,
    };
  }

  async getAllProduct() {
    try {
      //   const messageReceived = await this.serviceBusReceiverService.receiveMessageAsync();
      //   console.log('RECEIVED MESSAGE: ' + messageReceived);
      //   return messageReceived;
    } catch (err) {
      console.log('ERROR RECEIVING.....', err);
    }
  }

  getProduct(productId: string) {
    return { ...this.findProduct(productId) };
  }

  async updateProduct(product: ProductDto) {
    const dateTime = new Date();

    const newProduct = new Product(
      product.id,
      product.title,
      product.desc,
      product.price,
      dateTime,
      null,
    );

    const serviceBusDto = {
      serviceType: 'updateProduct',
      body: newProduct,
    };

    const res = await this.serviceBusSenderService.sendMessage(
      topicName,
      serviceBusDto,
    );
    return {
      message: 'Product Update Success',
      statusCode: 200,
      result: product.id,
    };
    // const [productRes, index] = this.findProduct(product.id);
    // const updatedProduct = { ...productRes };
    // if (product.title) {
    //   updatedProduct.title = product.title;
    // }
    // if (product.desc) {
    //   updatedProduct.desc = product.desc;
    // }
    // if (product.price) {
    //   updatedProduct.price = product.price;
    // }
    // this.products[index] = updatedProduct;
  }

  private findProduct(productId): [Product, number] {
    const productIndex = this.products.findIndex(
      (prod) => (prod.id = productId),
    );
    const product = this.products[productIndex];
    if (!product) {
      throw new NotFoundException('Product not found');
    }
    return [product, productIndex];
  }
}
