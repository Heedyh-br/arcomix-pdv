import { useAuth } from '../contexts/AuthContext';
import { Caixa } from '../types/caixa';
import { formatarCentavos } from '../utils/moeda';

interface ResumoFechamentoProps {
  caixa: Caixa;
}

const ROTULOS: Record<string, string> = {
  dinheiro: 'Dinheiro',
  debito: 'Débito',
  credito: 'Crédito',
  pix: 'PIX',
};

export default function ResumoFechamento({ caixa }: ResumoFechamentoProps) {
  const { sair } = useAuth();
  const divergencias = caixa.divergencias;
  const temDivergencia =
    divergencias && Object.values(divergencias).some((v) => v !== 0);

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-paper px-6 py-12 font-sans">
      <div className="w-full max-w-sm">
        <h1 className="text-2xl font-bold text-ink">Caixa fechado</h1>
        <p className="mt-1 text-ink/60">
          Conferência entre o que foi contado e o que o sistema registrou.
        </p>

        <div className="mt-6 flex flex-col gap-3">
          {divergencias &&
            Object.entries(divergencias).map(([forma, valor]) => (
              <div
                key={forma}
                className={`flex items-center justify-between rounded-lg border-2 px-4 py-3 ${
                  valor === 0
                    ? 'border-ink/15 bg-white'
                    : 'border-brick/30 bg-brick/10'
                }`}
              >
                <span className="font-semibold text-ink/80">
                  {ROTULOS[forma] ?? forma}
                </span>
                <span
                  className={`font-bold ${valor === 0 ? 'text-ink/60' : 'text-brick'}`}
                >
                  {valor > 0 ? '+' : ''}
                  {formatarCentavos(valor)}
                </span>
              </div>
            ))}
        </div>

        {temDivergencia && (
          <p className="mt-4 text-sm text-brick">
            Há diferença entre o contado e o registrado em pelo menos uma
            forma de pagamento. Vale conferir antes de encerrar o turno.
          </p>
        )}

        <button
          onClick={sair}
          className="mt-8 h-14 w-full rounded-lg bg-market text-lg font-bold text-white hover:bg-market-dark"
        >
          Concluir
        </button>
      </div>
    </div>
  );
}
