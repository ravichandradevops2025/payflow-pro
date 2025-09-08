
import { configureStore } from '@reduxjs/toolkit';
import { createSlice } from '@reduxjs/toolkit';

// Simple demo slice
const demoSlice = createSlice({
  name: 'demo',
  initialState: {
    value: 'demo'
  },
  reducers: {}
});

export const store = configureStore({
  reducer: {
    demo: demoSlice.reducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
