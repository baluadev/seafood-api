# ============================================
# SeaShop API — Multi-stage Dockerfile
# ============================================

# Stage 1: Install ALL deps (incl. dev — cần cho prisma generate + build)
FROM node:20-alpine AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci

# Stage 2: Build TypeScript
FROM node:20-alpine AS build
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npx prisma generate
RUN npm run build

# Stage 3: Development (dùng cho docker-compose local — phải đặt TRƯỚC production)
FROM node:20-alpine AS development
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npx prisma generate
EXPOSE 3001
CMD ["npm", "run", "start:dev"]

# Stage 4: Production — phải là stage CUỐI để Render dùng mặc định
FROM node:20-alpine AS production
WORKDIR /app
ENV NODE_ENV=production
RUN apk add --no-cache dumb-init
# Cài production deps riêng (bỏ qua postinstall)
COPY package*.json ./
RUN npm ci --omit=dev --ignore-scripts
# Copy prisma client đã generate
COPY --from=build /app/node_modules/.prisma ./node_modules/.prisma
# Copy prisma schema (cần ở runtime)
COPY --from=build /app/prisma ./prisma
# Copy compiled app
COPY --from=build /app/dist ./dist
EXPOSE 3001
ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "dist/main"]
