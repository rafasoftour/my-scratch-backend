# TESTING.md

## 1. Propósito de este documento

Este documento define la **estrategia de testing obligatoria** del backend.

Su objetivo es:
- Garantizar la corrección funcional del sistema.
- Proteger la arquitectura Clean definida en `ARCHITECTURE.md`.
- Evitar acoplamientos indebidos entre capas.
- Mantener los tests rápidos, claros y mantenibles.
- Permitir que agentes de IA colaboren sin introducir deuda técnica.

Este documento tiene **carácter normativo**.  
No es una guía orientativa.

---

## 2. Principio rector

> **Cada tipo de test valida un tipo de responsabilidad distinto.  
> Mezclar responsabilidades invalida el test.**

Un test que necesita infraestructura para validar lógica de negocio está mal diseñado.

---

## 3. Clasificación oficial de tests

El proyecto define **tres tipos de tests**, claramente diferenciados.

### 3.1 Unit Tests (tests unitarios)

#### Qué prueban
- Entidades de dominio (`domain`)
- Casos de uso (`application`)

#### Qué validan
- Reglas de negocio
- Invariantes
- Decisiones de los casos de uso
- Errores de dominio y de aplicación

#### Qué NO pueden usar
- MongoDB
- Mongoose
- Fastify
- HTTP
- Red
- Variables de entorno reales

#### Dependencias permitidas
- Clases de dominio
- Casos de uso
- **Puertos (interfaces)**
- Dobles de prueba (fakes / stubs) de los puertos

#### Regla obligatoria
> Si un test necesita base de datos, red o framework HTTP, **no es un unit test**.

---

### 3.2 Integration Tests (tests de integración)

Los tests de integración validan que **implementaciones concretas** cumplen los contratos definidos en la aplicación.

Existen **dos tipos explícitos**:

#### 3.2.1 Application + Infrastructure

Validan:
- Implementaciones reales de puertos (repositorios Mongo, integraciones externas).
- Mapping dominio ⇄ persistencia.
- Índices, restricciones y comportamiento real de la base de datos.

Características:
- Usan MongoDB real (base de datos de test).
- No usan HTTP ni Fastify.
- No prueban reglas de negocio (ya cubiertas por unit tests).

Pregunta que responden:
> ¿Esta implementación concreta cumple el contrato del puerto?

---

#### 3.2.2 Presentation + Application

Validan:
- Rutas HTTP.
- Traducción HTTP ⇄ casos de uso.
- Manejo de errores y códigos de estado.

Características:
- Usan Fastify.
- Usan `server.inject()` (no se abre un puerto real).
- Pueden usar repositorios reales o dobles controlados.

Pregunta que responden:
> ¿La API expone correctamente los casos de uso?

---

### 3.3 E2E Tests (end-to-end)

Validan el sistema completo:
- Server real
- Configuración real
- Base de datos real
- Flujos completos de usuario

Características:
- Lentos
- Escasos
- Alto valor

Uso recomendado:
- Flujos críticos
- Smoke tests
- Validación de despliegues

---

## 4. Estructura obligatoria de carpetas de tests

La estructura oficial es:

```
tests/
  unit/
    domain/
    application/

  integration/
    infrastructure/
    presentation/

  e2e/

  helpers/
    fakes/
    builders/
```

### Reglas
- Los **unit tests** solo viven en `tests/unit`.
- Los **integration tests** solo viven en `tests/integration`.
- Los **e2e tests** solo viven en `tests/e2e`.
- Los dobles de prueba reutilizables viven en `tests/helpers`.

---

## 5. Dobles de prueba (fakes, stubs, mocks)

### Regla general
> Se prefieren **fakes in-memory** a mocks de librería.

#### Permitido
- Implementaciones simples en memoria de puertos (`InMemoryUserRepository`).
- Builders para crear entidades o inputs de test.

#### No permitido
- Mockear Mongoose en unit tests.
- Mockear MongoDB.
- Usar `NODE_ENV` para alterar lógica de negocio.

Los puertos se **sustituyen**, no se parchean.

---

## 6. Relación con Clean Architecture

- Los unit tests refuerzan la independencia de `domain` y `application`.
- Los integration tests validan la capa `infrastructure` sin contaminar el core.
- Los tests de presentación garantizan que HTTP es solo un adaptador.

Un test que rompe estas fronteras se considera **violación arquitectónica**.

---

## 7. Herramienta oficial de testing

El framework oficial del proyecto es:

- **Vitest**

No se prohíbe el uso de utilidades adicionales, pero:
- deben justificarse
- no deben introducir dependencias técnicas en tests unitarios

---

## 8. Regla final

> **Si para probar una regla de negocio necesitas infraestructura,  
> esa regla está en la capa equivocada.**

Los tests son parte del diseño del sistema, no un añadido posterior.
