import { Schema, model } from 'mongoose';

export interface IStore {
  name: string;
  cep: string;
  street: string;
  neighborhood: string;
  city: string;
  state: string;
  latitude: number;
  longitude: number;
}

const StoreSchema = new Schema<IStore>({
  name: { type: String, required: true },
  cep: { type: String, required: true, unique: true },
  street: { type: String, required: true },
  neighborhood: { type: String, required: true },
  city: { type: String, required: true },
  state: { type: String, required: true },
  latitude: { type: Number, required: true },
  longitude: { type: Number, required: true },
});

export const Store = model<IStore>('Store', StoreSchema);