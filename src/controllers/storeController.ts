import { Request, Response } from 'express';
import { addStore } from '../services/storeService';
import logger from '../utils/logger';

export const createStore = async (req: Request, res: Response) => {
  const { name, cep } = req.body;

  if (!name || !cep) {
    return res.status(400).json({ message: 'Nome e CEP são obrigatórios' });
  }

  try {
    const store = await addStore({ name, cep });
    res.status(201).json(store);
  } catch (error) {
    logger.error('Erro ao criar loja:', error);
    res.status(500).json({ message: 'Erro ao criar loja' });
  }
};