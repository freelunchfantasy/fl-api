export default class DataProcessingHelper {
  constructor() {}

  processUser(user) {
    return {
      id: user.id,
      firstName: user.first_name,
      lastName: user.last_name,
      email: user.email,
      leagues: user.leagues,
    };
  }

  processTargetWords(words) {
    return words.map(word => ({
      id: word.id,
      word: word.word,
      numLetters: word.num_letters,
      numSyllables: word.num_syllables,
      firstUsed: word.first_used,
      definition: word.word_definition,
      targetDate: word.target_date,
      numGuesses: word.num_guesses,
      numUsers: word.num_users,
      statsResolved: word.stats_resolved,
    }));
  }

  processTargetWordStats(stats) {
    return {
      id: stats.id,
      word: stats.word,
      targetDate: stats.target_date,
      numGuesses: stats.num_guesses,
      numUsers: stats.num_users,
    };
  }

  processWordInfo(info) {
    if (info) {
      return { numLetters: info[0], numSyllables: info[1], firstUsed: info[2], definition: info[3] };
    }
  }

  processesUserGuesses(userGuesses) {
    return userGuesses.map(guess => ({
      id: guess.id,
      word: guess.word,
      result: guess.result,
    }));
  }

  processGameEndInfo(gameEndInfo) {
    return gameEndInfo.map(info => ({
      word: info.word,
      definition: info.word_definition,
      currentStreak: info.current_streak,
      longestStreak: info.longest_streak,
    }))[0];
  }
}
