interface CampoMoedaProps {
  label: string;
  value: string;
  onChange: (valor: string) => void;
  autoFocus?: boolean;
}

// Campo de texto para valores em reais. Mantém o texto livre (o operador
// digita "150,00" ou "150") — a conversão pra centavos acontece no submit,
// via utils/moeda.ts, então não brigamos com o cursor a cada tecla.
export default function CampoMoeda({
  label,
  value,
  onChange,
  autoFocus,
}: CampoMoedaProps) {
  return (
    <label className="flex flex-col gap-2">
      <span className="text-sm font-semibold text-ink/80">{label}</span>
      <div className="relative">
        <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 font-semibold text-ink/40">
          R$
        </span>
        <input
          type="text"
          inputMode="decimal"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          autoFocus={autoFocus}
          placeholder="0,00"
          className="h-14 w-full rounded-lg border-2 border-ink/15 bg-white pl-12 pr-4 text-lg text-ink outline-none focus:border-market"
        />
      </div>
    </label>
  );
}
