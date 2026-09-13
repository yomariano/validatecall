import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)

// Analytics is optional; never emit unresolved environment placeholders.
if (import.meta.env.VITE_UMAMI_SCRIPT_URL && import.meta.env.VITE_UMAMI_WEBSITE_ID) {
  const script = document.createElement('script');
  script.defer = true;
  script.src = import.meta.env.VITE_UMAMI_SCRIPT_URL;
  script.dataset.websiteId = import.meta.env.VITE_UMAMI_WEBSITE_ID;
  document.head.appendChild(script);
}
