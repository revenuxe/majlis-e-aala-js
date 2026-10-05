begin;
-- Anonymous catalogue reads must not invoke the authenticated-only role helper.
drop policy if exists "read active travel packages" on public.travel_packages;
create policy "public read active travel packages" on public.travel_packages for select to anon
  using (is_active);
create policy "members read active travel packages" on public.travel_packages for select to authenticated
  using (is_active or public.has_role(auth.uid(), 'admin'));
drop policy if exists "read available travel departures" on public.travel_departures;
create policy "public read available travel departures" on public.travel_departures for select to anon
  using (is_active and start_date >= current_date and exists (select 1 from public.travel_packages p where p.id = package_id and p.is_active));
create policy "members read available travel departures" on public.travel_departures for select to authenticated
  using ((is_active and start_date >= current_date and exists (select 1 from public.travel_packages p where p.id = package_id and p.is_active)) or public.has_role(auth.uid(), 'admin'));
commit;
