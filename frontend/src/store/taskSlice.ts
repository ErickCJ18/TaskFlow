import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import api from '../services/api.ts';

export interface Task {
  id: number;
  userId: number;
  title: string;
  description: string;
  priority: 'Alta' | 'Media' | 'Baja';
  status: 'Pendiente' | 'En Progreso' | 'Completada';
  dueDate: string | null;
  createdAt: string;
}

interface TaskState {
  tasks: Task[];
  counts: { Pendiente: number; 'En Progreso': number; Completada: number };
  loading: boolean;
  error: string | null;
}

const initialState: TaskState = {
  tasks: [],
  counts: { Pendiente: 0, 'En Progreso': 0, Completada: 0 },
  loading: false,
  error: null,
};

// HU-05, HU-09, HU-10: Obtener tareas con filtros
export const fetchTasks = createAsyncThunk(
  'tasks/fetchAll',
  async (params: { status?: string; search?: string } = {}, { rejectWithValue }) => {
    try {
      const query = new URLSearchParams();
      if (params.status) query.append('status', params.status);
      if (params.search) query.append('search', params.search);
      const res = await api.get(`/tasks?${query.toString()}`);
      return res.data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || 'Error al obtener tareas');
    }
  }
);

// HU-04: Crear tarea
export const createTask = createAsyncThunk(
  'tasks/create',
  async (taskData: Partial<Task>, { rejectWithValue }) => {
    try {
      const res = await api.post('/tasks', taskData);
      return res.data.task;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || 'Error al crear tarea');
    }
  }
);

// HU-06 y HU-08: Actualizar tarea o cambiar estado
export const updateTask = createAsyncThunk(
  'tasks/update',
  async ({ id, data }: { id: number; data: Partial<Task> }, { rejectWithValue }) => {
    try {
      const res = await api.put(`/tasks/${id}`, data);
      return res.data.task;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || 'Error al actualizar tarea');
    }
  }
);

// HU-07: Eliminar tarea
export const deleteTask = createAsyncThunk(
  'tasks/delete',
  async (id: number, { rejectWithValue }) => {
    try {
      await api.delete(`/tasks/${id}`);
      return id;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || 'Error al eliminar tarea');
    }
  }
);

const taskSlice = createSlice({
  name: 'tasks',
  initialState,
  reducers: {
    clearError: (state) => { state.error = null; },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchTasks.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(fetchTasks.fulfilled, (state, action) => {
        state.loading = false;
        state.tasks = action.payload.tasks;
        state.counts = action.payload.counts;
      })
      .addCase(fetchTasks.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(createTask.fulfilled, (state, action) => {
        state.tasks.unshift(action.payload);
        state.counts[action.payload.status as keyof typeof state.counts]++;
      })
      .addCase(updateTask.fulfilled, (state, action) => {
        const idx = state.tasks.findIndex(t => t.id === action.payload.id);
        if (idx !== -1) {
          const oldStatus = state.tasks[idx].status;
          const newStatus = action.payload.status;
          if (oldStatus !== newStatus) {
            state.counts[oldStatus as keyof typeof state.counts]--;
            state.counts[newStatus as keyof typeof state.counts]++;
          }
          state.tasks[idx] = action.payload;
        }
      })
      .addCase(deleteTask.fulfilled, (state, action) => {
        const task = state.tasks.find(t => t.id === action.payload);
        if (task) state.counts[task.status as keyof typeof state.counts]--;
        state.tasks = state.tasks.filter(t => t.id !== action.payload);
      });
  },
});

export const { clearError } = taskSlice.actions;
export default taskSlice.reducer;
