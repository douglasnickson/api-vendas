import { getCustomRepository } from 'typeorm';
import Order from '../entities/Order';
import { OrdersRepository } from '../repositories/OrdersRepository';
import CustomersRepository from '@modules/costumers/typeorm/repositories/CustomersRepository';
import AppError from '@shared/errors/AppError';
import { ProductRepository } from '@modules/products/typeorm/repositories/ProductsRepository';

interface IProduct {
  id: string;
  quantity: number;
}

interface IRequest {
  customer_id: string;
  products: IProduct[];
}

class CreateOrderService {
  public async execute({ customer_id, products }: IRequest): Promise<Order> {
    const ordersRepository = getCustomRepository(OrdersRepository);
    const customerRepository = getCustomRepository(CustomersRepository);
    const productsRepository = getCustomRepository(ProductRepository);

    const customerExists = await customerRepository.findById(customer_id);

    if (!customerExists) {
      throw new AppError('Could not find any costumer with the given id.');
    }

    const existsProducts = await productsRepository.findAllByIds(products);

    if (!existsProducts.length) {
      throw new AppError('Could not find any products with the given ids.');
    }

    const existsProductsIds = existsProducts.map(product => product.id);

    const checkInexistentProduct = products.filter(
      product => !existsProductsIds.includes(product.id),
    );

    if (checkInexistentProduct.length) {
      throw new AppError(
        `Could not find product ${checkInexistentProduct[0].id}.`,
      );
    }

    const quantityAvaiable = products.filter(
      product =>
        existsProducts.filter(p => p.id === product.id)[0].quantity <
        product.quantity,
    );

    if (quantityAvaiable.length) {
      throw new AppError(
        `The quantity ${quantityAvaiable[0].quantity} is not available for ${quantityAvaiable[0].id}.`,
      );
    }

    const serializedProducts = products.map(product => ({
      product_id: product.id,
      quantity: product.quantity,
      price: existsProducts.filter(p => p.id === product.id)[0].price,
    }));

    const order = await ordersRepository.createOrder({
      customer: customerExists,
      products: serializedProducts,
    });

    const { order_products } = order;

    const updatedProductQuantity = order_products.map(product => ({
      id: product.id,
      quantity:
        existsProducts.filter(p => p.id === product.id)[0].quantity -
        product.quantity,
    }));

    await productsRepository.save(updatedProductQuantity);

    return order;
  }
}

export default CreateOrderService;
