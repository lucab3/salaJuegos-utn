# Sala de Juegos - UTN Avellaneda

Trabajo Práctico #1 de la materia **Programación IV** (4° Cuatrimestre, Tecnicatura Universitaria en Programación, UTN Avellaneda).

- **Alumno:** Luca Belotti
- **Docente:** Lic. Ricardo Gastón Plazas
- **GitHub:** [@lucab3](https://github.com/lucab3)
- **Deploy (Producción):** https://sala-juegos-utn.vercel.app
- **Deploy (Preview rama-sprint-3):** Vercel deploya un preview automático al pushear la rama.

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
│   │   ├── home/         → Bienvenida + contenido condicional según sesión + grid de juegos
│   │   ├── login/        → Form reactivo + 3 botones de login rápido + Supabase Auth
│   │   ├── registro/     → Form reactivo + alta en Supabase Auth + insert tabla usuarios
│   │   ├── quien-soy/    → Perfil del alumno (GitHub API) - protegido por authGuard
│   │   ├── ahorcado/     → Juego Ahorcado con botones (sin teclado físico)
│   │   ├── mayor-menor/  → Juego Mayor o Menor con baraja española
│   │   ├── preguntados/  → Trivia con API externa (opentdb.com)
│   │   ├── buscaminas/   → Juego propio - 3 dificultades, cronómetro, banderas
│   │   ├── resultados/   → 4 tablas de ranking por juego
│   │   └── chat/         → Chat global en tiempo real (Supabase Realtime)
│   ├── shared/
│   │   ├── navbar/       → Barra de navegación con UI condicional según sesión
│   │   └── modal/        → Modal genérico (reemplazo de alert())
│   ├── services/
│   │   ├── github-service.ts       → Fetch a api.github.com/users/:username
│   │   ├── modal-service.ts        → Estado del modal global
│   │   ├── supabase-client.ts      → Cliente Supabase singleton
│   │   ├── auth-service.ts         → Login, registro, logout, sesión actual
│   │   ├── partidas-service.ts     → Guardar partida + leer ranking por juego
│   │   ├── chat-service.ts         → Mensajes globales + suscripción Realtime
│   │   └── trivia-service.ts       → Fetch a opentdb.com (Preguntados)
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
5. En **SQL Editor**, pegar y correr [supabase/schema.sql](supabase/schema.sql) para crear las tablas `usuarios`, `partidas` y `mensajes_chat` con Row Level Security (idempotente: se puede correr varias veces).
   - El script también agrega la tabla `mensajes_chat` a la publicación `supabase_realtime` para que el chat funcione en tiempo real.
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

### Sprint #3 - Entrega 2026-05-26

Rama: `rama-sprint-3`

- **Ahorcado** funcional con teclado en pantalla (botones A-Z). No usa el teclado físico, como pide la consigna.
  - Palabra aleatoria desde un diccionario interno; 6 fallos máximos.
  - Dibujo del muñeco SVG animado parte por parte.
  - Guarda el resultado en `partidas` (puntaje según fallos restantes).
- **Mayor o Menor** funcional con baraja española (40 cartas: oros, copas, espadas, bastos × 1-7, 10, 11, 12).
  - Mazo barajado en cada partida; pierde con 3 errores.
  - Animaciones de pop/flip al revelar carta siguiente.
  - Guarda aciertos como puntaje en `partidas`.
- **Chat global en tiempo real** vía Supabase Realtime (no requiere recargar).
  - Tabla `mensajes_chat` con RLS + publication `supabase_realtime`.
  - Burbujas a derecha para mensajes propios, izquierda para los demás.
  - Auto-scroll al recibir mensajes nuevos.
- **Persistencia en DB**: nuevas tablas `partidas` y `mensajes_chat` con Row Level Security (`partidas_insert_self`, `mensajes_insert_self`).
- Acumula todo lo de Sprint #1 y Sprint #2 (auth, guards, home condicional, navbar condicional).

### Sprint #4 - Entrega 2026-05-26

Rama: `rama-sprint-4` (se entrega junto con Sprint #3)

- **Preguntados** funcional con preguntas desde la API externa [opentdb.com](https://opentdb.com).
  - 10 preguntas multiple choice por partida.
  - Puntaje según dificultad (fácil 10, media 20, difícil 30).
  - Decoding de HTML entities (`&quot;`, `&eacute;`, etc.) que devuelve la API.
  - Guarda el resultado en `partidas`.
- **Buscaminas** como juego propio, con 3 dificultades (8×8/10 minas, 10×10/18 minas, 12×12/30 minas).
  - Cronómetro en pantalla.
  - Apertura en cascada de celdas con 0 vecinas.
  - Banderas con click derecho.
  - Primera click nunca es mina (las minas se colocan después del primer movimiento).
  - Guarda resultado + dificultad + tiempo en `partidas`.
- **4 tablas de resultados** (Ahorcado, Mayor o Menor, Preguntados, Buscaminas), ordenadas por puntaje desc y fecha desc.
  - Podio top 3 destacado con colores (oro/plata/bronce).
  - Detalle por juego según el campo `datos` JSONB (palabra adivinada, aciertos, dificultad, etc.).
- Servicio nuevo: `trivia-service.ts` para consumir la API externa con `HttpClient`.

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
