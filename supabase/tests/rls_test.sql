-- pgTAP tests for Row Level Security. Run with: npm run test:db
-- Every new table needs tests like these (see POLICY.md).

begin;

create extension if not exists pgtap with schema extensions;

select plan(12);

-- Fixtures: two users. The on_auth_user_created trigger creates their profiles.
insert into auth.users (id, email, raw_user_meta_data)
values
  ('11111111-1111-1111-1111-111111111111', 'alice@example.com', '{"name":"Alice"}'),
  ('22222222-2222-2222-2222-222222222222', 'bob@example.com', '{"name":"Bob"}');

-- --- trigger behaviour (checked as the superuser) ---------------------------

select is(
  (select count(*)::int from public.profiles),
  2,
  'signing up creates a profile'
);

select is(
  (select name from public.profiles where id = '11111111-1111-1111-1111-111111111111'),
  'Alice',
  'profile name comes from user metadata'
);

select is(
  (select count(*)::int from public.user_roles ur
     join public.roles r on r.id = ur.role_id
    where r.name = 'member'),
  2,
  'new users get the member role'
);

-- --- anonymous visitors -----------------------------------------------------

set local role anon;

select throws_ok(
  'select * from public.profiles',
  '42501',
  null,
  'anon cannot read profiles'
);

select throws_ok(
  'select * from public.roles',
  '42501',
  null,
  'anon cannot read roles'
);

reset role;

-- --- Alice ------------------------------------------------------------------

set local role authenticated;
set local request.jwt.claims to '{"sub":"11111111-1111-1111-1111-111111111111","role":"authenticated"}';

select is(
  (select count(*)::int from public.profiles),
  1,
  'a user sees only their own profile'
);

select is(
  (select email from public.profiles),
  'alice@example.com',
  'the visible profile is their own'
);

select is(
  (select count(*)::int from public.user_roles),
  1,
  'a user sees only their own role assignments'
);

select is(
  (select count(*)::int from public.roles),
  2,
  'authenticated users can list roles'
);

select lives_ok(
  $$update public.profiles set name = 'Alice B.' where id = '11111111-1111-1111-1111-111111111111'$$,
  'a user can update their own name'
);

select is_empty(
  $$update public.profiles set name = 'hacked' where id = '22222222-2222-2222-2222-222222222222' returning id$$,
  'a user cannot update another profile'
);

select throws_ok(
  $$update public.profiles set email = 'evil@example.com' where id = '11111111-1111-1111-1111-111111111111'$$,
  '42501',
  null,
  'a user cannot change their profile email directly'
);

reset role;

select * from finish();

rollback;
