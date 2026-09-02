import { DateTime } from 'luxon';
import { BILLING_PERIOD_START_DAY, SYSTEM_TIME_ZONE } from 'src/config';

type BillingLabel = {
  labelMonth: number;
  labelYear: number;
  labelText: string; // "Oct, 2025"
  labelWindowText: string; // "Sep 26 - Oct 25, 2025"
};

export type Bucket = { currency: string; amount: number; subAmount: number };

export function getCurrentBillingWindowWithLabelFromNYToUTC(
  nowNY = DateTime.now().setZone(SYSTEM_TIME_ZONE || 'America/New_York'),
) {
  const day = nowNY.day;
  const billingStartDay = parseInt(BILLING_PERIOD_START_DAY || '26', 10);
  const billingEndDay = billingStartDay - 1; // Day before start (was 25)

  // Active window: billingStartDay → billingEndDay (NY time)
  const startNY =
    day >= billingStartDay
      ? nowNY.set({ day: billingStartDay }).startOf('day')
      : nowNY.minus({ months: 1 }).set({ day: billingStartDay }).startOf('day');

  const endNY =
    day >= billingStartDay
      ? nowNY.plus({ months: 1 }).set({ day: billingEndDay }).endOf('day')
      : nowNY.set({ day: billingEndDay }).endOf('day');

  const label: BillingLabel = {
    labelMonth: endNY.month,
    labelYear: endNY.year,
    labelText: endNY.toFormat('LLL, yyyy'),
    labelWindowText: `${startNY.toFormat('LLL d')} - ${endNY.toFormat(
      'LLL d, yyyy',
    )}`,
  };

  return {
    startUTC: startNY.toUTC().set({ hour: 0 }).toJSDate(),
    endUTC: endNY.toUTC().set({ hour: 0 }).toJSDate(),
    label,
  };
}
