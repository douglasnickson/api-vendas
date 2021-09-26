import { getCustomRepository } from 'typeorm';
import { OrdersRepository } from '../repositories/OrdersRepository';
import Order from '../entities/Order';
import AppError from '@shared/errors/AppError';

interface IRequest {
  id: string;
}

class ShowOrderService {
  public async execute({ id }: IRequest): Promise<Order> {
    const ordersRepository = getCustomRepository(OrdersRepository);

    const order = await ordersRepository.findById(id);

    if (!order) {
      throw new AppError('Order not found.');
    }

    return order;
  }
}

export default ShowOrderService;
