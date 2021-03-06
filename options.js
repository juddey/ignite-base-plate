/**
 * The questions to ask during the install process.
 */
const questions = [
  {
    name: 'dir-structure',
    message: 'Would you like feature-first or function-first directories?',
    type: 'list',
    choices: ['feature', 'function']
  },
  {
    name: 'linter',
    message: 'Would you like prettier-standard linting?',
    type: 'list',
    choices: ['yes', 'no']
  },
  {
    name: 'storybooks',
    message: 'Howz about storybooks?',
    type: 'list',
    choices: ['yes', 'no']
  },
  {
    name: 'i18n',
    message: 'Shall we Internationalise?',
    type: 'list',
    choices: ['yes', 'no']
  }
]

/**
   * The function preset.
   */
const func = {
  'dir-structure': 'function',
  'linter': true,
  'storybooks': true,
  'i18n': true
}

/**
   * The feature preset.
   */
const feat = {
  'dir-structure': 'feature',
  'linter': true,
  'storybooks': true,
  'i18n': true
}

module.exports = {
  questions,
  answers: { func, feat }
}
