import https from 'https';
import axios from 'axios';

export default class DictionaryApiHelper {
  constructor() {
    this.baseDictionaryApiUri = 'https://api.dictionaryapi.dev/api/v2/entries/en/';
  }

  async getDictionaryWordData(word) {
    const requestOptions = {
      method: 'GET',
      url: `${this.baseDictionaryApiUri}${word}`,
      httpsAgent: new https.Agent({
        rejectUnauthorized: false,
      }),
      responseType: 'json',
    };
    return await axios.request(requestOptions);
  }
}
