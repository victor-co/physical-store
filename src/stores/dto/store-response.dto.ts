import { ApiProperty } from '@nestjs/swagger';

export class StoreDeliveryOptionDto {
  @ApiProperty({ example: '1 dia útil', description: 'Prazo de entrega' })
  prazo: string;

  @ApiProperty({ example: 'R$ 15,00', description: 'Valor do frete' })
  price: string;

  @ApiProperty({ example: 'Motoboy', description: 'Descrição do método' })
  description: string;

  @ApiProperty({
    example: '04014',
    description: 'Código do produto/agência (para Correios)',
    required: false,
  })
  codProdutoAgencia?: string;

  @ApiProperty({
    example: 'Correios',
    description: 'Empresa responsável pela entrega',
    required: false,
  })
  company?: string;
}

export class StorePositionDto {
  @ApiProperty({ example: -23.5505, description: 'Latitude' })
  lat: number;

  @ApiProperty({ example: -46.6333, description: 'Longitude' })
  lng: number;
}

export class StoreResponseDto {
  @ApiProperty({ example: 'Loja Centro', description: 'Nome da loja' })
  name: string;

  @ApiProperty({ example: 'São Paulo', description: 'Cidade da loja' })
  city: string;

  @ApiProperty({ example: '01310-000', description: 'CEP da loja' })
  postalCode: string;

  @ApiProperty({
    enum: ['PDV', 'LOJA'],
    description: 'Tipo de estabelecimento',
  })
  type: string;

  @ApiProperty({ example: '3.1 km', description: 'Distância calculada' })
  distance?: string;

  @ApiProperty({
    example: '10 minutos',
    description: 'Tempo de entrega',
    required: false,
  })
  duration?: string;

  @ApiProperty({
    type: [StoreDeliveryOptionDto],
    description: 'Opções de entrega',
  })
  value?: StoreDeliveryOptionDto[];

  @ApiProperty({ type: StorePositionDto, description: 'Posição geográfica' })
  position: StorePositionDto;
}

export class PaginatedStoreResponseDto {
  @ApiProperty({ type: [StoreResponseDto], description: 'Lista de lojas' })
  stores: StoreResponseDto[];

  @ApiProperty({ example: 10, description: 'Limite por página' })
  limit: number;

  @ApiProperty({ example: 0, description: 'Offset da paginação' })
  offset: number;

  @ApiProperty({ example: 100, description: 'Total de lojas' })
  total: number;
}

export class MapPinDto {
  @ApiProperty({ type: StorePositionDto, description: 'Posição no mapa' })
  position: StorePositionDto;

  @ApiProperty({ example: 'Loja Centro', description: 'Título do marcador' })
  title: string;
}

export class StoreByCepResponseDto extends PaginatedStoreResponseDto {
  @ApiProperty({ type: [MapPinDto], description: 'Marcadores do mapa' })
  pins: MapPinDto[];
}
