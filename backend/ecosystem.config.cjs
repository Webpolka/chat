// backend/ecosystem.config.cjs
module.exports = {
    apps: [
        {
            name: "chat-backend",
            script: "./backend/dist/server.js", // путь относительно папки backend
            instances: 1,
            autorestart: true,
            watch: false,
            env: {
                NODE_ENV: "development",
                PORT: 3000
            },
            env_production: {  // <- вот это нужно для --env production
                NODE_ENV: "production",
                PORT: 3000
            }
        }
    ]
};
