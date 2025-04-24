import { Injectable, Logger } from '@nestjs/common';
import axios, { AxiosError } from 'axios';
import { MelhorEnvioQuoteDto } from '../../dtos/melhor-envio.dto';

@Injectable()
export class MelhorEnvioService {
  private readonly logger = new Logger(MelhorEnvioService.name);
  private readonly API_URL = 'https://www.melhorenvio.com.br/api/v2/me';
  private readonly TOKEN = process.env.MELHOR_ENVIO_TOKEN;
  private readonly DEFAULT_TIMEOUT = 5000; // 5 segundos

  async calculateShipping(
    from: string,
    to: string,
  ): Promise<MelhorEnvioQuoteDto[]> {
    try {
      const formattedFrom = this.formatCep(from);
      const formattedTo = this.formatCep(to);

      if (!this.isValidCep(formattedFrom) || !this.isValidCep(formattedTo)) {
        throw new Error('CEP inválido');
      }

      const response = await axios.post(
        `${this.API_URL}/shipment/calculate`,
        {
          from: { postal_code: formattedFrom },
          to: { postal_code: formattedTo },
          products: [
            {
              id: '1',
              width: 10,
              height: 10,
              length: 10,
              weight: 0.3,
              quantity: 1,
            },
          ],
          options: {
            receipt: false,
            own_hand: false,
            insurance_value: 0,
          },
        },
        {
          headers: {
            Authorization: `Bearer ${this.TOKEN}`,
            'Content-Type': 'application/json',
            Accept: 'application/json',
          },
          timeout: this.DEFAULT_TIMEOUT,
        },
      );

      if (!Array.isArray(response.data)) {
        this.logger.warn(
          'Resposta inesperada da API Melhor Envio',
          response.data,
        );
        return [];
      }

      return response.data.map((quote) => ({
        ...quote,
        price: Number(quote.price) || 0,
        delivery_time: Number(quote.delivery_time) || 0,
        company: quote.company
          ? {
              ...quote.company,
              name: quote.company.name || 'Transportadora não identificada',
            }
          : null,
      }));
    } catch (error) {
      return this.handleError(error);
    }
  }

  private formatCep(cep: string): string {
    return cep.replace(/\D/g, '');
  }

  private isValidCep(cep: string): boolean {
    return /^[0-9]{8}$/.test(cep);
  }

  private handleError(error: unknown): MelhorEnvioQuoteDto[] {
    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError;

      this.logger.error('Erro na API Melhor Envio', {
        status: axiosError.response?.status,
        data: axiosError.response?.data,
        message: axiosError.message,
      });

      if (axiosError.response?.status === 401) {
        throw new Error('Autenticação falhou - verifique o token');
      }

      if (axiosError.response?.status === 400) {
        this.logger.warn(
          'Requisição inválida para Melhor Envio',
          axiosError.response.data,
        );
      }
    } else {
      this.logger.error('Erro desconhecido ao calcular frete', error);
    }

    // Retorna array vazio em caso de erro para não quebrar o fluxo
    return [];
  }
}
