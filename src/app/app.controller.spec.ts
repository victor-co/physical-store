import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';

describe('AppController', () => {
  let controller: AppController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
    }).compile();

    controller = module.get<AppController>(AppController);
  });

  describe('getHello()', () => {
    it('deve retornar "Physical Store API"', () => {
      expect(controller.getHello()).toBe('Physical Store API');
    });
  });
});
