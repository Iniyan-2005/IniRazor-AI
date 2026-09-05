import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Filter, ArrowLeftRight, ArrowRight } from 'lucide-react';
import DataTable from '../components/DataTable';
import StatusBadge from '../components/StatusBadge';
import { useStore } from '../hooks/useStore';
import { isReady } from '../services/dataService';
import { formatCurrency, formatDate, formatConfidence, truncate } from '../utils/formatters';

const TransactionsPage = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  const store = useStore();
  const { payments, reconciliations } = store;

  const data = useMemo(() => {
    if (!isReady()) return [];
    return payments.map((payment) => {
      const recon = reconciliations.find((r) => r.payment_id === payment.payment_id) || {};
      return {
        ...payment,
        recon_status: recon.status || 'PENDING',
        actual_amount: recon.actual_amount,
        difference: recon.difference,
        confidence: recon.ai_analysis?.confidence,
        reason: recon.ai_analysis?.likelyCause || recon.reason,
      };
    });
  }, [payments, reconciliations]);

  const filteredData = useMemo(() => {
    return data.filter((item) => {
      const matchesSearch =
        item.payment_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.order_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.customer_name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'All' || item.recon_status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [data, searchTerm, statusFilter]);

  const columns = [
    {
      header: 'Payment ID',
      accessor: 'payment_id',
      cell: (value) => (
        <span style={{ fontFamily: 'monospace', fontSize: '0.6875rem', color: 'var(--text-secondary)' }}>
          {truncate(value, 18)}
        </span>
      ),
    },
    {
      header: 'Customer',
      accessor: 'customer_name',
      cell: (value) => (
        <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{value}</span>
      ),
    },
    {
      header: 'Method',
      accessor: 'payment_method',
      cell: (value) => (
        <span style={{ fontSize: '0.75rem', textTransform: 'capitalize', color: 'var(--text-secondary)' }}>{value}</span>
      ),
    },
    {
      header: 'Amount',
      accessor: 'amount',
      cell: (value) => (
        <span style={{ fontWeight: 600, color: 'var(--text-primary)', fontVariantNumeric: 'tabular-nums' }}>
          {formatCurrency(value)}
        </span>
      ),
    },
    {
      header: 'Settlement',
      accessor: 'actual_amount',
      cell: (value, row) => (
        <span
          style={{
            fontVariantNumeric: 'tabular-nums',
            color: row.difference && row.difference !== 0 ? 'var(--warning)' : 'var(--text-secondary)',
          }}
        >
          {value !== undefined ? formatCurrency(value) : <span style={{ color: 'var(--text-muted)' }}>—</span>}
        </span>
      ),
    },
    {
      header: 'Diff',
      accessor: 'difference',
      cell: (value) => (
        <span
          style={{
            fontVariantNumeric: 'tabular-nums',
            fontWeight: value !== 0 && value !== undefined ? 600 : 400,
            color: value !== 0 && value !== undefined ? 'var(--danger)' : 'var(--text-muted)',
          }}
        >
          {value !== undefined ? (value !== 0 ? formatCurrency(value) : '—') : '—'}
        </span>
      ),
    },
    {
      header: 'Status',
      accessor: 'recon_status',
      cell: (value) => <StatusBadge status={value} size="sm" />,
    },
    {
      header: 'Confidence',
      accessor: 'confidence',
      cell: (value) => (
        <span style={{ fontSize: '0.75rem', color: value ? 'var(--text-secondary)' : 'var(--text-muted)' }}>
          {value ? formatConfidence(value) : '—'}
        </span>
      ),
    },
    {
      header: 'Date',
      accessor: 'created_at',
      cell: (value) => (
        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{formatDate(value)}</span>
      ),
    },
  ];

  if (!isReady()) {
    return (
      <div className="empty-state min-h-[40vh] justify-center">
        <div className="empty-state-icon">
          <ArrowLeftRight style={{ width: '1.5rem', height: '1.5rem' }} />
        </div>
        <div>
          <p className="empty-state-title">No Data Available</p>
          <p className="empty-state-desc">Generate synthetic data to view transactions.</p>
        </div>
        <button onClick={() => navigate('/reconciliation')} className="btn-primary">
          Go to Reconciliation
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-5 page-enter">
      {/* Page header + controls */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="page-title">Transactions</h1>
          <p className="page-subtitle">View and search all payment transactions.</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
          <div className="input-icon-wrapper">
            <Search className="input-icon" />
            <input
              type="text"
              placeholder="Search ID, order, customer…"
              className="input-with-icon"
              style={{ width: '100%', minWidth: '15rem' }}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="input-icon-wrapper">
            <Filter className="input-icon" />
            <select
              className="input-with-icon"
              style={{ width: '100%', minWidth: '11rem', appearance: 'none' }}
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="All">All Statuses</option>
              <option value="MATCHED">Matched</option>
              <option value="AI_RESOLVED">AI Resolved</option>
              <option value="NEEDS_REVIEW">Needs Review</option>
              <option value="UNRESOLVED">Unresolved</option>
            </select>
          </div>
        </div>
      </div>

      {/* Results count */}
      {filteredData.length !== data.length && (
        <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
          Showing{' '}
          <span style={{ fontWeight: 600, color: 'var(--text-secondary)' }}>{filteredData.length}</span>{' '}
          of{' '}
          <span style={{ fontWeight: 600, color: 'var(--text-secondary)' }}>{data.length}</span>{' '}
          transactions
        </p>
      )}

      <DataTable
        columns={columns}
        data={filteredData}
        onRowClick={(row) => navigate(`/transactions/${row.payment_id}`)}
        pagination={true}
        pageSize={15}
      />
    </div>
  );
};

export default TransactionsPage;
