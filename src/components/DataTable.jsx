import React, { useState, useMemo } from 'react';
import { ChevronUp, ChevronDown } from 'lucide-react';

/**
 * DataTable — Dark mode aware via CSS vars in component classes.
 *
 * Column definition accepts either:
 *   { key, label, render, sortable, className }       ← original API
 *   { accessor, header, cell, sortable, className }   ← alias API used by some pages
 */
const normaliseCol = (col) => ({
  key:       col.key       ?? col.accessor ?? '',
  label:     col.label     ?? col.header   ?? '',
  render:    col.render    ?? col.cell     ?? null,
  sortable:  col.sortable  ?? false,
  className: col.className ?? '',
});

const DataTable = ({
  columns = [],
  data = [],
  onRowClick,
  loading = false,
  emptyMessage = 'No data available',
  pagination = true,
  pageSize = 20,
}) => {
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
  const [currentPage, setCurrentPage] = useState(1);

  const normalisedCols = useMemo(() => columns.map(normaliseCol), [columns]);

  const handleSort = (key) => {
    setSortConfig((prev) =>
      prev.key === key && prev.direction === 'asc'
        ? { key, direction: 'desc' }
        : { key, direction: 'asc' }
    );
    setCurrentPage(1);
  };

  const sortedData = useMemo(() => {
    if (!sortConfig.key) return [...data];
    return [...data].sort((a, b) => {
      const av = a[sortConfig.key];
      const bv = b[sortConfig.key];
      if (av < bv) return sortConfig.direction === 'asc' ? -1 : 1;
      if (av > bv) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });
  }, [data, sortConfig]);

  const totalPages = Math.ceil(sortedData.length / pageSize);
  const currentData = pagination
    ? sortedData.slice((currentPage - 1) * pageSize, currentPage * pageSize)
    : sortedData;

  return (
    <div
      style={{
        backgroundColor: 'var(--bg-surface)',
        border: '1px solid var(--border)',
        borderRadius: '0.75rem',
        boxShadow: 'var(--shadow-card)',
        overflow: 'hidden',
      }}
    >
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          {/* Head */}
          <thead>
            <tr>
              {normalisedCols.map((col, i) => (
                <th
                  key={i}
                  className={`table-header ${
                    col.sortable
                      ? 'cursor-pointer select-none transition-colors'
                      : ''
                  } ${col.className}`}
                  onClick={() => col.sortable && handleSort(col.key)}
                  style={
                    col.sortable
                      ? {
                          ':hover': { backgroundColor: 'var(--bg-surface-3)' },
                        }
                      : {}
                  }
                >
                  <div className="flex items-center gap-1">
                    {col.label}
                    {col.sortable && sortConfig.key === col.key && (
                      <span style={{ color: 'var(--text-muted)' }}>
                        {sortConfig.direction === 'asc' ? (
                          <ChevronUp className="w-3.5 h-3.5" />
                        ) : (
                          <ChevronDown className="w-3.5 h-3.5" />
                        )}
                      </span>
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>

          {/* Body */}
          <tbody>
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <tr
                  key={i}
                  style={{ borderBottom: '1px solid var(--border-subtle)' }}
                >
                  {normalisedCols.map((_, j) => (
                    <td key={j} style={{ padding: '0.75rem 1rem' }}>
                      <div
                        className="skeleton"
                        style={{ height: '1rem', width: '75%' }}
                      />
                    </td>
                  ))}
                </tr>
              ))
            ) : currentData.length === 0 ? (
              <tr>
                <td
                  colSpan={normalisedCols.length}
                  style={{
                    padding: '3rem 1rem',
                    textAlign: 'center',
                    fontSize: '0.875rem',
                    color: 'var(--text-muted)',
                  }}
                >
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              currentData.map((row, rowIdx) => (
                <tr
                  key={rowIdx}
                  className="table-row"
                  style={{ cursor: onRowClick ? 'pointer' : 'default' }}
                  onClick={() => onRowClick && onRowClick(row)}
                >
                  {normalisedCols.map((col, colIdx) => (
                    <td key={colIdx} className={`table-cell ${col.className}`}>
                      {col.render ? col.render(row[col.key], row) : row[col.key]}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {pagination && totalPages > 1 && (
        <div
          className="px-4 py-3 flex items-center justify-between"
          style={{
            borderTop: '1px solid var(--border-subtle)',
            backgroundColor: 'var(--table-header-bg)',
          }}
        >
          <span
            style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}
          >
            Page{' '}
            <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
              {currentPage}
            </span>{' '}
            of {totalPages} · {' '}
            <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
              {sortedData.length}
            </span>{' '}
            records
          </span>
          <div className="flex items-center gap-1.5">
            <button
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
              style={{
                padding: '0.25rem 0.75rem',
                borderRadius: '0.5rem',
                border: '1px solid var(--border)',
                backgroundColor: 'var(--bg-surface)',
                fontSize: '0.75rem',
                fontWeight: 500,
                color: 'var(--text-secondary)',
                cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                opacity: currentPage === 1 ? 0.4 : 1,
                transition: 'all 150ms ease',
              }}
            >
              Previous
            </button>
            <button
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
              style={{
                padding: '0.25rem 0.75rem',
                borderRadius: '0.5rem',
                border: '1px solid var(--border)',
                backgroundColor: 'var(--bg-surface)',
                fontSize: '0.75rem',
                fontWeight: 500,
                color: 'var(--text-secondary)',
                cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
                opacity: currentPage === totalPages ? 0.4 : 1,
                transition: 'all 150ms ease',
              }}
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default DataTable;
