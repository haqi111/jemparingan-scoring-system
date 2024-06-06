FROM node:18-alpine AS builder

# Create app directory
WORKDIR /app

COPY package*.json ./
COPY prisma ./prisma/

# Install app dependencies
RUN npm install

COPY . .

RUN npm run prisma:generate

RUN npm run build

FROM node:18-alpine

COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma

# Set environment variables
ARG AT_SECRET
ENV AT_SECRET=${AT_SECRET}

ARG RT_SECRET
ENV RT_SECRET=${RT_SECRET}

ARG DATABASE_URL
ENV DATABASE_URL=${DATABASE_URL}

ARG SUPERADMIN_EMAILS
ENV SUPERADMIN_EMAILS=${SUPERADMIN_EMAILS}

EXPOSE 8080

CMD [ "npm", "run", "start:prod" ]
