export class MelhorEnvioCompanyDto {
  id: number;
  name: string;
  picture?: string;
}

export class MelhorEnvioQuoteDto {
  id: string;
  name: string;
  price: number;
  custom_price?: number;
  discount?: number;
  currency: string;
  delivery_time: number;
  delivery_range: {
    min: number;
    max: number;
  };
  company?: MelhorEnvioCompanyDto;
  custom_delivery_time?: number;
  custom_delivery_range?: {
    min: number;
    max: number;
  };
}
