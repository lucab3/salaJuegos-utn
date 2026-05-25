-- Sala de Juegos - Esquema Supabase
-- Ejecutar en: Supabase Dashboard -> SQL Editor -> New query
-- Acumulativo Sprint #2 (usuarios) + Sprint #3 (partidas + chat realtime).
-- Idempotente: se puede correr varias veces sin romper.
-- ---------------------------------------------------------------

-- =========================
-- SPRINT #2 -- USUARIOS
-- =========================

create table if not exists public.usuarios (
  id          uuid primary key references auth.users (id) on delete cascade,
  email       text not null unique,
  nombre      text not null,
  apellido    text not null,
  edad        int  not null check (edad between 13 and 120),
  created_at  timestamptz not null default now()
);

alter table public.usuarios enable row level security;

drop policy if exists "usuarios_select_autenticados" on public.usuarios;
create policy "usuarios_select_autenticados"
  on public.usuarios for select
  to authenticated
  using (true);

drop policy if exists "usuarios_insert_self" on public.usuarios;
create policy "usuarios_insert_self"
  on public.usuarios for insert
  to authenticated
  with check (auth.uid() = id);

drop policy if exists "usuarios_update_self" on public.usuarios;
create policy "usuarios_update_self"
  on public.usuarios for update
  to authenticated
  using (auth.uid() = id);


-- =========================
-- SPRINT #3 -- PARTIDAS (todos los juegos)
-- =========================
-- Una sola tabla generica para los 4 juegos. juego: 'ahorcado' | 'mayor-menor' | 'preguntados' | 'buscaminas'.
-- puntaje: numero entero (>=0); el ranking de cada juego se ordena por puntaje desc, jugada_en desc.
-- gano: bool optativo (algunos juegos como mayor-menor no tienen win/lose, sino score acumulado).
-- datos: jsonb libre para guardar detalle de la partida (palabra adivinada, dificultad, etc.).

create table if not exists public.partidas (
  id          bigserial primary key,
  user_id     uuid not null references auth.users (id) on delete cascade,
  juego       text not null check (juego in ('ahorcado','mayor-menor','preguntados','buscaminas')),
  gano        boolean,
  puntaje     int  not null default 0 check (puntaje >= 0),
  datos       jsonb not null default '{}'::jsonb,
  jugada_en   timestamptz not null default now()
);

create index if not exists partidas_juego_puntaje_idx
  on public.partidas (juego, puntaje desc, jugada_en desc);

create index if not exists partidas_user_idx
  on public.partidas (user_id);

alter table public.partidas enable row level security;

drop policy if exists "partidas_select_autenticados" on public.partidas;
create policy "partidas_select_autenticados"
  on public.partidas for select
  to authenticated
  using (true);

drop policy if exists "partidas_insert_self" on public.partidas;
create policy "partidas_insert_self"
  on public.partidas for insert
  to authenticated
  with check (auth.uid() = user_id);


-- =========================
-- SPRINT #3 -- CHAT GLOBAL EN TIEMPO REAL
-- =========================
-- Mensajes con usuario, contenido y fecha/hora. Se exponen via Supabase Realtime.

create table if not exists public.mensajes_chat (
  id          bigserial primary key,
  user_id     uuid not null references auth.users (id) on delete cascade,
  contenido   text not null check (length(contenido) between 1 and 500),
  enviado_en  timestamptz not null default now()
);

create index if not exists mensajes_chat_enviado_idx
  on public.mensajes_chat (enviado_en desc);

alter table public.mensajes_chat enable row level security;

drop policy if exists "mensajes_select_autenticados" on public.mensajes_chat;
create policy "mensajes_select_autenticados"
  on public.mensajes_chat for select
  to authenticated
  using (true);

drop policy if exists "mensajes_insert_self" on public.mensajes_chat;
create policy "mensajes_insert_self"
  on public.mensajes_chat for insert
  to authenticated
  with check (auth.uid() = user_id);

-- Realtime: agregar tabla a la publicacion (idempotente).
do $$
begin
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime' and tablename = 'mensajes_chat'
  ) then
    execute 'alter publication supabase_realtime add table public.mensajes_chat';
  end if;
end $$;
