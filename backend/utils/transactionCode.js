export function generateTransactionCode(prefix = 'TRX') {
  const ts = Date.now(); // ms timestamp, stable + sortable
  const rand = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  return `${prefix}-${ts}${rand}`;
}

