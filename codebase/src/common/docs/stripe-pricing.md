# Stripe Pricing Table (`stripe_prices`)

## Managing Prices
- Table: `stripe_prices` (UUID PK, kitType, paymentType, currency, stripePriceId, stripeProductId?, amountMinor, mode, interval?, isActive, description?, timestamps).
- Active lookup uses `(kitType, paymentType, currency)` with `isActive = 1`. Partial unique index enforces only one active row per tuple.
- Toggle prices by setting `isActive` to 0 for the old row and inserting a new row with `isActive` = 1; the unique filter will block multiple actives.

## Enums
- `kitType`: `gut-scan`, `deep-gut`, `deep-gut-plus`
- `paymentType` (`OrderPaymentType` enum): `PLATFORM_ORDER`, `WEBSITE_ORDER`, `KIT_REPLACEMENT_ORDER`
- `currency`: `USD`, `CAD`

## Seeding
- Seed migration reads env price IDs once to backfill rows; extend seeds for new kit/payment/currency combos as needed.

## Runtime
- All checkout and charging flows resolve prices via `StripePriceService.findActivePriceOrThrow`.
- No `.env` price IDs are used at runtime; ensure DB has active rows for required tuples.
