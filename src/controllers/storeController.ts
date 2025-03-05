import { Request, Response } from 'express';
import { addStore, findStores } from '../services/storeService';
import logger from '../utils/logger';

export const createStore = async (req: Request, res: Response) => {
  try {
    const store = await addStore(req.body);
    res.status(201).json(store);
  } catch (error) {
    logger.error('Erro ao criar loja:', error);
    res.status(500).json({ message: 'Erro ao criar loja' });
  }
};

export const getStores = async (req: Request, res: Response) => {
  try {
    const stores = await findStores();
    res.status(200).json(stores);
  } catch (error) {
    logger.error('Erro ao buscar lojas:', error);
    res.status(500).json({ message: 'Erro ao buscar lojas' });
  }
};