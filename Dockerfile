# ============================================
# SeaShop API — Multi-stage Dockerfile
# ============================================

# Stage 1: Dependencies
FROM node:20-alpine AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production && cp -r node_modules /tmp/prod_modules
RUN npm ci

# Stage 2: Build
FROM node:20-alpine AS build
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npx prisma generate
RUN npm run build

# Stage 3: Production
FROM node:20-alpine AS production
WORKDIR /app
ENV NODE_ENV=production
# Install dumb-init for proper PID 1 handling
RUN apk add --no-cache dumb-init
# Copy production node_modules
COPY --from=deps /tmp/prod_modules ./node_modules
# Copy built app
COPY --from=build /app/dist ./dist
# Copy prisma for runtime (needed by Prisma client)
COPY --from=build /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=build /app/prisma ./prisma
COPY package*.json ./
EXPOSE 3001
ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "dist/main"]

# Stage 4: Development (for docker-compose dev)
FROM node:20-alpine AS development
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npx prisma generate
EXPOSE 3001
CMD ["npm", "run", "start:dev"]
