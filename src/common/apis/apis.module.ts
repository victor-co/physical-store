import { Module } from '@nestjs/common';
import { ViacepService } from '../apis/services/viacep.service';
import { GoogleMapsService } from '../apis/services/google-maps.service';
import { MelhorEnvioService } from '../apis/services/melhor-envio.service';

@Module({
  providers: [ViacepService, GoogleMapsService, MelhorEnvioService],
  exports: [ViacepService, GoogleMapsService, MelhorEnvioService],
})
export class ApisModule {}
