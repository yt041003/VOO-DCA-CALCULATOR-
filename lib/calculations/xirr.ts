export type CashFlow = { date: string; amount: number };

const DAY_MS = 86_400_000;

function yearsBetween(first: string, current: string) {
  return (
    (new Date(`${current}T12:00:00Z`).getTime() -
      new Date(`${first}T12:00:00Z`).getTime()) /
    DAY_MS /
    365.2425
  );
}

/** Money-weighted annual return for irregular cash flows, solved by bisection. */
export function calculateXirr(cashFlows: CashFlow[]): number | null {
  if (cashFlows.length < 2) return null;
  const flows = [...cashFlows].sort((a, b) => a.date.localeCompare(b.date));
  if (!flows.some((flow) => flow.amount < 0) || !flows.some((flow) => flow.amount > 0)) {
    return null;
  }

  const npv = (rate: number) =>
    flows.reduce(
      (total, flow) =>
        total + flow.amount / Math.pow(1 + rate, yearsBetween(flows[0].date, flow.date)),
      0,
    );

  let low = -0.9999;
  let high = 10;
  let lowValue = npv(low);
  let highValue = npv(high);
  while (Math.sign(lowValue) === Math.sign(highValue) && high < 1_000_000) {
    high *= 10;
    highValue = npv(high);
  }
  if (!Number.isFinite(lowValue) || !Number.isFinite(highValue) || Math.sign(lowValue) === Math.sign(highValue)) {
    return null;
  }

  for (let iteration = 0; iteration < 200; iteration += 1) {
    const middle = (low + high) / 2;
    const value = npv(middle);
    if (Math.abs(value) < 1e-8) return middle;
    if (Math.sign(value) === Math.sign(lowValue)) {
      low = middle;
      lowValue = value;
    } else {
      high = middle;
    }
  }
  return (low + high) / 2;
}
