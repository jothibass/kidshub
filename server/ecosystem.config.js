module.exports = {
  apps: [
    {
      name: 'kidshub',
      script: 'index.js',
      cwd: __dirname,
      env: {
        NODE_ENV: 'production',
        PORT: 3000
      }
    }
  ]
}
