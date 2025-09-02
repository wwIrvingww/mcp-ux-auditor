# MCP UX Auditor

Servidor **MCP** local (transporte **STDIO**) que expone la tool `ux_audit.analyze`. Este servidor recibe HTML y devuelve métricas básicas de UX: jerarquía visual, carga cognitiva y acción principal (CTA).

## Propósito

El objetivo de este servidor es analizar archivos HTML y generar un reporte con métricas que permitan evaluar aspectos básicos de usabilidad. Esto permite a un chatbot anfitrión integrar una herramienta de auditoría UX y dar retroalimentación inmediata a diseñadores o desarrolladores.

## Requisitos

* Node.js 18+
* npm o yarn

## Instalación

```bash
npm install
```

## Uso

Para iniciar el servidor MCP local:

```bash
npm run start
```

El servidor se comunica por STDIO y debe ser levantado por un host MCP compatible (ej. tu chatbot anfitrión).

## Tool expuesta

* **name:** `ux_audit.analyze`
* **input:**

```json
{
  "html": "<!doctype html><html>...</html>"
}
```

* **output:** JSON con métricas (como texto MCP), por ejemplo:

```json
{
  "totals": {
    "headings": { "h1": 1, "h2": 2, "h3": 3 },
    "links": 5,
    "buttons": 2,
    "inputs": 1,
    "forms": 1,
    "images": 3
  },
  "cognitiveLoad": {
    "interactiveElements": 8,
    "suggestion": null
  },
  "visualHierarchy": {
    "hasSingleH1": true,
    "suggestion": null
  },
  "primaryActionFlow": {
    "hasPrimaryCTA": true,
    "primaryCTAText": "Continuar",
    "suggestion": null
  }
}
```

## Ejemplo de flujo

1. El host MCP envía una llamada de tool con el HTML.
2. El servidor analiza el HTML con `cheerio`.
3. El servidor responde con un reporte JSON en el campo `content`.

## Licencia

MIT.
