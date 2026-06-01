/**
 * Utilidades para el manejo y validación del RUT Chileno
 */

/**
 * Elimina puntos, guiones y espacios del RUT, dejando solo números y la letra K.
 */
export function cleanRut(rut: string): string {
  if (typeof rut !== 'string') return '';
  return rut.replace(/[^0-9kK]/g, '').toUpperCase();
}

/**
 * Formatea un RUT a su representación visual estándar XX.XXX.XXX-X
 */
export function formatRut(rut: string): string {
  const cleaned = cleanRut(rut);
  if (cleaned.length <= 1) return cleaned;

  const body = cleaned.slice(0, -1);
  const dv = cleaned.slice(-1);

  let formatted = '';
  let i = body.length;
  let j = 0;

  while (i > 0) {
    const char = body.charAt(i - 1);
    formatted = char + formatted;
    if (j % 3 === 2 && i > 1) {
      formatted = '.' + formatted;
    }
    j++;
    i--;
  }

  return `${formatted}-${dv}`;
}

/**
 * Valida un RUT chileno utilizando el algoritmo Módulo 11
 */
export function validateRut(rut: string): boolean {
  const cleaned = cleanRut(rut);
  if (cleaned.length < 8 || cleaned.length > 9) return false;

  const body = cleaned.slice(0, -1);
  const dv = cleaned.slice(-1);

  // Validar que el cuerpo sean solo dígitos
  if (!/^\d+$/.test(body)) return false;

  let sum = 0;
  let multiplier = 2;

  for (let i = body.length - 1; i >= 0; i--) {
    sum += parseInt(body.charAt(i), 10) * multiplier;
    multiplier = multiplier === 7 ? 2 : multiplier + 1;
  }

  const dvr = 11 - (sum % 11);
  let dvExpected = '';

  if (dvr === 11) {
    dvExpected = '0';
  } else if (dvr === 10) {
    dvExpected = 'K';
  } else {
    dvExpected = String(dvr);
  }

  return dvExpected === dv;
}
