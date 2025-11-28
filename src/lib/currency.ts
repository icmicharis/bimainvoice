import { Currency } from '@/types/invoice';

export const currencySymbols: Record<Currency, string> = {
  USD: '$',
  EUR: '€',
  JPY: '¥',
  GBP: '£',
  AUD: 'A$',
  CAD: 'C$',
  CHF: 'CHF',
  CNH: '¥',
  HKD: 'HK$',
  NZD: 'NZ$',
  KSH: 'KSh',
  NGN: '₦',
};

export function formatCurrency(amount: number, currency: Currency): string {
  const symbol = currencySymbols[currency];
  const formatted = amount.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  return `${symbol} ${formatted}`;
}

export function numberToWords(num: number): string {
  if (num === 0) return 'Zero';

  const ones = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine'];
  const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
  const teens = ['Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];

  function convertHundreds(n: number): string {
    if (n === 0) return '';
    if (n < 10) return ones[n];
    if (n < 20) return teens[n - 10];
    if (n < 100) return tens[Math.floor(n / 10)] + (n % 10 ? ' ' + ones[n % 10] : '');
    return ones[Math.floor(n / 100)] + ' Hundred' + (n % 100 ? ' and ' + convertHundreds(n % 100) : '');
  }

  const [intPart, decPart] = num.toFixed(2).split('.');
  const intNum = parseInt(intPart);

  let result = '';

  if (intNum >= 1000000) {
    result += convertHundreds(Math.floor(intNum / 1000000)) + ' Million ';
  }
  if (intNum >= 1000) {
    result += convertHundreds(Math.floor((intNum % 1000000) / 1000)) + ' Thousand ';
  }
  result += convertHundreds(intNum % 1000);

  if (parseInt(decPart) > 0) {
    result += ' and ' + decPart + '/100';
  }

  return result.trim();
}
