import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import List from './List.tsx'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path='/list' element={<List />} />
        <Route path='*' element={<Navigate to='/list' replace />} />
      </Routes>
    </BrowserRouter>
  </StrictMode>,
)
