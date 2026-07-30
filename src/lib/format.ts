/** Every currency figure in the app shows exactly two decimal places, so amounts align in a mono column. */
export function formatMoney(n: number): string {
  return n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}
