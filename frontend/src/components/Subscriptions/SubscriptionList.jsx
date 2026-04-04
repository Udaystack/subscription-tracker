import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getSubscriptions, deleteSubscription } from '../../services/api';
import toast from 'react-hot-toast';
import { PlusIcon, PencilIcon, TrashIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';

const CYCLE_LABELS = { WEEKLY: 'Weekly', MONTHLY: 'Monthly', QUARTERLY: 'Quarterly', YEARLY: 'Yearly' };

const CATEGORY_COLORS = {
  Entertainment: 'bg-blue-50 text-blue-700',
  Software: 'bg-purple-50 text-purple-700',
  Utilities: 'bg-green-50 text-green-700',
  Health: 'bg-amber-50 text-amber-700',
  Finance: 'bg-red-50 text-red-700',
  Other: 'bg-gray-50 text-gray-600',
};

export default function SubscriptionList() {
  const [subscriptions, setSubscriptions] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  const load = () => {
    getSubscriptions()
      .then(r => setSubscriptions(r.data))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Remove "${name}"?`)) return;
    try {
      await deleteSubscription(id);
      toast.success(`${name} removed`);
      load();
    } catch {
      toast.error('Failed to remove subscription');
    }
  };

  const filtered = subscriptions.filter(s =>
    s.name.toLowerCase().includes(search.toLowerCase()) ||
    (s.category || '').toLowerCase().includes(search.toLowerCase())
  );

  if (loading) {
    return <div className="flex items-center justify-center h-full">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
    </div>;
  }

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Subscriptions</h1>
        <Link to="/subscriptions/new" className="btn-primary flex items-center gap-2">
          <PlusIcon className="w-4 h-4" />
          Add new
        </Link>
      </div>

      <div className="relative mb-6">
        <MagnifyingGlassIcon className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input className="input pl-9" placeholder="Search subscriptions..."
          value={search} onChange={e => setSearch(e.target.value)} />
      </div>

      {filtered.length === 0 ? (
        <div className="card text-center py-12">
          <p className="text-gray-400 text-sm">
            {subscriptions.length === 0
              ? "No subscriptions yet — add your first one!"
              : "No results found"}
          </p>
          {subscriptions.length === 0 && (
            <Link to="/subscriptions/new" className="btn-primary inline-flex mt-4">
              Add subscription
            </Link>
          )}
        </div>
      ) : (
        <div className="card p-0 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                {['Name', 'Amount', 'Cycle', 'Category', 'Renews', 'Actions'].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.map(s => (
                <tr key={s.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 font-medium text-gray-900">{s.name}</td>
                  <td className="px-4 py-3 text-gray-700">${s.amount} {s.currency}</td>
                  <td className="px-4 py-3 text-gray-500">{CYCLE_LABELS[s.billingCycle]}</td>
                  <td className="px-4 py-3">
                    <span className={`badge ${CATEGORY_COLORS[s.category] || CATEGORY_COLORS.Other}`}>
                      {s.category || 'Other'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-sm ${s.daysUntilRenewal <= 3 ? 'text-red-600 font-medium' : s.daysUntilRenewal <= 7 ? 'text-amber-600 font-medium' : 'text-gray-500'}`}>
                      {s.daysUntilRenewal === 0 ? 'Today' :
                       s.daysUntilRenewal === 1 ? 'Tomorrow' :
                       `${s.daysUntilRenewal}d`}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <Link to={`/subscriptions/${s.id}/edit`}
                        className="text-gray-400 hover:text-blue-600 transition-colors">
                        <PencilIcon className="w-4 h-4" />
                      </Link>
                      <button onClick={() => handleDelete(s.id, s.name)}
                        className="text-gray-400 hover:text-red-600 transition-colors">
                        <TrashIcon className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
