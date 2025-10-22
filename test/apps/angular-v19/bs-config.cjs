module.exports = {
  port: 8080,
  logLevel: 'silent',
  files: ['./dist/**/*.{html,htm,css,js}'],
  server: {
    baseDir: './dist/angular-v18/browser',
    middleware: {
      0: null
    }
  },
  open: false
};
