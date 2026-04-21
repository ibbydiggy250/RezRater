update public.buildings
set type = 'Corridor'
where type::text = 'Communal';
