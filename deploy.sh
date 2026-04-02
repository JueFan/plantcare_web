#!/bin/bash

# ==========================================
# Website 自动化部署脚本
# 请在本地终端（不是沙盒）执行此脚本
# ==========================================

# --- 请修改以下服务器信息 ---
SERVER_USER="root"               # 你的服务器 SSH 用户名
SERVER_IP="43.156.136.229"        # 你的服务器公网 IP 地址或域名
SERVER_DIR="/opt/website"        # 服务器上存放项目代码的路径
# ----------------------------

# 退出遇到错误
set -e

echo "🚀 开始自动化部署流程..."

# 1. 导出本地数据库
echo "📦 正在从本地 plantsync-db 容器导出 rhs_data 数据库..."
# 从主项目的 MySQL 容器中导出 rhs_data 数据库
# 这里使用了之前硬编码的密码 '***REMOVED***'，如果你的本地环境密码不同请修改
docker exec plantsync-db mysqldump -u root -p***REMOVED*** rhs_data > init_db.sql

if [ ! -s init_db.sql ]; then
    echo "❌ 导出失败，init_db.sql 为空！请确保本地 plantsync-db 容器正在运行且有数据。"
    exit 1
fi
echo "✅ 数据库导出成功，已生成 init_db.sql"

# 2. 检查 SSH 连接并创建目录
echo "🔌 正在测试 SSH 连接并在服务器上创建部署目录..."
ssh ${SERVER_USER}@${SERVER_IP} "mkdir -p ${SERVER_DIR}"
echo "✅ 目录创建成功: ${SERVER_DIR}"

# 3. 上传文件到服务器 (通过 rsync 增量同步)
echo "⬆️  正在上传项目文件到服务器..."
rsync -avz --progress \
    --exclude 'node_modules' \
    --exclude '.git' \
    --exclude '.DS_Store' \
    ./server.js ./package.json ./Dockerfile ./docker-compose.yml ./.env ./init_db.sql ./Caddyfile \
    ${SERVER_USER}@${SERVER_IP}:${SERVER_DIR}/

echo "✅ 文件上传完成"

# 4. 在服务器上启动 Docker
echo "🐳 正在服务器上拉起 Docker 容器..."
ssh ${SERVER_USER}@${SERVER_IP} "cd ${SERVER_DIR} && docker-compose down && docker-compose up -d --build"

echo ""
echo "🎉 部署已全部完成！"
echo "--------------------------------------------------------"
echo "👉 你的后端 API 现在运行在: https://juefan.top/plantsync_web/api/v1"
echo ""
echo "⚠️ 下一步操作："
echo "1. 确保你的域名 juefan.top 已解析到服务器 IP: ${SERVER_IP}"
echo "2. 运行 'git push origin main' 将 config.js 更新推送到 GitHub"
echo "3. 等待 GitHub Pages 刷新后，你的网站就能通过 HTTPS 请求真实服务器数据了！"
echo "--------------------------------------------------------"
