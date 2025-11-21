import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path='/list' element={<App />} />
        <Route path='*' element={<Navigate to='/list' replace />} />
      </Routes>
    </BrowserRouter>
  </StrictMode>,
)
