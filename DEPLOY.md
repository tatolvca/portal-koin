# Subir a Git y publicar en Vercel

## 1. Subir a Git

Abre una terminal en la carpeta del proyecto (`portal-koin`) y ejecuta:

```bash
cd c:\Users\juan.olveira_koin\Desktop\portal-koin

# Si aún no es un repositorio Git:
git init

# Añadir todos los archivos (respeta .gitignore)
git add -A

# Ver qué se va a subir
git status

# Primer commit
git commit -m "Portal Koin: Protección de Cuenta, Métricas, Red, Overview"

# Crear repo en GitHub/GitLab/Bitbucket y enlazarlo (reemplaza URL por la tuya):
git remote add origin https://github.com/TU_USUARIO/portal-koin.git

# Subir (rama main)
git branch -M main
git push -u origin main
```

Si ya tienes un repo remoto configurado, solo necesitas:

```bash
git add -A
git commit -m "Portal Koin: actualizaciones"
git push
```

---

## 2. Publicar en Vercel

### Opción A: Conectar desde la web de Vercel (recomendado)

1. Entra en [vercel.com](https://vercel.com) e inicia sesión (con GitHub/GitLab/Bitbucket si quieres).
2. **Add New…** → **Project**.
3. **Import Git Repository**: elige el repo donde subiste `portal-koin`.
4. Si el repo tiene solo la carpeta del portal (o es el propio repo del portal), deja:
   - **Root Directory:** `./` (o la carpeta raíz del repo).
   - **Framework Preset:** Vite (Vercel lo suele detectar).
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
5. **Deploy**. Vercel construirá el proyecto y te dará una URL (ej. `portal-koin-xxx.vercel.app`).

### Opción B: Desde la terminal con Vercel CLI

```bash
cd c:\Users\juan.olveira_koin\Desktop\portal-koin
npm i -g vercel
vercel
```

Sigue las preguntas (login si hace falta, link a un proyecto o crear uno nuevo). Para producción:

```bash
vercel --prod
```

---

## Notas

- **Rutas (SPA):** En `vercel.json` hay un `rewrites` para que todas las rutas (ej. `/antifraude/proteccion-cuenta`) sirvan `index.html` y React Router funcione bien.
- **Variables de entorno:** Si más adelante usas env (API keys, etc.), configúralas en **Vercel → Project → Settings → Environment Variables**.
- **Rama:** Por defecto Vercel despliega la rama `main` en cada push. Puedes cambiar la rama en **Settings → Git**.
