import { getCustomRepository } from 'typeorm';
import { ProductRepository } from '../typeorm/repositories/ProductsRepository';
import Product from '../typeorm/entities/Product';
import redisCache from '@shared/cache/RedisCache';

class ListProductService {
  public async execute(): Promise<Product[]> {
    const productsRepository = getCustomRepository(ProductRepository);

    // const redisCache = new RedisCache();

    let products = await redisCache.recover<Product[]>(
      'API-VENDAS-PRODUCT_LIST',
    );

    if (!products) {
      products = await productsRepository.find();
      await redisCache.save('API-VENDAS-PRODUCT_LIST', products);
    }

    return products;
  }
}

export default ListProductService;
