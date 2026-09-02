import { PaymentStatementItem } from 'src/payment/entity/payment-statement-item.entity';

export async function getCurrencyTotalsForStatement(
  items: PaymentStatementItem[],
): Promise<{ currency: string; amount: number; subAmount: number }[]> {
  const currencyTotals = items.reduce((acc, item) => {
    const total = (item.unitAmount * item.quantity) / 100;
    const subTotal = item.unitAmount * item.quantity;
    const existing = acc.find((c) => c.currency === item.currency);
    if (existing) {
      existing.amount += total;
      existing.subAmount += subTotal;
    } else {
      acc.push({ currency: item.currency, amount: total, subAmount: subTotal });
    }
    return acc;
  }, [] as { currency: string; amount: number; subAmount: number }[]);

  return currencyTotals;
}
