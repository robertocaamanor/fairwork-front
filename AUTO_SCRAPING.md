# 🔄 Auto-Scraping Frontend Implementado

## ✨ Cambios Realizados

### Archivo Modificado
- ✅ [src/App.tsx](src/App.tsx)

### Funcionalidad Agregada

1. **Importación de useEffect**
   ```typescript
   import { useCallback, useEffect, useMemo, useState } from 'react'
   ```

2. **Hook de Auto-Scraping**
   ```typescript
   useEffect(() => {
     const triggerAutoScraping = async () => {
       try {
         console.log('[Auto-Scraping] Ejecutando scraping automático...')
         const result = await api.triggerScraping()
         console.log('[Auto-Scraping] Completado:', result.message)
         await queryClient.invalidateQueries({ queryKey: ['news'] })
       } catch (error) {
         console.error('[Auto-Scraping] Error:', error)
       }
     }

     // Ejecutar scraping inicial después de 5 segundos
     const initialTimeout = setTimeout(() => {
       triggerAutoScraping()
     }, 5000)

     // Ejecutar scraping cada minuto
     const intervalId = setInterval(() => {
       triggerAutoScraping()
     }, 60000) // 60 segundos = 1 minuto

     return () => {
       clearTimeout(initialTimeout)
       clearInterval(intervalId)
     }
   }, [queryClient])
   ```

## 🎯 Comportamiento

### Scraping Inicial
- **Espera 5 segundos** después de cargar la aplicación
- Ejecuta el primer scraping automáticamente
- Evita llamadas inmediatas al cargar la página

### Scraping Periódico
- Se ejecuta **cada 60 segundos** (1 minuto)
- Llama al endpoint `POST /news/scrape`
- Invalida la caché de React Query
- Refresca automáticamente las noticias en pantalla

### Logging
- Logs en consola del navegador:
  - `[Auto-Scraping] Ejecutando scraping automático...`
  - `[Auto-Scraping] Completado: <mensaje del backend>`
  - `[Auto-Scraping] Error: <error si falla>`

### Limpieza
- Al desmontar el componente (cerrar la app):
  - Limpia el timeout inicial
  - Limpia el intervalo periódico
  - Evita memory leaks

## 🚀 Cómo Probar

### 1. Iniciar el Backend
```powershell
cd E:\Proyectos\fairwork-api\news-scraper-api
npm run start:dev
```

### 2. Iniciar el Frontend
```powershell
cd E:\Proyectos\fairwork-api\news-monitor-web
npm run dev
```

### 3. Abrir el Navegador
- Ve a http://localhost:5173 (o el puerto que use Vite)
- Abre la consola del navegador (F12 → Console)

### 4. Observar el Auto-Scraping
```
[Auto-Scraping] Ejecutando scraping automático...
[Auto-Scraping] Completado: Scraping ejecutado correctamente.
```

Esto aparecerá:
- **Primera vez:** Después de 5 segundos de cargar la página
- **Periódicamente:** Cada 60 segundos

## 🔍 Verificación

### En el Frontend
1. Abre la consola del navegador
2. Deberías ver logs cada minuto
3. Las noticias se actualizan automáticamente

### En el Backend
En el terminal del backend verás:
```
[NewsService] Iniciando scraping...
[NewsService] ✓ Scrapeando: Fuente 1
[NewsService] ✓ Scrapeando: Fuente 2
[NewsService] Scraping completado: X nuevas noticias
```

### Flujo Completo
```
┌─────────────┐     ┌──────────────┐     ┌──────────────┐
│  Frontend   │────▶│   Backend    │────▶│  PostgreSQL  │
│             │     │              │     │              │
│ Auto-       │     │ Scraping     │     │ Guardar      │
│ Scraping    │     │ Normalizar   │     │ Noticias     │
│ cada 1 min  │     │ Fechas       │     │              │
│             │◀────│              │◀────│              │
│ Actualizar  │     │ Retornar     │     │              │
│ UI          │     │ Resultado    │     │              │
└─────────────┘     └──────────────┘     └──────────────┘
```

## ⚙️ Configuración

### Cambiar el Intervalo
Para modificar el tiempo entre scrapings, edita el valor en [src/App.tsx](src/App.tsx):

```typescript
// Cambiar de 1 minuto a 2 minutos
const intervalId = setInterval(() => {
  triggerAutoScraping()
}, 120000) // 120 segundos = 2 minutos
```

### Cambiar el Delay Inicial
Para modificar el tiempo de espera inicial:

```typescript
// Cambiar de 5 segundos a 10 segundos
const initialTimeout = setTimeout(() => {
  triggerAutoScraping()
}, 10000) // 10 segundos
```

### Deshabilitar Auto-Scraping
Si quieres deshabilitar temporalmente, comenta el useEffect:

```typescript
// Auto-scraping cada minuto
// useEffect(() => {
//   ...
// }, [queryClient])
```

## 📊 Beneficios

1. **Contenido Siempre Actualizado**
   - Las noticias se actualizan automáticamente
   - No necesitas refrescar la página manualmente

2. **Fechas Correctas**
   - Gracias a la normalización implementada
   - Las noticias aparecen en el año correcto

3. **UX Mejorada**
   - La aplicación se siente "viva"
   - Siempre muestra contenido reciente

4. **Manejo de Errores**
   - Los errores se logean en consola
   - No interrumpe el flujo de la aplicación

5. **Performance Optimizada**
   - React Query maneja la caché inteligentemente
   - Solo actualiza cuando hay cambios

## 🔧 Troubleshooting

### El scraping no se ejecuta
1. Verifica que el backend esté corriendo
2. Revisa la consola del navegador por errores
3. Confirma que el endpoint `/news/scrape` responde

### Muchas llamadas al backend
- El intervalo está configurado correctamente (60 segundos)
- Si ves llamadas más frecuentes, verifica que no haya múltiples instancias de la app abiertas

### No se actualizan las noticias
1. Verifica que el scraping se ejecute (logs en consola)
2. Confirma que `queryClient.invalidateQueries()` se llame
3. Revisa que React Query tenga `refetchInterval: 60000` configurado

## ✅ Estado

- [x] Auto-scraping implementado
- [x] Intervalo de 1 minuto configurado
- [x] Delay inicial de 5 segundos
- [x] Logging en consola
- [x] Limpieza de recursos (cleanup)
- [x] Manejo de errores
- [x] Invalidación de caché
- [x] Sin errores de TypeScript
- [ ] Probar en producción

---

**Fecha:** 2026-05-05  
**Estado:** ✅ IMPLEMENTADO Y LISTO PARA PROBAR
