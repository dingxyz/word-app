// services/api.ts
import http from '@/api/http';

const apiKey = 'AIzaSyAJKCS3ks02UA8wqtq4U-AHPL85JWAUEus';
const url = `https://texttospeech.googleapis.com/v1/text:synthesize?key=${apiKey}`;
class VoiceApi {
  static getVoice(data: any): Promise<any> {
    return http.post(url, data);
  }
}

export default VoiceApi;
