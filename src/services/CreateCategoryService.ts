// import AppError from '../errors/AppError';

import { getRepository } from 'typeorm';
import Category from '../models/Category';

interface Request {
  title: string;
}

class CreateTransactionService {
  public async execute({ title }: Request): Promise<Category> {
    const categoryRepository = getRepository(Category);
    const findCategory = await categoryRepository.findOne({ where: { title } });

    if (findCategory) {
      return findCategory;
    }
    const category = categoryRepository.create({ title });
    await categoryRepository.save(category);
    return category;
  }
}

export default CreateTransactionService;
