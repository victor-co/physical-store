import axios from 'axios';
import logger from '../utils/logger';

const viaCepUrl = 'https://viacep.com.br/ws';

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