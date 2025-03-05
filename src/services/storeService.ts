import axios from 'axios';
import { Store, IStore } from '../models/storeModel';
import logger from '../utils/logger';
import { calculateDistance } from '../utils/distanceCalculator';

const viaCepUrl = 'https://viacep.com.br/ws';
const nominatimUrl = 'https://nominatim.openstreetmap.org/search';

export const getAddressByCep = async (cep: string) => {
  try {
    const response = await axios.get(`${viaCepUrl}/${cep}/json`);
    if (response.data.erro) {
      throw new Error('CEP não encontrado');
    }
    return response.data;
  } catch (error) {
    logger.error('Erro ao buscar CEP:', error);
    throw error;
  }
};

export const getCoordinatesByAddress = async (address: string) => {
  try {
    const response = await axios.get(nominatimUrl, {
      params: {
        q: address,
        format: 'json',
        limit: 1,
      },
    });
    if (response.data.length === 0) {
      throw new Error('Coordenadas não encontradas');
    }
    return {
      latitude: parseFloat(response.data[0].lat),
      longitude: parseFloat(response.data[0].lon),
    };
  } catch (error) {
    logger.error('Erro ao buscar coordenadas:', error);
    throw error;
  }
};

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

export const findStoresWithinRadius = async (targetCep: string, radius: number = 100): Promise<IStore[]> => {
  try {
    const addressData = await getAddressByCep(targetCep);
    const fullAddress = `${addressData.logradouro}, ${addressData.bairro}, ${addressData.localidade}, ${addressData.uf}, Brasil`;
    const targetCoords = await getCoordinatesByAddress(fullAddress);

    const stores = await Store.find();

    const nearbyStores = stores.filter((store) => {
      const distance = calculateDistance(
        { latitude: store.latitude, longitude: store.longitude },
        targetCoords
      );
      return distance <= radius;
    });

    return nearbyStores;
  } catch (error) {
    logger.error('Erro ao buscar lojas próximas:', error);
    throw error;
  }
};