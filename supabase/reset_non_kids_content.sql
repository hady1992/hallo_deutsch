-- DANGER: REVIEW BEFORE RUNNING MANUALLY IN THE SUPABASE SQL EDITOR.
-- This file is never executed by the application or build process.
-- It intentionally preserves every kids content type and custom_quizzes.

begin;

delete from public.content_items
where content_type in (
  'lessons',
  'vocabulary',
  'nouns',
  'verbs',
  'grammar',
  'exercises',
  'placement_tests',
  'exams'
);

do $$
declare
  table_name text;
begin
  foreach table_name in array array[
    'vocabulary',
    'exercises',
    'exams',
    'placement_tests'
  ]
  loop
    if to_regclass('public.' || table_name) is not null then
      execute format('delete from public.%I', table_name);
    end if;
  end loop;
end $$;

-- Safety report: protected types should remain visible here.
select content_type, count(*) as remaining_rows
from public.content_items
group by content_type
order by content_type;

commit;
