module.exports = {
  apps: [{
    name: "kidshub",
    script: "./server.js",
    cwd: "/var/www/kidshub/backend",
    env: {
      NODE_ENV: "production"
    }
  }]
};
