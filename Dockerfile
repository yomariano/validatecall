FROM node:22-alpine AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
ARG VITE_API_URL=https://api.validatecall.com
ARG VITE_UMAMI_SCRIPT_URL
ARG VITE_UMAMI_WEBSITE_ID
ARG VITE_STRIPE_MODE
ARG VITE_STRIPE_TEST_LITE_LINK
ARG VITE_STRIPE_TEST_STARTER_LINK
ARG VITE_STRIPE_TEST_PRO_LINK
ARG VITE_STRIPE_LIVE_LITE_LINK
ARG VITE_STRIPE_LIVE_STARTER_LINK
ARG VITE_STRIPE_LIVE_PRO_LINK
RUN npm run build

FROM nginx:stable-alpine
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
