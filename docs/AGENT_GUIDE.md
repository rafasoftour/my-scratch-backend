# AGENT_GUIDE.md

## 1. Propósito de este documento

Este documento define **las reglas de trabajo obligatorias** para cualquier agente de asistencia (IA o humano) que colabore en el desarrollo del backend.

Su objetivo es:
- Preservar la arquitectura definida.
- Evitar decisiones implícitas o no consensuadas.
- Reducir deuda técnica desde el inicio.
- Garantizar coherencia, seguridad y mantenibilidad.
- Garantizar una estrategia de testing coherente con la arquitectura.

Este documento tiene **carácter normativo**: no es orientativo.

---

## 2. Principio rector

> **Nada se implementa sin encajar explícitamente en la arquitectura definida y en la estrategia de testing oficial.**

Antes de proponer código, un agente debe:
1. Identificar la capa afectada.
2. Justificar la decisión técnica.
3. Verificar que no rompe la regla de dependencias.
4. Verificar que es testeable según `TESTING.md`.

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
- Vitest (testing)

Regla obligatoria:

> **No introducir nuevas librerías sin justificación explícita y aprobación.**

---

## 5. Testing como contrato arquitectónico

La estrategia de testing definida en `TESTING.md` forma parte del contrato arquitectónico.

Reglas:
- Las reglas de negocio se validan mediante **unit tests**.
- La infraestructura se valida mediante **integration tests**.
- No se introducen dependencias técnicas en tests unitarios.
- Un cambio que rompa la estrategia de testing se considera un **cambio arquitectónico**.

---

## 6. Regla final

> **La claridad arquitectónica, la testabilidad y la seguridad tienen prioridad absoluta sobre la rapidez de desarrollo.**
