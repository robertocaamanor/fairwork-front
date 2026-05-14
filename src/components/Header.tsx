import { LogOut, Radar } from 'lucide-react'
import type { AuthUser } from '../types/auth'

interface HeaderProps {
  isOnline: boolean
  lastUpdated?: Date
  className?: string
  onOpenCategories: () => void
  viewMode: 'monitor' | 'search' | 'editorial'
  onViewModeChange: (mode: 'monitor' | 'search' | 'editorial') => void
  currentUser: AuthUser
  onLogout: () => void
}

const formatLastUpdate = (value?: Date): string => {
  if (!value) return 'Sin actualizacion reciente'

  return new Intl.DateTimeFormat('es-CL', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  }).format(value)
}

export function Header({
  isOnline,
  lastUpdated,
  className,
  onOpenCategories,
  viewMode,
  onViewModeChange,
  currentUser,
  onLogout,
}: HeaderProps) {
  return (
    <header
      className={`fixed inset-x-0 top-0 z-20 border-b border-zinc-700 bg-zinc-950/95 backdrop-blur ${className ?? ''}`}
    >
      <div className="mx-auto flex max-w-[1600px] flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-semibold tracking-tight text-zinc-100">Fairwork</h1>
            {isOnline ? (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-2 py-0.5 text-xs font-medium text-emerald-400 border border-emerald-500/20">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Online
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-rose-500/10 px-2 py-0.5 text-xs font-medium text-rose-400 border border-rose-500/20">
                <span className="h-1.5 w-1.5 rounded-full bg-rose-500" />
                Offline
              </span>
            )}
          </div>
          <p className="text-xs text-zinc-400 mt-1">Ultima actualizacion: {formatLastUpdate(lastUpdated)}</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="mr-2 hidden rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-right sm:block">
            <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">Sesión</p>
            <p className="text-sm font-semibold text-zinc-100">{currentUser.username}</p>
            <p className="text-xs text-zinc-400">
              {currentUser.isAdmin
                ? 'Administrador'
                : currentUser.canSendToN8n
                  ? 'Puede enviar a n8n'
                  : 'Solo lectura'}
            </p>
          </div>
          <div className="flex rounded-lg border border-zinc-700 bg-zinc-900 p-1 mr-2">
            <button
              onClick={() => onViewModeChange('monitor')}
              className={`px-3 py-1.5 text-sm font-medium rounded-md transition ${viewMode === 'monitor' ? 'bg-zinc-800 text-white' : 'text-zinc-400 hover:text-zinc-300'}`}
            >
              Monitor
            </button>
            <button
              onClick={() => onViewModeChange('search')}
              className={`px-3 py-1.5 text-sm font-medium rounded-md transition ${viewMode === 'search' ? 'bg-zinc-800 text-white' : 'text-zinc-400 hover:text-zinc-300'}`}
            >
              Búsqueda
            </button>
            <button
              onClick={() => onViewModeChange('editorial')}
              className={`px-3 py-1.5 text-sm font-medium rounded-md transition ${viewMode === 'editorial' ? 'bg-zinc-800 text-white' : 'text-zinc-400 hover:text-zinc-300'}`}
            >
              Editorial
            </button>
          </div>
          {viewMode === 'monitor' && (
            <button
              type="button"
              onClick={onOpenCategories}
              className="flex items-center gap-2 rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-1.5 text-sm font-medium text-zinc-300 transition hover:bg-zinc-800"
            >
              <Radar size={16} />
              Columnas
            </button>
          )}
          <button
            type="button"
            onClick={onLogout}
            className="inline-flex items-center gap-2 rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-1.5 text-sm font-medium text-zinc-300 transition hover:bg-zinc-800"
          >
            <LogOut size={16} />
            Salir
          </button>
        </div>
      </div>
    </header>
  )
}
