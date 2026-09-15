import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from 'react';
import { api } from '../services/api';
import { UsuarioLogado, LoginResponse } from '../types/auth';

interface AuthContextValue {
  usuario: UsuarioLogado | null;
  carregando: boolean;
  entrar: (login: string, senha: string) => Promise<void>;
  sair: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [usuario, setUsuario] = useState<UsuarioLogado | null>(null);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    const salvo = localStorage.getItem('arcomix_usuario');
    if (salvo) {
      setUsuario(JSON.parse(salvo));
    }
    setCarregando(false);
  }, []);

  async function entrar(login: string, senha: string) {
    const { data } = await api.post<LoginResponse>('/auth/login', {
      login,
      senha,
    });
    localStorage.setItem('arcomix_token', data.access_token);
    localStorage.setItem('arcomix_usuario', JSON.stringify(data.usuario));
    setUsuario(data.usuario);
  }

  function sair() {
    localStorage.removeItem('arcomix_token');
    localStorage.removeItem('arcomix_usuario');
    setUsuario(null);
  }

  return (
    <AuthContext.Provider value={{ usuario, carregando, entrar, sair }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth deve ser usado dentro de <AuthProvider>');
  }
  return ctx;
}
