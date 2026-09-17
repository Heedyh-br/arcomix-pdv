import { FormEvent, useState } from 'react';
import { fecharCaixa } from '../services/caixa';
import { centavosDoTexto, formatarCentavos } from '../utils/moeda';
import { Caixa } from '../types/caixa';
import CampoMoeda from '../components/CampoMoeda';

interface FechamentoCaixaProps {
  caixa: Caixa;
  onFechado: (caixa: Caixa) => void;
  onCancelar: () => void;
}

export default function FechamentoCaixa({
  caixa,
  onFechado,
  onCancelar,
}: FechamentoCaixaProps) {
  const [dinheiro, setDinheiro] = useState('');
  const [debito, setDebito] = useState('');
  const [credito, setCredito] = useState('');
  const [pix, setPix] = useState('');
  const [erro, setErro] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setErro(null);
    setEnviando(true);
    try {
      const fechado = await fecharCaixa(caixa.id, {
        dinheiroContado: centavosDoTexto(dinheiro),
        debitoContado: centavosDoTexto(debito),
        creditoContado: centavosDoTexto(credito),
        pixContado: centavosDoTexto(pix),
      });
      onFechado(fechado);
    } catch (err: any) {
      if (!err?.response) {
        setErro('Não consegui falar com o servidor. Confira sua conexão.');
      } else {
        setErro(
          err.response?.data?.message ??
            'Não foi possível fechar o caixa. Tente novamente.',
        );
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
        aria-label="Fechar caixa"
      >
        <h1 className="text-2xl font-bold text-ink">Fechamento de caixa</h1>
        <p className="mt-1 text-ink/60">
          Conte fisicamente o que está na gaveta e informe abaixo, por forma
          de recebimento.
        </p>
        <p className="mt-3 text-sm text-ink/50">
          Fundo de troco na abertura: {formatarCentavos(caixa.fundoTrocoCentavos)}
        </p>

        <div className="mt-6 flex flex-col gap-4">
          <CampoMoeda label="Dinheiro contado" value={dinheiro} onChange={setDinheiro} autoFocus />
          <CampoMoeda label="Débito contado" value={debito} onChange={setDebito} />
          <CampoMoeda label="Crédito contado" value={credito} onChange={setCredito} />
          <CampoMoeda label="PIX contado" value={pix} onChange={setPix} />

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
            {enviando ? 'Fechando…' : 'Fechar caixa'}
          </button>

          <button
            type="button"
            onClick={onCancelar}
            className="text-sm font-semibold text-ink/50"
          >
            Voltar
          </button>
        </div>
      </form>
    </div>
  );
}
