#!/bin/bash
sed -i '/location \/ {/i \
    # PlantSync Website API 后端转发\n    location /plantsync_web/ {\n        proxy_pass http://127.0.0.1:3001/;\n        proxy_set_header Host $host;\n        proxy_set_header X-Real-IP $remote_addr;\n        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;\n        proxy_set_header X-Forwarded-Proto $scheme;\n    }\n' /etc/nginx/sites-available/juefan.top
