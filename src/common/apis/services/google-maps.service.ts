import { Injectable, Logger } from '@nestjs/common';
import axios from 'axios';

interface DistanceMatrixParams {
  origins: string[];
  destinations: string[];
  units?: 'metric' | 'imperial';
  mode?: 'driving' | 'walking' | 'bicycling' | 'transit';
}

@Injectable()
export class GoogleMapsService {
  private readonly logger = new Logger(GoogleMapsService.name);
  private readonly API_KEY = process.env.GOOGLE_MAPS_API_KEY;
  private readonly BASE_URL =
    'https://maps.googleapis.com/maps/api/distancematrix/json';

  async getDistanceMatrix(params: DistanceMatrixParams) {
    try {
      const {
        origins,
        destinations,
        units = 'metric',
        mode = 'driving',
      } = params;

      const response = await axios.get(this.BASE_URL, {
        params: {
          origins: origins.join('|'),
          destinations: destinations.join('|'),
          units,
          mode,
          key: this.API_KEY,
        },
      });

      if (response.data.status !== 'OK') {
        throw new Error(`Google Maps API error: ${response.data.status}`);
      }

      return response.data;
    } catch (error) {
      this.logger.error(
        'Error in Google Maps API',
        error.response?.data || error.message,
      );
      throw error;
    }
  }
}
