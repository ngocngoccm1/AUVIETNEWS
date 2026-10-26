-- Server-only access to the ImageKit key stored in Supabase Vault.
-- Store/update the actual value through Vault management, never in this file.
-- service_role already has SELECT on vault.decrypted_secrets in this project.
begin;
create or replace function public.get_imagekit_upload_key()
returns text
language sql
stable
security invoker
set search_path = ''
as $$
 select decrypted_secret
 from vault.decrypted_secrets
 where name = 'IMAGEKIT_PRIVATE_KEY'
 limit 1;
$$;
revoke all on function public.get_imagekit_upload_key() from public, anon, authenticated;
grant execute on function public.get_imagekit_upload_key() to service_role;
commit;
notify pgrst, 'reload schema';
