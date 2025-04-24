import { ApiProperty } from '@nestjs/swagger';

export class StoreDeliveryOptionDto {
  @ApiProperty({
    example: '1 dia útil',
    description: 'Prazo de entrega estimado',
  })
  prazo: string;

  @ApiProperty({
    example: 'R$ 15,00',
    description: 'Valor do frete',
  })
  price: string;

  @ApiProperty({
    example: 'Motoboy',
    description: 'Descrição do método de entrega',
  })
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
  @ApiProperty({
    example: -23.5505,
    description: 'Latitude da loja',
  })
  lat: number;

  @ApiProperty({
    example: -46.6333,
    description: 'Longitude da loja',
  })
  lng: number;
}

export class StoreByCepDto {
  @ApiProperty({
    example: 'Loja Centro',
    description: 'Nome da loja',
  })
  name: string;

  @ApiProperty({
    example: 'São Paulo',
    description: 'Cidade onde a loja está localizada',
  })
  city: string;

  @ApiProperty({
    example: '01310-100',
    description: 'CEP da loja',
  })
  postalCode: string;

  @ApiProperty({
    enum: ['PDV', 'LOJA'],
    description: 'Tipo de estabelecimento',
    example: 'PDV',
  })
  type: string;

  @ApiProperty({
    example: '3.1 km',
    description: 'Distância entre o CEP consultado e a loja',
  })
  distance: string;

  @ApiProperty({
    example: '10 minutos',
    description: 'Tempo estimado de entrega',
    required: false,
  })
  duration?: string;

  @ApiProperty({
    type: [StoreDeliveryOptionDto],
    description: 'Opções de entrega disponíveis',
  })
  value: StoreDeliveryOptionDto[];

  @ApiProperty({
    type: StorePositionDto,
    description: 'Posição geográfica da loja',
  })
  position: StorePositionDto;
}

export class MapPinDto {
  @ApiProperty({
    type: StorePositionDto,
    description: 'Coordenadas do marcador no mapa',
  })
  position: StorePositionDto;

  @ApiProperty({
    example: 'Loja Centro',
    description: 'Título do marcador no mapa',
  })
  title: string;
}

export class StoreByCepResponseDto {
  @ApiProperty({
    type: [StoreByCepDto],
    description: 'Lista de lojas encontradas',
  })
  stores: StoreByCepDto[];

  @ApiProperty({
    type: [MapPinDto],
    description: 'Marcadores para exibição no mapa',
  })
  pins: MapPinDto[];

  @ApiProperty({
    example: 10,
    description: 'Número máximo de resultados por página',
  })
  limit: number;

  @ApiProperty({
    example: 0,
    description: 'Offset utilizado na paginação',
  })
  offset: number;

  @ApiProperty({
    example: 100,
    description: 'Total de lojas disponíveis',
  })
  total: number;
}
