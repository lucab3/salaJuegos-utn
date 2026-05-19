# Sala de Juegos - UTN Avellaneda

Trabajo Práctico #1 de la materia **Programación IV** (4° Cuatrimestre, Tecnicatura Universitaria en Programación, UTN Avellaneda).

- **Alumno:** Luca Belotti
- **Docente:** Lic. Ricardo Gastón Plazas
- **GitHub:** [@lucab3](https://github.com/lucab3)
- **Deploy (Producción):** https://sala-juegos-utn.vercel.app
- **Deploy (Preview rama-sprint-2):** https://sala-juegos-utn-git-rama-sprint-2-luca-belotti-6656s-projects.vercel.app

---

## Sobre el proyecto

Aplicación web tipo "sala de juegos" que permite a usuarios registrados medir sus capacidades cognitivas y motrices a través de cuatro juegos, con persistencia de resultados, chat global en tiempo real y un sistema de autenticación.

El TP se entrega en 5 sprints semanales, cada uno en su propia rama y vía Pull Request hacia `main`.

## Tecnologías

- **Framework:** [Angular 21](https://angular.dev) (standalone components, signals, control flow `@if/@for`)
- **Lenguajes:** TypeScript, SCSS, HTML
- **UI:** [Bootstrap 5.3](https://getbootstrap.com) + [Bootstrap Icons](https://icons.getbootstrap.com)
- **Backend:** [Supabase](https://supabase.com) - Auth, PostgreSQL y Realtime
- **Hosting:** [Vercel](https://vercel.com)
- **Formularios:** Reactive Forms con `FormBuilder.nonNullable`

## Estructura

```
src/
├── app/
│   ├── pages/
│   │   ├── home/         → Bienvenida + contenido condicional según sesión
│   │   ├── login/        → Form reactivo + 3 botones de login rápido + Supabase Auth
│   │   ├── registro/     → Form reactivo + alta en Supabase Auth + insert tabla usuarios
│   │   └── quien-soy/    → Perfil del alumno (GitHub API) - protegido por authGuard
│   ├── shared/
│   │   ├── navbar/       → Barra de navegación con UI condicional según sesión
│   │   └── modal/        → Modal genérico (reemplazo de alert())
│   ├── services/
│   │   ├── github-service.ts       → Fetch a api.github.com/users/:username
│   │   ├── modal-service.ts        → Estado del modal global
│   │   ├── supabase-client.ts      → Cliente Supabase singleton
│   │   └── auth-service.ts         → Login, registro, logout, sesión actual
│   ├── guards/
│   │   └── auth-guard.ts           → authGuard + guestGuard (CanActivateFn)
│   ├── app.ts            → Shell raíz
│   ├── app.config.ts     → Providers (Router, HttpClient)
│   └── app.routes.ts     → Lazy-loaded routes + guards
├── environments/
│   └── environment.ts    → URL + anon key de Supabase + usuarios de testing
├── styles.scss           → Tokens y estilos globales
└── index.html            → Favicon SVG personalizado
supabase/
└── schema.sql            → Esquema de la tabla usuarios + RLS
```

## Setup local

```bash
npm install
```

Antes de levantar el server hay que conectar Supabase (ver siguiente sección).

```bash
npm start          # abre http://localhost:4200
npm run build      # genera dist/salaJuegos-utn/browser/
```

## Setup Supabase (necesario desde Sprint #2)

1. Crear un proyecto gratis en [supabase.com](https://supabase.com/dashboard) → **New project**.
2. En **Project Settings → API** copiar:
   - `Project URL`
   - `anon public` key
3. Pegarlos en [src/environments/environment.ts](src/environments/environment.ts):
   ```ts
   supabase: {
     url: 'https://<tu-proyecto>.supabase.co',
     anonKey: '<tu-anon-key>'
   }
   ```
4. En **Authentication → Providers → Email**:
   - Activar **Email** como método de login.
   - Desactivar **Confirm email** (durante el TP, así los usuarios entran al toque sin verificar inbox).
5. En **SQL Editor**, pegar y correr [supabase/schema.sql](supabase/schema.sql) para crear la tabla `usuarios` con Row Level Security.
6. Crear los 3 usuarios de testing en **Authentication → Users → Add user** con los emails y passwords definidos en `environment.ts` (`tester1@salajuegos.test`, etc.), y luego registrarlos por el formulario de la app para que se carguen en la tabla `usuarios`.

## Sprints

### Sprint #1 - Entrega 2026-05-19 - tag [v1.0.0](https://github.com/lucab3/salaJuegos-utn/releases/tag/v1.0.0)

Rama: `rama-sprint-1`

- Proyecto Angular 21 inicializado con routing y SCSS.
- Componentes creados: `Login`, `Registro`, `Home`, `Quién Soy`.
- Navegación entre componentes (router + navbar).
- **Quién Soy** trae los datos del alumno desde `https://api.github.com/users/lucab3` y muestra avatar, bio, repos públicos, seguidores, etc.
- Explicación del **juego propio elegido: Buscaminas** (reglas y datos que se guardarán en DB).
- Favicon SVG propio.
- Animaciones CSS de entrada (fade, pop, slide).
- Servicio de modal genérico para reemplazar `alert()`.
- Estilos uniformes con Bootstrap 5 + variables CSS propias.

### Sprint #2 - Entrega 2026-05-20

Rama: `rama-sprint-2`

- Integración con **Supabase Auth**: registro y login con email + contraseña.
- Registro guarda los datos personales (nombre, apellido, edad, email) en la tabla `usuarios` (la contraseña **no** se guarda — la gestiona Supabase Auth).
- Auto-login post-registro y navegación automática a Home.
- Mensajes de error traducidos al español (credenciales inválidas, usuario ya registrado, etc.).
- **3 botones de inicio de sesión rápido** en la página de login (testers configurables en `environment.ts`).
- **Guards de ruta** funcionales:
  - `authGuard` protege `/quien-soy` (redirige a `/login` si no hay sesión).
  - `guestGuard` protege `/login` y `/registro` (redirige a `/home` si ya hay sesión).
- **Home condicional**:
  - Sin sesión: muestra CTAs a Login/Registro.
  - Con sesión: muestra saludo personalizado + botón de cerrar sesión.
- **Navbar condicional**: oculta Login/Registro cuando hay sesión, muestra nombre del usuario + botón logout.
- Esquema SQL versionado en [supabase/schema.sql](supabase/schema.sql) con Row Level Security.

### Sprint #3 + #4 - Entrega 2026-05-26

Ramas: `rama-sprint-3` y `rama-sprint-4`

- **Ahorcado** (entrada por botones, no teclado).
- **Mayor o Menor** (baraja de naipes).
- **Chat global en tiempo real** (Supabase Realtime).
- **Preguntados** (preguntas desde API externa).
- **Buscaminas** (juego propio).
- 4 tablas de resultados ordenadas por desempeño.

### Sprint #5 - Recuperatorio 2026-06-02

Rama: `rama-sprint-5`

- Encuesta con validaciones (nombre, edad 18-99, teléfono 10 dígitos numéricos, mínimo 3 preguntas con distintos controles).
- Sección de resultados de encuestas (sólo admins, con guard).
- Animaciones de transición entre componentes.

## Juego propio: Buscaminas

Elegí Buscaminas porque combina lógica deductiva, manejo de información parcial y velocidad, capacidades cognitivas que pide ejercitar la consigna.

**Reglas:**

1. Tablero de NxN celdas, algunas con minas.
2. Click izquierdo descubre la celda. Si toca una mina, se pierde.
3. Si la celda es segura, muestra cuántas minas hay en las 8 vecinas.
4. Si tiene 0 minas vecinas, se abre en cascada el área limpia.
5. Click derecho (o botón Bandera) marca una celda como sospechosa.
6. Se gana al descubrir todas las celdas que NO son minas.

**Métricas guardadas en DB:** usuario, victoria/derrota, tiempo en segundos, dificultad (tamaño de tablero y cantidad de minas).

## Licencia

Trabajo académico - UTN Avellaneda, 2026.
