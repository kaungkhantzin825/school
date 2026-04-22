import { useState, useEffect } from 'react';
import '../../styles/admin/DegreeManagement.css';

interface Degree {
  id: number;
  code: string;
  name: string;
  description: string;
  level: 'bachelor' | 'master' | 'doctorate';
  status: 'active' | 'inactive';
  university_id: number;
}

const DegreeManagement = () => {
  const [degrees, setDegrees] = useState<Degree[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editingDegree, setEditingDegree] = useState<Degree | null>(null);
  const [formData, setFormData] = useState({
    code: '',
    name: '',
    description: '',
    level: 'bachelor' as 'bachelor' | 'master' | 'doctorate',
    status: 'active' as 'active' | 'inactive',
  });

  // Mock data for now
  useEffect(() => {
    setDegrees([
      { id: 1, code: 'MBBS', name: 'Bachelor of Medicine', description: 'Medical degree', level: 'bachelor', status: 'active', university_id: 1 },
      { id: 2, code: 'M.Med.Sc', name: 'Master of Medical Science', description: 'Advanced medical degree', level: 'master', status: 'active', university_id: 1 },
      { id: 3, code: 'B.E', name: 'Bachelor of Engineering', description: 'Engineering degree', level: 'bachelor', status: 'active', university_id: 4 },
    ]);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingDegree) {
      // Update
      setDegrees(degrees.map(d => d.id === editingDegree.id ? { ...d, ...formData } : d));
    } else {
      // Create
      const newDegree = { id: Date.now(), ...formData, university_id: 1 };
      setDegrees([...degrees, newDegree]);
    }
    handleCloseModal();
  };

  const handleEdit = (degree: Degree) => {
    setEditingDegree(degree);
    setFormData({
      code: degree.code,
      name: degree.name,
      description: degree.description,
      level: degree.level,
      status: degree.status,
    });
    setShowModal(true);
  };

  const handleDelete = (id: number) => {
    if (confirm('Are you sure you want to delete this degree?')) {
      setDegrees(degrees.filter(d => d.id !== id));
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingDegree(null);
    setFormData({
      code: '',
      name: '',
      description: '',
      level: 'bachelor',
      status: 'active',
    });
  };

  return (
    <div className="degree-management">
      <div className="degree-header">
        <h1>📚 Degree Management</h1>
        <button className="add-degree-btn" onClick={() => setShowModal(true)}>
          + Add Degree
        </button>
      </div>

      <div className="degrees-grid">
        {degrees.map((degree) => (
          <div key={degree.id} className="degree-card">
            <div className="degree-card-header">
              <h3>{degree.code}</h3>
              <span className={`status-badge ${degree.status}`}>
                {degree.status}
              </span>
            </div>
            <h4>{degree.name}</h4>
            <p className="degree-description">{degree.description}</p>
            <div className="degree-level">
              <span className="level-badge">{degree.level}</span>
            </div>
            <div className="degree-actions">
              <button className="edit-btn" onClick={() => handleEdit(degree)}>
                ✏️ Edit
              </button>
              <button className="delete-btn" onClick={() => handleDelete(degree.id)}>
                🗑️ Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={handleCloseModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editingDegree ? 'Edit Degree' : 'Add New Degree'}</h2>
              <button className="close-btn" onClick={handleCloseModal}>×</button>
            </div>

            <form onSubmit={handleSubmit} className="degree-form">
              <div className="form-group">
                <label>Degree Code *</label>
                <input
                  type="text"
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                  placeholder="e.g., MBBS, B.E, M.Sc"
                  required
                />
              </div>

              <div className="form-group">
                <label>Degree Name *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., Bachelor of Medicine"
                  required
                />
              </div>

              <div className="form-group">
                <label>Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Brief description of the degree"
                  rows={3}
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Level *</label>
                  <select
                    value={formData.level}
                    onChange={(e) => setFormData({ ...formData, level: e.target.value as any })}
                    required
                  >
                    <option value="bachelor">Bachelor</option>
                    <option value="master">Master</option>
                    <option value="doctorate">Doctorate</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Status *</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                    required
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
              </div>

              <div className="form-actions">
                <button type="button" className="cancel-btn" onClick={handleCloseModal}>
                  Cancel
                </button>
                <button type="submit" className="submit-btn">
                  {editingDegree ? 'Update' : 'Create'} Degree
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default DegreeManagement;
