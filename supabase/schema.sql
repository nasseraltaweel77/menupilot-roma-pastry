create extension if not exists "pgcrypto";

create table public.restaurants (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  slug text not null unique,
  phone text,
  currency text not null default 'SAR',
  created_at timestamptz not null default now()
);

create table public.menu_categories (
  id uuid primary key default gen_random_uuid(),
  restaurant_id uuid not null references public.restaurants(id) on delete cascade,
  name_en text not null,
  name_ar text not null,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

create table public.menu_items (
  id uuid primary key default gen_random_uuid(),
  restaurant_id uuid not null references public.restaurants(id) on delete cascade,
  category_id uuid references public.menu_categories(id) on delete set null,
  name_en text not null,
  name_ar text not null,
  description_en text,
  description_ar text,
  price numeric(10, 2) not null check (price >= 0),
  image_url text,
  is_available boolean not null default true,
  created_at timestamptz not null default now()
);

create type public.order_status as enum ('New', 'Preparing', 'Ready', 'Delivered', 'Cancelled');

create table public.orders (
  id uuid primary key default gen_random_uuid(),
  restaurant_id uuid not null references public.restaurants(id) on delete cascade,
  customer_name text not null,
  customer_phone text not null,
  delivery_address text not null,
  notes text,
  status public.order_status not null default 'New',
  total numeric(10, 2) not null check (total >= 0),
  items jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now()
);

create index menu_categories_restaurant_id_idx on public.menu_categories(restaurant_id);
create index menu_items_restaurant_id_idx on public.menu_items(restaurant_id);
create index menu_items_category_id_idx on public.menu_items(category_id);
create index orders_restaurant_id_created_at_idx on public.orders(restaurant_id, created_at desc);

alter table public.restaurants enable row level security;
alter table public.menu_categories enable row level security;
alter table public.menu_items enable row level security;
alter table public.orders enable row level security;

create policy "Owners can manage restaurants"
on public.restaurants
for all
using (auth.uid() = owner_id)
with check (auth.uid() = owner_id);

create policy "Public can read restaurants"
on public.restaurants
for select
using (true);

create policy "Owners can manage categories"
on public.menu_categories
for all
using (
  exists (
    select 1 from public.restaurants
    where restaurants.id = menu_categories.restaurant_id
    and restaurants.owner_id = auth.uid()
  )
)
with check (
  exists (
    select 1 from public.restaurants
    where restaurants.id = menu_categories.restaurant_id
    and restaurants.owner_id = auth.uid()
  )
);

create policy "Public can read categories"
on public.menu_categories
for select
using (true);

create policy "Owners can manage items"
on public.menu_items
for all
using (
  exists (
    select 1 from public.restaurants
    where restaurants.id = menu_items.restaurant_id
    and restaurants.owner_id = auth.uid()
  )
)
with check (
  exists (
    select 1 from public.restaurants
    where restaurants.id = menu_items.restaurant_id
    and restaurants.owner_id = auth.uid()
  )
);

create policy "Public can read available items"
on public.menu_items
for select
using (is_available = true);

create policy "Owners can manage orders"
on public.orders
for all
using (
  exists (
    select 1 from public.restaurants
    where restaurants.id = orders.restaurant_id
    and restaurants.owner_id = auth.uid()
  )
)
with check (
  exists (
    select 1 from public.restaurants
    where restaurants.id = orders.restaurant_id
    and restaurants.owner_id = auth.uid()
  )
);

create policy "Public can create orders"
on public.orders
for insert
with check (true);

-- After creating an auth user in Supabase, replace the owner_id and run this seed.
-- insert into public.restaurants (owner_id, name, slug, phone)
-- values ('YOUR_AUTH_USER_ID', 'Demo Restaurant', 'demo-restaurant', '966500000000');
