import { CustomError } from '../errors/customError';
import logger from '../utils/logger';
import axios from 'axios';

const viaCepUrl = 'https://viacep.com.br/ws';

export const getAddressByCep = async (cep: string) => {
  if (!/^\d{8}$/.test(cep)) {
    throw new CustomError('Formato de CEP inválido', 400);
  }

  try {
    const response = await axios.get(`${viaCepUrl}/${cep}/json`);
    if (response.data.erro) {
      throw new CustomError('CEP não encontrado', 404);
    }
    return response.data;
  } catch (error) {
    logger.error('Erro ao buscar CEP:', error);
    if (error instanceof CustomError) {
      throw error;
    }
    throw new CustomError('Erro ao buscar CEP', 500);
  }
};