import DictionaryApiHelper from './dictionary-api-helper.js';
import WordFirstUseHelper from './word-first-use-helper.js';

export default class WordInfoHelper {
  constructor() {
    this.dictionaryApiHelper = new DictionaryApiHelper();
    this.wordFirstUseHelper = new WordFirstUseHelper();
  }

  /**
   * Gets all info about the input word
   * @param {*} word - word to get info on
   * @returns
   */
  async getWordInfo(word) {
    try {
      const dictionaryResponse = await this.dictionaryApiHelper.getDictionaryWordData(word);
      const wordInfo = dictionaryResponse.data[0];
      const numLetters = word.length;
      const numSyllables = await this.getNumSyllables(word);
      const firstUse = await this.wordFirstUseHelper.getWordFirstUse(word);
      const definition = this.getWordDefinition(wordInfo);
      return [numLetters, numSyllables, firstUse, definition];
    } catch (error) {
      console.log(`Dictionary API did not include entry for ${word}. Error: ${error}`);
      return error;
    }
  }

  /**
   * Gets the number of syllables in the input word
   * @param {} word
   * @returns
   */
  getNumSyllables(word) {
    word = word.toLowerCase();
    var t_some = 0;
    if (word.length > 3) {
      if (word.substring(0, 4) == 'some') {
        word = word.replace('some', '');
        t_some++;
      }
    }
    word = word.replace(/(?:[^laeiouy]|ed|[^laeiouy]e)$/, '');
    word = word.replace(/^y/, '');
    var syl = word.match(/[aeiouy]{1,2}/g);
    if (syl) {
      return syl.length + t_some;
    }
  }

  /**
   * Gets the definition of the input word
   * @param {} word
   * @returns
   */
  getWordDefinition(wordInfo) {
    return wordInfo.meanings[0].definitions[0].definition;
  }
}
