import { Request, Response } from 'express';
import { addStore, findStoresWithinRadius } from '../services/storeService';
import logger from '../utils/logger';

export const createStore = async (req: Request, res: Response): Promise<void> => {
  const { name, cep } = req.body;

  if (!name || !cep) {
    res.status(400).json({ message: 'Nome e CEP são obrigatórios' });
    return;
  }

  try {
    const store = await addStore({ name, cep });
    res.status(201).json(store);
  } catch (error) {
    logger.error('Erro ao criar loja:', error);
    res.status(500).json({ message: 'Erro ao criar loja' });
  }
};

export const getNearbyStores = async (req: Request, res: Response): Promise<void> => {
  const { cep } = req.query;

  if (!cep) {
    res.status(400).json({ message: 'CEP é obrigatório' });
    return;
  }

  try {
    const stores = await findStoresWithinRadius(cep as string);
    res.status(200).json(stores);
  } catch (error) {
    logger.error('Erro ao buscar lojas próximas:', error);
    res.status(500).json({ message: 'Erro ao buscar lojas próximas' });
  }
};