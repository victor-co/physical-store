import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({
  timestamps: true,
  autoIndex: true,
  collection: 'stores',
})
export class Store {
  @Prop({
    type: String,
    required: [true, 'storeID é obrigatório'],
    unique: true,
    trim: true,
    index: true,
  })
  storeID: string;

  @Prop({
    type: String,
    required: [true, 'storeName é obrigatório'],
    trim: true,
  })
  storeName: string;

  @Prop({
    type: Boolean,
    required: true,
    default: true,
  })
  takeOutInStore: boolean;

  @Prop({
    type: Number,
    required: [true, 'shippingTimeInDays é obrigatório'],
    min: [0, 'O prazo deve ser positivo'],
  })
  shippingTimeInDays: number;

  @Prop({
    type: Number,
    required: [true, 'latitude é obrigatória'],
    min: -90,
    max: 90,
  })
  latitude: number;

  @Prop({
    type: Number,
    required: [true, 'longitude é obrigatória'],
    min: -180,
    max: 180,
  })
  longitude: number;

  @Prop({
    type: String,
    required: [true, 'address1 é obrigatório'],
    trim: true,
  })
  address1: string;

  @Prop({ type: String, trim: true })
  address2?: string;

  @Prop({ type: String, trim: true })
  address3?: string;

  @Prop({
    type: String,
    required: [true, 'city é obrigatória'],
    trim: true,
  })
  city: string;

  @Prop({
    type: String,
    required: [true, 'district é obrigatório'],
    trim: true,
  })
  district: string;

  @Prop({
    type: String,
    required: [true, 'state é obrigatório'],
    length: 2,
    uppercase: true,
    trim: true,
  })
  state: string;

  @Prop({
    type: String,
    required: [true, 'type é obrigatório'],
    enum: ['PDV', 'LOJA'],
    uppercase: true,
    trim: true,
  })
  type: string;

  @Prop({
    type: String,
    required: [true, 'country é obrigatório'],
    default: 'Brasil',
    trim: true,
  })
  country: string;

  @Prop({
    type: String,
    required: [true, 'postalCode é obrigatório'],
    match: [/^\d{8}$/, 'CEP deve conter 8 dígitos'],
    trim: true,
    set: (cep: string) => {
      const cleanedCep = cep.replace(/\D/g, ''); // Remove não-dígitos
      if (cleanedCep.length !== 8) throw new Error('CEP inválido');
      return cleanedCep;
    },
    get: (cep: string) => cep.replace(/(\d{5})(\d{3})/, '$1-$2'),
  })
  postalCode: string;

  @Prop({
    type: String,
    match: [/^\d{10,11}$/, 'Telefone inválido'],
    trim: true,
  })
  telephoneNumber?: string;

  @Prop({
    type: String,
    match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Email inválido'],
    lowercase: true,
    trim: true,
  })
  emailAddress?: string;

  @Prop({
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point',
    },
    coordinates: {
      type: [Number],
      default: [0, 0],
    },
  })
  location: {
    type: string;
    coordinates: [number, number];
  };
}

export const StoreSchema = SchemaFactory.createForClass(Store);

StoreSchema.index({ postalCode: 1 });
StoreSchema.index({ state: 1 });
StoreSchema.index({ location: '2dsphere' });

StoreSchema.pre('save', function (next) {
  if (this.isModified('latitude') || this.isModified('longitude')) {
    this.location.coordinates = [this.longitude, this.latitude];
  }
  next();
});

export type StoreDocument = Store & Document;
