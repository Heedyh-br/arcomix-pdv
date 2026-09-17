import { useEffect, useState } from 'react';
import { useAuth } from './contexts/AuthContext';
import { buscarCaixaAberto } from './services/caixa';
import { Caixa } from './types/caixa';
import Login from './pages/Login';
import AberturaCaixa from './pages/AberturaCaixa';
import Home from './pages/Home';
import FechamentoCaixa from './pages/FechamentoCaixa';
import ResumoFechamento from './pages/ResumoFechamento';

type Tela = 'carregando' | 'abertura' | 'home' | 'fechamento' | 'resumo';

export default function App() {
  const { usuario, carregando } = useAuth();
  const [tela, setTela] = useState<Tela>('carregando');
  const [caixa, setCaixa] = useState<Caixa | null>(null);
  const [caixaFechado, setCaixaFechado] = useState<Caixa | null>(null);
  const [erroCarregamento, setErroCarregamento] = useState<string | null>(null);

  // Ao logar, verifica se o operador já tem um turno em aberto (RF08).
  useEffect(() => {
    if (!usuario) return;
    let cancelado = false;
    setTela('carregando');
    setErroCarregamento(null);

    buscarCaixaAberto()
      .then((atual) => {
        if (cancelado) return;
        setCaixa(atual);
        setTela(atual ? 'home' : 'abertura');
      })
      .catch(() => {
        if (cancelado) return;
        setErroCarregamento(
          'Não consegui verificar o caixa aberto. Tente recarregar a página.',
        );
      });

    return () => {
      cancelado = true;
    };
  }, [usuario]);

  if (carregando) {
    return null;
  }

  if (!usuario) {
    return <Login />;
  }

  if (erroCarregamento) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-paper px-6 font-sans text-ink">
        <p className="max-w-sm text-center text-brick">{erroCarregamento}</p>
      </div>
    );
  }

  if (tela === 'carregando') {
    return null;
  }

  if (tela === 'abertura') {
    return <AberturaCaixa onAberto={(c) => { setCaixa(c); setTela('home'); }} />;
  }

  if (tela === 'fechamento' && caixa) {
    return (
      <FechamentoCaixa
        caixa={caixa}
        onFechado={(c) => { setCaixaFechado(c); setTela('resumo'); }}
        onCancelar={() => setTela('home')}
      />
    );
  }

  if (tela === 'resumo' && caixaFechado) {
    return <ResumoFechamento caixa={caixaFechado} />;
  }

  if (tela === 'home' && caixa) {
    return <Home caixa={caixa} onIrParaFechamento={() => setTela('fechamento')} />;
  }

  return null;
}
