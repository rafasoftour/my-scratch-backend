# ARCHITECTURE

## 1. Propósito del backend

Este backend actúa como **punto único de acceso seguro** para un portal de informes corporativo que proporciona acceso controlado a dashboards analíticos (actualmente Metabase, con posibilidad de extenderse a otros proveedores en el futuro).

Sus responsabilidades principales son:

- Autenticar usuarios mediante **WSO2 como Identity Provider (OIDC)**.
- Autorizar el acceso a recursos de forma **local**, basada en usuarios, roles y permisos almacenados en la aplicación.
- Generar **URLs de embedding firmadas** (JWT de corta duración) para dashboards.
- Registrar accesos y eventos relevantes mediante **logging estructurado** y envío a **Graylog**.

Fuera de alcance en esta fase:

- Alta o sincronización automática de usuarios desde WSO2.
- Gestión de identidades en WSO2.
- Lógica BI o consultas de datos.
- Interfaz de usuario o frontend.

---

## 2. Principios arquitectónicos

El diseño del backend se rige por los siguientes principios:

- **Clean Architecture**, separando claramente responsabilidades y dependencias.
- **Regla de dependencias**: las dependencias siempre apuntan hacia el núcleo.
- **API-first**: la API pública está definida por un contrato explícito (OpenAPI).
- **Seguridad por diseño**: autenticación delegada, autorización local estricta.
- **Separación entre identidad y acceso**:
  - WSO2 autentica.
  - El backend decide si un usuario tiene acceso.
- **Observabilidad y auditabilidad** como requisitos de primer nivel.

---

## 3. Stack tecnológico (decisiones cerradas)

- Runtime: **Node.js**
- Lenguaje: **TypeScript**
- Framework HTTP: **Fastify**
- Persistencia: **MongoDB**, accedido exclusivamente mediante **Mongoose**
- Logging: **Pino** (Fastify nativo)
- Centralización de logs: **Graylog (GELF)**

No se introducirá ninguna librería adicional sin una justificación explícita documentada.

---

## 4. Arquitectura en capas (Clean Architecture)

El backend se organiza en cuatro capas claramente diferenciadas:

presentation → application → domain  
                    ↑  
              infrastructure

Las capas externas dependen de las internas y las capas internas no conocen los detalles de las externas.

---

## 5. Capas

### Domain

Representa el núcleo del negocio: entidades, reglas, invariantes y errores de dominio.  
No conoce frameworks, base de datos ni HTTP.

### Application

Orquesta los casos de uso. Define puertos (interfaces), DTOs y errores de aplicación.  
No conoce detalles técnicos.

### Infrastructure

Implementa dependencias externas: MongoDB (Mongoose), Metabase, logging, configuración técnica.  
Mongoose solo existe en esta capa.

### Presentation

Expone la API HTTP con Fastify. Traduce HTTP ⇄ casos de uso, gestiona autenticación y errores.

---

## 6. API-first y OpenAPI

La API pública se define mediante un contrato **OpenAPI**, que es la fuente de verdad de rutas, esquemas y códigos de error.  
El contrato no contiene lógica de negocio. El tooling asociado se documenta fuera de este archivo.

---

## 7. Autenticación y autorización

- Autenticación mediante **WSO2 (OIDC)**.
- Identidad local ligada al claim **sub**.
- Si un usuario autenticado no existe localmente → **403 Forbidden**.
- No existe auto-provisioning.

---

## 8. Flujo típico de acceso a dashboard

1. Request con token OIDC válido.
2. Validación del token y extracción de `sub`.
3. Búsqueda de usuario local.
4. Verificación de permisos.
5. Generación de URL de embed firmada (JWT corto).
6. Respuesta al cliente y registro de auditoría.

---

## 9. Gestión de configuración

- Configuración vía variables de entorno.
- Validación en arranque (fail fast).
- El dominio y la aplicación no acceden a `process.env`.

---

## 10. Manejo de errores

| Situación                | Código  |
| ------------------------ | ------- |
| Token inválido / ausente | 401     |
| Usuario no existente     | 403     |
| Sin permisos             | 403     |
| Recurso inexistente      | 404     |
| Error externo            | 502/503 |

---

## 11. Observabilidad y logging

- Logs estructurados en JSON.
- Inclusión de requestId, sub, userId y recurso.
- No se loguean tokens ni secretos.

---

## 12. Seguridad

- Autorización local estricta.
- JWT de embed con TTL corto y claims mínimos.
- Principio de mínimo privilegio.

Los detalles completos se documentan en SECURITY.md.

---

## 13. Evolución prevista

Arquitectura preparada para:

- Nuevos proveedores de dashboards.
- Backend administrativo.
- Auditoría persistente.
- Caching controlado si se justifica.
