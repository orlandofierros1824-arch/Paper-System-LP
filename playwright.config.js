module.exports = {
  testDir: './tests',
  testMatch: ['e2e/**/*.spec.js', 'acceptance/**/*.spec.js'],
  reporter: [['list'], ['html', { open: 'never' }]],
  webServer: {
    command: 'npx http-server papeleria_lp/public -p 3000 -c-1',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
  },
  use: { baseURL: 'http://localhost:3000' },
};