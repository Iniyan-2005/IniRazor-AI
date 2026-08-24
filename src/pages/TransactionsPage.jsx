import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Filter, ArrowLeftRight } from 'lucide-react';
import DataTable from '../components/DataTable';
import StatusBadge from '../components/StatusBadge';
import { getStore, isReady } from '../services/dataService';
import { formatCurrency, formatDate, formatConfidence, truncate } from '../utils/formatters';

const TransactionsPage = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  const { payments, reconciliations } = getStore();

  const data = useMemo(() => {
    if (!isReady()) return [];
    return payments.map(payment => {
      const recon = reconciliations.find(r => r.payment_id === payment.payment_id) || {};
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
    return data.filter(item => {
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
      cell: (value) => <span className="font-mono text-xs">{truncate(value, 15)}</span>,
    },
    {
      header: 'Order ID',
      accessor: 'order_id',
      cell: (value) => <span className="text-gray-600">{value}</span>,
    },
    {
      header: 'Amount',
      accessor: 'amount',
      cell: (value) => <span className="font-medium">{formatCurrency(value)}</span>,
    },
    {
      header: 'Settlement',
      accessor: 'actual_amount',
      cell: (value, row) => (
        <span className={row.difference !== 0 ? 'text-orange-600' : ''}>
          {value !== undefined ? formatCurrency(value) : '-'}
        </span>
      ),
    },
    {
      header: 'Diff',
      accessor: 'difference',
      cell: (value) => (
        <span className={value !== 0 && value !== undefined ? 'text-red-600 font-medium' : 'text-gray-400'}>
          {value !== undefined ? formatCurrency(value) : '-'}
        </span>
      ),
    },
    {
      header: 'Status',
      accessor: 'recon_status',
      cell: (value) => <StatusBadge status={value} />,
    },
    {
      header: 'Confidence',
      accessor: 'confidence',
      cell: (value) => (
        <span className="text-sm">
          {value ? formatConfidence(value) : '-'}
        </span>
      ),
    },
    {
      header: 'Date',
      accessor: 'created_at',
      cell: (value) => <span className="text-sm text-gray-500">{formatDate(value)}</span>,
    },
  ];

  if (!isReady()) {
    return (
      <div className="flex flex-col items-center justify-center h-64 bg-white rounded-lg shadow border border-gray-200">
        <ArrowLeftRight className="w-12 h-12 text-gray-400 mb-4" />
        <h2 className="text-xl font-semibold text-gray-700">No Data Available</h2>
        <p className="text-gray-500 mt-2 mb-4">Generate synthetic data to view transactions.</p>
        <button
          onClick={() => navigate('/reconcile')}
          className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md"
        >
          Go to Reconciliation
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Transactions</h1>
          <p className="text-gray-500">View and search all payment transactions.</p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
          <div className="relative">
            <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search ID, Order, Customer..."
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-md w-full sm:w-64 focus:ring-blue-500 focus:border-blue-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="relative">
            <Filter className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <select
              className="pl-10 pr-8 py-2 border border-gray-300 rounded-md w-full sm:w-48 focus:ring-blue-500 focus:border-blue-500 appearance-none bg-white"
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

      <div className="bg-white shadow rounded-lg overflow-hidden">
        <DataTable
          columns={columns}
          data={filteredData}
          keyField="id"
          onRowClick={(row) => navigate(`/transactions/${row.payment_id}`)}
          pagination={true}
          rowsPerPage={10}
        />
      </div>
    </div>
  );
};

export default TransactionsPage;
