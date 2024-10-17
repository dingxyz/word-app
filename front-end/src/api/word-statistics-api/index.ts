// services/api.ts
import http from '@/api/http';

class WordStatisticsApi {
  static get(): Promise<any> {
    return http.get('/statistics');
  }

  static add(data: any): Promise<any> {
    return http.post('/statistics', data);
  }
}

export default WordStatisticsApi;
