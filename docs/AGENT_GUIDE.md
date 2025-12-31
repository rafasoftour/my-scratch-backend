# AGENT_GUIDE

## 1. Propósito de este documento

Este documento define **las reglas de trabajo obligatorias** para cualquier agente de asistencia (IA o humano) que colabore en el desarrollo del backend `reports-api-backend-public`.

Su objetivo es:
- Preservar la arquitectura definida.
- Evitar decisiones implícitas o no consensuadas.
- Reducir deuda técnica desde el inicio.
- Garantizar coherencia, seguridad y mantenibilidad.

Este documento tiene **carácter normativo**: no es orientativo.

---

## 2. Principio rector

> **Nada se implementa sin encajar explícitamente en la arquitectura definida.**

Antes de proponer código, un agente debe:
1. Identificar la capa afectada.
2. Justificar la decisión técnica.
3. Verificar que no rompe la regla de dependencias.

---

## 3. Arquitectura innegociable

El proyecto sigue **Clean Architecture** con las capas:

- `domain`
- `application`
- `infrastructure`
- `presentation`

Reglas estrictas:

- `domain` no depende de nada.
- `application` solo depende de `domain`.
- `infrastructure` implementa puertos definidos en `application`.
- `presentation` solo orquesta y traduce HTTP ⇄ aplicación.
- **Nunca** se accede a MongoDB fuera de `infrastructure`.
- **Nunca** se introduce lógica de negocio en `presentation`.

Si una propuesta rompe estas reglas → **rechazada**.

---

## 4. Stack tecnológico cerrado

El stack aceptado es:

- Node.js
- TypeScript
- Fastify
- MongoDB + Mongoose (solo en `infrastructure`)
- Pino (logging)
- Graylog (GELF)

Regla obligatoria:

> **No introducir nuevas librerías sin justificación explícita y aprobación.**

Si un agente considera necesaria una librería adicional, debe:
- Explicar el problema que resuelve.
- Justificar por qué no puede resolverse con el stack actual.
- Indicar impacto arquitectónico y de seguridad.

---

## 5. Seguridad: reglas no negociables

Todo agente debe respetar estrictamente:

- Autenticación **solo** mediante WSO2 (OIDC).
- Autorización **solo** local.
- Nunca confiar en roles/claims externos para permisos.
- No auto-provisioning de usuarios.
- JWT de embedding con TTL corto y claims mínimos.
- Nunca loguear tokens, JWTs ni secretos.

Cualquier desviación requiere revisión explícita.

---

## 6. Gestión de usuarios y permisos

Reglas:

- El identificador de usuario es siempre el claim `sub`.
- Si un usuario autenticado no existe localmente → **403**.
- Los permisos se evalúan por recurso.
- No existen accesos “por defecto”.

Nunca:
- Crear usuarios automáticamente.
- Inferir permisos.
- Delegar autorización a Metabase.

---

## 7. API y OpenAPI

Principios:

- El backend es **API-first**.
- Toda API pública debe reflejarse en el contrato OpenAPI.
- No se documentan endpoints internos o experimentales.
- Cambios en rutas públicas requieren actualizar el contrato.

El tooling (Postman u otros) no condiciona el diseño.

---

## 8. Logging y observabilidad

Reglas:

- Logs estructurados obligatorios.
- Incluir `requestId` en todos los flujos.
- Registrar accesos permitidos y denegados.
- No exponer información sensible en logs.

El logging es parte del sistema de seguridad.

---

## 9. Gestión de errores

- Los errores se definen en `domain` y `application`.
- `presentation` solo traduce a HTTP.
- Mensajes genéricos, sin filtrar información interna.
- Mismo código de error para “no existe” y “no autorizado” cuando aplique.

---

## 10. Configuración

Reglas:

- Toda configuración vía variables de entorno.
- Validación en arranque (fail fast).
- `domain` y `application` no acceden a `process.env`.

Nunca:
- Hardcodear secretos.
- Leer configuración en múltiples puntos.

---

## 11. Testing y ejemplos

- No introducir código de ejemplo en producción.
- Los ejemplos deben ir a documentación o tests.
- No mezclar lógica real con “mock logic”.

---

## 12. Estilo de propuestas de un agente

Antes de escribir código, un agente debe responder:

1. ¿En qué capa va?
2. ¿Qué caso de uso cubre?
3. ¿Qué puertos necesita?
4. ¿Qué impacto tiene en seguridad?
5. ¿Rompe alguna regla existente?

Si no puede responder claramente → no debe proponer implementación.

---

## 13. Cambios arquitectónicos

Cualquier cambio que afecte a:

- Capas
- Flujo de autenticación/autorización
- Modelo de permisos
- Proveedores externos
- Stack tecnológico

Debe:
- Documentarse primero.
- Acordarse explícitamente.
- Reflejarse en `ARCHITECTURE.md` y/o `SECURITY.md`.

---

## 14. Regla final

> **La claridad arquitectónica y la seguridad tienen prioridad absoluta sobre la rapidez de desarrollo.**

Un agente debe optimizar para:
- claridad
- control
- auditabilidad
- mantenibilidad

No para “que funcione rápido”.
