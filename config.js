// API Configuration
// Change this URL to your deployed backend URL when deploying to production
// For local development, it points to the local Express server
const CONFIG = {
    // ⚠️ 部署后，将 'YOUR_SERVER_IP' 替换为你实际的服务器公网 IP，例如: 'http://192.168.1.100:3001/api/v1'
    // ⚠️ 注意: GitHub Pages 默认使用 HTTPS。如果你的服务器只有 HTTP IP 而没有配置 HTTPS 域名，
    // 浏览器会因为 "混合内容 (Mixed Content)" 安全策略拦截请求。
    // 解决方案:
    // 1. (推荐) 为你的服务器配置一个域名和免费 SSL 证书 (如 Let's Encrypt)。
    // 2. (临时) 在浏览器的地址栏左侧网站设置中，允许 "不安全内容" (Insecure Content) 加载以进行测试。
    API_BASE_URL: window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' 
        ? 'http://localhost:3000/api/v1' 
        : 'http://YOUR_SERVER_IP:3001/api/v1' 
};
