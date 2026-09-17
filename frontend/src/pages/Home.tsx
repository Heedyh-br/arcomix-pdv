import { useAuth } from '../contexts/AuthContext';
import { Caixa } from '../types/caixa';
import { formatarCentavos } from '../utils/moeda';

interface HomeProps {
  caixa: Caixa;
  onIrParaFechamento: () => void;
}

export default function Home({ caixa, onIrParaFechamento }: HomeProps) {
  const { usuario, sair } = useAuth();

  const abertura = new Date(caixa.dataAbertura);

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-paper px-6 py-12 font-sans">
      <div className="w-full max-w-sm text-center">
        <p className="text-sm font-semibold text-market">Turno em andamento</p>
        <h1 className="mt-1 text-2xl font-bold text-ink">
          Olá, {usuario?.nome}
        </h1>

        <div className="mt-6 rounded-lg border-2 border-ink/15 bg-white p-6 text-left">
          <p className="text-sm text-ink/50">Caixa aberto desde</p>
          <p className="text-lg font-semibold text-ink">
            {abertura.toLocaleDateString('pt-BR')} às{' '}
            {abertura.toLocaleTimeString('pt-BR', {
              hour: '2-digit',
              minute: '2-digit',
            })}
          </p>
          <p className="mt-4 text-sm text-ink/50">Fundo de troco</p>
          <p className="text-lg font-semibold text-ink">
            {formatarCentavos(caixa.fundoTrocoCentavos)}
          </p>
        </div>

        <p className="mt-6 text-ink/60">
          Próximo módulo: registro de vendas (RF01–RF07).
        </p>

        <button
          onClick={onIrParaFechamento}
          className="mt-6 h-14 w-full rounded-lg border-2 border-ink/15 font-semibold text-ink/70 hover:border-brick/40 hover:text-brick"
        >
          Fechar caixa
        </button>

        <button
          onClick={sair}
          className="mt-3 text-sm font-semibold text-ink/50"
        >
          Sair
        </button>
      </div>
    </div>
  );
}
