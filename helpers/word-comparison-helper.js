import WordInfoHelper from './word-info-helper.js';
import { comparisonConstants } from '../lib/comparison-constants.js';

export default class WordComparisonHelper {
  constructor() {
    this.wordInfoHelper = new WordInfoHelper();
  }

  /**
   * Compares an input word to a target word, returning a summary of their comparison
   * @param {*} word
   * @param {*} targetWordInfo
   * @returns - comparison object:
   * {
   *    sameWord: boolean, - indicates whether the input word is the same word as the target word
   *    alphabetically: string, - indicates whether target word comes earlier or later alphabetically than input word
   *    correctLetters: string, - indicates which letters of the input word match letters of the target word
   *    numLetters: string, - indicates whether target word is shorter or longer than input word
   *    numSyllables: string, - indicates whether the target word has fewer or more syllables than input word
   *    firstUsed: string, - indicates whether the first use of target word is earlier or later than first use of input word
   *    definition: string, - a portion of the target word's definition, with later guesses seeing more of the definition
   * }
   */
  async compareWordToTargetWord(word, targetWordInfo, guessNumber, prevMatchingLetters) {
    const [numLetters, numSyllables, firstUsed, definition] = await this.wordInfoHelper.getWordInfo(word);
    const sameWord = word.toUpperCase() === targetWordInfo.word.toUpperCase();
    const comparison = {
      sameWord,
      alphabetically: this.compareAlphabetically(word, targetWordInfo.word),
      correctLetters: this.determineCorrectLetters(word, targetWordInfo.word, prevMatchingLetters),
      numLetters: this.compareWordLengths(numLetters, targetWordInfo.numLetters),
      numSyllables: this.compareNumSyllables(numSyllables, targetWordInfo.numSyllables),
      firstUsed: this.compareFirstUse(firstUsed, targetWordInfo.firstUsed),
      definitionPortion: this.getDefinitionPortion(targetWordInfo.definition, guessNumber, sameWord),
    };
    return {
      numLetters,
      numSyllables,
      firstUsed,
      comparison,
    };
  }

  /**
   * Compares the input word and target word, returning whether the target word is earlier or later (or same) in the alphabet than the input word
   * @param {*} word
   * @param {*} targetWord
   * @returns
   */
  compareAlphabetically(word, targetWord) {
    if (word.toUpperCase() === targetWord.toUpperCase()) {
      return comparisonConstants.alphabetically.SAME;
    } else if (word.toUpperCase() > targetWord.toUpperCase()) {
      return comparisonConstants.alphabetically.EARLIER;
    } else {
      return comparisonConstants.alphabetically.LATER;
    }
  }

  /**
   * Determine which letters of the input word exactly match the letters of the target word
   * For example, 'traders, trace' would return 'tra-e--'
   * Takes in previous matching letters string and adds newly matched letters
   * @param {*} word
   * @param {*} targetWord
   * @returns
   */
  determineCorrectLetters(word, targetWord, prevMatchingLetters) {
    const hadPreviousMatch = (previous, i) => {
      if (i + 1 > previous.length) return false;
      return previous[i] != '-';
    };

    var correctLetters = '';
    for (var i = 0; i < word.length; i++) {
      if (hadPreviousMatch(prevMatchingLetters, i)) {
        correctLetters = `${correctLetters} ${targetWord[i]}`;
      } else {
        if (i < targetWord.length) {
          correctLetters = `${correctLetters} ${targetWord[i] == word[i] ? word[i] : '-'}`;
        } else {
          correctLetters = `${correctLetters} -`;
        }
      }
    }
    return correctLetters;
  }

  /**
   * Compares the lengths of the input word and target word, returning if the target word has
   * fewer or more (or same) letters than the input word
   * @param {*} wordLength
   * @param {*} targetWordLength
   * @returns
   */
  compareWordLengths(wordLength, targetWordLength) {
    if (wordLength == targetWordLength) {
      return comparisonConstants.numerically.SAME;
    } else if (wordLength > targetWordLength) {
      return comparisonConstants.numerically.FEWER;
    } else {
      return comparisonConstants.numerically.MORE;
    }
  }

  /**
   * Compares the number of syllables of the input word and target word, returning if the target word has
   * fewer or more (or same) number of syllables than target word
   * @param {*} numWordSyllables
   * @param {*} numTargetWordSyllables
   * @returns
   */
  compareNumSyllables(numWordSyllables, numTargetWordSyllables) {
    if (numWordSyllables == numTargetWordSyllables) {
      return comparisonConstants.numerically.SAME;
    } else if (numWordSyllables > numTargetWordSyllables) {
      return comparisonConstants.numerically.FEWER;
    } else {
      return comparisonConstants.numerically.MORE;
    }
  }

  /**
   * Compares the first uses of the input word and the target word. Returns whether the target
   * word's first use is earlier or later (or same) than input word's first use
   * @param {*} inputWordFirstUse
   * @param {*} targetWordFirstUse
   */
  compareFirstUse(inputWordFirstUse, targetWordFirstUse) {
    if (inputWordFirstUse == targetWordFirstUse) {
      return comparisonConstants.chronologically.SAME;
    } else if (inputWordFirstUse > targetWordFirstUse) {
      return comparisonConstants.chronologically.EARLIER;
    } else {
      return comparisonConstants.chronologically.LATER;
    }
  }

  /**
   * Gets a portion of the target word's definition, with more of the definition being revealed
   * with each guess
   * @param {*} definition
   * @param {*} guessNumber
   * @param {*} sameWord
   * @returns
   */
  getDefinitionPortion(definition, guessNumber, sameWord) {
    if (sameWord) return definition;
    const NUM_WORDS_PER_GUESS = 3;
    const wordArray = definition.split(' ');
    var definitionPortion = '';
    var numWords = guessNumber * NUM_WORDS_PER_GUESS;
    for (var word = 0; word < numWords; word++) {
      definitionPortion = `${definitionPortion} ${word < wordArray.length ? wordArray[word] : ''}`;
    }
    definitionPortion = `${definitionPortion} ${numWords < wordArray.length ? '...' : ''}`;
    return definitionPortion;
  }
}
