import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { HttpException, Logger } from '@nestjs/common';
import { Error } from 'mongoose';

import { StoresService } from './stores.service';
import { ViacepService } from '../common/apis/services/viacep.service';
import { GoogleMapsService } from '../common/apis/services/google-maps.service';
import { MelhorEnvioService } from '../common/apis/services/melhor-envio.service';
import { DELIVERY_CONSTANTS } from '../common/constants/delivery.constants';
import { Store } from './entities/store.entity';
import { CreateStoreDto } from './dto/create-store.dto';

type MockStoreType = Omit<Store, 'location'> & {
  location: {
    type: string;
    coordinates: [number, number];
  };
  toObject: () => Store & {
    location: {
      type: string;
      coordinates: [number, number];
    };
  };
};

interface MongoDuplicateError extends Error {
  code: number;
  keyPattern: Record<string, number>;
}

class MockStoreModel {
  data: MockStoreType;

  constructor(data?: Partial<MockStoreType>) {
    const defaultData: MockStoreType = {
      storeID: '',
      storeName: '',
      postalCode: '',
      city: '',
      address1: '',
      district: '',
      state: '',
      latitude: 0,
      longitude: 0,
      type: 'PDV',
      shippingTimeInDays: 0,
      takeOutInStore: false,
      country: 'Brasil',
      location: {
        type: 'Point',
        coordinates: [0, 0],
      },
      toObject: () => ({
        ...this.data,
        location: {
          type: 'Point',
          coordinates: this.data.location.coordinates,
        },
      }),
    };

    this.data = { ...defaultData, ...data } as MockStoreType;
  }

  save() {
    return Promise.resolve(this.data);
  }

  static find = jest.fn().mockReturnValue({
    exec: jest.fn().mockResolvedValue([]),
    limit: jest.fn().mockReturnThis(),
    skip: jest.fn().mockReturnThis(),
    lean: jest.fn().mockReturnThis(),
  });

  static countDocuments = jest.fn().mockReturnValue({
    exec: jest.fn().mockResolvedValue(0),
  });

  static findOne = jest.fn().mockReturnValue({
    exec: jest.fn().mockResolvedValue(null),
  });
}

const mockViaCepService = {
  findAddressByCep: jest.fn().mockResolvedValue({ uf: 'SP' }),
};

const mockGoogleMapsService = {
  getDistanceMatrix: jest.fn().mockResolvedValue({
    rows: [
      {
        elements: [
          {
            status: 'OK',
            distance: { text: '1.0 km', value: 1000 },
            duration: { text: '10 mins', value: 600 },
          },
        ],
      },
    ],
  }),
};

const mockMelhorEnvioService = {
  calculateShipping: jest.fn().mockResolvedValue([
    {
      name: 'Sedex',
      price: 27.0,
      delivery_time: 2,
      company: { name: 'Correios' },
    },
    {
      name: 'PAC',
      price: 25.5,
      delivery_time: 6,
      company: { name: 'Correios' },
    },
  ]),
};

describe('StoresService', () => {
  let service: StoresService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        StoresService,
        {
          provide: getModelToken(Store.name),
          useValue: MockStoreModel,
        },
        {
          provide: Logger,
          useValue: { error: jest.fn() },
        },
        {
          provide: ViacepService,
          useValue: mockViaCepService,
        },
        {
          provide: GoogleMapsService,
          useValue: mockGoogleMapsService,
        },
        {
          provide: MelhorEnvioService,
          useValue: mockMelhorEnvioService,
        },
      ],
    }).compile();

    service = module.get<StoresService>(StoresService);
    jest.clearAllMocks();
  });

  describe('create', () => {
    const createStoreDto: CreateStoreDto = {
      storeID: 'TEST_001',
      storeName: 'Test Store',
      postalCode: '01311000',
      city: 'São Paulo',
      address1: 'Rua Teste, 123',
      district: 'Centro',
      state: 'SP',
      latitude: -23.5505,
      longitude: -46.6333,
      type: 'PDV',
      shippingTimeInDays: 3,
    };

    it('deve criar uma loja com sucesso incluindo country automaticamente', async () => {
      const mockStore = {
        ...createStoreDto,
        country: 'Brasil',
        takeOutInStore: false,
        location: {
          type: 'Point',
          coordinates: [createStoreDto.longitude, createStoreDto.latitude],
        },
        toObject: function () {
          return {
            ...this,
            location: {
              type: 'Point',
              coordinates: this.location.coordinates,
            },
          };
        },
      } as unknown as MockStoreType;

      jest
        .spyOn(MockStoreModel.prototype, 'save')
        .mockResolvedValueOnce(mockStore);

      const result = await service.create(createStoreDto);
      expect(result).toEqual(mockStore);
    });

    it('deve lançar erro de validação quando dados são inválidos', async () => {
      const validationError = new Error.ValidationError();
      validationError.message = 'Validation failed';
      validationError.errors = {
        storeName: new Error.ValidatorError({
          message: 'Nome da loja é obrigatório',
          path: 'storeName',
          value: undefined,
        }),
      };

      jest
        .spyOn(MockStoreModel.prototype, 'save')
        .mockRejectedValueOnce(validationError);

      await expect(service.create({} as CreateStoreDto)).rejects.toThrow(
        HttpException,
      );
    });

    it('deve lançar erro de conflito quando loja já existe', async () => {
      const duplicateError = new Error('Duplicate key') as MongoDuplicateError;
      duplicateError.code = 11000;
      duplicateError.keyPattern = { storeID: 1 };

      jest
        .spyOn(MockStoreModel.prototype, 'save')
        .mockRejectedValueOnce(duplicateError);

      await expect(service.create(createStoreDto)).rejects.toThrow(
        HttpException,
      );
    });
  });

  describe('listAll', () => {
    it('deve retornar lista vazia quando não há lojas', async () => {
      MockStoreModel.find().exec.mockResolvedValueOnce([]);
      MockStoreModel.countDocuments().exec.mockResolvedValueOnce(0);

      const result = await service.listAll();
      expect(result.stores).toEqual([]);
      expect(result.total).toBe(0);
    });

    it('deve retornar lista com lojas quando existem', async () => {
      const mockStores = [
        {
          storeID: 'TEST_001',
          storeName: 'Test Store',
          postalCode: '01311000',
          city: 'São Paulo',
          type: 'PDV',
          state: 'SP',
          country: 'Brasil',
          latitude: -23.5505,
          longitude: -46.6333,
          address1: 'Rua Teste, 123',
          district: 'Centro',
          shippingTimeInDays: 3,
        },
      ];

      MockStoreModel.find().exec.mockResolvedValueOnce(mockStores);
      MockStoreModel.countDocuments().exec.mockResolvedValueOnce(1);

      const result = await service.listAll();
      expect(result.stores.length).toBe(1);
      expect(result.total).toBe(1);
    });
  });

  describe('findById', () => {
    const mockStore = {
      storeID: 'TEST_001',
      storeName: 'Test Store',
      postalCode: '01311000',
      city: 'São Paulo',
      type: 'PDV',
      state: 'SP',
      country: 'Brasil',
      latitude: -23.5505,
      longitude: -46.6333,
      address1: 'Rua Teste, 123',
      district: 'Centro',
      shippingTimeInDays: 3,
    };

    it('deve retornar a loja quando encontrada', async () => {
      MockStoreModel.findOne().exec.mockResolvedValueOnce(mockStore);

      const result = await service.findById('TEST_001');
      expect(result).toEqual(mockStore);
    });

    it('deve lançar erro quando loja não é encontrada', async () => {
      MockStoreModel.findOne().exec.mockResolvedValueOnce(null);

      await expect(service.findById('INVALID_ID')).rejects.toThrow(
        HttpException,
      );
    });
  });

  describe('findByState', () => {
    const mockStores = [
      {
        storeID: 'TEST_001',
        storeName: 'Test Store SP',
        postalCode: '01311000',
        city: 'São Paulo',
        type: 'PDV',
        state: 'SP',
        country: 'Brasil',
        latitude: -23.5505,
        longitude: -46.6333,
        address1: 'Rua Teste, 123',
        district: 'Centro',
        shippingTimeInDays: 3,
      },
    ];

    it('deve retornar lojas filtradas por estado', async () => {
      MockStoreModel.find().exec.mockResolvedValueOnce(mockStores);
      MockStoreModel.countDocuments().exec.mockResolvedValueOnce(1);

      const result = await service.findByState('SP');
      expect(result.stores.length).toBe(1);
      expect(result.stores[0].name).toBe('Test Store SP');
    });

    it('deve retornar lista vazia quando não há lojas no estado', async () => {
      MockStoreModel.find().exec.mockResolvedValueOnce([]);
      MockStoreModel.countDocuments().exec.mockResolvedValueOnce(0);

      const result = await service.findByState('RJ');
      expect(result.stores).toEqual([]);
      expect(result.total).toBe(0);
    });
  });

  describe('findByCep — fluxo PDV', () => {
    it('deve retornar opção PDV com frete de R$ 15,00 se distância ≤ 50km', async () => {
      MockStoreModel.find().exec.mockResolvedValueOnce([
        {
          storeID: 'PDV_001',
          storeName: 'Loja PDV',
          postalCode: '01311000',
          city: 'São Paulo',
          latitude: -23.5505,
          longitude: -46.6333,
          type: 'PDV',
          shippingTimeInDays: 1,
          toObject: () => ({
            location: {
              coordinates: [-46.6333, -23.5505],
            },
          }),
        },
      ]);

      const result = await service.findByCep('01311000');
      expect(result.stores[0].value).toEqual([
        {
          prazo: '1 dia útil',
          price: `R$ ${DELIVERY_CONSTANTS.PDV.PRICE.toFixed(2)}`,
          description: DELIVERY_CONSTANTS.PDV.DESCRIPTION,
        },
      ]);
    });
  });

  describe('findByCep — fluxo LOJA', () => {
    it('deve retornar opções Sedex e PAC para loja do tipo LOJA', async () => {
      MockStoreModel.find().exec.mockResolvedValueOnce([
        {
          storeID: 'LOJA_001',
          storeName: 'Loja Distante',
          postalCode: '80000000',
          city: 'Curitiba',
          latitude: -25.4278,
          longitude: -49.273,
          type: 'LOJA',
          toObject: () => ({
            location: {
              coordinates: [-49.273, -25.4278],
            },
            shippingTimeInDays: 1,
          }),
        },
      ]);

      const result = await service.findByCep('01311000');
      expect(result.stores[0].value).toEqual([
        {
          prazo: '2 dias úteis',
          price: 'R$ 27.00',
          description: DELIVERY_CONSTANTS.CORREIOS.SEDEX.DESCRIPTION,
          codProdutoAgencia: DELIVERY_CONSTANTS.CORREIOS.SEDEX.CODE,
          company: 'Correios',
        },
        {
          prazo: '6 dias úteis',
          price: 'R$ 25.50',
          description: DELIVERY_CONSTANTS.CORREIOS.PAC.DESCRIPTION,
          codProdutoAgencia: DELIVERY_CONSTANTS.CORREIOS.PAC.CODE,
          company: 'Correios',
        },
      ]);
    });
  });
});
