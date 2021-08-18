import { getCustomRepository } from 'typeorm';
import AppError from '@shared/errors/AppError';
import UsersRepository from '../typeorm/repositories/UsersRepository';

interface IRequest {
  id: string;
}

class RemoveUserService {
  public async execute({ id }: IRequest): Promise<void> {
    const usersRepository = getCustomRepository(UsersRepository);
    const user = await usersRepository.findOne(id);

    if (!user) {
      throw new AppError('User not found');
    }

    await usersRepository.remove(user);
  }
}

export default RemoveUserService;
