import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import WebviewApp from './WebviewApp'
import '../index.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <WebviewApp />
  </StrictMode>,
)
