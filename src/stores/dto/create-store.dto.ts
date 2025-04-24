import { ApiProperty } from '@nestjs/swagger';
import {
  IsBoolean,
  IsNumber,
  IsString,
  IsNotEmpty,
  IsEnum,
  Min,
} from 'class-validator';

export class CreateStoreDto {
  @ApiProperty({ example: 'LOJA_SP_001', description: 'ID único da loja' })
  @IsNotEmpty()
  @IsString()
  storeID: string;

  @ApiProperty({ example: 'Loja Paulista', description: 'Nome da loja' })
  @IsNotEmpty()
  @IsString()
  storeName: string;

  @ApiProperty({ example: -23.5635, description: 'Latitude' })
  @IsNumber()
  latitude: number;

  @ApiProperty({ example: -46.6543, description: 'Longitude' })
  @IsNumber()
  longitude: number;

  @ApiProperty({
    example: 'Av. Paulista, 1000',
    description: 'Endereço principal',
  })
  @IsNotEmpty()
  @IsString()
  address1: string;

  @ApiProperty({ example: 'Centro', description: 'Bairro' })
  @IsNotEmpty()
  @IsString()
  district: string;

  @ApiProperty({ example: 'São Paulo', description: 'Cidade' })
  @IsNotEmpty()
  @IsString()
  city: string;

  @ApiProperty({ example: 'SP', description: 'Estado (UF)' })
  @IsNotEmpty()
  @IsString()
  state: string;

  @ApiProperty({ example: '01311000', description: 'CEP' })
  @IsNotEmpty()
  @IsString()
  postalCode: string;

  @ApiProperty({
    example: 'PDV',
    enum: ['PDV', 'LOJA'],
    description: 'Tipo de estabelecimento',
  })
  @IsEnum(['PDV', 'LOJA'])
  type: string;

  @ApiProperty({ example: 1, description: 'Prazo de entrega em dias' })
  @IsNumber()
  @Min(0)
  shippingTimeInDays: number;

  @ApiProperty({
    example: true,
    description: 'Permite retirada na loja',
    required: false,
  })
  @IsBoolean()
  takeOutInStore?: boolean = true;
}
