# 使用 Node.js 18 官方轻量镜像
FROM node:18-alpine

# 设置工作目录
WORKDIR /app

# 复制依赖定义
COPY package*.json ./

# 安装依赖 (生产环境)
RUN npm install --production

# 复制所有源代码
COPY . .

# 暴露端口
EXPOSE 3001

# 设置环境变量默认值
ENV NODE_ENV=production
ENV PORT=3001

# 启动命令
CMD ["node", "server.js"]
