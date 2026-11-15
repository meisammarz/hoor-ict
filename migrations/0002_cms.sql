create table if not exists admins (
  user_id text primary key,
  created_at timestamptz not null default now()
);

create table if not exists media (
  id serial primary key,
  kind text not null,
  ref_id text not null default '',
  title text not null default '',
  caption text not null default '',
  data_url text not null,
  sort int not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists team_members (
  id serial primary key,
  name text not null,
  role text not null,
  specialty text not null default '',
  photo text not null default '',
  sort int not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists articles (
  id serial primary key,
  slug text not null unique,
  title text not null,
  summary text not null,
  body text not null,
  topic text not null default 'safety',
  downloads int not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists headlines (
  link text primary key,
  title text not null,
  source text not null,
  published_at text not null default '',
  hidden boolean not null default false,
  fetched_at timestamptz not null default now()
);

create table if not exists site_settings (
  id int primary key default 1,
  phone1 text not null default '',
  phone2 text not null default '',
  address text not null default '',
  whatsapp text not null default '',
  banner text not null default ''
);

insert into site_settings (id) values (1) on conflict (id) do nothing;
