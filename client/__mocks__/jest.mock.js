// eslint-disable-next-line no-undef
module.exports = {
  collectCoverage: true,
  coverageDirectory: 'coverage',
  collectCoverageFrom: [
    'client/src/**/*.{js,jsx}', 
    '!src/**/*.test.js' 
  ],
  coveragePathIgnorePatterns: [
    '/node_modules/', 
    'client/jest.mock.js'
  ]
};
