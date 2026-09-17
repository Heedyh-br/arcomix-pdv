// Formata centavos (inteiro) como "R$ 1.234,56".
export function formatarCentavos(centavos: number): string {
  return (centavos / 100).toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  });
}

// Converte o texto digitado pelo operador (ex.: "150,00", "150", "1.500,5")
// em centavos inteiros. Qualquer caractere que não seja dígito, ponto ou
// vírgula é ignorado; o resultado nunca é negativo.
export function centavosDoTexto(texto: string): number {
  const limpo = texto.replace(/[^\d,.-]/g, '');
  if (!limpo) return 0;
  const normalizado = limpo.replace(/\./g, '').replace(',', '.');
  const valor = Number.parseFloat(normalizado);
  if (Number.isNaN(valor)) return 0;
  return Math.max(0, Math.round(valor * 100));
}
