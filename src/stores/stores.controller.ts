import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
  ApiBody,
} from '@nestjs/swagger';
import { StoresService } from './stores.service';
import { CreateStoreDto } from './dto/create-store.dto';
import { StoreResponseDto } from './dto/store-response.dto';
import { StoreByCepResponseDto } from './dto/store-by-cep-response.dto';

@ApiTags('Stores')
@Controller('stores')
export class StoresController {
  constructor(private readonly storesService: StoresService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Cria uma nova loja' })
  @ApiBody({ type: CreateStoreDto })
  @ApiResponse({
    status: 201,
    description: 'Loja criada com sucesso',
    type: StoreResponseDto,
  })
  async create(@Body() createStoreDto: CreateStoreDto) {
    return this.storesService.create(createStoreDto);
  }

  @Get()
  @ApiOperation({ summary: 'Lista todas as lojas' })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'offset', required: false, type: Number })
  @ApiResponse({
    status: 200,
    type: StoreResponseDto,
    description: 'Lista de lojas paginada',
  })
  async listAll(@Query('limit') limit = 10, @Query('offset') offset = 0) {
    return this.storesService.listAll(limit, offset);
  }

  @Get('cep/:cep')
  @ApiOperation({ summary: 'Busca lojas por CEP com opções de entrega' })
  @ApiParam({ name: 'cep', description: 'CEP do cliente', example: '01311000' })
  @ApiResponse({
    status: 200,
    type: StoreByCepResponseDto,
    description: 'Lojas encontradas com opções de entrega',
  })
  async findByCep(@Param('cep') cep: string) {
    return this.storesService.findByCep(cep);
  }

  @Get(':storeID')
  @ApiOperation({ summary: 'Busca loja por ID' })
  @ApiParam({
    name: 'storeID',
    description: 'ID custom da loja',
    example: 'LOJA_SP_001',
  })
  @ApiResponse({
    status: 200,
    type: StoreResponseDto,
    description: 'Detalhes da loja',
  })
  async findByStoreId(@Param('storeID') storeID: string) {
    return this.storesService.findById(storeID);
  }

  @Get('state/:state')
  @ApiOperation({ summary: 'Busca lojas por estado' })
  @ApiParam({ name: 'state', description: 'Sigla do estado', example: 'SP' })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'offset', required: false, type: Number })
  @ApiResponse({
    status: 200,
    type: StoreResponseDto,
    description: 'Lojas filtradas por estado',
  })
  async findByState(
    @Param('state') state: string,
    @Query('limit') limit = 10,
    @Query('offset') offset = 0,
  ) {
    return this.storesService.findByState(state, limit, offset);
  }
}
