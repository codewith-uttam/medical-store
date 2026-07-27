import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2 } from 'lucide-react';
import { useAuth } from '../AuthContext';

const Inventory = () => {
  const { authHeaders } = useAuth();
  const [medicines, setMedicines] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    id: null,
    name: '',
    generic_name: '',
    batch_no: '',
    expiry_date: '',
    quantity: 0,
    price: 0,
    manufacturer: ''
  });

  const fetchMedicines = () => {
    fetch('http://localhost:5000/api/medicines', { headers: authHeaders() })
      .then(res => res.json())
      .then(data => setMedicines(data))
      .catch(err => console.error(err));
  };

  useEffect(() => {
    fetchMedicines();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const openModal = (medicine = null) => {
    if (medicine) {
      setFormData(medicine);
    } else {
      setFormData({
        id: null, name: '', generic_name: '', batch_no: '',
        expiry_date: '', quantity: 0, price: 0, manufacturer: ''
      });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const method = formData.id ? 'PUT' : 'POST';
    const url = formData.id 
      ? `http://localhost:5000/api/medicines/${formData.id}`
      : 'http://localhost:5000/api/medicines';

    fetch(url, {
      method,
      headers: authHeaders(),
      body: JSON.stringify(formData)
    })
    .then(res => res.json())
    .then(() => {
      fetchMedicines();
      closeModal();
    })
    .catch(err => console.error(err));
  };

  const handleDelete = (id) => {
    if (window.confirm("Are you sure you want to delete this medicine?")) {
      fetch(`http://localhost:5000/api/medicines/${id}`, { method: 'DELETE', headers: authHeaders() })
        .then(() => fetchMedicines())
        .catch(err => console.error(err));
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h1>Inventory</h1>
          <p className="subtitle" style={{ marginBottom: 0 }}>Manage your medicines and stock</p>
        </div>
        <button className="btn btn-primary" onClick={() => openModal()}>
          <Plus size={18} />
          Add Medicine
        </button>
      </div>

      <div className="glass-panel">
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Batch No</th>
                <th>Expiry</th>
                <th>Qty</th>
                <th>Price (₹)</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {medicines.map(med => (
                <tr key={med.id}>
                  <td style={{ fontWeight: '500' }}>
                    {med.name}
                    <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{med.generic_name}</div>
                  </td>
                  <td>{med.batch_no}</td>
                  <td>{med.expiry_date}</td>
                  <td>
                    <span className={`badge ${med.quantity < 10 ? 'badge-danger' : 'badge-success'}`}>
                      {med.quantity}
                    </span>
                  </td>
                  <td>{med.price.toFixed(2)}</td>
                  <td>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button 
                        style={{ background: 'transparent', border: 'none', color: 'var(--accent-primary)', cursor: 'pointer' }}
                        onClick={() => openModal(med)}
                      >
                        <Edit2 size={18} />
                      </button>
                      <button 
                        style={{ background: 'transparent', border: 'none', color: 'var(--danger)', cursor: 'pointer' }}
                        onClick={() => handleDelete(med.id)}
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {medicines.length === 0 && (
                <tr>
                  <td colSpan="6" style={{ textAlign: 'center', color: 'var(--text-secondary)', padding: '24px' }}>
                    No medicines found. Click "Add Medicine" to create one.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>{formData.id ? 'Edit Medicine' : 'Add Medicine'}</h2>
              <button onClick={closeModal} style={{ background: 'transparent', border: 'none', color: 'var(--text-primary)', fontSize: '24px', cursor: 'pointer' }}>&times;</button>
            </div>
            <div className="modal-body">
              <form id="medicineForm" onSubmit={handleSubmit}>
                <div className="input-group">
                  <label>Name</label>
                  <input type="text" name="name" value={formData.name} onChange={handleInputChange} required />
                </div>
                <div className="input-group">
                  <label>Generic Name</label>
                  <input type="text" name="generic_name" value={formData.generic_name} onChange={handleInputChange} />
                </div>
                <div className="form-row-2">
                  <div className="input-group">
                    <label>Batch No</label>
                    <input type="text" name="batch_no" value={formData.batch_no} onChange={handleInputChange} required />
                  </div>
                  <div className="input-group">
                    <label>Expiry Date</label>
                    <input type="date" name="expiry_date" value={formData.expiry_date} onChange={handleInputChange} required />
                  </div>
                </div>
                <div className="form-row-2">
                  <div className="input-group">
                    <label>Quantity</label>
                    <input type="number" name="quantity" value={formData.quantity} onChange={handleInputChange} required min="0" />
                  </div>
                  <div className="input-group">
                    <label>Price (₹)</label>
                    <input type="number" name="price" value={formData.price} onChange={handleInputChange} required step="0.01" min="0" />
                  </div>
                </div>
                <div className="input-group">
                  <label>Manufacturer</label>
                  <input type="text" name="manufacturer" value={formData.manufacturer} onChange={handleInputChange} />
                </div>
              </form>
            </div>
            <div className="modal-footer">
              <button className="btn" onClick={closeModal} style={{ background: 'var(--bg-tertiary)', color: 'var(--text-primary)' }}>Cancel</button>
              <button type="submit" form="medicineForm" className="btn btn-primary">Save Medicine</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Inventory;
