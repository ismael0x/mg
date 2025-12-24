
export const formatCurrency = (amount: number, currency: string = 'DH'): string => {
  return new Intl.NumberFormat('fr-FR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount) + ' ' + currency;
};

export const numberToFrenchWords = (n: number): string => {
  const units = ['', 'un', 'deux', 'trois', 'quatre', 'cinq', 'six', 'sept', 'huit', 'neuf'];
  const teens = ['dix', 'onze', 'douze', 'treize', 'quatorze', 'quinze', 'seize', 'dix-sept', 'dix-huit', 'dix-neuf'];
  const tens = ['', 'dix', 'vingt', 'trente', 'quarante', 'cinquante', 'soixante', 'soixante-dix', 'quatre-vingts', 'quatre-vingt-dix'];

  if (n === 0) return 'zéro';

  function convert(n: number): string {
    if (n < 10) return units[n];
    if (n < 20) return teens[n - 10];
    if (n < 100) {
      const unit = n % 10;
      const ten = Math.floor(n / 10);
      if (ten === 7 || ten === 9) {
          return tens[ten - 1] + (unit === 1 ? ' et ' : '-') + convert(unit + 10);
      }
      return tens[ten] + (unit === 0 ? '' : (unit === 1 ? ' et un' : '-' + units[unit]));
    }
    if (n < 1000) {
      const hundred = Math.floor(n / 100);
      const remainder = n % 100;
      const hundredStr = hundred === 1 ? 'cent' : units[hundred] + ' cents';
      return hundredStr + (remainder === 0 ? '' : ' ' + convert(remainder));
    }
    if (n < 1000000) {
      const thousand = Math.floor(n / 1000);
      const remainder = n % 1000;
      const thousandStr = thousand === 1 ? 'mille' : convert(thousand) + ' mille';
      return thousandStr + (remainder === 0 ? '' : ' ' + convert(remainder));
    }
    return n.toString(); // Fallback for very large numbers
  }

  const integerPart = Math.floor(n);
  const decimalPart = Math.round((n - integerPart) * 100);

  let result = convert(integerPart) + ' dirhams';
  if (decimalPart > 0) {
    result += ' et ' + convert(decimalPart) + ' centimes';
  } else {
    result += ' pile';
  }

  return result.charAt(0).toUpperCase() + result.slice(1);
};
