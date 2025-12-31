# ARCHITECTURE.md

## 1. Propósito del backend

Este backend actúa como **punto único de acceso seguro** para un portal de informes corporativo que proporciona acceso controlado a dashboards analíticos.

Sus responsabilidades principales son:

- Autenticar usuarios mediante **OIDC (WSO2)**.
- Autorizar el acceso a recursos de forma **local**.
- Generar URLs de embedding firmadas.
- Registrar accesos y eventos relevantes.

---

## 2. Principios arquitectónicos

El diseño del backend se rige por:

- **Clean Architecture**
- **Regla de dependencias** (hacia el núcleo)
- **API-first**
- **Seguridad por diseño**
- **Testabilidad por diseño**

---

## 3. Arquitectura en capas

presentation → application → domain  
                    ↑  
              infrastructure

Las capas externas dependen de las internas. Las internas no conocen las externas.

---

## 4. Capas

### Domain

- Entidades y reglas de negocio.
- Invariantes.
- Value Objects.
- Errores de dominio.

El dominio **no representa la base de datos** ni modelos de persistencia.

---

### Application

- Casos de uso.
- Puertos (interfaces).
- Orquestación de flujos.

Define **qué necesita** del exterior, no **cómo se implementa**.

---

### Infrastructure

- Implementaciones técnicas:
  - MongoDB / Mongoose
  - Integraciones externas
- Modelos de persistencia.
- Índices, timestamps, configuración técnica.

Puede contener datos que **no existen en el dominio** (ej. `createdAt`, `updatedAt`).

---

### Presentation

- HTTP / Fastify.
- Rutas.
- Traducción HTTP ⇄ casos de uso.
- Manejo de errores y status codes.

No contiene lógica de negocio.

---

## 5. Composition Root

El **composition root** es el punto donde se conectan todas las capas.

Características:
- Crea implementaciones concretas.
- Inyecta dependencias.
- Lee configuración.
- Registra adaptadores.

Ejemplo:
- `server.ts`

El composition root **no pertenece** a ninguna capa de Clean Architecture.

---

## 6. Testing

El sistema adopta una estrategia de testing explícita y obligatoria definida en `TESTING.md`.

- Unit tests protegen el núcleo.
- Integration tests validan adaptadores.
- E2E tests validan el sistema completo.

La testabilidad es un requisito arquitectónico.

---

## 7. Regla final

> **La arquitectura se valida tanto por el código como por los tests.**
