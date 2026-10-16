# ── Build: Expo web export ──────────────────────────────────────────────────────
FROM node:22-bookworm-slim AS build
WORKDIR /app
COPY package.json package-lock.json .npmrc ./
RUN npm ci
COPY . .
# Public URLs of the gateway, baked into the bundle at build time
ARG EXPO_PUBLIC_API_URL
ARG EXPO_PUBLIC_PLACES_API_URL
ARG EXPO_PUBLIC_DEVICES_API_URL
ARG EXPO_PUBLIC_CONSUMPTION_API_URL
ARG EXPO_PUBLIC_VALVE_API_URL
ARG EXPO_PUBLIC_NOTIFICATIONS_API_URL
ENV EXPO_PUBLIC_API_URL=$EXPO_PUBLIC_API_URL \
    EXPO_PUBLIC_PLACES_API_URL=$EXPO_PUBLIC_PLACES_API_URL \
    EXPO_PUBLIC_DEVICES_API_URL=$EXPO_PUBLIC_DEVICES_API_URL \
    EXPO_PUBLIC_CONSUMPTION_API_URL=$EXPO_PUBLIC_CONSUMPTION_API_URL \
    EXPO_PUBLIC_VALVE_API_URL=$EXPO_PUBLIC_VALVE_API_URL \
    EXPO_PUBLIC_NOTIFICATIONS_API_URL=$EXPO_PUBLIC_NOTIFICATIONS_API_URL
RUN npx expo export --platform web

# ── Run: static files with nginx ────────────────────────────────────────────────
FROM nginx:1.27-alpine
COPY docker/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
