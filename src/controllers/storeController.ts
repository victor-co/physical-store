import { Request, Response } from 'express';
import { addStore, findStoresWithinRadius } from '../services/storeService';
import logger from '../utils/logger';

export const createStore = async (req: Request, res: Response): Promise<void> => {
  const { name, cep } = req.body;

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

  try {
    const nearbyStores = await findStoresWithinRadius(cep as string);

    if (nearbyStores.length === 0) {
      res.status(404).json({ message: 'Nenhuma loja encontrada dentro do raio de 100 km' });
      return;
    }

    const formattedStores = nearbyStores.map(({ store, distance }) => ({
      store,
      distance: `${distance} Km`,
    }));

    res.status(200).json(formattedStores);
  } catch (error) {
    logger.error('Erro ao buscar lojas próximas:', error);
    res.status(500).json({ message: 'Erro ao buscar lojas próximas' });
  }
};