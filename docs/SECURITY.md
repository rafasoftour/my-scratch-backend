# SECURITY

## 1. Objetivo del documento

Este documento describe las **decisiones de seguridad** del backend y los controles aplicados para garantizar:
- Autenticación fiable
- Autorización estricta
- Minimización de superficie de ataque
- Trazabilidad y auditoría

Este documento complementa a `ARCHITECTURE.md` y no describe detalles de implementación específicos de librerías.

---

## 2. Modelo de seguridad general

El backend sigue el principio de **seguridad por diseño**, basado en la separación estricta entre:

- **Autenticación**: delegada a un proveedor externo (WSO2).
- **Autorización**: gestionada exclusivamente de forma local.

No existe ningún flujo que permita acceso sin cumplir **ambas** condiciones.

---

## 3. Autenticación (OIDC con WSO2)

### 3.1 Rol de WSO2

WSO2 actúa únicamente como **Identity Provider (IdP)**:

- Emite tokens OIDC.
- Gestiona credenciales, MFA y ciclo de vida de identidades.
- Garantiza la identidad del usuario.

El backend **no**:
- Almacena contraseñas.
- Gestiona login.
- Gestiona usuarios en WSO2.

---

### 3.2 Validación del token

Cada request protegida debe incluir un token OIDC válido.

El backend valida como mínimo:

- Firma del token.
- `iss` (issuer).
- `aud` (audience).
- Expiración (`exp`).
- Integridad del token.

Si la validación falla → **401 Unauthorized**.

---

### 3.3 Identificador de usuario (`sub`)

- El claim `sub` se utiliza como **identificador único y estable** del usuario.
- El backend enlaza el usuario local con WSO2 exclusivamente mediante `sub`.
- No se utilizan emails, usernames u otros claims como clave primaria.

---

## 4. Autorización local

### 4.1 Principio fundamental

> Un usuario autenticado **no implica** un usuario autorizado.

El backend decide el acceso a recursos de forma local y explícita.

---

### 4.2 Reglas de autorización

Para conceder acceso deben cumplirse **todas** las condiciones:

1. El token OIDC es válido.
2. El usuario existe en la base de datos local.
3. El usuario tiene permiso explícito sobre el recurso solicitado.

Si falla cualquiera de ellas → **403 Forbidden**.

---

### 4.3 No auto-provisioning

- No existe creación automática de usuarios locales.
- No existe sincronización automática con WSO2.
- El alta de usuarios es manual y controlada.

Esta decisión reduce el riesgo de accesos no deseados por errores de configuración del IdP.

---

## 5. Autorización por recursos

- Los permisos se evalúan **por recurso** (por ejemplo, dashboards).
- No se delega la autorización a sistemas externos (como Metabase).
- El backend es la **única autoridad** de acceso.

Esto permite:
- Auditoría centralizada.
- Políticas homogéneas.
- Independencia de proveedores externos.

---

## 6. Embedding seguro de dashboards

### 6.1 JWT de embedding

Las URLs de embedding se generan mediante JWT firmados por el backend.

Características:

- TTL corto.
- Claims mínimos necesarios.
- Firma con secreto gestionado por el backend.

---

### 6.2 Restricciones

- El JWT de embedding **no se reutiliza** como token de autenticación.
- No se expone ningún secreto al cliente.
- El cliente no puede modificar los parámetros del embed.

---

## 7. Gestión de secretos

Principios:

- Todos los secretos se gestionan mediante variables de entorno.
- Nunca se versionan en el repositorio.
- Nunca se devuelven en respuestas HTTP.
- Nunca se registran en logs.

Incluye:
- Secretos JWT.
- Credenciales de MongoDB.
- Claves de integración con Metabase.
- Configuración de WSO2.

---

## 8. Logging y auditoría

### 8.1 Objetivos

- Trazabilidad de accesos.
- Detección de usos indebidos.
- Soporte a auditorías.

---

### 8.2 Contenido de logs

Los logs pueden incluir:

- `requestId`
- `sub`
- `userId` local
- Recurso accedido
- Acción realizada
- Resultado (permitido / denegado)

No se registran:
- Tokens OIDC completos.
- JWT de embedding.
- Cabeceras sensibles.
- Secretos.

---

## 9. Manejo de errores y exposición de información

Principios:

- Los mensajes de error son **genéricos**.
- No se filtra información interna.
- No se revela si un recurso existe cuando el usuario no está autorizado.

Ejemplo:
- Usuario sin permiso → siempre **403**, independientemente de la existencia del recurso.

---

## 10. Superficie de ataque minimizada

Decisiones explícitas:

- No endpoints públicos sin autenticación.
- No auto-descubrimiento de recursos.
- No lógica de permisos en frontend.
- No dependencia de claims externos para autorización.

---

## 11. Defensa en profundidad

La seguridad se apoya en múltiples capas:

- Validación de tokens.
- Autorización local.
- TTL corto en embeds.
- Logging centralizado.
- Separación estricta de responsabilidades.

---

## 12. Evolución y revisiones

Este documento deberá revisarse cuando:

- Se añadan nuevos proveedores de dashboards.
- Se incorporen flujos administrativos.
- Se introduzcan cambios en el modelo de permisos.
- Se modifique la estrategia de autenticación.

La seguridad se considera un **requisito continuo**, no un estado final.
