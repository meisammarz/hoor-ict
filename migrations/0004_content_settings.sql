alter table site_settings
  add column if not exists title text not null default '',
  add column if not exists eyebrow text not null default '',
  add column if not exists headline text not null default '',
  add column if not exists lede text not null default '',
  add column if not exists motto text not null default '',
  add column if not exists since text not null default '',
  add column if not exists coverage text not null default '';
