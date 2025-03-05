import { Store, IStore } from '../models/storeModel';
import logger from '../utils/logger';

export const addStore = async (storeData: IStore): Promise<IStore> => {
  try {
    const store = new Store(storeData);
    await store.save();
    logger.info(`Loja adicionada: ${store.name}`);
    return store;
  } catch (error) {
    logger.error('Erro ao adicionar loja:', error);
    throw error;
  }
};

export const findStores = async (): Promise<IStore[]> => {
  try {
    const stores = await Store.find();
    logger.info(`Lojas encontradas: ${stores.length}`);
    return stores;
  } catch (error) {
    logger.error('Erro ao buscar lojas:', error);
    throw error;
  }
};