alter table site_settings
  add column if not exists show_prices boolean not null default false;

create table if not exists panel_users (
  username text primary key,
  pass_hash text not null,
  primary_admin boolean not null default false,
  created_at timestamptz not null default now()
);

insert into panel_users (username, pass_hash, primary_admin)
values (
  'admin',
  '9f0d1ad837cbd892f0ec9d319c493835:ad6d806285af394a5b1ec3f3d9adaac48f4217ff0c2d4da69963f6e694dc4bfa',
  true
)
on conflict (username) do nothing;

create table if not exists prices (
  id serial primary key,
  title text not null,
  unit text not null default '',
  amount text not null,
  note text not null default '',
  sort int not null default 0,
  created_at timestamptz not null default now()
);
