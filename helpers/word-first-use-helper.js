import https from 'https';
import axios from 'axios';

export default class WordFirstUseHelper {
  constructor() {
    this.baseMerriamWebsterUrl = 'https://www.merriam-webster.com/dictionary/';
    this.FIRST_USE_STRING_KEY = 'The first known use';
  }

  async getWordFirstUse(word) {
    const requestOptions = {
      method: 'GET',
      url: `${this.baseMerriamWebsterUrl}${word}`,
      httpsAgent: new https.Agent({
        rejectUnauthorized: false,
      }),
      responseType: 'json',
    };
    const response = await axios.request(requestOptions);
    return this.extractFirstUseFromResponse(response);
  }

  extractFirstUseFromResponse(response) {
    const htmlString = response.data;
    const firstUseIdx = htmlString.indexOf(this.FIRST_USE_STRING_KEY);
    const firstUsePhrase = htmlString.slice(
      firstUseIdx,
      firstUseIdx + htmlString.slice(firstUseIdx).indexOf('</span>')
    );
    var firstUseYear = firstUsePhrase.match(/(\d+)/)[0];
    console.log(firstUsePhrase);
    firstUseYear = firstUsePhrase.includes('century') ? `${firstUseYear}00` : firstUseYear;
    return parseInt(firstUseYear);
  }
}
