# Sala de Juegos - UTN Avellaneda

Trabajo Práctico #1 de la materia **Programación IV** (4° Cuatrimestre, Tecnicatura Universitaria en Programación, UTN Avellaneda).

- **Alumno:** Luca Belotti
- **Docente:** Lic. Ricardo Gastón Plazas
- **GitHub:** [@lucab3](https://github.com/lucab3)
- **Deploy (Producción):** https://sala-juegos-utn.vercel.app
- **Deploy (Preview rama-sprint-1):** https://sala-juegos-utn-git-rama-sprint-1-luca-belotti-6656s-projects.vercel.app

---

## Sobre el proyecto

Aplicación web tipo "sala de juegos" que permite a usuarios registrados medir sus capacidades cognitivas y motrices a través de cuatro juegos, con persistencia de resultados, chat global en tiempo real y un sistema de autenticación.

El TP se entrega en 5 sprints semanales, cada uno en su propia rama y vía Pull Request hacia `main`.

## Tecnologías

- **Framework:** [Angular 21](https://angular.dev) (standalone components, signals, control flow `@if/@for`)
- **Lenguajes:** TypeScript, SCSS, HTML
- **UI:** [Bootstrap 5.3](https://getbootstrap.com) + [Bootstrap Icons](https://icons.getbootstrap.com)
- **Backend (Sprint #2+):** [Supabase](https://supabase.com) - Auth, PostgreSQL y Realtime
- **Hosting:** [Vercel](https://vercel.com)
- **Formularios:** Reactive Forms con `FormBuilder.nonNullable`

## Estructura

```
src/
├── app/
│   ├── pages/
│   │   ├── home/         → Bienvenida + CTAs a juegos y auth
│   │   ├── login/        → Form reactivo de inicio de sesión
│   │   ├── registro/     → Form reactivo de registro
│   │   └── quien-soy/    → Perfil del alumno (GitHub API) + explicación del juego propio
│   ├── shared/
│   │   ├── navbar/       → Barra de navegación global
│   │   └── modal/        → Modal genérico (reemplazo de alert())
│   ├── services/
│   │   ├── github-service.ts   → Fetch a api.github.com/users/:username
│   │   └── modal-service.ts    → Estado del modal global
│   ├── app.ts            → Shell raíz
│   ├── app.config.ts     → Providers (Router, HttpClient)
│   └── app.routes.ts     → Lazy-loaded routes
├── styles.scss           → Tokens y estilos globales
└── index.html            → Favicon SVG personalizado
```

## Cómo correr local

```bash
npm install
npm start          # abre http://localhost:4200
```

## Cómo buildear

```bash
npm run build      # genera dist/salaJuegos-utn/browser/
```

## Sprints

### Sprint #1 - Entrega 2026-05-19

Rama: `rama-sprint-1`

- Proyecto Angular 21 inicializado con routing y SCSS.
- Componentes creados: `Login`, `Registro`, `Home`, `Quién Soy`.
- Navegación entre componentes (router + navbar).
- **Quién Soy** trae los datos del alumno desde `https://api.github.com/users/lucab3` y muestra avatar, bio, repos públicos, seguidores, etc.
- Explicación del **juego propio elegido: Buscaminas** (reglas y datos que se guardarán en DB).
- Favicon SVG propio.
- Animaciones CSS de entrada (fade, pop, slide).
- Servicio de modal genérico para reemplazar `alert()` (cumple con la consigna desde el Sprint #1).
- Estilos uniformes con Bootstrap 5 + variables CSS propias.

### Sprint #2 - Entrega 2026-05-20

Rama: `rama-sprint-2`

- Autenticación contra Supabase (login/registro/logout).
- 3 botones de inicio de sesión rápido.
- Home condicional según estado de sesión.
- Guards de ruta para zonas privadas.

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
