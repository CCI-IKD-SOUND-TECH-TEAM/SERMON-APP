'use client';

import React from 'react';

export interface AdminTableColumn<Row> {
  key: string;
  label: string;
  render?: (row: Row) => React.ReactNode;
}

export interface AdminTableProps<Row extends { id?: string | number }> {
  columns: AdminTableColumn<Row>[];
  rows: Row[];
  renderActions?: (row: Row) => React.ReactNode;
  actionLabel?: string;
  itemsPerPage?: number;
}

/**
 * AdminTable — dense review-queue / content table. Zebra-free, hairline row
 * borders, sticky header, row-hover tint, inline right-aligned action icons.
 */
export function AdminTable<Row extends { id?: string | number }>({
  columns,
  rows,
  renderActions,
  actionLabel,
  itemsPerPage = 10,
}: AdminTableProps<Row>) {
  const [hoverIdx, setHoverIdx] = React.useState(-1);
  const [currentPage, setCurrentPage] = React.useState(1);

  const totalPages = Math.max(1, Math.ceil(rows.length / itemsPerPage));
  
  React.useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [rows.length, totalPages, currentPage]);

  const visibleRows = rows.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <div className="admin-table-container" style={{ border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)' }}>
      <div style={{ width: '100%' }}>
        <style>{`
          .admin-table {
            width: 100%;
            border-collapse: collapse;
            font: var(--text-body-sm);
            color: var(--color-ink);
          }
          .admin-table th {
            text-align: left;
            padding: 12px 16px;
            font: 600 12px/1 var(--font-body);
            text-transform: uppercase;
            letter-spacing: 0.05em;
            color: var(--color-ink-muted);
            border-bottom: 1px solid var(--color-border);
            background: color-mix(in srgb, var(--color-surface) 50%, var(--color-bg));
          }
          .admin-table td {
            padding: 12px 16px;
            border-bottom: 1px solid var(--color-border);
          }
          .admin-table tbody tr {
            background: var(--color-surface);
            transition: background var(--motion-fast);
          }
          .admin-table tbody tr:hover {
            background: color-mix(in srgb, var(--color-primary-light) 30%, transparent);
          }
          @media (max-width: 768px) {
            .admin-table-container {
              border: none !important;
              background: transparent !important;
            }
            .admin-table, .admin-table tbody, .admin-table tr {
              display: block;
              width: 100%;
            }
            .admin-table thead {
              display: none;
            }
            .admin-table tbody tr {
              display: grid;
              grid-template-columns: 1fr auto;
              border: 1px solid var(--color-border);
              border-radius: var(--radius-md);
              margin-bottom: var(--space-4);
              background: var(--color-surface);
              overflow: hidden;
            }
            .admin-table tbody tr:hover {
              background: var(--color-surface);
            }
            .admin-table td {
              grid-column: 1 / -1;
              display: flex;
              justify-content: space-between;
              align-items: center;
              border-bottom: 1px solid color-mix(in srgb, var(--color-border) 50%, transparent);
            }
            .admin-table td:last-child {
              border-bottom: none;
            }
            .admin-table td::before {
              content: attr(data-label);
              color: var(--color-ink-muted);
              font-weight: 500;
              margin-right: 16px;
              text-align: left;
            }
            .admin-table td > div, .admin-table td > span, .admin-table td > button {
              text-align: right;
            }
            .admin-table td:first-child {
              grid-column: 1;
              grid-row: 1;
              font-weight: 600;
              border-bottom: 1px solid var(--color-border);
              justify-content: flex-start;
            }
            .admin-table td:first-child::before {
              display: none;
            }
            .admin-table td:first-child > * {
              text-align: left;
            }
            .admin-table td.actions-cell {
              grid-column: 2;
              grid-row: 1;
              border-bottom: 1px solid var(--color-border);
              justify-content: flex-end;
              padding-left: 0;
            }
            .admin-table td.actions-cell::before {
              display: none;
            }
          }
        `}</style>
        <table className="admin-table">
        <thead>
          <tr>
            {columns.map((c) => (
              <th key={c.key}>
                {c.label}
              </th>
            ))}
            {renderActions && (
              <th style={{ textAlign: 'right' }}>
                {actionLabel || ''}
              </th>
            )}
          </tr>
        </thead>
        <tbody>
          {visibleRows.map((row, i) => (
            <tr
              key={row.id ?? i}
              onMouseEnter={() => setHoverIdx(i)}
              onMouseLeave={() => setHoverIdx(-1)}
              style={hoverIdx === i ? { background: 'color-mix(in srgb, var(--color-primary-light) 30%, transparent)' } : {}}
            >
              {columns.map((c) => (
                <td key={c.key} data-label={c.label}>
                  {c.render ? c.render(row) : (row as Record<string, React.ReactNode>)[c.key]}
                </td>
              ))}
              {renderActions && (
                <td className="actions-cell" style={{ textAlign: 'right' }}>
                  {renderActions(row)}
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
      </div>
      {totalPages > 1 && (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', borderTop: '1px solid var(--color-border)', background: 'var(--color-surface)' }}>
          <div style={{ font: 'var(--text-body-sm)', color: 'var(--color-ink-muted)' }}>
            Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, rows.length)} of {rows.length}
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(p => p - 1)}
              style={{
                padding: '6px 12px',
                border: '1px solid var(--color-border)',
                background: currentPage === 1 ? 'var(--color-bg)' : 'var(--color-surface)',
                color: currentPage === 1 ? 'var(--color-ink-faint)' : 'var(--color-ink)',
                borderRadius: 'var(--radius-sm)',
                cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                font: '500 13px/1 var(--font-body)',
              }}
            >
              Previous
            </button>
            <button
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage(p => p + 1)}
              style={{
                padding: '6px 12px',
                border: '1px solid var(--color-border)',
                background: currentPage === totalPages ? 'var(--color-bg)' : 'var(--color-surface)',
                color: currentPage === totalPages ? 'var(--color-ink-faint)' : 'var(--color-ink)',
                borderRadius: 'var(--radius-sm)',
                cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
                font: '500 13px/1 var(--font-body)',
              }}
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
