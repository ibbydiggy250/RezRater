insert into public.quads (name, slug)
values
  ('Eleanor Roosevelt Community', 'roosevelt-quad'),
  ('Mendelsohn Community', 'mendelsohn-quad'),
  ('H Community', 'h-quad'),
  ('Kelly Community', 'kelly-quad'),
  ('Tabler Community', 'tabler-quad'),
  ('Roth Community', 'roth-quad'),
  ('Living Learning Community / Nobel Halls', 'living-learning-community'),
  ('West Apartments', 'west-apartments'),
  ('Schomburg Apartments', 'schomburg-apartments'),
  ('Chapin Apartments', 'chapin-apartments')
on conflict (slug) do update
set name = excluded.name;

delete from public.buildings
where slug = 'stimson'
  and exists (select 1 from public.buildings where slug = 'benedict-north');

delete from public.buildings
where slug = 'handel'
  and exists (select 1 from public.buildings where slug = 'hendrix');

update public.buildings
set slug = 'benedict-north',
    name = 'Benedict North Hall'
where slug = 'stimson';

update public.buildings
set slug = 'hendrix',
    name = 'Hendrix Hall'
where slug = 'handel';

with quad_ids as (
  select id, slug from public.quads
)
insert into public.buildings (quad_id, name, slug, type, has_kitchen)
values
  ((select id from quad_ids where slug = 'roosevelt-quad'), 'Keller Hall', 'keller', 'Corridor', false),
  ((select id from quad_ids where slug = 'roosevelt-quad'), 'Greeley Hall', 'greeley', 'Corridor', false),
  ((select id from quad_ids where slug = 'roosevelt-quad'), 'Wagner Hall', 'wagner', 'Corridor', false),
  ((select id from quad_ids where slug = 'roosevelt-quad'), 'Stimson Hall', 'stimson-hall', 'Corridor', false),
  ((select id from quad_ids where slug = 'mendelsohn-quad'), 'Ammann Hall', 'ammann', 'Corridor', false),
  ((select id from quad_ids where slug = 'mendelsohn-quad'), 'Irving Hall', 'irving', 'Corridor', false),
  ((select id from quad_ids where slug = 'mendelsohn-quad'), 'O''Neill Hall', 'o-neill', 'Corridor', false),
  ((select id from quad_ids where slug = 'mendelsohn-quad'), 'Gray Hall', 'gray', 'Corridor', false),
  ((select id from quad_ids where slug = 'h-quad'), 'Benedict South Hall', 'benedict-south', 'Corridor', false),
  ((select id from quad_ids where slug = 'h-quad'), 'James Hall', 'james', 'Corridor', false),
  ((select id from quad_ids where slug = 'h-quad'), 'Langmuir Hall', 'langmuir', 'Corridor', false),
  ((select id from quad_ids where slug = 'h-quad'), 'Benedict North Hall', 'benedict-north', 'Corridor', false),
  ((select id from quad_ids where slug = 'kelly-quad'), 'Baruch Hall', 'baruch', 'Suite', false),
  ((select id from quad_ids where slug = 'kelly-quad'), 'Dewey Hall', 'dewey', 'Suite', false),
  ((select id from quad_ids where slug = 'kelly-quad'), 'Eisenhower Hall', 'eisenhower', 'Suite', false),
  ((select id from quad_ids where slug = 'kelly-quad'), 'Hamilton Hall', 'hamilton', 'Suite', false),
  ((select id from quad_ids where slug = 'kelly-quad'), 'Schick Hall', 'schick', 'Suite', false),
  ((select id from quad_ids where slug = 'tabler-quad'), 'Douglass Hall', 'douglass', 'Suite', false),
  ((select id from quad_ids where slug = 'tabler-quad'), 'Dreiser Hall', 'dreiser', 'Suite', false),
  ((select id from quad_ids where slug = 'tabler-quad'), 'Hand Hall', 'hand', 'Suite', true),
  ((select id from quad_ids where slug = 'tabler-quad'), 'Chinn Hall', 'chinn', 'Suite', false),
  ((select id from quad_ids where slug = 'tabler-quad'), 'Toscanini Hall', 'toscanini', 'Suite', false),
  ((select id from quad_ids where slug = 'roth-quad'), 'Cardozo Hall', 'cardozo', 'Suite', false),
  ((select id from quad_ids where slug = 'roth-quad'), 'Gershwin Hall', 'gershwin', 'Suite', false),
  ((select id from quad_ids where slug = 'roth-quad'), 'Hendrix Hall', 'hendrix', 'Suite', false),
  ((select id from quad_ids where slug = 'roth-quad'), 'Mount Hall', 'mount', 'Suite', false),
  ((select id from quad_ids where slug = 'roth-quad'), 'Whitman Hall', 'whitman', 'Suite', false),
  ((select id from quad_ids where slug = 'roth-quad'), 'Gershwin Hall (3-bedroom units)', 'gershwin-three-bedroom', 'Suite', true),
  ((select id from quad_ids where slug = 'living-learning-community'), 'Lauterbur Hall', 'lauterbur', 'Suite', false),
  ((select id from quad_ids where slug = 'living-learning-community'), 'Yang Hall', 'yang', 'Suite', false),
  ((select id from quad_ids where slug = 'living-learning-community'), 'Chavez Hall', 'chavez', 'Suite', false),
  ((select id from quad_ids where slug = 'living-learning-community'), 'Tubman Hall', 'tubman', 'Suite', false),
  ((select id from quad_ids where slug = 'west-apartments'), 'West A', 'west-a', 'Apartment', true),
  ((select id from quad_ids where slug = 'west-apartments'), 'West B', 'west-b', 'Apartment', true),
  ((select id from quad_ids where slug = 'west-apartments'), 'West C', 'west-c', 'Apartment', true),
  ((select id from quad_ids where slug = 'west-apartments'), 'West D', 'west-d', 'Apartment', true),
  ((select id from quad_ids where slug = 'west-apartments'), 'West E', 'west-e', 'Apartment', true),
  ((select id from quad_ids where slug = 'west-apartments'), 'West F', 'west-f', 'Apartment', true),
  ((select id from quad_ids where slug = 'west-apartments'), 'West G', 'west-g', 'Apartment', true),
  ((select id from quad_ids where slug = 'west-apartments'), 'West H', 'west-h', 'Apartment', true),
  ((select id from quad_ids where slug = 'west-apartments'), 'West I', 'west-i', 'Apartment', true),
  ((select id from quad_ids where slug = 'west-apartments'), 'West J', 'west-j', 'Apartment', true)
  ,
  ((select id from quad_ids where slug = 'west-apartments'), 'West K', 'west-k', 'Apartment', true),
  ((select id from quad_ids where slug = 'schomburg-apartments'), 'Schomburg A', 'schomburg-a', 'Apartment', true),
  ((select id from quad_ids where slug = 'schomburg-apartments'), 'Schomburg B', 'schomburg-b', 'Apartment', true),
  ((select id from quad_ids where slug = 'chapin-apartments'), 'Chapin Apartments', 'chapin-apartments', 'Apartment', true)
on conflict (slug) do update
set quad_id = excluded.quad_id,
    name = excluded.name,
    type = excluded.type,
    has_kitchen = excluded.has_kitchen;
