process.env.TZ = 'UTC';
module.exports = {
  moduleNameMapper: {
    "uuid": require.resolve('uuid'),
    '^src/(.*)$': '<rootDir>/src/$1',
  },
  modulePathIgnorePatterns: ['dist'],
  testPathIgnorePatterns: ['dist', 'node_modules'],
  collectCoverageFrom: ['src/**/*.ts'],
  testMatch: ['<rootDir>/src/**/*.spec.{ts,tsx}'],
  transformIgnorePatterns: [
    'node_modules/(?!((.*\\.mjs$)|@ionic|@stencil|ionicons))',
  ],
};
