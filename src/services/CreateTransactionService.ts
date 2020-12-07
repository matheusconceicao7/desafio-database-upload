import { getCustomRepository } from 'typeorm';
import AppError from '../errors/AppError';

import Transaction from '../models/Transaction';
import TransactionRepository from '../repositories/TransactionsRepository';
import CreateCategoryService from './CreateCategoryService';

interface Request {
  title: string;
  value: number;
  type: string;
  category: string;
}

class CreateTransactionService {
  public async execute({
    title,
    value,
    type,
    category,
  }: Request): Promise<Transaction> {
    const createCategoryService = new CreateCategoryService();
    const transactionRepository = getCustomRepository(TransactionRepository);
    const { id: category_id } = await createCategoryService.execute({
      title: category,
    });

    const transactions = await transactionRepository.find();
    const { total } = transactionRepository.getBalance(transactions);

    if (type !== 'income' && type !== 'outcome') {
      throw new AppError('Invalid transaction type');
    }

    if (type === 'outcome' && value > total) {
      throw new AppError('You can not spend more money than you have');
    }

    const transaction = transactionRepository.create({
      title,
      type,
      value,
      category_id,
    });
    await transactionRepository.save(transaction);

    return transaction;
  }
}

export default CreateTransactionService;
