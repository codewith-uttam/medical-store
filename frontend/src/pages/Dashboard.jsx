import React, { useState, useEffect } from 'react';
import { IndianRupee, Pill, AlertTriangle } from 'lucide-react';
import { useAuth } from '../AuthContext';

const Dashboard = () => {
  const { authHeaders } = useAuth();
  const [data, setData] = useState({
    totalSalesToday: 0,
    totalMedicines: 0,
    lowStockMeds: []
  });

  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_URL}/api/dashboard`, { headers: authHeaders() })
      .then(res => res.json())
      .then(data => setData(data))
      .catch(err => console.error(err));
  }, []);

  return (
    <div>
      <h1>Dashboard</h1>
      <p className="subtitle">Overview of today's activities and alerts</p>

      <div className="grid-cards">
        <div className="glass-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <h3 style={{ color: 'var(--text-secondary)', fontSize: '14px', marginBottom: '8px' }}>Total Sales (Today)</h3>
              <div style={{ fontSize: '32px', fontWeight: '700', color: 'var(--success)' }}>
                ₹ {data.totalSalesToday.toFixed(2)}
              </div>
            </div>
            <div style={{ padding: '12px', background: 'rgba(16, 185, 129, 0.1)', borderRadius: '12px' }}>
              <IndianRupee color="var(--success)" />
            </div>
          </div>
        </div>

        <div className="glass-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <h3 style={{ color: 'var(--text-secondary)', fontSize: '14px', marginBottom: '8px' }}>Total Medicines</h3>
              <div style={{ fontSize: '32px', fontWeight: '700', color: 'var(--accent-primary)' }}>
                {data.totalMedicines}
              </div>
            </div>
            <div style={{ padding: '12px', background: 'rgba(59, 130, 246, 0.1)', borderRadius: '12px' }}>
              <Pill color="var(--accent-primary)" />
            </div>
          </div>
        </div>
      </div>

      <h2>Low Stock Alerts</h2>
      <div className="glass-panel" style={{ marginTop: '16px' }}>
        {data.lowStockMeds.length === 0 ? (
          <p style={{ color: 'var(--text-secondary)' }}>No low stock items. Everything looks good!</p>
        ) : (
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Medicine Name</th>
                  <th>Batch No</th>
                  <th>Remaining Qty</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {data.lowStockMeds.map(med => (
                  <tr key={med.id}>
                    <td style={{ fontWeight: '600' }}>{med.name}</td>
                    <td>{med.batch_no}</td>
                    <td>{med.quantity}</td>
                    <td>
                      <span className="badge badge-danger">
                        <AlertTriangle size={12} style={{ display: 'inline', marginRight: '4px' }} />
                        Low Stock
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
