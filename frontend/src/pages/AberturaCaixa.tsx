import { FormEvent, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { abrirCaixa } from '../services/caixa';
import { centavosDoTexto } from '../utils/moeda';
import { Caixa } from '../types/caixa';
import CampoMoeda from '../components/CampoMoeda';

interface AberturaCaixaProps {
  onAberto: (caixa: Caixa) => void;
}

export default function AberturaCaixa({ onAberto }: AberturaCaixaProps) {
  const { usuario, sair } = useAuth();
  const [fundoTroco, setFundoTroco] = useState('');
  const [erro, setErro] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setErro(null);
    setEnviando(true);
    try {
      const caixa = await abrirCaixa(centavosDoTexto(fundoTroco));
      onAberto(caixa);
    } catch (err: any) {
      const status = err?.response?.status;
      if (!err?.response) {
        setErro('Não consegui falar com o servidor. Confira sua conexão.');
      } else if (status === 400) {
        setErro(
          err.response?.data?.message ??
            'Já existe um caixa aberto para este usuário.',
        );
      } else {
        setErro('Não foi possível abrir o caixa. Tente novamente.');
      }
    } finally {
      setEnviando(false);
    }
  }

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-paper px-6 py-12 font-sans">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm"
        aria-label="Abrir caixa"
      >
        <p className="text-sm font-semibold text-market">
          {usuario?.nome} · turno iniciando
        </p>
        <h1 className="mt-1 text-2xl font-bold text-ink">Abertura de caixa</h1>
        <p className="mt-1 text-ink/60">
          Informe o fundo de troco que está na gaveta para começar o turno.
        </p>

        <div className="mt-8 flex flex-col gap-4">
          <CampoMoeda
            label="Fundo de troco inicial"
            value={fundoTroco}
            onChange={setFundoTroco}
            autoFocus
          />

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
            {enviando ? 'Abrindo…' : 'Abrir caixa'}
          </button>

          <button
            type="button"
            onClick={sair}
            className="text-sm font-semibold text-ink/50"
          >
            Sair
          </button>
        </div>
      </form>
    </div>
  );
}
