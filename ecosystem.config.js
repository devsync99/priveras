module.exports = {
  apps: [{
    name: 'priveras',
    script: 'node_modules/.bin/next',
    args: 'start',
    instances: 2,
    exec_mode: 'cluster',
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    autorestart: true,
    max_restarts: 3,
    min_uptime: '10s'
  }]
}
