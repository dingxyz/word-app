// services/api.ts
import http from '@/api/http';
import {WORD_TYPE} from "@/stores/useApp";

export class IWord {
  id?: string = null;
  english: string = '';
  chinese: string = '';
  annotation?: string = ''
  wordType?: WORD_TYPE;
}

class WordApi {
  static get(params: any): Promise<any> {
    return http.get('/words', { params });
  }
  static add(data: IWord): Promise<any> {
    return http.post('/words', data);
  }
  static update(data: IWord): Promise<any> {
    return http.put(`/words/${data.id}`, data);
  }
  static moveTo(data: any): Promise<any> {
    return http.post(`/words/move`, data);
  }
  static remove(id: string, params: any): Promise<any> {
    return http.delete(`/words/${id}`, { params });
  }
}

export default WordApi;
