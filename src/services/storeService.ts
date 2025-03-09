import { Store, IStore } from '../models/storeModel';
import logger from '../utils/logger';
import { calculateDistance } from '../utils/distanceCalculator';
import { getAddressByCep } from './cepService';
import { getCoordinatesByAddress } from './coordinatesService';
import { CustomError } from '../errors/customError';

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
    if (error instanceof Error && 'code' in error && error.code === 11000) {
      throw new CustomError('Já existe uma loja com este CEP', 400);
    }
    logger.error('Erro ao adicionar loja:', error);
    throw new CustomError('Erro ao adicionar loja', 500);
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
      .filter(({ distance }) => distance <= radius) // filtra as lojas
      .sort((a, b) => a.distance - b.distance); // ordenando por distancia

    if (nearbyStores.length === 0) {
      throw new CustomError('Nenhuma loja encontrada dentro do raio de 100 km', 404);
    }

    return nearbyStores;
  } catch (error) {
    logger.error('Erro ao buscar lojas próximas:', error);
    if (error instanceof CustomError) {
      throw error;
    }
    throw new CustomError('Erro ao buscar lojas próximas', 500);
  }
};