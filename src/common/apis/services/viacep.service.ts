import { Injectable } from '@nestjs/common';
import axios from 'axios';
import { CepResponseDto } from '../../dtos/cep.dto';

@Injectable()
export class ViacepService {
  async findAddressByCep(cep: string): Promise<CepResponseDto> {
    const response = await axios.get(`https://viacep.com.br/ws/${cep}/json/`);

    if (response.data.erro) {
      throw new Error('CEP não encontrado');
    }

    return response.data;
  }
}
