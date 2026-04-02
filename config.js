// API Configuration
// Change this URL to your deployed backend URL when deploying to production
// For local development, it points to the local Express server
const CONFIG = {
    // 生产环境使用配置好的域名接口 (通过 Nginx/Caddy 反向代理并提供 HTTPS)
    API_BASE_URL: window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' 
        ? 'http://localhost:3000/api/v1' 
        : 'https://api.juefan.top/api/v1' 
};
