import { supabase } from '@/lib/customSupabaseClient';

export const CONTENT_PAGE_SIZE = 500;
export const CONTENT_ID_BATCH_SIZE = 200;

const asArray = (value) => (Array.isArray(value) ? value : []);

const createPageSignature = (rows) => {
  const first = rows[0];
  const last = rows[rows.length - 1];
  const boundary = (row) => row?.id || JSON.stringify(row || null);
  return `${rows.length}:${boundary(first)}:${boundary(last)}`;
};

const isMissingCreatedAtError = (error) => (
  String(error?.message || '').toLowerCase().includes('created_at')
  && ['42703', 'PGRST204', 'PGRST200', undefined].includes(error?.code)
);

const buildPublishedRowsQuery = ({
  contentType,
  level,
  columns,
  isPublished,
  from,
  to,
  orderByCreatedAt,
}) => {
  let query = supabase
    .from('content_items')
    .select(columns)
    .eq('content_type', contentType);

  if (typeof isPublished === 'boolean') query = query.eq('is_published', isPublished);
  if (level) query = query.eq('level', level);
  if (orderByCreatedAt) query = query.order('created_at', { ascending: true });

  return query
    .order('id', { ascending: true })
    .range(from, to);
};

export const fetchPublishedRowsPaginated = async ({
  contentType,
  level = null,
  columns = '*',
  isPublished = true,
  pageSize = CONTENT_PAGE_SIZE,
}) => {
  if (!contentType) throw new Error('contentType is required for paginated content reads.');
  if (!Number.isInteger(pageSize) || pageSize <= 0) throw new Error('pageSize must be a positive integer.');

  const rows = [];
  const seenPageSignatures = new Set();
  let from = 0;
  let orderByCreatedAt = true;

  while (true) {
    const to = from + pageSize - 1;
    const { data, error } = await buildPublishedRowsQuery({
      contentType,
      level,
      columns,
      isPublished,
      from,
      to,
      orderByCreatedAt,
    });

    if (error && orderByCreatedAt && from === 0 && isMissingCreatedAtError(error)) {
      orderByCreatedAt = false;
      continue;
    }
    if (error) throw error;

    const page = asArray(data);
    if (page.length === 0) break;
    if (page.length > pageSize) throw new Error('Supabase returned a page larger than the requested range.');

    const signature = createPageSignature(page);
    if (seenPageSignatures.has(signature)) {
      throw new Error('Supabase pagination repeated the same page; the read was stopped to prevent an infinite loop.');
    }
    seenPageSignatures.add(signature);
    rows.push(...page);

    if (page.length < pageSize) break;
    const nextFrom = from + page.length;
    if (nextFrom <= from) throw new Error('Supabase pagination did not advance.');
    from = nextFrom;
  }

  return rows;
};

export const fetchPublishedRowsCount = async ({ contentType, level = null, isPublished = true }) => {
  if (!contentType) throw new Error('contentType is required for content counts.');
  let query = supabase
    .from('content_items')
    .select('id', { count: 'exact', head: true })
    .eq('content_type', contentType);

  if (typeof isPublished === 'boolean') query = query.eq('is_published', isPublished);
  if (level) query = query.eq('level', level);

  const { count, error } = await query;
  if (error) throw error;
  return Number(count) || 0;
};

export const splitIntoContentBatches = (values, batchSize = CONTENT_ID_BATCH_SIZE) => {
  const safeValues = asArray(values);
  if (!Number.isInteger(batchSize) || batchSize <= 0) throw new Error('batchSize must be a positive integer.');
  const batches = [];
  for (let index = 0; index < safeValues.length; index += batchSize) {
    batches.push(safeValues.slice(index, index + batchSize));
  }
  return batches;
};
