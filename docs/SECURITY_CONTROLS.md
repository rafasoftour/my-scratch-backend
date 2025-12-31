# SECURITY_CONTROLS.md

## 1. Propósito

Este documento describe **controles de seguridad implementables** y su ubicación por capas (Clean Architecture),
para que el equipo y los agentes de IA sepan:

- qué control existe,
- dónde se implementa,
- cómo se verifica,
- qué evidencia deja.

---

## 2. Controles por dominio de seguridad

### 2.1 Identidad y Autenticación (OIDC / WSO2)
**Objetivo:** validar que la identidad es auténtica y vigente.

- Validación JWT: firma, `iss`, `aud`, `exp`, `nbf` (cuando aplique), `kid`/rotación de claves.
- Aceptar únicamente algoritmos esperados (lista blanca).
- Rechazar tokens sin claims mínimas.

**Dónde vive:**
- `presentation`: middleware/hook de autenticación, extracción de `sub`.
- `application`: si hay reglas de mapping/alta automática, viven en use cases.
- `domain`: value objects si hay invariantes de identidad (p.ej. `UserSub`).

**Tests:**
- Integration (presentation): rutas protegidas con `server.inject()`.
- Integration (infra): validación contra JWKS de test (si aplica).

---

### 2.2 Autorización
**Objetivo:** el backend decide permisos **localmente**.

- Policy: permisos por rol/atributo interno, no confiar “tal cual” en roles externos.
- “Deny by default”.

**Dónde vive:**
- `application`: decisiones de autorización y errores (403).
- `domain`: reglas puras si aplican.
- `presentation`: traduce a HTTP, no decide permisos.

**Tests:**
- Unit (application): casos permitidos/denegados.
- Integration (presentation): status codes correctos.

---

### 2.3 Integridad de usuario (`sub` único)
**Objetivo:** evitar ambigüedad de identidad.

- `sub` es único por diseño.
- Application devuelve conflicto (409) si existe.
- Infrastructure refuerza con índice único (defensa en profundidad).

**Dónde vive:**
- `application`: `CreateUserUseCase` (pre-check + error tipado).
- `infrastructure`: índice único y traducción de error DB → error de aplicación.

**Tests:**
- Unit (application): `sub` duplicado produce error.
- Integration (infra): índice único funciona.

---

### 2.4 Seguridad HTTP (API expuesta a Internet)
**Objetivo:** reducir superficie de ataque.

- CORS con allowlist estricta.
- Rate limiting por IP/usuario (según rutas).
- Cabeceras de seguridad (p.ej. via `@fastify/helmet`).
- Tamaño máximo de payload.
- Timeouts y límites de recursos.

**Dónde vive:**
- `presentation` / `bootstrap` (config de servidor).

**Tests:**
- Integration (presentation): CORS/headers/rate-limit básico.

---

### 2.5 Validación de entrada
**Objetivo:** evitar inyección, desbordes y estados inválidos.

- Validación de payload y parámetros (Zod/JSON Schema según decisión de proyecto).
- Rechazar “unknown fields” si procede.
- Normalización básica en value objects.

**Dónde vive:**
- `presentation`: validación de request.
- `domain`: invariantes de value objects/entidades.

**Tests:**
- Unit (domain): invariantes.
- Integration (presentation): 400 en payload inválido.

---

### 2.6 Criptografía y tokens firmados (embedding)
**Objetivo:** enlaces firmados, expiración, no repudio razonable.

- Firmas con claves protegidas.
- TTL explícito y corto.
- Inclusión de claims mínimos necesarios (principio de minimización).
- Revocación/rotación de claves planificada.

**Dónde vive:**
- `application`: caso de uso que genera el token/URL.
- `infrastructure`: almacenamiento/lectura de claves, integración con proveedor.

**Tests:**
- Unit: TTL y claims generados.
- Integration: validación/rotación (si aplica).

---

### 2.7 Logging, auditoría y trazabilidad
**Objetivo:** evidencia y respuesta a incidentes.

- Logging estructurado con `requestId`.
- Auditoría de accesos (quién, qué recurso, cuándo, resultado).
- Evitar logs de secretos/PII innecesaria.

**Dónde vive:**
- `presentation`: requestId, logging básico.
- `application`: eventos de auditoría relevantes.
- `infrastructure`: salida a Graylog/GELF (si aplica).

**Tests:**
- Unit: formato/eventos (si se modela).
- Integration: rutas generan eventos.

---

### 2.8 Gestión de secretos y configuración
**Objetivo:** no exponer claves.

- `.env` solo en desarrollo; producción via secret manager/CI.
- Rotación de secretos.
- No hardcodear tokens/keys.

**Dónde vive:**
- `bootstrap`: carga de config.
- `infrastructure`: consumo de secretos.

**Evidencia:**
- docs + revisión + CI checks (si se añade).

---

### 2.9 Seguridad de dependencias y supply chain
**Objetivo:** reducir riesgos de librerías.

- Dependabot/renovate (si se habilita).
- `npm audit` en CI.
- Pinning razonable y revisión de cambios.

---

## 3. Referencias (marcos)

- ENS (RD 311/2022): marco nacional.
- NIS2 (Dir. UE 2022/2555): gestión del riesgo y reporting.
- OWASP ASVS: requisitos verificables de AppSec.
- OWASP SAMM: madurez de prácticas.
