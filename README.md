# News Monitor Web

Frontend independiente para monitoreo editorial estilo TweetDeck, con columnas por categoria y acciones de curaduria.

## Stack

- React
- TypeScript
- Vite
- TailwindCSS
- Axios
- TanStack Query
- Lucide React

## Requisitos

- Node.js 20+
- Backend disponible en `http://localhost:3000`

## Instalacion

1. Instala dependencias:

```bash
npm install
```

2. Crea tu archivo de entorno a partir del ejemplo:

```bash
cp .env.example .env
```

En Windows PowerShell:

```powershell
Copy-Item .env.example .env
```

## Variables de entorno

`VITE_API_BASE_URL=http://localhost:3000`

## Ejecutar frontend

```bash
npm run dev
```

Aplicacion disponible por defecto en `http://localhost:5173`.

## Build de produccion

```bash
npm run build
```

## Funcionalidades incluidas

- Dashboard oscuro con barra superior fija (`Monitor Editorial`).
- Board horizontal tipo TweetDeck con scroll y columnas por categoria:
  - `tv_chilena`
  - `tv_internacional`
  - `musica`
  - `farandula`
  - `streaming`
  - `radio`
- Cards de noticias con:
  - titulo, fuente, hora, resumen
  - imagen opcional
  - score
  - acciones: Seleccionar, Descartar, Enviar a n8n, Abrir fuente
- Filtros globales:
  - Solo score >= 70
  - Todas
  - Nuevas
  - Seleccionadas
  - Descartadas
- Refresh manual y refresh automatico cada 60 segundos.
- Boton para ejecutar scraping (`POST /news/scrape`).
- Manejo de errores API con mensajes claros en pantalla.

## Busqueda por columna y relacionadas

- Cada columna del monitor tiene su propio buscador con debounce de 400 ms.
- Si la busqueda esta vacia, la columna usa datos normales de `GET /news/latest`.
- Si hay texto, la columna consulta `GET /news?category=<category>&q=<texto>`.
- Cada card incluye boton `Relacionadas`.
- El modal de relacionadas permite:
  - consulta inicial por `GET /news/related?newsId=<id>`
  - busqueda manual por `GET /news/related?q=<texto>&category=<category>&source=<sourceName>`
- El refresh automatico cada 60 segundos mantiene el texto de busqueda por columna.

## Seccion de revision editorial (CMS)

- Navegacion superior con 2 vistas:
  - `Monitor`
  - `Revision editorial`
- Filtros editoriales por estado:
  - `pending_review`
  - `approved`
  - `rejected`
  - `draft_created`
- Cards editoriales con datos SEO generados por n8n:
  - `proposal.titulo`
  - `proposal.bajada`
  - `proposal.keyword`
  - `proposal.meta_description`
  - `proposal.categoria_sugerida`
  - `proposal.riesgo_editorial`
  - `proposal.nota_editor`
  - titulo original, fuente, score, URL original y fecha de creacion
- Acciones por card:
  - `Aprobar` -> `PATCH /editorial/reviews/:id/status`
  - `Rechazar` -> `PATCH /editorial/reviews/:id/status` con motivo opcional
  - `Abrir fuente`
  - `Ver cuerpo` (modal con contenido)

## Flujo completo n8n + frontend + backend

1. n8n crea propuesta SEO en `POST /editorial/reviews`.
2. Frontend consulta `GET /editorial/reviews?status=pending_review`.
3. Editor aprueba o rechaza en UI.
4. n8n consulta `GET /editorial/reviews/approved`.
5. n8n crea borrador en WordPress.
6. n8n confirma en backend con `PATCH /editorial/reviews/:id/published` (status `draft_created`).

## Endpoints editoriales consumidos por el frontend

- `GET /editorial/reviews?status=pending_review`
- `GET /editorial/reviews?status=approved`
- `GET /editorial/reviews?status=rejected`
- `GET /editorial/reviews?status=draft_created`
- `PATCH /editorial/reviews/:id/status`

## Nota de conectividad

- Frontend (host): `http://localhost:5173`
- Backend (host): `http://localhost:3000`
- n8n (Docker): `http://localhost:8080`
- Desde n8n en Docker hacia backend: `http://host.docker.internal:3000`
