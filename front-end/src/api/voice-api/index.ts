// services/api.ts
import http from '@/api/http';

const apiKey = 'AIzaSyAJKCS3ks02UA8wqtq4U-AHPL85JWAUEus';
const url = `https://texttospeech.googleapis.com/v1/text:synthesize?key=${apiKey}`;
class VoiceApi {
  static getVoice(data: any): Promise<any> {
    return http.post(url, data);
  }
  static getVoicesList(languageCode: string): Promise<any> {
    return http.get(`https://texttospeech.googleapis.com/v1/voices?key=${apiKey}&languageCode=${languageCode}`);
  }
}

export default VoiceApi;
