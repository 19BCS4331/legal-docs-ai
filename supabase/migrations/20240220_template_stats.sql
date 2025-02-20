-- Create a function to get template usage statistics
create or replace function get_template_usage_stats(user_id uuid)
returns table (
  template_id uuid,
  count bigint
)
language plpgsql
security definer
as $$
begin
  return query
    select 
      d.template_id,
      count(d.id)::bigint
    from documents d
    where d.user_id = $1
    group by d.template_id;
end;
$$;
