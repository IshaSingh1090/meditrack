import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import API from '../api/axios';

const Dashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [medicines, setMedicines] = useState([]);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const [showForm, setShowForm] = useState(false);
  const [editingMed, setEditingMed] = useState(null);
  const [form, setForm] = useState({
    name: '', barcode: '', quantity: '', expiryDate: '', category: '', manufacturer: ''
  });

  const fetchMedicines = async () => {
    try {
      const res = await API.get('/medicines');
      setMedicines(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => { fetchMedicines(); }, []);

  const handleLogout = () => { logout(); navigate('/login'); };

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingMed) {
        await API.put(`/medicines/${editingMed._id}`, form);
      } else {
        await API.post('/medicines', form);
      }
      setForm({ name: '', barcode: '', quantity: '', expiryDate: '', category: '', manufacturer: '' });
      setShowForm(false);
      setEditingMed(null);
      fetchMedicines();
    } catch (err) {
      console.error(err);
    }
  };

  const handleEdit = (med) => {
    setEditingMed(med);
    setForm({
      name: med.name,
      barcode: med.barcode || '',
      quantity: med.quantity,
      expiryDate: med.expiryDate?.split('T')[0],
      category: med.category || '',
      manufacturer: med.manufacturer || ''
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Delete this medicine?')) {
      await API.delete(`/medicines/${id}`);
      fetchMedicines();
    }
  };

  const getStatusColor = (status) => {
    if (status === 'expired') return '#fee2e2';
    if (status === 'expiring_soon') return '#fef9c3';
    return '#dcfce7';
  };

  const getStatusBadge = (status) => {
    if (status === 'expired') return { bg: '#ef4444', text: '🔴 Expired' };
    if (status === 'expiring_soon') return { bg: '#f59e0b', text: '🟡 Expiring Soon' };
    return { bg: '#22c55e', text: '🟢 Safe' };
  };

  const filtered = medicines.filter(m => {
    const matchSearch = m.name.toLowerCase().includes(search.toLowerCase()) ||
      (m.category || '').toLowerCase().includes(search.toLowerCase());
    const matchFilter = filter === 'all' || m.expiryStatus === filter;
    return matchSearch && matchFilter;
  });

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f0f4f8' }}>
      {/* Header */}
      <div style={{ backgroundColor: '#2563eb', color: 'white', padding: '1rem 2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2 style={{ margin: 0 }}>💊 MediTrack Pro</h2>
        <div>
          <span style={{ marginRight: '1rem' }}>Welcome, {user?.name}</span>
          <button onClick={handleLogout} style={{ padding: '0.5rem 1rem', backgroundColor: 'white', color: '#2563eb', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>Logout</button>
        </div>
      </div>

      <div style={{ padding: '2rem' }}>
        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginBottom: '2rem' }}>
          {[
            { label: 'Total Medicines', value: medicines.length, color: '#2563eb' },
            { label: 'Expiring Soon', value: medicines.filter(m => m.expiryStatus === 'expiring_soon').length, color: '#f59e0b' },
            { label: 'Expired', value: medicines.filter(m => m.expiryStatus === 'expired').length, color: '#ef4444' },
          ].map((stat, i) => (
            <div key={i} style={{ backgroundColor: 'white', padding: '1.5rem', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)', textAlign: 'center' }}>
              <div style={{ fontSize: '2rem', fontWeight: 'bold', color: stat.color }}>{stat.value}</div>
              <div style={{ color: '#64748b', marginTop: '0.25rem' }}>{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Controls */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            <input
              placeholder="🔍 Search medicines..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{ padding: '0.6rem 1rem', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '0.9rem', width: '250px' }}
            />
            <select value={filter} onChange={e => setFilter(e.target.value)}
              style={{ padding: '0.6rem 1rem', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '0.9rem' }}>
              <option value="all">All Status</option>
              <option value="safe">🟢 Safe</option>
              <option value="expiring_soon">🟡 Expiring Soon</option>
              <option value="expired">🔴 Expired</option>
            </select>
          </div>
          <button onClick={() => { setShowForm(true); setEditingMed(null); setForm({ name: '', barcode: '', quantity: '', expiryDate: '', category: '', manufacturer: '' }); }}
            style={{ padding: '0.6rem 1.5rem', backgroundColor: '#2563eb', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', fontSize: '0.9rem' }}>
            ➕ Add Medicine
          </button>
        </div>

        {/* Add/Edit Form */}
        {showForm && (
          <div style={{ backgroundColor: 'white', padding: '1.5rem', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)', marginBottom: '1.5rem' }}>
            <h3 style={{ marginTop: 0, color: '#1e293b' }}>{editingMed ? '✏️ Edit Medicine' : '➕ Add New Medicine'}</h3>
            <form onSubmit={handleSubmit}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
                {[
                  { name: 'name', placeholder: 'Medicine Name', required: true },
                  { name: 'barcode', placeholder: 'Barcode' },
                  { name: 'quantity', placeholder: 'Quantity', type: 'number', required: true },
                  { name: 'expiryDate', placeholder: 'Expiry Date', type: 'date', required: true },
                  { name: 'category', placeholder: 'Category' },
                  { name: 'manufacturer', placeholder: 'Manufacturer' },
                ].map(field => (
                  <input key={field.name} name={field.name} type={field.type || 'text'}
                    placeholder={field.placeholder} value={form[field.name]}
                    onChange={handleChange} required={field.required}
                    style={{ padding: '0.75rem', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '0.9rem' }} />
                ))}
              </div>
              <div style={{ marginTop: '1rem', display: 'flex', gap: '1rem' }}>
                <button type="submit" style={{ padding: '0.75rem 2rem', backgroundColor: '#2563eb', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>
                  {editingMed ? 'Update' : 'Add Medicine'}
                </button>
                <button type="button" onClick={() => { setShowForm(false); setEditingMed(null); }}
                  style={{ padding: '0.75rem 2rem', backgroundColor: '#e2e8f0', color: '#64748b', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Table */}
        <div style={{ backgroundColor: 'white', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)', overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ backgroundColor: '#f8fafc' }}>
                {['Name', 'Barcode', 'Quantity', 'Expiry Date', 'Status', 'Category', 'Manufacturer', 'Actions'].map(h => (
                  <th key={h} style={{ padding: '1rem', textAlign: 'left', color: '#64748b', fontWeight: '600', fontSize: '0.85rem', borderBottom: '1px solid #e2e8f0' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan="8" style={{ padding: '2rem', textAlign: 'center', color: '#64748b' }}>No medicines found.</td></tr>
              ) : filtered.map(med => {
                const badge = getStatusBadge(med.expiryStatus);
                return (
                  <tr key={med._id} style={{ backgroundColor: getStatusColor(med.expiryStatus), borderBottom: '1px solid #e2e8f0' }}>
                    <td style={{ padding: '0.85rem 1rem', fontWeight: '500' }}>{med.name}</td>
                    <td style={{ padding: '0.85rem 1rem', color: '#64748b' }}>{med.barcode || '—'}</td>
                    <td style={{ padding: '0.85rem 1rem' }}>{med.quantity}</td>
                    <td style={{ padding: '0.85rem 1rem' }}>{new Date(med.expiryDate).toLocaleDateString()}</td>
                    <td style={{ padding: '0.85rem 1rem' }}>
                      <span style={{ backgroundColor: badge.bg, color: 'white', padding: '0.25rem 0.75rem', borderRadius: '20px', fontSize: '0.8rem', fontWeight: '600' }}>
                        {badge.text}
                      </span>
                    </td>
                    <td style={{ padding: '0.85rem 1rem', color: '#64748b' }}>{med.category || '—'}</td>
                    <td style={{ padding: '0.85rem 1rem', color: '#64748b' }}>{med.manufacturer || '—'}</td>
                    <td style={{ padding: '0.85rem 1rem' }}>
                      <button onClick={() => handleEdit(med)} style={{ marginRight: '0.5rem', padding: '0.35rem 0.75rem', backgroundColor: '#3b82f6', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '0.8rem' }}>✏️ Edit</button>
                      <button onClick={() => handleDelete(med._id)} style={{ padding: '0.35rem 0.75rem', backgroundColor: '#ef4444', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '0.8rem' }}>🗑️ Delete</button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;