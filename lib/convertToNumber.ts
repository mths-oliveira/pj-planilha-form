export function convertToNumber(numero: string) {
  return Number(numero.replace(/[^0-9]/g, "")); // Remove caracteres não numéricos
}
