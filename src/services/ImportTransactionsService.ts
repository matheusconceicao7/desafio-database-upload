import fs from 'fs';
import path from 'path';
import csvParse from 'csv-parse';
import Bluebird, { mapSeries } from 'bluebird';
import uploadConfig from '../config/upload';

import Transaction from '../models/Transaction';
import CreateTransactionService from './CreateTransactionService';

interface TransactionCSV {
  title: string;
  type: string;
  value: number;
  category: string;
}

async function loadTransactionCSV(filePath: string): Promise<TransactionCSV[]> {
  const readCSVStream = fs.createReadStream(filePath);

  const parseStream = csvParse({
    from_line: 2,
    ltrim: true,
    rtrim: true,
  });

  const parseCSV = readCSVStream.pipe(parseStream);

  const transactions: TransactionCSV[] = [];

  parseCSV.on('data', async line => {
    const [title, type, value, category] = line;
    if (!title || !type || !value || !category) {
      return;
    }
    transactions.push({ title, type, value, category });
  });

  await new Promise(resolve => {
    parseCSV.on('end', resolve);
  });

  return transactions;
}

class ImportTransactionsService {
  async execute(filename: string): Bluebird<Transaction[]> {
    const filePath = path.join(uploadConfig.directory, filename);
    const csvTransactions = await loadTransactionCSV(filePath);
    const createTransactionService = new CreateTransactionService();

    const importedTransactions = mapSeries(csvTransactions, transaction =>
      createTransactionService.execute({ ...transaction }),
    );

    return importedTransactions;
  }
}

export default ImportTransactionsService;
