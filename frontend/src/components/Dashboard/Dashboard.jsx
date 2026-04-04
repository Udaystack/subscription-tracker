import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getSummary, getSubscriptions } from '../../services/api';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import { formatDistanceToNow } from 'date-fns';
import { PlusIcon, BellAlertIcon } from '@heroicons/react/24/outline';

const COLORS = ['#3b82f6', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444', '#6366f1'];

const CATEGORY_COLORS = {
  Entertainment: '#3b82f6',
  Software: '#8b5cf6',
  Utilities: '#10b981',
  Health: '#f59e0b',
  Finance: '#ef4444',
  Other: '#6b7280',
};

export default function Dashboard() {
  const [summary, setSummary] = useState(null);
  const [subscriptions, setSubscriptions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getSummary(), getSubscriptions()])
      .then(([s, subs]) => {
        setSummary(s.data);
        setSubscriptions(subs.data);
      })
      .finally(() => setLoading(false));
  }, []);

  const dueSoon = subscriptions
    .filter(s => s.daysUntilRenewal >= 0 && s.daysUntilRenewal <= 7)
    .sort((a, b) => a.daysUntilRenewal - b.daysUntilRenewal);

  const categoryData = subscriptions.reduce((acc, s) => {
    const cat = s.category || 'Other';
    const existing = acc.find(x => x.name === cat);
    if (existing) existing.value += parseFloat(s.amount);
    else acc.push({ name: cat, value: parseFloat(s.amount) });
    return acc;
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Welcome back, {localStorage.getItem('userName')}
          </p>
        </div>
        <Link to="/subscriptions/new" className="btn-primary flex items-center gap-2">
          <PlusIcon className="w-4 h-4" />
          Add subscription
        </Link>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard label="Monthly spend" value={`$${summary?.totalMonthly || '0.00'}`} color="blue" />
        <StatCard label="Yearly spend" value={`$${summary?.totalYearly || '0.00'}`} color="purple" />
        <StatCard label="Active subscriptions" value={summary?.activeCount || 0} color="green" />
        <StatCard label="Renewing this week" value={summary?.dueSoonCount || 0} color={summary?.dueSoonCount > 0 ? 'amber' : 'gray'} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Due soon */}
        <div className="card">
          <div className="flex items-center gap-2 mb-4">
            <BellAlertIcon className="w-5 h-5 text-amber-500" />
            <h2 className="font-semibold text-gray-900">Renewing soon</h2>
          </div>
          {dueSoon.length === 0 ? (
            <p className="text-sm text-gray-400 py-4 text-center">No renewals in the next 7 days 🎉</p>
          ) : (
            <div className="space-y-3">
              {duesoon.map(s => (
                <div key={s.id} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                  <div>
                    <p className="text-sm font-medium text-gray-900">{s.name}</p>
                    <p className="text-xs text-gray-400">
                      {s.daysUntilRenewal === 0 ? 'Today' :
                       s.daysUntilRenewal === 1 ? 'Tomorrow' :
                       `In ${s.daysUntilRenewal} days`}
                    </p>
                  </div>
                  <span className="text-sm font-semibold text-gray-900">${s.amount}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Category chart */}
        <div className="card">
          <h2 className="font-semibold text-gray-900 mb-4">Spend by category</h2>
          {categoryData.length === 0 ? (
            <p className="text-sm text-gray-400 py-4 text-center">No subscriptions yet</p>
          ) : (
            <div className="flex items-center gap-4">
              <ResponsiveContainer width="50%" height={180}>
                <PieChart>
                  <Pie data={categoryData} cx="50%" cy="50%" innerRadius={45} outerRadius={75}
                    paddingAngle={3} dataKey="value">
                    {categoryData.map((entry, index) => (
                      <Cell key={entry.name}
                        fill={CATEGORY_COLORS[entry.name] || COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(v) => `$${v.toFixed(2)}`} />
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-2 flex-1">
                {categoryData.map((entry, index) => (
                  <div key={entry.name} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full"
                        style={{ background: CATEGORY_COLORS[entry.name] || COLORS[index % COLORS.length] }} />
                      <span className="text-gray-600">{entry.name}</span>
                    </div>
                    <span className="font-medium text-gray-900">${entry.value.toFixed(2)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value, color }) {
  const colors = {
    blue: 'bg-blue-50 text-blue-700',
    purple: 'bg-purple-50 text-purple-700',
    green: 'bg-green-50 text-green-700',
    amber: 'bg-amber-50 text-amber-700',
    gray: 'bg-gray-50 text-gray-600',
  };
  return (
    <div className="card py-4">
      <p className="text-xs text-gray-500 mb-1">{label}</p>
      <p className={`text-2xl font-bold ${colors[color]}`}>{value}</p>
    </div>
  );
}
