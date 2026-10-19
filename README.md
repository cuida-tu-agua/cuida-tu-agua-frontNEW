# Cuida Tu Agua: mobile and web app

React Native (Expo) app, one project for web and mobile, for the Cuida Tu Agua water meter platform:
consumption and cost per place, meter linking, valve control, notifications, saving tips and an administration panel.
It talks to the five services of the platform (ms-iam, ms-places, ms-device, ms-consumption, ms-valve).

SENA project, Software Analysis and Development.

## Run it

```bash
npm install
npm run web      # http://localhost:19006
npm start        # Expo, to open it on a phone or an emulator
```

The services must be running. Each address comes from an `EXPO_PUBLIC_*` variable (copy `.env.example` to `.env`); without it the app works the address out by itself (on the web, the host of the page; on a phone in development, the PC running Expo) with the port of each service (3001 to 3005).

## Useful commands

| Command | What it does |
|---------|--------------|
| `npx tsc --noEmit` | Type check |
| `npx jest` | Unit tests (`npm test` also reports coverage) |
| `npm run lint` | ESLint |
| `npm run build:web` | Web build |

## Languages

The app is available in Spanish (default), English, French and Portuguese (Brazil). The user chooses it in
Profile → Language. How it works and how to add a text or a language: [`docs/i18n.md`](docs/i18n.md).
The user stories of the translation work are in [`docs/i18n-user-stories.md`](docs/i18n-user-stories.md).

## More documents

- [`PUSH.md`](PUSH.md): push notifications on a phone.
- [`PUBLICACION.md`](PUBLICACION.md): publishing the app.
