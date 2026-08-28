create index if not exists analytics_events_user_id_idx on public.analytics_events(user_id);
create index if not exists casting_scores_jury_user_id_idx on public.casting_scores(jury_user_id);

alter policy "authenticated create forum threads" on public.forum_threads with check ((author_user_id = (select auth.uid())) or ((select public.current_app_role()) = 'admin'));
alter policy "authors update forum threads" on public.forum_threads using ((author_user_id = (select auth.uid())) or ((select public.current_app_role()) = 'admin')) with check ((author_user_id = (select auth.uid())) or ((select public.current_app_role()) = 'admin'));
alter policy "authors delete forum threads" on public.forum_threads using ((author_user_id = (select auth.uid())) or ((select public.current_app_role()) = 'admin'));

alter policy "authenticated create forum replies" on public.forum_replies with check ((author_user_id = (select auth.uid())) or ((select public.current_app_role()) = 'admin'));
alter policy "authors update forum replies" on public.forum_replies using ((author_user_id = (select auth.uid())) or ((select public.current_app_role()) = 'admin')) with check ((author_user_id = (select auth.uid())) or ((select public.current_app_role()) = 'admin'));
alter policy "authors delete forum replies" on public.forum_replies using ((author_user_id = (select auth.uid())) or ((select public.current_app_role()) = 'admin'));

alter policy "admin all models" on public.models using ((select public.current_app_role()) = 'admin') with check ((select public.current_app_role()) = 'admin');
alter policy "model read own model" on public.models using (auth_user_id = (select auth.uid()));

alter policy "admin all portfolios" on public.model_portfolio_images using ((select public.current_app_role()) = 'admin') with check ((select public.current_app_role()) = 'admin');
alter policy "model read own portfolio" on public.model_portfolio_images using (exists (select 1 from public.models m where m.id = model_portfolio_images.model_id and m.auth_user_id = (select auth.uid())));
alter policy "model insert own portfolio" on public.model_portfolio_images with check (exists (select 1 from public.models m where m.id = model_portfolio_images.model_id and m.auth_user_id = (select auth.uid())));
alter policy "model update own portfolio" on public.model_portfolio_images using (exists (select 1 from public.models m where m.id = model_portfolio_images.model_id and m.auth_user_id = (select auth.uid()))) with check (exists (select 1 from public.models m where m.id = model_portfolio_images.model_id and m.auth_user_id = (select auth.uid())));
alter policy "model delete own portfolio" on public.model_portfolio_images using (exists (select 1 from public.models m where m.id = model_portfolio_images.model_id and m.auth_user_id = (select auth.uid())));

alter policy "admin all model events" on public.model_events using ((select public.current_app_role()) = 'admin') with check ((select public.current_app_role()) = 'admin');
alter policy "model read own events" on public.model_events using (exists (select 1 from public.models m where m.id = model_events.model_id and m.auth_user_id = (select auth.uid())));
alter policy "model insert own events" on public.model_events with check (exists (select 1 from public.models m where m.id = model_events.model_id and m.auth_user_id = (select auth.uid())));
alter policy "model update own events" on public.model_events using (exists (select 1 from public.models m where m.id = model_events.model_id and m.auth_user_id = (select auth.uid()))) with check (exists (select 1 from public.models m where m.id = model_events.model_id and m.auth_user_id = (select auth.uid())));
alter policy "model delete own events" on public.model_events using (exists (select 1 from public.models m where m.id = model_events.model_id and m.auth_user_id = (select auth.uid())));

alter policy "admin all model collaborations" on public.model_collaborations using ((select public.current_app_role()) = 'admin') with check ((select public.current_app_role()) = 'admin');
alter policy "model read own collaborations" on public.model_collaborations using (exists (select 1 from public.models m where m.id = model_collaborations.model_id and m.auth_user_id = (select auth.uid())));
alter policy "model insert own collaborations" on public.model_collaborations with check (exists (select 1 from public.models m where m.id = model_collaborations.model_id and m.auth_user_id = (select auth.uid())));
alter policy "model update own collaborations" on public.model_collaborations using (exists (select 1 from public.models m where m.id = model_collaborations.model_id and m.auth_user_id = (select auth.uid()))) with check (exists (select 1 from public.models m where m.id = model_collaborations.model_id and m.auth_user_id = (select auth.uid())));
alter policy "model delete own collaborations" on public.model_collaborations using (exists (select 1 from public.models m where m.id = model_collaborations.model_id and m.auth_user_id = (select auth.uid())));

create policy "explicit deny direct analytics access" on public.analytics_events for all to anon, authenticated using (false) with check (false);
create policy "explicit deny direct casting scores access" on public.casting_scores for all to anon, authenticated using (false) with check (false);
create policy "explicit deny direct email delivery log access" on public.email_delivery_log for all to anon, authenticated using (false) with check (false);
create policy "explicit deny direct email templates access" on public.email_templates for all to anon, authenticated using (false) with check (false);
create policy "explicit deny direct fashion day reservations access" on public.fashion_day_reservations for all to anon, authenticated using (false) with check (false);
create policy "explicit deny direct general applications access" on public.general_applications for all to anon, authenticated using (false) with check (false);
create policy "explicit deny direct mailing contacts access" on public.mailing_contacts for all to anon, authenticated using (false) with check (false);
create policy "explicit deny direct recovery requests access" on public.recovery_requests for all to anon, authenticated using (false) with check (false);
