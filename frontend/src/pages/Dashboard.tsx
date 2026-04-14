import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../store/index.ts';
import { fetchTasks, createTask, updateTask, deleteTask, Task } from '../store/taskSlice.ts';
import TaskCard from '../components/TaskCard.tsx';
import TaskModal from '../components/TaskModal.tsx';

const COLUMNS: { key: Task['status']; label: string; color: string }[] = [
  { key: 'Pendiente',   label: '📋 Pendiente',   color: '#e8f4fd' },
  { key: 'En Progreso', label: '⚙️ En Progreso', color: '#fff8e1' },
  { key: 'Completada',  label: '✅ Completada',  color: '#e8f8f0' },
];

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const { tasks, counts, loading } = useSelector((state: RootState) => state.tasks);

  const [user, setUser] = useState<{ name: string } | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [filterStatus, setFilterStatus] = useState('');
  const [search, setSearch] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem('user');
    if (!stored) { navigate('/login'); return; }
    setUser(JSON.parse(stored));
    dispatch(fetchTasks({}));
  }, [dispatch, navigate]);

  // HU-09 y HU-10: filtrar y buscar
  useEffect(() => {
    const timer = setTimeout(() => {
      dispatch(fetchTasks({ status: filterStatus, search }));
    }, 300);
    return () => clearTimeout(timer);
  }, [filterStatus, search, dispatch]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const handleSaveTask = async (data: Partial<Task>) => {
    if (editingTask) {
      await dispatch(updateTask({ id: editingTask.id, data }));
    } else {
      await dispatch(createTask(data));
    }
    setModalOpen(false);
    setEditingTask(null);
  };

  const handleEdit = (task: Task) => {
    setEditingTask(task);
    setModalOpen(true);
  };

  const handleDeleteConfirm = (id: number) => setDeleteConfirm(id);

  const handleDeleteExecute = async () => {
    if (deleteConfirm) {
      await dispatch(deleteTask(deleteConfirm));
      setDeleteConfirm(null);
    }
  };

  const handleStatusChange = async (id: number, status: Task['status']) => {
    await dispatch(updateTask({ id, data: { status } }));
  };

  const getTasksByStatus = (status: Task['status']) =>
    tasks.filter(t => t.status === status);

  return (
    <div style={styles.container}>
      {/* Navbar */}
      <nav style={styles.navbar} data-testid="navbar">
        <h1 style={styles.navTitle}>TaskFlow</h1>
        <div style={styles.navRight}>
          <span data-testid="user-greeting" style={styles.greeting}>
            👋 Hola, {user?.name}
          </span>
          <button
            data-testid="btn-logout"
            onClick={handleLogout}
            style={styles.logoutBtn}
          >
            Cerrar sesión
          </button>
        </div>
      </nav>

      {/* Controles */}
      <div style={styles.controls}>
        <div style={styles.leftControls}>
          {/* HU-10: Búsqueda */}
          <input
            data-testid="input-search"
            type="text"
            placeholder="🔍 Buscar tarea..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={styles.searchInput}
          />
          {/* HU-09: Filtro */}
          <select
            data-testid="select-filter-status"
            value={filterStatus}
            onChange={e => setFilterStatus(e.target.value)}
            style={styles.filterSelect}
          >
            <option value="">Todas</option>
            <option value="Pendiente">Pendiente</option>
            <option value="En Progreso">En Progreso</option>
            <option value="Completada">Completada</option>
          </select>
        </div>

        {/* HU-04: Crear tarea */}
        <button
          data-testid="btn-new-task"
          onClick={() => { setEditingTask(null); setModalOpen(true); }}
          style={styles.newTaskBtn}
        >
          + Nueva tarea
        </button>
      </div>

      {/* HU-05: Tablero Kanban */}
      {loading ? (
        <div style={styles.loading} data-testid="loading">Cargando tareas...</div>
      ) : (
        <div style={styles.board} data-testid="kanban-board">
          {COLUMNS.map(col => (
            <div key={col.key} style={{ ...styles.column, backgroundColor: col.color }} data-testid={`column-${col.key.replace(' ', '-')}`}>
              <div style={styles.columnHeader}>
                <span style={styles.columnTitle}>{col.label}</span>
                <span data-testid={`count-${col.key.replace(' ', '-')}`} style={styles.badge}>
                  {counts[col.key] ?? 0}
                </span>
              </div>
              <div style={styles.taskList}>
                {getTasksByStatus(col.key).length === 0 ? (
                  <p style={styles.empty} data-testid={`empty-${col.key.replace(' ', '-')}`}>
                    Sin tareas
                  </p>
                ) : (
                  getTasksByStatus(col.key).map(task => (
                    <TaskCard
                      key={task.id}
                      task={task}
                      onEdit={handleEdit}
                      onDelete={handleDeleteConfirm}
                      onStatusChange={handleStatusChange}
                    />
                  ))
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal crear/editar */}
      {modalOpen && (
        <TaskModal
          task={editingTask}
          onSave={handleSaveTask}
          onClose={() => { setModalOpen(false); setEditingTask(null); }}
        />
      )}

      {/* HU-07: Diálogo de confirmación de eliminación */}
      {deleteConfirm && (
        <div style={styles.overlay} data-testid="delete-confirm-dialog">
          <div style={styles.confirmBox}>
            <h3 style={{ marginBottom: '12px' }}>¿Eliminar tarea?</h3>
            <p style={{ color: '#555', marginBottom: '20px' }}>Esta acción no se puede deshacer.</p>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
              <button
                data-testid="btn-cancel-delete"
                onClick={() => setDeleteConfirm(null)}
                style={styles.cancelBtn}
              >
                Cancelar
              </button>
              <button
                data-testid="btn-confirm-delete"
                onClick={handleDeleteExecute}
                style={styles.confirmDeleteBtn}
              >
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const styles: { [key: string]: React.CSSProperties } = {
  container: { minHeight: '100vh', backgroundColor: '#f0f4f8', fontFamily: 'Calibri, sans-serif' },
  navbar: { backgroundColor: '#2C5F9E', color: '#fff', padding: '14px 28px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  navTitle: { fontSize: '22px', fontWeight: 700 },
  navRight: { display: 'flex', alignItems: 'center', gap: '16px' },
  greeting: { fontSize: '14px' },
  logoutBtn: { padding: '6px 16px', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.5)', background: 'transparent', color: '#fff', cursor: 'pointer', fontSize: '13px' },
  controls: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 28px' },
  leftControls: { display: 'flex', gap: '12px' },
  searchInput: { padding: '9px 14px', borderRadius: '8px', border: '1px solid #ccc', fontSize: '14px', width: '240px' },
  filterSelect: { padding: '9px 14px', borderRadius: '8px', border: '1px solid #ccc', fontSize: '14px', backgroundColor: '#fff' },
  newTaskBtn: { padding: '10px 22px', backgroundColor: '#2C5F9E', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '14px', fontWeight: 600 },
  board: { display: 'flex', gap: '20px', padding: '0 28px 28px', alignItems: 'flex-start' },
  column: { flex: 1, borderRadius: '12px', padding: '16px', minHeight: '400px' },
  columnHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' },
  columnTitle: { fontWeight: 700, fontSize: '15px', color: '#1a1a2e' },
  badge: { backgroundColor: '#2C5F9E', color: '#fff', borderRadius: '20px', padding: '2px 10px', fontSize: '13px', fontWeight: 700 },
  taskList: { display: 'flex', flexDirection: 'column', gap: '4px' },
  empty: { textAlign: 'center', color: '#aaa', fontSize: '13px', marginTop: '40px' },
  loading: { textAlign: 'center', padding: '60px', color: '#666', fontSize: '16px' },
  overlay: { position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 },
  confirmBox: { backgroundColor: '#fff', borderRadius: '12px', padding: '28px', maxWidth: '380px', width: '90%', boxShadow: '0 8px 40px rgba(0,0,0,0.2)' },
  cancelBtn: { padding: '9px 18px', borderRadius: '8px', border: '1px solid #ccc', background: '#fff', cursor: 'pointer' },
  confirmDeleteBtn: { padding: '9px 18px', borderRadius: '8px', border: 'none', backgroundColor: '#e74c3c', color: '#fff', cursor: 'pointer', fontWeight: 600 },
};

export default Dashboard;
