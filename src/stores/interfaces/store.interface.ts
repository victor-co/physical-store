import { Document } from 'mongoose';

export interface IStore extends Document {
  storeID: string;
  storeName: string;
  takeOutInStore: boolean;
  shippingTimeInDays: number;
  latitude: number;
  longitude: number;
  address1: string;
  address2?: string;
  address3?: string;
  city: string;
  district: string;
  state: string;
  type: 'PDV' | 'LOJA';
  country: string;
  postalCode: string;
  telephoneNumber?: string;
  emailAddress?: string;
}

// Interface Geolocalização
export interface IStoreLocation {
  latitude: number;
  longitude: number;
  postalCode: string;
  state: string;
}
