'use client';

import ResponsiveResourceManager from './ResponsiveResourceManager';
import type { CrudField } from '@/lib/resource-registry';

type Row = Record<string, unknown>;

export default function SupabaseResourceManager({
  resource,
  title,
  primaryKey,
  columns,
  fields,
  initialRows,
  canCreate = true,
  canDelete = true,
}: {
  resource: string;
  title: string;
  primaryKey: string;
  columns: readonly string[];
  fields: readonly CrudField[];
  initialRows: Row[];
  canCreate?: boolean;
  canDelete?: boolean;
}) {
  return (
    <ResponsiveResourceManager
      resource={resource}
      title={title}
      primaryKey={primaryKey}
      columns={columns}
      fields={fields}
      initialRows={initialRows}
      initialTotal={initialRows.length}
      canCreate={canCreate}
      canDelete={canDelete}
    />
  );
}
