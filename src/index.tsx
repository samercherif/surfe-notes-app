import React from 'react'
import { createRoot } from 'react-dom/client'
import { ErrorBoundary } from 'react-error-boundary'
import { ApiClientProvider } from '@api/ApiClientContext'
import App from './app/App'
import './index.css'

const container = document.getElementById('root')
if (container) {
  const root = createRoot(container)
  root.render(
    <React.StrictMode>
      <ApiClientProvider>
        <ErrorBoundary fallback={<div>{'Something went wrong'}</div>}>
          <App />
        </ErrorBoundary>
      </ApiClientProvider>
    </React.StrictMode>,
  )
}
