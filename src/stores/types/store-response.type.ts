import { Store } from '../entities/store.entity';

export type StoreResponse = {
  stores: Store[];
  limit: number;
  offset: number;
  total: number;
};

export type StoreDeliveryOption = {
  prazo: string;
  price: string;
  description: string;
  company?: string;
  codProdutoAgencia?: string;
};

export type StoreByCepResponse = {
  name: string;
  city: string;
  postalCode: string;
  type: 'PDV' | 'LOJA';
  distance: string;
  duration?: string;
  value: StoreDeliveryOption[];
  position?: {
    lat: number;
    lng: number;
  };
};

export type StoreByCepListResponse = {
  stores: StoreByCepResponse[];
  pins: Array<{
    position: {
      lat: number;
      lng: number;
    };
    title: string;
  }>;
  limit: number;
  offset: number;
  total: number;
};
