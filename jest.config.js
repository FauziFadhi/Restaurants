/** @type {import('ts-jest/dist/types').InitialOptionsTsJest} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  globals: {
    'ts-jest': {
      tsConfig: 'tsconfig.json',
    },
  },
  moduleNameMapper: {
    '@utils/(.*)': ['<rootDir>/src/utils/$1'],
    '@models/(.*)': ['<rootDir>/src/models/$1'],
    '@config/(.*)': ['<rootDir>/src/config/$1'],
  },
};
