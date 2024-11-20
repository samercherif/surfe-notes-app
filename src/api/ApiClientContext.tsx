import type { ReactNode } from 'react'
import type React from 'react'
import { createContext, useContext, useMemo } from 'react'
import type { AxiosInstance } from 'axios'
import axios from 'axios'
import { VITE_APP_SURFE_API_URL } from '@src/constants'

interface ClientsContextType {
  apiClient: AxiosInstance
}

const ClientsContext = createContext<ClientsContextType>({} as ClientsContextType)

interface ClientsProviderProps {
  children: ReactNode
}

export const ApiClientProvider: React.FC<ClientsProviderProps> = ({ children }) => {
  const clients = useMemo(
    () => ({
      apiClient: axios.create({
        baseURL: VITE_APP_SURFE_API_URL,
        timeout: 5000,
      }),
    }),
    [],
  )
  return <ClientsContext.Provider value={clients}>{children}</ClientsContext.Provider>
}

export const useClients = (): ClientsContextType => useContext(ClientsContext)
