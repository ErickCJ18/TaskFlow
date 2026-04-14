import React, { useState, useEffect } from 'react';
import { Task } from '../store/taskSlice';

interface Props {
  task?: Task | null;
  onSave: (data: Partial<Task>) => void;
  onClose: () => void;
}

const TaskModal: React.FC<Props> = ({ task, onSave, onClose }) => {
  const [form, setForm] = useState({
    title: '',
    description: '',
    priority: 'Media' as Task['priority'],
    dueDate: '',
  });
  const [error, setError] = useState('');

  useEffect(() => {
    if (task) {
      setForm({
        title: task.title,
        description: task.description || '',
        priority: task.priority,
        dueDate: task.dueDate ? task.dueDate.split('T')[0] : '',
      });
    }
  }, [task]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim()) {
      setError('El título es requerido');
      return;
    }
    onSave(form);
  };

  return (
    <div style={styles.overlay} data-testid="task-modal">
      <div style={styles.modal}>
        <div style={styles.header}>
          <h2 style={styles.title}>{task ? 'Editar Tarea' : 'Nueva Tarea'}</h2>
          <button onClick={onClose} style={styles.closeBtn} data-testid="btn-close-modal">✕</button>
        </div>

        {error && <div style={styles.error} data-testid="modal-error">{error}</div>}

        <form onSubmit={handleSubmit} data-testid="task-form">
          <div style={styles.field}>
            <label style={styles.label}>Título *</label>
            <input
              data-testid="input-task-title"
              name="title"
              value={form.title}
              onChange={handleChange}
              placeholder="Título de la tarea"
              style={styles.input}
              required
            />
          </div>
          <div style={styles.field}>
            <label style={styles.label}>Descripción</label>
            <textarea
              data-testid="input-task-description"
              name="description"
              value={form.description}
              onChange={handleChange}
              placeholder="Descripción opcional..."
              style={{ ...styles.input, height: '80px', resize: 'vertical' }}
            />
          </div>
          <div style={styles.row}>
            <div style={{ ...styles.field, flex: 1 }}>
              <label style={styles.label}>Prioridad</label>
              <select
                data-testid="select-priority"
                name="priority"
                value={form.priority}
                onChange={handleChange}
                style={styles.input}
              >
                <option value="Alta">Alta</option>
                <option value="Media">Media</option>
                <option value="Baja">Baja</option>
              </select>
            </div>
            <div style={{ ...styles.field, flex: 1 }}>
              <label style={styles.label}>Fecha límite</label>
              <input
                data-testid="input-due-date"
                name="dueDate"
                type="date"
                value={form.dueDate}
                onChange={handleChange}
                style={styles.input}
                min={new Date().toISOString().split('T')[0]}
              />
            </div>
          </div>
          <div style={styles.buttons}>
            <button type="button" onClick={onClose} style={styles.cancelBtn}>Cancelar</button>
            <button type="submit" data-testid="btn-save-task" style={styles.saveBtn}>
              {task ? 'Guardar cambios' : 'Crear tarea'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const styles: { [key: string]: React.CSSProperties } = {
  overlay: { position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 },
  modal: { backgroundColor: '#fff', borderRadius: '12px', padding: '28px', width: '100%', maxWidth: '500px', boxShadow: '0 8px 40px rgba(0,0,0,0.2)' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' },
  title: { fontSize: '20px', fontWeight: 700, color: '#1a1a2e' },
  closeBtn: { background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer', color: '#888' },
  field: { marginBottom: '16px' },
  row: { display: 'flex', gap: '16px' },
  label: { display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: 600, color: '#444' },
  input: { width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #ddd', fontSize: '14px', boxSizing: 'border-box' },
  buttons: { display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '20px' },
  cancelBtn: { padding: '10px 20px', borderRadius: '8px', border: '1px solid #ccc', background: '#fff', cursor: 'pointer', fontSize: '14px' },
  saveBtn: { padding: '10px 24px', borderRadius: '8px', border: 'none', backgroundColor: '#2C5F9E', color: '#fff', cursor: 'pointer', fontSize: '14px', fontWeight: 600 },
  error: { backgroundColor: '#fdecea', color: '#c0392b', padding: '10px', borderRadius: '8px', marginBottom: '16px', fontSize: '14px' },
};

export default TaskModal;
