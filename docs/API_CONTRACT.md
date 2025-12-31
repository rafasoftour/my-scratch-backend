# API_CONTRACT

## 1. Propósito del documento

Este documento define cómo se gestiona el **contrato de la API pública** del backend `reports-api-backend-public`.

El contrato de la API:
- Es la **fuente de verdad** de la interfaz pública.
- Permite testing manual, integración con frontend y revisión externa.
- Establece reglas claras de evolución y compatibilidad.

Este documento **no describe implementación**, solo el contrato.

---

## 2. Enfoque API-first

El backend sigue un enfoque **API-first**:

- La API se diseña antes de implementar lógica.
- El contrato OpenAPI define:
  - Endpoints disponibles
  - Métodos HTTP
  - Esquemas de request y response
  - Códigos de estado y errores
  - Requisitos de autenticación

La implementación debe **ajustarse al contrato**, no al revés.

---

## 3. OpenAPI como contrato oficial

- El contrato se define mediante **OpenAPI**.
- OpenAPI es el **único contrato oficial** de la API pública.
- Cualquier consumidor debe asumir que:
  - Lo no documentado no existe.
  - Lo documentado es estable dentro de una versión.

---

## 4. Ubicación del contrato

El contrato OpenAPI se mantiene en el repositorio en la ruta:

```
docs/postman/
```

Dentro de esta carpeta se almacenan los ficheros OpenAPI en formato JSON o YAML.

---

## 5. Relación con herramientas externas

El contrato OpenAPI puede ser importado en herramientas externas como:

- Postman
- Clientes HTTP
- Herramientas de validación

Estas herramientas **no definen** el contrato, solo lo consumen.

---

## 6. Alcance del contrato

El contrato OpenAPI documenta únicamente:

- Endpoints públicos del backend.
- Flujos soportados oficialmente.
- Esquemas de datos expuestos a clientes.

No se documentan:

- Endpoints internos.
- Endpoints experimentales.
- Endpoints administrativos no públicos (si los hubiera en el futuro).

---

## 7. Autenticación en el contrato

El contrato debe reflejar explícitamente que:

- Todos los endpoints están protegidos por **OIDC (Bearer Token)**.
- No existen endpoints públicos sin autenticación.
- El contrato no expone detalles internos de WSO2.

---

## 8. Autorización y permisos

Principios:

- El contrato **no describe reglas de permisos internas**.
- El contrato sí documenta:
  - Posibles códigos de error (403).
  - Casos generales de acceso denegado.

La lógica de autorización pertenece a la implementación, no al contrato.

---

## 9. Errores y respuestas

El contrato debe documentar:

- Códigos HTTP esperados.
- Estructura estándar de errores.
- Casos de error comunes:
  - 401 Unauthorized
  - 403 Forbidden
  - 404 Not Found
  - 5xx errores de servidor

Los mensajes de error son genéricos y no filtran información sensible.

---

## 10. Versionado del contrato

Reglas de versionado:

- Cambios **compatibles hacia atrás**:
  - añadir campos opcionales
  - añadir endpoints nuevos
- Cambios **no compatibles**:
  - eliminar campos
  - cambiar significados
  - modificar rutas existentes

Los cambios no compatibles requieren:
- Nueva versión del contrato
- Comunicación explícita a consumidores

---

## 11. Disciplina de actualización

Reglas obligatorias:

- No se modifica una ruta pública sin actualizar el contrato.
- No se implementa un endpoint público sin reflejarlo en OpenAPI.
- El contrato se revisa antes de merges relevantes.

---

## 12. Relación con otros documentos

Este documento se apoya en:

- `ARCHITECTURE.md` → diseño general del sistema.
- `SECURITY.md` → decisiones de seguridad.
- `AGENT_GUIDE.md` → reglas de trabajo de agentes.

En caso de conflicto:
1. SECURITY.md
2. ARCHITECTURE.md
3. API_CONTRACT.md

---

## 13. Regla final

> **Si no está en el contrato OpenAPI, no existe como API pública.**

Esta regla garantiza:
- claridad
- control
- estabilidad
- confianza de los consumidores
