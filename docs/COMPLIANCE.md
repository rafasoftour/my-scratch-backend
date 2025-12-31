# COMPLIANCE.md

## 1. Objetivo

Este documento define el **encaje de cumplimiento** del proyecto en materia de ciberseguridad, considerando:

- **ENS (Esquema Nacional de Seguridad)** — Real Decreto 311/2022.
- **NIS2 (Directiva (UE) 2022/2555)** — marco europeo de gestión del riesgo y notificación de incidentes.
- **OWASP** como referencia técnica de AppSec (Top 10, ASVS, SAMM).

El objetivo práctico es convertir requisitos de cumplimiento en **controles verificables** y **evidencias**.

---

## 2. Alcance

### 2.1 En alcance
- Backend expuesto a Internet.
- Autenticación y federación de identidad mediante **WSO2 (OIDC)**.
- Autorización local del backend (no delegada a terceros).
- Generación de URLs/tokens firmados para embedding.
- Registro de auditoría de accesos.
- Protección de secretos y configuraciones.

### 2.2 Fuera de alcance (por ahora)
- Gestión completa de identidades (se delega en WSO2 como IdP).
- Gestión de dispositivos/EDR del entorno.
- Plataforma SIEM corporativa (el backend debe integrarse, pero no la gestiona).
- Certificación formal ENS (este repositorio prepara controles y evidencias, la certificación es un proceso corporativo).

---

## 3. Nivel de referencia y criterio

Dado que el servicio estará **expuesto a Internet** y puede dar acceso a **terceros** (siempre autenticados vía WSO2), el proyecto adopta:

- **OWASP ASVS como checklist** de requisitos de seguridad de aplicación.
  - Objetivo recomendado: **ASVS Level 2** para servicios Internet-facing con datos y permisos.
- **OWASP SAMM** como marco de madurez (gobernanza y prácticas), a nivel de compañía/equipo.

Este documento no “certifica”, pero sí define **qué evidencia técnica genera el repo**.

---

## 4. Matriz mínima de controles y evidencias

La siguiente matriz se mantiene “ligera” y evoluciona con el proyecto. Cada control debe tener:
- Implementación (dónde vive en el repo)
- Test (unit/integration/e2e)
- Evidencia (log, test, configuración, documentación, revisión)

| Control | Descripción | Evidencia mínima esperada |
|---|---|---|
| Autenticación OIDC | Validar tokens de WSO2 (firma, issuer, audience, expiración, etc.) | Tests de integración + documentación de claims aceptadas |
| Autorización local | Permisos del backend (no confiar en roles externos sin mapping) | Unit tests de reglas + logs de decisión |
| Sub único | `sub` identifica unívocamente al usuario local | Índice único en DB + test integración + error 409 controlado |
| Logging/auditoría | Accesos y acciones relevantes con `requestId` | Logs estructurados + eventos de auditoría + tests |
| Gestión de secretos | Secretos fuera del código, rotables | `.env`/secret manager + doc + revisión |
| Hardening HTTP | Cabeceras, CORS, rate limiting | Config + tests de presentación |
| Seguridad de dependencias | Actualizaciones y escaneo | CI con auditoría (npm audit, etc.) |
| Gestión de incidentes | Procedimiento mínimo | `INCIDENT_RESPONSE.md` + evidencias de logging |
| Threat Modeling | Identificar amenazas y mitigaciones | `THREAT_MODEL.md` actualizado por versión |
| Testing por diseño | Unit/integration/e2e conforme a `TESTING.md` | Suites separadas + cobertura de casos críticos |

---

## 5. Gobernanza mínima (cómo se mantiene)

- Cualquier cambio que afecte a autenticación/autorización/logging/cripto requiere:
  - Revisión explícita (PR) con checklist de seguridad.
- La estrategia de testing es parte del contrato arquitectónico.
- Se mantiene un histórico de cambios en este documento (sección 6).

---

## 6. Historial

- v0.1: Base de encaje ENS/NIS2/OWASP y matriz mínima.
