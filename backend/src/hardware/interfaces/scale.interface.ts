/**
 * RF03 - integração com balança. [Suposição] balança certificada real fica
 * para integração futura; aqui simulamos a leitura de peso.
 */
export interface IScale {
  pesar(): Promise<{ pesoKg: number }>;
}
export const SCALE = 'SCALE';
