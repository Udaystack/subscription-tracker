import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { createSubscription, updateSubscription, getSubscription } from '../../services/api';
import toast from 'react-hot-toast';

const CATEGORIES = ['Entertainment', 'Software', 'Utilities', 'Health', 'Finance', 'Other'];
const CYCLES = ['WEEKLY', 'MONTHLY', 'QUARTERLY', 'YEARLY'];

const empty = {
  name: '', amount: '', currency: 'USD',
  billingCycle: 'MONTHLY', nextRenewalDate: '',
  category: 'Other', notes: '', logoUrl: '',
};

export default function SubscriptionForm() {
  const [form, setForm] = useState(empty);
  const [loading, setLoading] = useState(false);
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);

  useEffect(() => {
    if (isEdit) {
      getSubscription(id).then(r => {
        const s = r.data;
        setForm({
          name: s.name, amount: s.amount, currency: s.currency,
          billingCycle: s.billingCycle,
          nextRenewalDate: s.nextRenewalDate,
          category: s.category || 'Other',
          notes: s.notes || '', logoUrl: s.logoUrl || '',
        });
      });
    }
  }, [id, isEdit]);

  const update = (field) => (e) => setForm({ ...form, [field]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (isEdit) {
        await updateSubscription(id, form);
        toast.success('Subscription updated');
      } else {
        await createSubscription(form);
        toast.success('Subscription added');
      }
      navigate('/subscriptions');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 max-w-xl">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">
        {isEdit ? 'Edit subscription' : 'Add subscription'}
      </h1>

      <div className="card">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="label">Service name *</label>
            <input className="input" placeholder="e.g. Netflix, Spotify" required
              value={form.name} onChange={update('name')} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Amount *</label>
              <input className="input" type="number" step="0.01" min="0.01" required
                value={form.amount} onChange={update('amount')} />
            </div>
            <div>
              <label className="label">Currency</label>
              <select className="input" value={form.currency} onChange={update('currency')}>
                {['USD', 'EUR', 'GBP', 'INR', 'CAD'].map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Billing cycle *</label>
              <select className="input" value={form.billingCycle} onChange={update('billingCycle')}>
                {CYCLES.map(c => <option key={c} value={c}>{c.charAt(0) + c.slice(1).toLowerCase()}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Category</label>
              <select className="input" value={form.category} onChange={update('category')}>
                {CATEGORIES.map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
          </div>

          <div>
            <label className="label">Next renewal date *</label>
            <input className="input" type="date" required
              value={form.nextRenewalDate} onChange={update('nextRenewalDate')} />
          </div>

          <div>
            <label className="label">Notes</label>
            <textarea className="input" rows={2} placeholder="Optional notes..."
              value={form.notes} onChange={update('notes')} />
          </div>

          <div className="flex gap-3 pt-2">
            <button type="submit" disabled={loading} className="btn-primary flex-1">
              {loading ? 'Saving...' : isEdit ? 'Save changes' : 'Add subscription'}
            </button>
            <button type="button" onClick={() => navigate('/subscriptions')} className="btn-secondary">
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
