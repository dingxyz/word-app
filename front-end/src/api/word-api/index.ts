// services/api.ts
import http from '@/api/http';

export class IWord {
  id?: string = null;
  english: string = '';
  chinese: string = '';
}

class WordApi {
  static get(): Promise<any> {
    return http.get('/words');
  }
  static add(data: IWord): Promise<any> {
    return http.post('/words', data);
  }
  static update(data: IWord): Promise<any> {
    return http.put(`/words/${data.id}`, data);
  }
  static remove(id: string): Promise<any> {
    return http.delete(`/words/${id}`);
  }
}

export default WordApi;