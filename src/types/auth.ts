export interface AuthUser {
  id: string
  username: string
  isAdmin: boolean
  canSendToN8n: boolean
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface LoginResponse {
  accessToken: string
  user: AuthUser
}