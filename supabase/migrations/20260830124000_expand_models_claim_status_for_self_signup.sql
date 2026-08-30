alter table public.models
  drop constraint if exists models_claim_status_check;

alter table public.models
  add constraint models_claim_status_check
  check (
    claim_status is null
    or claim_status = any (
      array[
        'not_applicable'::text,
        'available'::text,
        'pending_activation'::text,
        'pending_claim'::text,
        'pending_email_confirmation'::text,
        'pending_agency_review'::text,
        'claim_in_progress'::text,
        'claimed'::text,
        'rejected'::text,
        'blocked'::text
      ]
    )
  );
