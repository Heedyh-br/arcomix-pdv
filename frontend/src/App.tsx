import { useAuth } from './contexts/AuthContext';
import Login from './pages/Login';

export default function App() {
  const { usuario, carregando, sair } = useAuth();

  if (carregando) {
    return null;
  }

  if (!usuario) {
    return <Login />;
  }

  // Placeholder — módulo (c) Abertura de Caixa assume esta tela a seguir.
  return (
    <div className="flex min-h-screen items-center justify-center bg-paper font-sans text-ink">
      <div className="text-center">
        <p className="text-xl font-bold">
          Olá, {usuario.nome} ({usuario.perfil})
        </p>
        <p className="mt-1 text-ink/60">
          Próximo módulo: abertura de caixa.
        </p>
        <button
          onClick={sair}
          className="mt-6 rounded-lg border-2 border-ink/15 px-4 py-2 font-semibold text-ink/70"
        >
          Sair
        </button>
      </div>
    </div>
  );
}
