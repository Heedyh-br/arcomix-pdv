import { FormEvent, useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';

function saudacaoPorHorario(hora: number): string {
  if (hora < 12) return 'Bom dia';
  if (hora < 18) return 'Boa tarde';
  return 'Boa noite';
}

export default function Login() {
  const { entrar } = useAuth();
  const [login, setLogin] = useState('');
  const [senha, setSenha] = useState('');
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);
  const [agora, setAgora] = useState(new Date());

  useEffect(() => {
    const intervalo = setInterval(() => setAgora(new Date()), 30_000);
    return () => clearInterval(intervalo);
  }, []);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setErro(null);
    setEnviando(true);
    try {
      await entrar(login, senha);
    } catch {
      setErro('Login ou senha inválidos. Confira e tente novamente.');
    } finally {
      setEnviando(false);
    }
  }

  return (
    <div className="flex min-h-screen w-full font-sans">
      {/* Painel de identidade — listras verticais remetem ao código de barras lido no caixa */}
      <aside className="relative hidden w-2/5 flex-col justify-between overflow-hidden bg-night px-10 py-12 text-paper md:flex">
        <div
          className="pointer-events-none absolute inset-y-0 left-0 w-24 opacity-70"
          style={{
            backgroundImage:
              'repeating-linear-gradient(90deg, #ECE7DC 0 3px, transparent 3px 7px, #ECE7DC 7px 9px, transparent 9px 16px, #ECE7DC 16px 20px, transparent 20px 26px)',
            maskImage: 'linear-gradient(to right, black 60%, transparent)',
          }}
          aria-hidden="true"
        />
        <div className="relative z-10">
          <p className="text-2xl font-extrabold tracking-tight">Arcomix</p>
          <p className="text-sm text-paper/70">Sistema de frente de caixa</p>
        </div>

        <div className="relative z-10">
          <p className="text-4xl font-extrabold leading-tight">
            {saudacaoPorHorario(agora.getHours())}
          </p>
          <p className="mt-2 text-paper/70">
            {agora.toLocaleDateString('pt-BR', {
              weekday: 'long',
              day: '2-digit',
              month: 'long',
            })}{' '}
            ·{' '}
            {agora.toLocaleTimeString('pt-BR', {
              hour: '2-digit',
              minute: '2-digit',
            })}
          </p>
        </div>
      </aside>

      {/* Painel de acesso */}
      <main className="flex w-full flex-1 items-center justify-center bg-paper px-6 py-12 md:w-3/5">
        <form
          onSubmit={handleSubmit}
          className="w-full max-w-sm"
          aria-label="Entrar no sistema"
        >
          <h1 className="text-2xl font-bold text-ink">Identifique-se</h1>
          <p className="mt-1 text-ink/60">
            Use seu login e senha para abrir o turno.
          </p>

          <div className="mt-8 flex flex-col gap-4">
            <label className="flex flex-col gap-2">
              <span className="text-sm font-semibold text-ink/80">Login</span>
              <input
                type="text"
                value={login}
                onChange={(e) => setLogin(e.target.value)}
                autoComplete="username"
                autoFocus
                required
                className="h-14 rounded-lg border-2 border-ink/15 bg-white px-4 text-lg text-ink outline-none focus:border-market"
              />
            </label>

            <label className="flex flex-col gap-2">
              <span className="text-sm font-semibold text-ink/80">Senha</span>
              <div className="relative">
                <input
                  type={mostrarSenha ? 'text' : 'password'}
                  value={senha}
                  onChange={(e) => setSenha(e.target.value)}
                  autoComplete="current-password"
                  required
                  className="h-14 w-full rounded-lg border-2 border-ink/15 bg-white px-4 pr-16 text-lg text-ink outline-none focus:border-market"
                />
                <button
                  type="button"
                  onClick={() => setMostrarSenha((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 px-2 py-2 text-sm font-semibold text-ink/60"
                >
                  {mostrarSenha ? 'ocultar' : 'mostrar'}
                </button>
              </div>
            </label>

            {erro && (
              <p
                role="alert"
                className="rounded-lg border-2 border-brick/30 bg-brick/10 px-4 py-3 text-brick"
              >
                {erro}
              </p>
            )}

            <button
              type="submit"
              disabled={enviando}
              className="mt-2 h-16 rounded-lg bg-market text-lg font-bold text-white transition-colors hover:bg-market-dark disabled:opacity-60"
            >
              {enviando ? 'Entrando…' : 'Entrar'}
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}
