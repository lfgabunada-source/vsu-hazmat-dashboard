import React from 'react'
import ReactDOM from 'react-dom/client'
import { createBrowserRouter, RouterProvider, Navigate } from 'react-router-dom'
import './index.css'
import Layout, { RequireAdmin } from './components/Layout'
import { ToastProvider } from './components/Toast'
import { AppProvider } from './store/app'

import Auth from './screens/Auth'
import Dashboard from './screens/Dashboard'
import HazardMap from './screens/HazardMap'
import Survey from './screens/Survey'
import UnitCoordination from './screens/UnitCoordination'
import NewEntry from './screens/NewEntry'
import WasteRegister from './screens/WasteRegister'
import Assessment from './screens/Assessment'
import CorrectiveActions from './screens/CorrectiveActions'
import Guidelines from './screens/Guidelines'
import ConsolidatedReport from './screens/ConsolidatedReport'
import Approvals from './screens/Approvals'
import UnitsAdmin from './screens/UnitsAdmin'

const router = createBrowserRouter([
  { path: '/login', element: <Auth initialMode="login" /> },
  { path: '/register', element: <Auth initialMode="register" /> },
  {
    path: '/',
    element: <Layout />,
    children: [
      { index: true, element: <Dashboard /> },
      { path: 'map', element: <HazardMap /> },
      { path: 'survey', element: <Survey /> },
      { path: 'coordination', element: <UnitCoordination /> },
      { path: 'new', element: <NewEntry /> },
      { path: 'waste', element: <WasteRegister /> },
      { path: 'assessment', element: <Assessment /> },
      { path: 'actions', element: <CorrectiveActions /> },
      { path: 'guidelines', element: <Guidelines /> },
      { path: 'report', element: <ConsolidatedReport /> },
      {
        path: 'admin/approvals',
        element: (
          <RequireAdmin>
            <Approvals />
          </RequireAdmin>
        ),
      },
      {
        path: 'admin/units',
        element: (
          <RequireAdmin>
            <UnitsAdmin />
          </RequireAdmin>
        ),
      },
      { path: '*', element: <Navigate to="/" replace /> },
    ],
  },
])

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <AppProvider>
      <ToastProvider>
        <RouterProvider router={router} />
      </ToastProvider>
    </AppProvider>
  </React.StrictMode>,
)
