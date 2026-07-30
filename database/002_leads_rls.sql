alter table public.leads enable row level security;

create policy "Anyone can create leads"
on public.leads
for insert
to anon
with check (true);