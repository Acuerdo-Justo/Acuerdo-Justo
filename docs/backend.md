# Integración con backend

El frontend consume exclusivamente la API de `Back-Acuerdo-Justo`.

## Variables

```env
VITE_API_URL=http://localhost:3000/api
VITE_WS_URL=ws://localhost:3000/ws
```

## Sesión

- El JWT permanece únicamente en una cookie HttpOnly.
- PostgreSQL controla sesiones revocables y expira la sesión tras 5 minutos sin actividad.
- `sessionStorage` guarda solamente un marcador no sensible para exigir un nuevo login al cerrar y volver a abrir la pestaña.
- No se guardan JWT, credenciales ni datos privados en almacenamiento del navegador.

## Módulos conectados

- Autenticación y roles.
- Agenda y citas.
- Expedientes y documentos.
- Asesorías virtuales.
- Notificaciones y recordatorios.

Consulta [DEPLOYMENT.md](../DEPLOYMENT.md) para la configuración de Vercel.
