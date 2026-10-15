# Inventario

App de inventario y ventas (productos con colores, stock por ubicación, cajas cerradas, accesorios, ventas, reportes y galería de trabajos).

**Todo se guarda localmente en el navegador** (IndexedDB). No usa servidores ni nube, y funciona sin conexión una vez cargada.

## Usar en tu computadora

```bash
npm install
npm run dev
```

Abre la dirección que muestra la terminal (normalmente http://localhost:5173).

## Generar la versión para publicar

```bash
npm run build
```

Queda en la carpeta `dist/`. Se puede subir a cualquier hosting estático (GitHub Pages, Netlify, Vercel, etc.).

## Publicar en GitHub Pages

1. Sube este proyecto a un repositorio de GitHub (rama `main`).
2. En GitHub: **Settings → Pages → Build and deployment → Source: GitHub Actions**.
3. Cada vez que hagas push, `.github/workflows/deploy.yml` compila y publica la app.

## Importante sobre los datos

- Los datos viven **en el navegador y dispositivo donde se usan**. Si borras los datos del sitio o cambias de navegador/equipo, no estarán.
- Para pasar datos entre dispositivos o hacer copias de seguridad usa **Configuración → Respaldo** (exportar/importar `.json`).
- Hay también exportar/importar productos en Excel (**Configuración → Importar / Exportar Excel**).
- En **Configuración** puedes poner tu nombre; aparece como vendedor en las ventas.
