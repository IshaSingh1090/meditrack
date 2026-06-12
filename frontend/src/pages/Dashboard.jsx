import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import API from '../api/axios';

const Dashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [medicines, setMedicines] = useState([]);

  useEffect(() => {
    const fetchMedicines = async () => {
      try {
        const res = await API.get('/medicines');
        setMedicines(res.data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchMedicines();
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getStatusColor = (status) => {
    if (status === 'expired') return '#fee2e2';
    if (status === 'expiring_soon') return '#fef9c3';
    return '#dcfce7';
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h2 style={styles.title}>💊 MediTrack Pro</h2>
        <div>
          <span style={styles.welcome}>Welcome, {user?.name}</span>
          <button style={styles.logoutBtn} onClick={handleLogout}>Logout</button>
        </div>
      </div>

      <div style={styles.content}>
        <h3>Medicine Inventory</h3>
        {medicines.length === 0 ? (
          <p style={styles.empty}>No medicines added yet.</p>
        ) : (
          <table style={styles.table}>
            <thead>
              <tr>
                <th>Name</th>
                <th>Quantity</th>
                <th>Expiry Date</th>
                <th>Status</th>
                <th>Category</th>
              </tr>
            </thead>
            <tbody>
              {medicines.map((med) => (
                <tr key={med._id} style={{ backgroundColor: getStatusColor(med.expiryStatus) }}>
                  <td>{med.name}</td>
                  <td>{med.quantity}</td>
                  <td>{new Date(med.expiryDate).toLocaleDateString()}</td>
                  <td>{med.expiryStatus}</td>
                  <td>{med.category}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

const styles = {
  container: { minHeight: '100vh', backgroundColor: '#f0f4f8' },
  header: { backgroundColor: '#2563eb', color: 'white', padding: '1rem 2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  title: { margin: 0 },
  welcome: { marginRight: '1rem', color: 'white' },
  logoutBtn: { padding: '0.5rem 1rem', backgroundColor: 'white', color: '#2563eb', border: 'none', borderRadius: '6px', cursor: 'pointer' },
  content: { padding: '2rem' },
  empty: { color: '#64748b' },
  table: { width: '100%', borderCollapse: 'collapse', backgroundColor: 'white', borderRadius: '8px', overflow: 'hidden' },
};

export default Dashboard;