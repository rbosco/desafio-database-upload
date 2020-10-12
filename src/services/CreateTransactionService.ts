import AppError from '../errors/AppError';

import {getCustomRepository, getRepository} from 'typeorm';

import TransactionsRepository from '../repositories/TransactionsRepository';

import Transaction from '../models/Transaction';
import Category from '../models/Category';

interface Request{
  title:string;
  value:number;
  type:'income' | 'outcome';
  category:string;
}

class CreateTransactionService {
  public async execute({title,value,type,category}:Request): Promise<Transaction> {
    // TODO
    const transactionRepository = getCustomRepository(TransactionsRepository);
    const categoryRepository = getRepository(Category);

    //Verificar se a categoria já exite
    //Existe? Buscar ela do banco de dados e usar o id que foi retornado
    //Não existe? Cria a categoria

    const {total} = await transactionRepository.getBalance();

    if (type ==='outcome' && total < value){
      throw new AppError("You do not have enough balance.");
    }

    let transactionCategory = await categoryRepository.findOne({
      where:{
        title:category
      }
    });

    if(!transactionCategory){
      transactionCategory = categoryRepository.create({
        title:category,
      });

      await categoryRepository.save(transactionCategory);
    }

    const transaction = transactionRepository.create({
      title,
      value,
      type,
      category:transactionCategory
    });

    await transactionRepository.save(transaction);

    return transaction;
  }
}

export default CreateTransactionService;
