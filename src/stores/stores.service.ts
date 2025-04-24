import { Injectable, Logger, HttpException, HttpStatus } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Error } from 'mongoose';
import { Store, StoreDocument } from './entities/store.entity';
import { ViacepService } from '../common/apis/services/viacep.service';
import { GoogleMapsService } from '../common/apis/services/google-maps.service';
import { MelhorEnvioService } from '../common/apis/services/melhor-envio.service';
import { DELIVERY_CONSTANTS } from '../common/constants/delivery.constants';
import { CreateStoreDto } from './dto/create-store.dto';
import { GoogleDistanceMatrixElement } from '../common/apis/types/google-maps.type';
import { StoreByCepResponse, StoreDeliveryOption } from './types/store.types';

@Injectable()
export class StoresService {
  private readonly logger = new Logger(StoresService.name);

  constructor(
    @InjectModel(Store.name) private readonly storeModel: Model<StoreDocument>,
    private readonly viaCepService: ViacepService,
    private readonly googleMapsService: GoogleMapsService,
    private readonly melhorEnvioService: MelhorEnvioService,
  ) {}

  async create(createStoreDto: CreateStoreDto): Promise<Store> {
    try {
      const createdStore = new this.storeModel({
        ...createStoreDto,
        country: 'Brasil',
        location: {
          type: 'Point',
          coordinates: [createStoreDto.longitude, createStoreDto.latitude],
        },
      });

      return await createdStore.save();
    } catch (error) {
      this.logger.error(`Erro técnico: ${error.message}`);

      if (error instanceof Error.ValidationError) {
        const messages = Object.values(error.errors).map((err) => err.message);
        throw new HttpException(
          {
            statusCode: HttpStatus.BAD_REQUEST,
            message: 'Erro de validação',
            errors: messages,
          },
          HttpStatus.BAD_REQUEST,
        );
      }

      if (error.code === 11000) {
        const key = Object.keys(error.keyPattern)[0];
        throw new HttpException(
          {
            statusCode: HttpStatus.CONFLICT,
            message: `Já existe uma loja com este ${key}`,
            error: 'Conflito de dados',
          },
          HttpStatus.CONFLICT,
        );
      }

      throw new HttpException(
        {
          statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
          message: 'Ocorreu um erro inesperado',
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async findByCep(cep: string): Promise<StoreByCepResponse> {
    try {
      const formattedCep = this.formatCep(cep);
      const cepData = await this.viaCepService.findAddressByCep(formattedCep);
      const stores = await this.findStoresByState(cepData.uf);

      const validStores = (
        await Promise.all(
          stores.map(async (store) => {
            try {
              const distanceInfo = await this.calculateRealDistance(
                formattedCep,
                store.postalCode,
              );
              return this.buildStoreResponse(store, distanceInfo, formattedCep);
            } catch (error) {
              this.logger.error(
                `Error processing store ${store.storeID}: ${error.message}`,
              );
              return null;
            }
          }),
        )
      ).filter(
        (store): store is StoreByCepResponse['stores'][0] => store !== null,
      );

      return this.buildFinalResponse(validStores);
    } catch (error) {
      this.logger.error(`Error in findByCep: ${error.message}`, error.stack);
      throw new HttpException(
        'Erro ao buscar lojas',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async listAll(limit = 10, offset = 0) {
    try {
      const [stores, total] = await Promise.all([
        this.storeModel.find().limit(limit).skip(offset).lean().exec(),
        this.storeModel.countDocuments().exec(),
      ]);

      return {
        stores: stores.map((store) => this.mapToStoreResponse(store)),
        limit,
        offset,
        total,
      };
    } catch (error) {
      this.logger.error(`Error listing stores: ${error.message}`, error.stack);
      throw new HttpException(
        'Erro ao listar lojas',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async findById(storeID: string): Promise<Store> {
    try {
      const store = await this.storeModel.findOne({ storeID }).exec(); // Busca pelo storeID
      if (!store) {
        throw new HttpException('Loja não encontrada', HttpStatus.NOT_FOUND);
      }
      return store;
    } catch (error) {
      this.logger.error(
        `Error finding store by ID: ${error.message}`,
        error.stack,
      );
      throw new HttpException(
        'Erro ao buscar loja',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async findByState(state: string, limit = 10, offset = 0) {
    try {
      const [stores, total] = await Promise.all([
        this.storeModel
          .find({ state: state.toUpperCase() })
          .limit(limit)
          .skip(offset)
          .lean()
          .exec(),
        this.storeModel.countDocuments({ state: state.toUpperCase() }).exec(),
      ]);

      return {
        stores: stores.map((store) => this.mapToStoreResponse(store)),
        limit,
        offset,
        total,
      };
    } catch (error) {
      this.logger.error(
        `Error finding stores by state: ${error.message}`,
        error.stack,
      );
      throw new HttpException(
        'Erro ao buscar lojas por estado',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  private formatCep(cep: string): string {
    return cep.replace(/\D/g, '');
  }

  private async calculateRealDistance(
    originCep: string,
    destinationCep: string,
  ): Promise<GoogleDistanceMatrixElement> {
    try {
      const response = await this.googleMapsService.getDistanceMatrix({
        origins: [originCep],
        destinations: [destinationCep],
        units: 'metric',
        mode: 'driving',
      });

      const element = response.rows[0].elements[0];
      if (element.status !== 'OK') {
        throw new Error(`Status do cálculo de distância: ${element.status}`);
      }

      return element;
    } catch (error) {
      this.logger.error(`Distance calculation failed: ${error.message}`);
      throw error;
    }
  }
  //2
  private buildFinalResponse(
    stores: StoreByCepResponse['stores'],
  ): StoreByCepResponse {
    return {
      stores,
      pins: stores.map((store) => ({
        position: store.position,
        title: store.name,
      })),
      limit: stores.length,
      offset: 0,
      total: stores.length,
    };
  }
  //1
  private mapToStoreResponse(
    store: Store | StoreDocument,
  ): StoreByCepResponse['stores'][0] {
    return {
      name: store.storeName,
      city: store.city,
      postalCode: store.postalCode,
      type: store.type as 'PDV' | 'LOJA',
      distance: '',
      position: {
        lat: store.latitude,
        lng: store.longitude,
      },
      value: [],
    };
  }

  private async buildStoreResponse(
    store: Store | StoreDocument,
    distanceInfo: GoogleDistanceMatrixElement,
    originCep: string,
  ): Promise<StoreByCepResponse['stores'][0]> {
    const distanceMeters = distanceInfo.distance.value;
    const distanceKm = distanceMeters / 1000;
    const isPDV = this.isValidPDV(store, distanceMeters);

    const baseResponse = this.mapToStoreResponse(store);
    Object.assign(baseResponse, {
      distance: `${distanceKm.toFixed(1)} km`,
      duration: distanceInfo.duration.text,
    });

    if (isPDV) {
      baseResponse.value = [this.buildPdvDeliveryOption(store)];
    } else if (store.type === 'LOJA') {
      baseResponse.value = await this.getShippingOptions(
        originCep,
        store.postalCode,
      );
    }

    return baseResponse;
  }

  private isValidPDV(
    store: Store | StoreDocument,
    distanceMeters: number,
  ): boolean {
    return (
      store.type === 'PDV' &&
      distanceMeters <= DELIVERY_CONSTANTS.PDV.MAX_RADIUS_KM * 1000
    );
  }

  private buildPdvDeliveryOption(
    store: Store | StoreDocument,
  ): StoreDeliveryOption {
    const dias = store.shippingTimeInDays;
    return {
      prazo: `${dias} dia${dias !== 1 ? 's' : ''} ${dias !== 1 ? 'úteis' : 'útil'}`,
      price: `R$ ${DELIVERY_CONSTANTS.PDV.PRICE.toFixed(2)}`,
      description: DELIVERY_CONSTANTS.PDV.DESCRIPTION,
    };
  }

  private async getShippingOptions(
    originCep: string,
    destinationCep: string,
  ): Promise<StoreDeliveryOption[]> {
    try {
      const quotes = await this.melhorEnvioService.calculateShipping(
        originCep,
        destinationCep,
      );

      if (!quotes || !Array.isArray(quotes)) {
        this.logger.warn('No shipping quotes returned from Melhor Envio');
        return this.getDefaultShippingOptions();
      }

      return quotes
        .map((quote) => {
          const price = Number(quote?.price) || 0;
          const deliveryTime = Number(quote?.delivery_time) || 0;

          const isSedex = quote.name?.toLowerCase().includes('sedex');
          const isPac = quote.name?.toLowerCase().includes('pac');

          return {
            prazo: `${deliveryTime} dias úteis`,
            price: `R$ ${price.toFixed(2)}`,
            description: isSedex
              ? DELIVERY_CONSTANTS.CORREIOS.SEDEX.DESCRIPTION
              : isPac
                ? DELIVERY_CONSTANTS.CORREIOS.PAC.DESCRIPTION
                : quote.name || 'Entrega padrão',
            ...(isSedex || isPac
              ? {
                  codProdutoAgencia: isSedex
                    ? DELIVERY_CONSTANTS.CORREIOS.SEDEX.CODE
                    : DELIVERY_CONSTANTS.CORREIOS.PAC.CODE,
                  company: quote.company?.name || 'Correios',
                }
              : {}),
          };
        })
        .filter(
          (option) =>
            option.price &&
            (option.codProdutoAgencia ||
              option.description.includes('Sedex') ||
              option.description.includes('PAC')),
        );
    } catch (error) {
      this.logger.error('Error getting shipping options:', error);
      return this.getDefaultShippingOptions();
    }
  }

  private getDefaultShippingOptions(): StoreDeliveryOption[] {
    return [
      {
        prazo: `${DELIVERY_CONSTANTS.CORREIOS.SEDEX.DEFAULT_DAYS} dias úteis`,
        price: `R$ ${DELIVERY_CONSTANTS.CORREIOS.SEDEX.DEFAULT_PRICE.toFixed(2)}`,
        description: DELIVERY_CONSTANTS.CORREIOS.SEDEX.DESCRIPTION,
        codProdutoAgencia: DELIVERY_CONSTANTS.CORREIOS.SEDEX.CODE,
        company: 'Correios',
      },
      {
        prazo: `${DELIVERY_CONSTANTS.CORREIOS.PAC.DEFAULT_DAYS} dias úteis`,
        price: `R$ ${DELIVERY_CONSTANTS.CORREIOS.PAC.DEFAULT_PRICE.toFixed(2)}`,
        description: DELIVERY_CONSTANTS.CORREIOS.PAC.DESCRIPTION,
        codProdutoAgencia: DELIVERY_CONSTANTS.CORREIOS.PAC.CODE,
        company: 'Correios',
      },
    ];
  }

  private async findStoresByState(uf: string): Promise<StoreDocument[]> {
    return this.storeModel.find({ state: uf.toUpperCase() }).exec();
  }
}
