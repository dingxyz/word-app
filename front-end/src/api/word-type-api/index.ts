// services/api.ts
import http from '@/api/http';

export class WordType {
  id?: string = null;
  name: string = '';
  order?: number = 0;
  hasTOC?: boolean = false;
  parentId?: string = null;
}

class WordTypeApi {
  static get(): Promise<any> {
    return http.get('/types');
  }

  static add(data: WordType): Promise<any> {
    return http.post('/types', data);
  }

  static update(data: WordType): Promise<any> {
    return http.put(`/types/${data.id}`, data);
  }

  static remove(id: string): Promise<any> {
    return http.delete(`/types/${id}`);
  }
}

export default WordTypeApi;
