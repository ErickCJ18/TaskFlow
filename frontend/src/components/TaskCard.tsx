import React from 'react';
import { Task } from '../store/taskSlice.ts';

interface Props {
  task: Task;
  onEdit: (task: Task) => void;
  onDelete: (id: number) => void;
  onStatusChange: (id: number, status: Task['status']) => void;
}

const priorityColors: Record<string, string> = {
  Alta: '#e74c3c',
  Media: '#f39c12',
  Baja: '#27ae60',
};

const statusOptions: Task['status'][] = ['Pendiente', 'En Progreso', 'Completada'];

const TaskCard: React.FC<Props> = ({ task, onEdit, onDelete, onStatusChange }) => {
  const formatDate = (date: string | null) => {
    if (!date) return '—';
    return new Date(date).toLocaleDateString('es-DO', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  return (
    <div data-testid={`task-card-${task.id}`} style={styles.card}>
      <div style={styles.header}>
        <span style={{ ...styles.priority, backgroundColor: priorityColors[task.priority] }}>
          {task.priority}
        </span>
        <div style={styles.actions}>
          <button
            data-testid={`btn-edit-${task.id}`}
            onClick={() => onEdit(task)}
            style={styles.editBtn}
            title="Editar"
          >✏️</button>
          <button
            data-testid={`btn-delete-${task.id}`}
            onClick={() => onDelete(task.id)}
            style={styles.deleteBtn}
            title="Eliminar"
          >🗑️</button>
        </div>
      </div>

      <h3 data-testid={`task-title-${task.id}`} style={styles.title}>{task.title}</h3>

      {task.description && (
        <p style={styles.description}>{task.description}</p>
      )}

      <div style={styles.footer}>
        <span style={styles.date}>📅 {formatDate(task.dueDate)}</span>
        <select
          data-testid={`select-status-${task.id}`}
          value={task.status}
          onChange={(e) => onStatusChange(task.id, e.target.value as Task['status'])}
          style={styles.statusSelect}
        >
          {statusOptions.map(s => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
      </div>
    </div>
  );
};

const styles: { [key: string]: React.CSSProperties } = {
  card: { backgroundColor: '#fff', borderRadius: '10px', padding: '16px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)', marginBottom: '12px', border: '1px solid #e8edf2' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' },
  priority: { fontSize: '11px', fontWeight: 700, color: '#fff', padding: '3px 10px', borderRadius: '20px' },
  actions: { display: 'flex', gap: '6px' },
  editBtn: { background: 'none', border: 'none', cursor: 'pointer', fontSize: '16px', padding: '2px' },
  deleteBtn: { background: 'none', border: 'none', cursor: 'pointer', fontSize: '16px', padding: '2px' },
  title: { fontSize: '15px', fontWeight: 600, color: '#1a1a2e', marginBottom: '6px' },
  description: { fontSize: '13px', color: '#666', marginBottom: '10px', lineHeight: '1.5' },
  footer: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '12px', borderTop: '1px solid #f0f0f0', paddingTop: '10px' },
  date: { fontSize: '12px', color: '#888' },
  statusSelect: { fontSize: '12px', padding: '4px 8px', borderRadius: '6px', border: '1px solid #ccc', backgroundColor: '#f9f9f9', cursor: 'pointer' },
};

export default TaskCard;
