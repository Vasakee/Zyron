// Helper function to format currency amounts
export function formatCurrencyAmount(amountInCents: number) {
  return {
    amountInCents,
    actualAmount: amountInCents / 100,
  };
}

// Helper function to group amounts by currency
export function groupByCurrency(items: any[], currencyField: string = 'currency', amountField: string = 'amount') {
  const grouped = items.reduce((acc, item) => {
    const currency = item[currencyField];
    const amount = parseInt(String(item[amountField])) || 0;

    if (!acc[currency]) {
      acc[currency] = 0;
    }
    acc[currency] += amount;

    return acc;
  }, {} as Record<string, number>);

  return Object.entries(grouped).map(([currency, amountInCents]) => ({
    currency,
    ...formatCurrencyAmount(Number(amountInCents)),
  }));
}

// Calculate total amount across all currencies (for percentage calculations)
export function getTotalAmount(currencyAmounts: Array<{ amountInCents: number }>) {
  return currencyAmounts.reduce((sum, item) => sum + item.amountInCents, 0);
}
