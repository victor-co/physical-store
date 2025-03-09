import { Store, IStore } from '../models/storeModel';
import logger from '../utils/logger';
import { calculateDistance } from '../utils/distanceCalculator';
import { getAddressByCep } from './cepService';
import { getCoordinatesByAddress } from './coordinatesService';

export const addStore = async (storeData: { name: string; cep: string }): Promise<IStore> => {
  try {
    const addressData = await getAddressByCep(storeData.cep);
    const fullAddress = `${addressData.logradouro}, ${addressData.bairro}, ${addressData.localidade}, ${addressData.uf}, Brasil`;
    const coordinates = await getCoordinatesByAddress(fullAddress);

    const store: IStore = {
      name: storeData.name,
      cep: storeData.cep,
      street: addressData.logradouro,
      neighborhood: addressData.bairro,
      city: addressData.localidade,
      state: addressData.uf,
      latitude: coordinates.latitude,
      longitude: coordinates.longitude,
    };

    const newStore = new Store(store);
    await newStore.save();
    logger.info(`Loja adicionada: ${newStore.name}`);
    return newStore;
  } catch (error) {
    logger.error('Erro ao adicionar loja:', error);
    throw error;
  }
};

export const findStoresWithinRadius = async (
  targetCep: string,
  radius: number = 100
): Promise<{ store: IStore; distance: number }[]> => {
  try {
    const addressData = await getAddressByCep(targetCep);
    const fullAddress = `${addressData.logradouro}, ${addressData.bairro}, ${addressData.localidade}, ${addressData.uf}, Brasil`;
    const targetCoords = await getCoordinatesByAddress(fullAddress);

    const stores = await Store.find();

    const nearbyStores = stores
      .map((store) => {
        const distance = calculateDistance(
          { latitude: store.latitude, longitude: store.longitude },
          targetCoords
        );
        return {
          store,
          distance: parseFloat(distance.toFixed(1)),
        };
      })
      .filter(({ distance }) => distance <= radius);

    return nearbyStores;
  } catch (error) {
    logger.error('Erro ao buscar lojas próximas:', error);
    throw error;
  }
};