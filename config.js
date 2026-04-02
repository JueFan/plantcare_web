// API Configuration
// Change this URL to your deployed backend URL when deploying to production
// For local development, it points to the local Express server
const CONFIG = {
    API_BASE_URL: window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' 
        ? 'http://localhost:3000/api/v1' 
        : 'https://api.yourdomain.com/api/v1' // Replace with your actual production backend URL
};
