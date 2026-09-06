const lbpNumberFormatter = new Intl.NumberFormat("en-US", {
  maximumFractionDigits: 0,
  useGrouping: true,
});

export function formatLBP(amount: number): string {
  if (!Number.isSafeInteger(amount) || amount < 0) {
    throw new RangeError("LBP amount must be a non-negative safe integer");
  }

  return `${lbpNumberFormatter.format(amount)} L.L.`;
}
