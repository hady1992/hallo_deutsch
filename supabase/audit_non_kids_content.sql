-- REVIEW ONLY. Run manually in the Supabase SQL editor.
-- This script does not modify any rows.

select
  content_type,
  count(*) as row_count,
  count(*) filter (where is_published = true) as published_count
from public.content_items
group by content_type
order by content_type;

do $$
declare
  table_name text;
  row_count bigint;
begin
  foreach table_name in array array[
    'vocabulary',
    'exercises',
    'exams',
    'placement_tests'
  ]
  loop
    if to_regclass('public.' || table_name) is not null then
      execute format('select count(*) from public.%I', table_name) into row_count;
      raise notice 'public.%: % rows', table_name, row_count;
    else
      raise notice 'public.%: table does not exist', table_name;
    end if;
  end loop;
end $$;
