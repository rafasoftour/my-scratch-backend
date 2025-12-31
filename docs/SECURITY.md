# SECURITY.md

## 1. Objetivo del documento

Este documento describe las **decisiones de seguridad** del backend y los controles aplicados para garantizar:
- Autenticación fiable
- Autorización estricta
- Minimización de superficie de ataque
- Trazabilidad y auditoría

El backend está **expuesto a Internet** y puede dar acceso a **terceros** autenticados mediante WSO2 (usuarios propios o identidad federada).

Este documento complementa a `ARCHITECTURE.md`, `TESTING.md` y al encaje de cumplimiento definido en `COMPLIANCE.md`.

---

## 2. Encaje ENS / NIS2 / OWASP

Este proyecto se alinea con:
- **ENS (Real Decreto 311/2022)** como marco nacional de medidas de seguridad.
- **NIS2 (Directiva (UE) 2022/2555)** como marco europeo de gestión del riesgo y notificación de incidentes.
- **OWASP** (Top 10, ASVS, SAMM) como referencia técnica para seguridad de aplicaciones.

Criterio práctico:
- Adoptamos **OWASP ASVS** como checklist de requisitos verificables (objetivo recomendado: **ASVS L2** por exposición a Internet).
- Usamos **SAMM** como referencia de madurez (a nivel de proceso/equipo).

---

## 3. Modelo de seguridad general

Principios:
- **Deny by default**.
- **Autenticación delegada** a WSO2 (OIDC), **autorización local** en el backend.
- **Defensa en profundidad** (controles en aplicación + refuerzos en infraestructura).
- **Minimización**: solo se manejan claims/datos necesarios.
- **Trazabilidad**: toda llamada relevante debe ser auditable.
- Separación estricta de responsabilidades por capas (Clean Architecture).

---

## 4. Autenticación (OIDC / WSO2)

El backend valida tokens OIDC/JWT emitidos por WSO2.

Validaciones mínimas:
- Firma (JWKS / claves rotables)
- `iss` (issuer) esperado
- `aud` (audience) esperado
- `exp` (caducidad)
- Allowlist de algoritmos aceptados

El `sub` del token se considera el identificador unívoco de identidad para enlazar con el usuario local.

---

## 5. Autorización (decisión local)

El backend **no confía ciegamente** en roles/grupos externos para autorizar recursos internos.
Cualquier dato externo debe pasar por un **mapping / modelo de permisos local**.

Reglas:
- Denegar por defecto.
- Centralizar decisiones en la capa `application`.
- `presentation` solo traduce (HTTP), no decide permisos.

---

## 6. Integridad del usuario (`sub` único)

Motivo:
- Evitar ambigüedad: un `sub` debe referir a un único usuario local.

Implementación (defensa en profundidad):
- En `application`: pre-check + error controlado (409) si existe.
- En `infrastructure`: índice único en DB y traducción de error de DB a error de aplicación.

---

## 7. Seguridad HTTP (API expuesta a Internet)

Controles recomendados/obligatorios:
- CORS con allowlist (por entorno).
- Rate limiting (global y/o por ruta).
- Cabeceras de seguridad (p.ej. helmet).
- Límite de payload y límites de recursos.
- Timeouts razonables.
- Sanitización/validación de entradas (schema validation).

---

## 8. Gestión de secretos

- Ningún secreto se versiona en el repositorio.
- En producción: secrets vía mecanismo corporativo (CI/secret manager).
- Rotación planificada de secretos y claves de firma.

---

## 9. Logging, auditoría y privacidad

- Logging estructurado con `requestId`.
- Auditoría de accesos: `sub`, recurso, decisión (permitido/denegado), timestamp.
- No loguear secretos ni datos sensibles innecesarios.
- Asegurar correlación y retención conforme a políticas corporativas.

---

## 10. Dependencias y supply chain

- Actualizaciones regulares de dependencias.
- Escaneo de dependencias (p.ej. `npm audit` en CI).
- Revisión explícita de cambios de librerías críticas (auth/crypto/http).

---

## 11. Testing de seguridad

Los tests son parte del control de seguridad:
- Unit tests: reglas de autorización, TTL de tokens firmados, invariantes de dominio.
- Integration tests: repositorios e índices, validación de rutas, hardening básico.
- E2E: flujos críticos de acceso.

Ver `TESTING.md`.

---

## 12. Respuesta a incidentes

Existe un procedimiento mínimo en `INCIDENT_RESPONSE.md`.
Cualquier cambio relevante de seguridad debe actualizar también:
- `THREAT_MODEL.md`
- `COMPLIANCE.md`

---

## 13. Evolución y revisiones

Revisar este documento cuando:
- Se añadan nuevos proveedores de dashboards.
- Se incorporen flujos administrativos.
- Se modifique el modelo de permisos.
- Se introduzcan cambios en autenticación/cripto.
- Se amplíe exposición a terceros o nuevos entornos.

La seguridad se considera un **requisito continuo**, no un estado final.
