DO $$
DECLARE t text;
BEGIN
  FOREACH t IN ARRAY ARRAY['admin_notifications','admin_profile','agency_achievements','agency_info','agency_partners','agency_services','agency_timeline','api_keys','applications','casting_applications','classroom_progress','contact_info','faq_data','fashion_day_events','fashion_day_reservations','hero_slides','jury_members','mailing_contacts','miss_one_light','model_distinctions','models','nav_links','news_items','pages_content','registration_staff','site_config','site_images','social_links','testimonials','users']
  LOOP
    EXECUTE format('alter table public.%I add column if not exists position bigint not null default 0', t);
    EXECUTE format('create index if not exists %I on public.%I(position)', t || '_position_idx', t);
  END LOOP;
END $$;
