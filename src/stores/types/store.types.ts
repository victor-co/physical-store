export type StoreByCepResponse = {
  stores: Array<{
    name: string;
    city: string;
    postalCode: string;
    type: 'PDV' | 'LOJA';
    distance: string;
    duration?: string;
    value: StoreDeliveryOption[];
    position: {
      lat: number;
      lng: number;
    };
  }>;
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

export type StoreDeliveryOption = {
  prazo: string;
  price: string;
  description: string;
  company?: string;
  codProdutoAgencia?: string;
};
