-- Sala de Juegos - Esquema Supabase
-- Ejecutar en: Supabase Dashboard → SQL Editor → New query
-- Sprint #2: tabla usuarios + Row Level Security
-- ---------------------------------------------------------------

-- 1) Tabla de perfiles. El id matchea con auth.users.id (UUID).
create table if not exists public.usuarios (
  id          uuid primary key references auth.users (id) on delete cascade,
  email       text not null unique,
  nombre      text not null,
  apellido    text not null,
  edad        int  not null check (edad between 13 and 120),
  created_at  timestamptz not null default now()
);

-- 2) Row Level Security activada.
alter table public.usuarios enable row level security;

-- 3) Políticas:
--    - Cualquiera autenticado puede leer todos los perfiles (necesario para Sprint #3 chat + #4 tablas).
--    - El usuario puede insertar/actualizar SOLO su propio perfil.
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
