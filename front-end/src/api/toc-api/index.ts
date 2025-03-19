import http from '@/api/http';

export class ITOC {
  order: number = 1;
  bookId: string = '';
  title: string = '';
  detail?: string = '';
}

class TOCApi {
  static getList(params: any): Promise<any> {
    return http.get('/toc', { params });
  }

  static getById(id: string): Promise<any> {
    return http.get(`/toc/${id}`);
  }

  static search(data: any): Promise<any> {
    return http.post('/toc/search', data);
  }

  static add(data: ITOC): Promise<any> {
    return http.post('/toc', data);
  }

  static update(data: ITOC): Promise<any> {
    return http.put(`/toc/${data.order}`, data);
  }

  static remove(order: number): Promise<any> {
    return http.delete(`/toc/${order}`);
  }
}

export default TOCApi;
