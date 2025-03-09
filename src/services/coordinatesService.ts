import axios from 'axios';
import logger from '../utils/logger';

const nominatimUrl = 'https://nominatim.openstreetmap.org/search';

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