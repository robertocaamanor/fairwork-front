import { useState } from 'react'

interface LoginScreenProps {
  onLogin: (credentials: { username: string; password: string }) => Promise<void>
  isSubmitting: boolean
  errorMessage: string | null
}

export function LoginScreen({ onLogin, isSubmitting, errorMessage }: LoginScreenProps) {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    await onLogin({ username, password })
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-zinc-950 px-4 text-zinc-100 sm:px-6">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(8,145,178,0.18),transparent_35%),radial-gradient(circle_at_bottom_right,rgba(244,63,94,0.14),transparent_35%)]" />

      <div className="relative w-full max-w-md rounded-3xl border border-zinc-800 bg-zinc-950/90 p-8 shadow-2xl shadow-black/30 backdrop-blur">
        <div className="mb-8 space-y-3 text-center">
          <img src="/logo-tvenserio.svg" alt="TVenserio Logo" className="mx-auto h-10 w-auto" />
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-zinc-50">Acceso Fairwork</h1>
            <p className="mt-2 text-sm text-zinc-400">
              Inicia sesión para revisar noticias y, según tu rol, enviar artículos a n8n.
            </p>
          </div>
        </div>

        <form className="space-y-4" onSubmit={handleSubmit}>
          <label className="block space-y-2">
            <span className="text-sm font-medium text-zinc-300">Usuario</span>
            <input
              type="text"
              value={username}
              onChange={(event) => setUsername(event.target.value)}
              className="w-full rounded-xl border border-zinc-700 bg-zinc-900 px-4 py-3 text-sm text-zinc-100 outline-none transition focus:border-cyan-500"
              placeholder="admin o demo"
              autoComplete="username"
              required
            />
          </label>

          <label className="block space-y-2">
            <span className="text-sm font-medium text-zinc-300">Contraseña</span>
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="w-full rounded-xl border border-zinc-700 bg-zinc-900 px-4 py-3 text-sm text-zinc-100 outline-none transition focus:border-cyan-500"
              placeholder="Ingresa tu contraseña"
              autoComplete="current-password"
              required
            />
          </label>

          {errorMessage ? (
            <div className="rounded-xl border border-rose-500/40 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
              {errorMessage}
            </div>
          ) : null}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full rounded-xl bg-cyan-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-cyan-500 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting ? 'Ingresando...' : 'Iniciar sesión'}
          </button>
        </form>

        <div className="mt-6 rounded-2xl border border-zinc-800 bg-zinc-900/70 p-4 text-xs text-zinc-400">
          <p className="font-medium text-zinc-300">Usuarios iniciales</p>
          <p className="mt-2">demo: solo consulta</p>
          <p>admin: administración y envío a n8n</p>
        </div>
      </div>
    </div>
  )
}