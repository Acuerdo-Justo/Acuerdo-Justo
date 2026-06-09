# Preparación de backend

La aplicación está preparada para conectarse a Supabase sin acoplar la interfaz
directamente a la base de datos.

## Estructura

- `src/types/platform.ts`: contratos del dominio.
- `src/lib/supabase.ts`: cliente opcional de Supabase.
- `src/services/platformService.ts`: operaciones de datos.
- `supabase/schema.sql`: tablas y políticas iniciales.
- `.env.example`: variables necesarias.

## Conectar Supabase

1. Crea un proyecto en Supabase.
2. Ejecuta `supabase/schema.sql` desde el SQL Editor.
3. Crea un archivo `.env` basado en `.env.example`.
4. Reinicia el servidor de desarrollo.

## Seguridad antes de producción

- Protege solicitudes públicas con CAPTCHA o una Edge Function.
- Agrega autenticación para asesores y administradores.
- No guardes cálculos financieros anónimos.
- Genera tipos de Supabase y reemplaza los casts temporales del servicio.
- Define permisos administrativos para confirmar citas y gestionar solicitudes.

## Siguientes módulos recomendados

1. Calculadora interactiva.
2. Formulario de asesoría virtual.
3. Calendario de disponibilidad.
4. Panel administrativo.
5. Autenticación y seguimiento del usuario.
