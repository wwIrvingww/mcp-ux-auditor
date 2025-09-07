# 📋 MCP UX Auditor — README

Este repositorio contiene un servidor MCP (Model Context Protocol) llamado **mcp-ux-auditor** que realiza un análisis automatizado de aspectos de usabilidad/UX de una página o artefacto entregado (URL, HTML o captura). No es una herramienta trivial: pretende devolver un *informe estructurado* con problemas, evidencias y sugerencias accionables (p. ej. problemas de contraste, orden de tabulación, elementos solapados, heurísticas de usabilidad). Este README describe cómo instalar, ejecutar, usar, y cómo integrarlo con el *host/chatbot*.

---

## 🔎 Qué hace el servicio (visión funcional)

* **Herramienta principal**: `ux_audit.analyze`
* **Entradas aceptadas** (al menos una de):

  * `url` (string): URL pública a analizar (siempre que el servidor pueda alcanzarla).
  * `html` (string): HTML crudo para analizar offline.
  * `screenshot_base64` (string): captura de pantalla en Base64 (para análisis visual heurístico simple).
* **Opciones**:

  * `depth` (integer, opcional): nivel de análisis/recursos a descargar (1 = solo recurso principal; 2 = recursos externos básicos).
  * `rules` (array, opcional): lista de reglas específicas a ejecutar (p. ej. \[`contrast`,`tab-order`,`image-alt`]).
* **Salida**: JSON estructurado que contiene:

  * `summary` (texto): resumen ejecutivo corto.
  * `scores` (obj): métricas cuantitativas (ej. `accessibility_score`, `layout_score`).
  * `issues` (array): lista de issues con campos `{id, severity, title, description, selector, suggestion}`.
  * `artifacts` (obj, opcional): recursos generados (mini-screenshots, fragmentos HTML, logs), referenciados por nombre o base64.

---

## 🛠️ Requisitos

* Node.js >= 20.x.
* npm o yarn.
* Conexión a internet si se analizan URLs externas.
* (Opcional) `chromium` / `puppeteer` si se usa renderizado para análisis visual; en ese caso instalar dependencias del sistema si corres en Linux.

---

## 📦 Instalación y arranque local

```
# clonar
git clone https://github.com/TU_USUARIO/mcp-ux-auditor.git
cd mcp-ux-auditor

# instalar dependencias
npm install

# construir
npm run build

# iniciar (modo dev)
npm run dev
# o modo producción
npm start

```

Por defecto el servidor escucha en `http://127.0.0.1:3000`.

---

## 🧭 API / Especificación MCP (mínimo requerido)

### 1) `GET /tools`

* **Descripción**: lista las herramientas disponibles. Retorna `{"tools": ["ux_audit.analyze"]}`.
* **Uso**: discovery/sincronización por parte del host.

### 2) `POST /mcp/run`

* **Descripción**: endpoint MCP genérico. Recibe un JSON con campos `tool` y `input`.
* **Cuerpo (ejemplo)**:

```
{
  "tool": "ux_audit.analyze",
  "input": {
    "url": "https://ejemplo.com/page.html",
    "depth": 1,
    "rules": ["contrast","image-alt"]
  }
}

```

* **Respuesta (ejemplo resumido)**:

```
{
  "summary": "Se detectaron 3 issues importantes: contraste, imágenes sin alt, tab-order inconsistente.",
  "scores": { "accessibility_score": 0.68, "layout_score": 0.83 },
  "issues": [
    {"id":"ISS-001","severity":"high","title":"Contraste insuficiente","description":"El texto en selector .hero h1...","selector":".hero h1","suggestion":"Aumentar contraste a ratio 4.5:1"}
  ],
  "artifacts": {"screenshot":"<base64...>"}
}

```

---

## 🔁 Integración con el host (ej. `irvingpt`)

El host debe invocar `POST /mcp/run` con `tool: "ux_audit.analyze"` y el `input` adecuado. Para integrar en Python (ejemplo conceptual):

* Añadir client en `mcp_servers/ux_auditor` que haga POST a `REMOTE_UX_AUDITOR_URL`.
* Registrar la tool en el host y exponer un endpoint de puente (`/mcp/ux-audit`) que convierta parámetros user-facing a `input` para el MCP.

---

## ✅ Ejemplos de uso (curl & PowerShell)

**curl (Linux/Mac)**

```
curl -s -X POST http://127.0.0.1:3000/mcp/run \
  -H "Content-Type: application/json" \
  -d '{"tool":"ux_audit.analyze","input":{"url":"https://example.com","depth":1}}' | jq

```

**PowerShell (Windows)**

```
Invoke-RestMethod -Uri "http://127.0.0.1:3000/mcp/run" -Method Post -ContentType "application/json" -Body '{"tool":"ux_audit.analyze","input":{"url":"https://example.com","depth":1}}'

```

