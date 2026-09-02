import { Injectable } from '@nestjs/common';
import axios, { AxiosInstance } from 'axios';
import {
  VITRACT_QUESTIONAIRE_API_BASE_URL,
  VITRACT_REST_KEY,
} from 'src/config';

@Injectable()
export class VitractHealthInfoClient {
  private readonly http: AxiosInstance;

  constructor() {
    this.http = axios.create({
      baseURL:
        VITRACT_QUESTIONAIRE_API_BASE_URL ||
        'https://vitract-api.azurewebsites.net',
      timeout: 20000,
      headers: { VitractRest: VITRACT_REST_KEY },
    });
  }

  async exists(kitNumber: string, categoryId = 0): Promise<boolean> {
    const url = `/api/Vitract/ClientQuestionaire`;
    const res = await this.http.get(url, {
      params: { kitId: kitNumber, categoryId },
    });
    const data = res.data;
    if (Array.isArray(data)) return data.length > 0;
    if (data && typeof data === 'object' && data.status === false) return false;
    return false;
  }
}
