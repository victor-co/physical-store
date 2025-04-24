import { plainToInstance } from 'class-transformer';
import { IsString } from 'class-validator';
import { validateSync } from 'class-validator';

class EnvVariables {
  @IsString()
  MONGODB_URI: string;

  @IsString()
  GOOGLE_MAPS_API_KEY: string;

  @IsString()
  MELHOR_ENVIO_TOKEN: string;
}

export function validate(config: Record<string, unknown>) {
  const validatedConfig = plainToInstance(EnvVariables, config);
  const errors = validateSync(validatedConfig);

  if (errors.length > 0) {
    throw new Error(errors.toString());
  }
  return validatedConfig;
}
