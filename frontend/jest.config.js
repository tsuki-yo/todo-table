module.exports = {
  transformIgnorePatterns: [
    'node_modules/(?!(axios|react-router-dom)/)'
  ],
  moduleNameMapper: {
    '^axios$': require.resolve('axios')
  }
}; 