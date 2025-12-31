# THREAT_MODEL.md

## 1. Propósito

Modelo de amenazas “ligero” para el backend, suficiente para:
- Identificar riesgos principales.
- Alinear mitigaciones con ENS/NIS2/OWASP.
- Priorizar controles y tests.

Este documento se revisa ante cambios relevantes (auth, permisos, embedding, logging, exposición de nuevas rutas).

---

## 2. Contexto del sistema

### 2.1 Descripción
Backend expuesto a Internet que:
- autentica usuarios vía WSO2 (OIDC),
- autoriza acceso a recursos internos,
- genera enlaces/tokens firmados para embedding,
- registra auditoría.

### 2.2 Activos
- Claves/secretos de firma (embedding).
- Tokens OIDC y sesión (si aplica).
- Datos de autorización local (roles/permisos/ACL).
- Logs/auditoría.
- Identificadores de usuario (`sub`).

### 2.3 Fronteras de confianza
- Internet → Backend (no confiable).
- Backend → WSO2 (confiable bajo TLS y validación).
- Backend → MongoDB (confiable en red interna, con credenciales).
- Backend → proveedor de dashboards (Metabase u otros).

---

## 3. Amenazas (STRIDE) y mitigaciones

### 3.1 Suplantación (Spoofing)
**Amenaza:** token falso/robado, replay, algoritmo inseguro.
- Mitigación: validación JWT completa, allowlist de algoritmos, verificación de `iss`/`aud`/`exp`, clock-skew controlado.
- Mitigación: TLS estricto, rotación de claves/JWKS.
- Evidencia: tests integración de auth + logs de rechazo.

### 3.2 Manipulación (Tampering)
**Amenaza:** manipular parámetros de embedding / dashboards.
- Mitigación: firmar payload, TTL corto, validar inputs, “deny by default”.
- Evidencia: unit tests de firma/TTL y validación.

### 3.3 Repudio (Repudiation)
**Amenaza:** usuario niega acceso/acción.
- Mitigación: auditoría con requestId, `sub`, recurso, decisión, timestamp.
- Evidencia: logs estructurados + eventos de auditoría.

### 3.4 Divulgación de información (Information Disclosure)
**Amenaza:** exposición de datos sensibles, filtrado de logs, CORS laxo.
- Mitigación: minimización de datos, CORS allowlist, no log de secretos, control de permisos, hardening HTTP.
- Evidencia: tests de presentación (headers/CORS), revisión de logs.

### 3.5 Denegación de servicio (DoS)
**Amenaza:** flood de requests, payloads grandes, rutas costosas.
- Mitigación: rate limiting, límites de payload, timeouts, cache de JWKS si aplica.
- Evidencia: tests básicos de rate-limit y límites.

### 3.6 Elevación de privilegios (EoP)
**Amenaza:** acceso a dashboards no autorizados, bypass de permisos.
- Mitigación: autorización local centralizada, no confiar roles externos sin mapping, controles “deny by default”.
- Evidencia: unit tests de autorización + integración de rutas 403/404 según política.

---

## 4. Decisiones clave de seguridad

- `sub` es el identificador unívoco de usuario local (índice único en DB + control en aplicación).
- La autorización se decide localmente en el backend.
- Los tokens/URLs de embedding se firman con TTL corto.
- Logging y auditoría son obligatorios.

---

## 5. Backlog de mitigaciones (living list)

- [ ] Rate limiting por ruta y/o por usuario.
- [ ] Política de CORS allowlist por entorno.
- [ ] Reglas de logging para evitar PII/secrets.
- [ ] Rotación planificada de claves de firma.
- [ ] Integración con SIEM/Graylog a nivel corporativo.
