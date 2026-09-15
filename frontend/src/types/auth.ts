export type Perfil = 'operador' | 'supervisor' | 'administrador';

export interface UsuarioLogado {
  id: string;
  nome: string;
  login: string;
  perfil: Perfil;
}

export interface LoginResponse {
  access_token: string;
  usuario: UsuarioLogado;
}
