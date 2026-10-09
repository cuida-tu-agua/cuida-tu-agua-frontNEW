# Publicación (web + móvil) y CORS

Estado: **todo está parametrizado, pero todavía no hay dominio ni despliegue**. Ningún valor de abajo es real: son ejemplos con `app.ejemplo.com` / `api.ejemplo.com`. Cuando exista el despliegue, solo se rellenan las variables; no hay que tocar código.

## 1. Qué hay que decidir primero
| Decisión | Por qué importa |
|---|---|
| **Dominio de la web** (p. ej. `https://app.ejemplo.com`) | Es el *origen* que cada API debe permitir en CORS y el que usan los enlaces de los correos |
| **Cómo se llega a las APIs** (p. ej. `https://api.ejemplo.com/iam`, `/places`… tras un proxy, o un subdominio por servicio) | Son las 6 variables `EXPO_PUBLIC_*` del front |
| **HTTPS en todo** | Los tokens viajan en cabeceras; en producción el navegador bloquea contenido mixto (web https → API http) |

## 2. CORS: qué se configura en cada servicio
Por defecto la lista de orígenes permitidos está **vacía en producción** (nadie puede llamar desde un navegador hasta que se configure). Los orígenes `localhost` solo existen en desarrollo.

| Servicio | Variable de entorno (producción) | Ejemplo |
|---|---|---|
| ms-iam (Java) | `IAM_CORSALLOWEDORIGINS` (varios, separados por coma) | `https://app.ejemplo.com` |
| ms-places | `Cors__AllowedOrigins__0` | `https://app.ejemplo.com` |
| ms-device | `Cors__AllowedOrigins__0` | `https://app.ejemplo.com` |
| ms-consumption | `Cors__AllowedOrigins__0` | `https://app.ejemplo.com` |
| ms-valve | `Cors__AllowedOrigins__0` | `https://app.ejemplo.com` |
| ms-notification | `Cors__AllowedOrigins__0` | `https://app.ejemplo.com` |

- Varios orígenes en .NET: `Cors__AllowedOrigins__1`, `__2`…
- El origen es exacto: esquema + host (+ puerto si no es el estándar), **sin barra final**. `https://app.ejemplo.com` y `https://www.ejemplo.com` son distintos.
- La app móvil (APK/iOS) **no usa CORS** (no es un navegador); solo la web lo necesita.
- Comprobarlo (debe devolver `access-control-allow-origin` con tu origen; con otro origen no devuelve nada):
  ```bash
  curl -s -i -X OPTIONS https://api.ejemplo.com/places/api/places \
    -H "Origin: https://app.ejemplo.com" -H "Access-Control-Request-Method: GET" -H "Access-Control-Request-Headers: authorization" | grep -i access-control
  ```
- Verificado en local (2026-10-09) con IAM y ms-notification: con la variable puesta acepta ese origen, rechaza `localhost` y cualquier otro.

## 3. Variables de cada servicio para producción
En producción **no hay user-secrets**: todo va por variables de entorno (`__` = nivel de la configuración) o por el gestor de secretos del hosting. Nunca en git. Poner `ASPNETCORE_ENVIRONMENT=Production`.

**Comunes a los servicios .NET**
| Variable | Valor |
|---|---|
| `ConnectionStrings__<Nombre>` | cadena de SQL Server con el usuario `*_app` (`Places`, `Devices`, `Consumption`, `Valve`, `Notification`) |
| `Jwt__PublicKeyPath` + archivo | clave **pública** de ms-iam (`iam-public.pem`); `Jwt__Issuer` debe ser igual al de IAM (`iam.jwt.issuer`) |
| `Redis__Configuration` | el mismo Redis de ms-iam (revocación de sesiones) |
| `Internal__ApiKey` | **la misma clave** (≥24 caracteres) en IAM (`INTERNAL_API_KEY`), places, device, valve y notification |
| `RabbitMq__Host/Port/Username/Password` | broker (device, consumption, valve, notification) |
| `Services__*BaseUrl` | URLs internas entre servicios (`PlacesBaseUrl`, `DevicesBaseUrl`, `ConsumptionBaseUrl`, `IamBaseUrl`) |

**ms-notification, además**
| Variable | Para qué |
|---|---|
| `App__PublicUrl` | base de los enlaces "Abrir en la app" de los correos → `https://app.ejemplo.com` |
| `Smtp__Host/Port/Security/Username/Password/FromAddress/FromName` | correo real (vacío `Host` = canal de correo apagado) |
| `Push__Enabled` (`true` por defecto), `Push__ExpoAccessToken` (opcional) | push por Expo |
| `Devices__OfflineAfterMinutes` | umbral de "sensor desconectado" |

**ms-device**: `Mqtt__Host/Port/Username/Password` (broker MQTT al que se conecta el medidor).

**ms-iam**: `SECURITY_APP_PASSWORD`/datasource, `INTERNAL_API_KEY`, `DEVICES_URL`, `PLACES_URL`, `IAM_CORSALLOWEDORIGINS`, correo (`SPRING_MAIL_*`, `IAM_MAIL_FROM`), y el par de claves RS256 (`keys/private.pem`/`public.pem`, **la privada solo en IAM**).

## 4. Web (sitio estático)
Las variables `EXPO_PUBLIC_*` se **incrustan al compilar**: cambiar de dominio = volver a compilar.

```bash
# PowerShell (ejemplo; una URL por servicio, SIN barra final)
$env:EXPO_PUBLIC_API_URL="https://api.ejemplo.com/iam"
$env:EXPO_PUBLIC_PLACES_API_URL="https://api.ejemplo.com/places"
$env:EXPO_PUBLIC_DEVICES_API_URL="https://api.ejemplo.com/devices"
$env:EXPO_PUBLIC_CONSUMPTION_API_URL="https://api.ejemplo.com/consumption"
$env:EXPO_PUBLIC_VALVE_API_URL="https://api.ejemplo.com/valve"
$env:EXPO_PUBLIC_NOTIFICATIONS_API_URL="https://api.ejemplo.com/notifications"
npm run build:web          # genera la carpeta dist/
```
- Sin esas variables, la web llama al **mismo host** que la sirvió pero en los puertos 3001–3006: sirve en desarrollo, no en producción.
- Subir `dist/` a cualquier hosting estático. Es una SPA: configurar que **cualquier ruta devuelva `index.html`** (rewrite/fallback), si no, recargar en `/places` da 404.
- Si las APIs están detrás de un proxy con prefijos (`/iam`, `/places`…), el proxy debe quitar el prefijo antes de reenviar.

## 5. App móvil (APK / iOS)
La app nativa no tiene "host de la página": **sin las mismas `EXPO_PUBLIC_*` llama a `localhost`/`10.0.2.2` y no funciona**. Definirlas como variables de entorno de EAS (`eas env:create` o en el panel de expo.dev) para los perfiles `preview` y `production`, y compilar:
```bash
eas build --profile preview --platform android      # APK instalable
eas build --profile production --platform android   # app bundle para Play Store
```
Push: ver `PUSH.md` (`eas init`, development build, credenciales FCM).

## 6. Lista de comprobación el día del despliegue
1. HTTPS activo en la web y en cada API.
2. CORS: el `curl` de la sección 2 contra cada API.
3. `Internal__ApiKey` idéntica en los 5 sitios; `Jwt__Issuer` idéntico en todos.
4. Liquibase aplicado a la BD (repos `*-db`, en orden) y tarifas **oficiales** cargadas (las actuales son de referencia).
5. Registrar un usuario real → verificar correo → iniciar sesión → crear lugar.
6. `juanome43@gmail.com`: cuando se registre, correr `liquibase update` de `ms-iam-db` para darle ADMIN.
7. Quitar cuentas y datos de prueba de la BD si se reutilizó la de desarrollo.
