# Notificaciones push (HU-026)

Las alertas críticas y de advertencia llegan al celular por **Expo Push**. En la web no hay push: ahí el canal es la bandeja y el correo.

## Cómo funciona
1. Al iniciar sesión (y cada vez que se abre la app con sesión) `PushBridge` pide el permiso y registra el token de Expo en ms-notification (`POST /api/push-tokens`).
2. Al **cerrar sesión** se quita el token (`DELETE /api/push-tokens`) para que el siguiente usuario del teléfono no reciba las alertas del anterior. Si la sesión expira o la cuenta se borra no se puede quitar: el siguiente inicio de sesión en ese teléfono se queda con el token.
3. Un push que llega con la app abierta refresca el contador de la campana. Tocar un push (app abierta, en segundo plano o cerrada) abre **Notificaciones**.
4. Qué niveles suenan lo decide el usuario en *Notificaciones → Preferencias* (por defecto: crítica y advertencia sí, informativa no).

Código: `src/core/push/` (`pushDevice.ts` nativo, `pushDevice.web.ts` vacío, `PushService.ts`), `src/presentation/push/PushBridge.tsx`, `src/infrastructure/repositories/HttpPushRepository.ts`.

## Para que funcione en un teléfono (una sola vez)
No se puede hacer desde el código; necesita tu cuenta de Expo:

```bash
npm install -g eas-cli
eas login
eas init                      # crea el projectId y lo escribe en app.json (extra.eas.projectId)
eas build --profile development --platform android   # development build (Expo Go en Android NO recibe push remoto desde SDK 53)
```

- **Android:** además hay que subir las credenciales FCM (`eas credentials`).
- **iOS:** Expo Go sí recibe push de pruebas; para publicar hace falta cuenta de Apple Developer.
- Sin `projectId`, simulador o permiso denegado la app **funciona igual**, solo que no registra el token (no hay error).

## Probar sin teléfono
Con el token de un teléfono real, `POST https://exp.host/--/api/v2/push/send` o <https://expo.dev/notifications> sirven para mandar un push de prueba. El backend (ms-notification) se probó contra un Expo simulado local; **el envío al Expo real y a un teléfono real está pendiente de verificar**.
