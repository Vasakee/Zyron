# Internal API Endpoint Details

Goal: endpoint-level map for internal controllers. For full schemas, use `/docs`.

## Conventions
- Base path is `/api/v1` unless noted.
- Most endpoints return `successResponse` with `{ message, code, status, data }`.
- Auth: `x-access-token` header for user-authenticated routes unless noted.
- Admin-only routes use `RolesGuard` with `Roles('admin')`.

## Common response shapes

Success wrapper (most controllers):
```json
{
  "message": "Human readable message",
  "code": 200,
  "status": "success",
  "data": {}
}
```

Validation error (from `AllExceptionsFilter`):
```json
{
  "status": "error",
  "message": "First validation message",
  "data": ["All validation messages"]
}
```

Unauthorized/forbidden errors typically return:
```json
{
  "status": "error",
  "message": "Your access token is either expired or invalid"
}
```

## Related domain docs
- Auth: `src/docs/domains/auth.md`
- Users: `src/docs/domains/users.md`
- Practitioners: `src/docs/domains/practitioners.md`
- Kits: `src/docs/domains/kits.md`
- Orders: `src/docs/domains/orders.md`
- Payments: `src/docs/domains/payments.md`
- Billing: `src/docs/domains/billing.md`
- Reporting: `src/docs/domains/reporting.md`
- Support: `src/docs/domains/support.md`
- Mail: `src/docs/domains/mail.md`
- Contact messages: `src/docs/domains/contact-messages.md`
- Health info: `src/docs/domains/health-info.md`
- Vaari: `src/docs/domains/vaari.md`
- Admin: `src/docs/domains/admin.md`

## Examples

Create user:
```http
POST /api/v1/users
Content-Type: application/json

{
  "firstName": "Jane",
  "lastName": "Doe",
  "email": "jane@example.com",
  "password": "secret"
}
```

Create order (pay-as-you-go):
```http
POST /api/v1/orders
x-access-token: <jwt>
Content-Type: application/json

{
  "firstName": "Jane",
  "lastName": "Doe",
  "email": "jane@example.com",
  "country": "US",
  "addressLineOne": "123 Main St",
  "city": "New York",
  "state": "NY",
  "postalCode": "10001",
  "quantity": 1,
  "orderType": "pay_as_you_go",
  "currency": "usd",
  "kitType": "gut-scan"
}
```

Update kit status (internal):
```http
PUT /api/v1/kits/status/<kitId>
x-access-token: <jwt>
Content-Type: application/json

{
  "status": "awaiting-result"
}
```

Stripe webhook:
```http
POST /api/v1/payment/webhook
stripe-signature: <sig>
Content-Type: application/json

{ ...stripe payload... }
```

## Swagger alignment notes
- External APIs (`/api/v1/external/*`) have Swagger tags and operations; see `src/auth-external/auth-external.controller.ts` and `src/order-external/order-external.controller.ts`.
- Reporting endpoints include `@ApiResponse` annotations for some routes; others rely on DTOs and defaults.
- Many internal controllers (users, orders, kits, practitioners, support) have minimal Swagger decorators; use DTO schema sections in domain docs for request bodies.

## App
Source: `src/app.controller.ts`

| Method | Path | Auth | Body/Query | Notes |
| --- | --- | --- | --- | --- |
| GET | `/api/v1/` | none | none | Returns a plain string health message. |
| GET | `/api/v1/health/:page` | none | path param `page` | Simple health probe by page. |

## Admin
Source: `src/admin/admin.controller.ts`

| Method | Path | Auth | Body/Query | Notes |
| --- | --- | --- | --- | --- |
| POST | `/api/v1/admins` | none | `CreateAdminDto` | Create admin account. |
| GET | `/api/v1/admins` | `x-access-token` | `AdminQueryDto`, `PageOptionsDto` | List admins. |
| PUT | `/api/v1/admins` | `x-access-token` | `UpdateAdminAccountDto` | Update current admin account. |
| PUT | `/api/v1/admins/:adminId` | `x-access-token` | `UpdateAdminDto` | Update admin by id. |

## Users
Source: `src/user/user.controller.ts`

| Method | Path | Auth | Body/Query | Notes |
| --- | --- | --- | --- | --- |
| POST | `/api/v1/users` | none | `CreateCustomerAccountDto` | Signup. |
| POST | `/api/v1/users/login` | none | `LoginAccountDto` | Login. |
| GET | `/api/v1/users` | `x-access-token` | none | List users. |
| GET | `/api/v1/users/profile` | `x-access-token` | none | Current user profile. |
| GET | `/api/v1/users/:id` | `x-access-token` | none | Get user by id. |
| PUT | `/api/v1/users` | `x-access-token` | `UpdateCustomerAccountDto` | Update current user. |
| PUT | `/api/v1/users/password` | `x-access-token` | `UpdatePasswordDto` | Update password. |
| PUT | `/api/v1/users/change-password` | `x-access-token` | `ChangePasswordDto` | Change password (old + new). |
| POST | `/api/v1/users/forgot-password` | none | `ForgotPasswordDTO` | Sends reset email. |
| POST | `/api/v1/users/reset-password/:token` | none | `ResetPasswordDTO` | Reset password by token. |
| POST | `/api/v1/users/create-password/:token` | none | `ResetPasswordDTO` | Create password from invite token. |
| POST | `/api/v1/users/resend-token` | none | `ResendValidationTokenDto` | Resend validation token. |
| POST | `/api/v1/users/validate-account` | none | `ValidateAccountDto` | Validate account. |
| POST | `/api/v1/users/complete-registration` | `x-access-token` | `CompleteClientRegistrationDto` | Complete registration. |
| POST | `/api/v1/users/resend-new-platform-password` | none | `ForgotPasswordDTO` | New platform reset email. |
| POST | `/api/v1/users/reset-new-platform-password/:token` | none | `ResetNewPlatformPasswordDTO` | Reset password by token. |
| POST | `/api/v1/users/initiate-transfer` | `x-access-token` | `InitiateTransferDTO` | Start account transfer. |
| POST | `/api/v1/users/verify-transfer` | none | `VerifyTransferDTO` | Verify transfer. |
| POST | `/api/v1/users/complete-transfer` | none | `CompleteTransferDTO` | Complete transfer. |
| POST | `/api/v1/users/monthly-billing-access` | admin | `SetMonthlyBillingAccessDto` | Enable/disable monthly billing for email. |
| POST | `/api/v1/users/monthly-billing-access/bulk` | admin | `BulkMonthlyBillingAccessDto` + file | Bulk enable/disable. |

## Practitioners
Source: `src/practitioner/practitioner.controller.ts`

| Method | Path | Auth | Body/Query | Notes |
| --- | --- | --- | --- | --- |
| POST | `/api/v1/practitioners` | none | `CreatePractitionerAccountDto` | Signup. |
| POST | `/api/v1/practitioners/create-client` | `x-access-token` | `CreateClienttDto` | Create client under practitioner. |
| POST | `/api/v1/practitioners/send-info` | `x-access-token` | `SendInfoDto` | Send health info. |
| GET | `/api/v1/practitioners` | `x-access-token` | `PractitionerPageOptionsDto`, `PractitionerQueryDto` | List practitioners. |
| PUT | `/api/v1/practitioners/status/:id` | `x-access-token` | `UpdatePractitionerAccountStatusDto` | Update practitioner status. |
| PUT | `/api/v1/practitioners` | `x-access-token` | `UpdatePractitionerAccountDto` | Update current practitioner. |
| PUT | `/api/v1/practitioners/:id` | `x-access-token` | `UpdatePractitionerAccountDto` | Update by id. |
| POST | `/api/v1/practitioners/bulk` | `x-access-token` | `csvFile` | Bulk upload via CSV. |
| POST | `/api/v1/practitioners/resend-invites` | `x-access-token` | `{ email }` | Resend invite email. |

## Kits
Source: `src/kit/kit.controller.ts`

| Method | Path | Auth | Body/Query | Notes |
| --- | --- | --- | --- | --- |
| POST | `/api/v1/kits` | `x-access-token` | `CreateKitDto` | Register kit (current user). |
| POST | `/api/v1/kits/practitioner-kit` | `x-access-token` | `RegisterPractitionerKitDto` | Register practitioner kit. |
| GET | `/api/v1/kits/user-kits` | `x-access-token` | `PageOptionsDto`, `KitQueryDto` | List current user kits. |
| GET | `/api/v1/kits` | `x-access-token` | `PageOptionsDto`, `KitQueryDto` | List all kits. |
| GET | `/api/v1/kits/single/:id` | `x-access-token` | none | Get kit by id. |
| GET | `/api/v1/kits/singlekit/:id` | none | none | Public-like get by id. |
| GET | `/api/v1/kits/practitioner-kits` | `x-access-token` | `PageOptionsDto`, `KitQueryDto` | Kits for current practitioner. |
| GET | `/api/v1/kits/all-practitioner-kits/:practitionerId` | `x-access-token` | `PageOptionsDto`, `KitQueryDto` | Kits for practitioner id. |
| PUT | `/api/v1/kits/:id` | `x-access-token` | `UpdateKitDto` | Update kit by id. |
| PUT | `/api/v1/kits/status/:kitId` | `x-access-token` | `UpdateKitStatusDto` | Update kit status. |
| PUT | `/api/v1/kits/external/status/:kitId` | `x-api-key` | `UpdateKitStatusDto` | External status update (API key). |
| PUT | `/api/v1/kits/practitioner-status/:kitId` | `x-access-token` | `UpdateKitStatusDto` | Update practitioner kit status. |
| PATCH | `/api/v1/kits/lock-status/:kitId` | `x-access-token` | none | Toggle lock status. |
| DELETE | `/api/v1/kits/:id` | `x-access-token` | none | Delete kit. |
| GET | `/api/v1/kits/family-kits` | `x-access-token` | `PageOptionsDto`, `KitQueryDto` | Family kits for user. |
| GET | `/api/v1/kits/old-practitioner-kits` | `x-access-token` | `PageOptionsDto`, `KitQueryDto` | Legacy practitioner kits. |
| GET | `/api/v1/kits/get-name/:kitId` | none | none | Lookup kit name. |
| PUT | `/api/v1/kits/complete-process/:kitId` | `x-access-token` | `CompleteReportDto` | Mark report complete. |
| PUT | `/api/v1/kits/update-sample-collection-date/:kitId` | `x-access-token` | `UpdateDateOfSampleCollectionDto` | Update collection date. |
| PUT | `/api/v1/kits/practitioner-kit-name` | admin | `UpdatePractitionerKitNameDto` | Update practitioner kit name. |
| POST | `/api/v1/kits/transfer` | admin | `TransferKitDto` | Transfer kit to practitioner. |

## Valid Kits
Source: `src/validKit/valid-kit.controller.ts`

| Method | Path | Auth | Body/Query | Notes |
| --- | --- | --- | --- | --- |
| POST | `/api/v1/validKits/bulk` | `x-access-token` | `csvFile` | Bulk upload valid kits. |
| GET | `/api/v1/validKits` | `x-access-token` | `PageOptionsDto` | List valid kits. |

## Orders
Source: `src/order/order.controller.ts`

| Method | Path | Auth | Body/Query | Notes |
| --- | --- | --- | --- | --- |
| POST | `/api/v1/orders` | `x-access-token` | `OrderDto` | Create order (guarded by monthly billing access). |
| POST | `/api/v1/orders/save` | `x-access-token` | `SaveOrderDto` | Save order without payment flow. |
| GET | `/api/v1/orders` | `x-access-token` | `PageOptionsDto`, `OrdersQueryDto` | List orders (optionally filtered). |
| GET | `/api/v1/orders/customer-orders` | `x-access-token` | `PageOptionsDto`, `OrdersQueryDto` | Website orders. |
| GET | `/api/v1/orders/waitlist-orders` | `x-access-token` | `PageOptionsDto`, `OrdersQueryDto` | Waitlist orders. |
| GET | `/api/v1/orders/practitioner-orders` | `x-access-token` | `PageOptionsDto`, `OrdersQueryDto` | Practitioner orders. |
| GET | `/api/v1/orders/practitioner-waitlist-orders` | `x-access-token` | `PageOptionsDto`, `OrdersQueryDto` | Practitioner waitlist orders. |
| GET | `/api/v1/orders/order-kits/:orderId` | `x-access-token` | `PageOptionsDto`, `OrdersKitQueryDto` | Order kit list. |
| GET | `/api/v1/orders/paidOrder` | `x-access-token` | none | Paid order discrepancies report. |
| GET | `/api/v1/orders/pending-order/:id` | `x-access-token` | none | Generate payment link. |
| PUT | `/api/v1/orders/:id` | `x-access-token` | `UpdateOrderDto` | Update order. |
| PATCH | `/api/v1/orders/:id/cancel` | admin | none | Cancel order. |
| PUT | `/api/v1/orders/shipping/:id` | `x-access-token` | `UpdateShippingDto` | Update shipping info. |
| POST | `/api/v1/orders/waitlist` | none | `ShotgunWaitlistDto` | Join waitlist. |
| POST | `/api/v1/orders/complete-waitlist-payment` | none | `PaymentLinkTestDto` | Generate second payment link. |
| POST | `/api/v1/orders/consent-acceptance` | none | `ConsentAcceptanceDto` | Save consent and payment method. |
| GET | `/api/v1/orders/consent-decision/:sessionId` | none | path param | Consent decision + checkout session. |
| GET | `/api/v1/orders/send-reminders` | none | none | Trigger reminder emails. |
| DELETE | `/api/v1/orders/:id` | `x-access-token` | none | Delete order. |

## Payments
Source: `src/payment/controllers/payment.controller.ts`

| Method | Path | Auth | Body/Query | Notes |
| --- | --- | --- | --- | --- |
| POST | `/api/v1/payment/webhook` | Stripe | raw payload | Stripe webhook handler. |
| POST | `/api/v1/payment/charge-payment-method` | `x-access-token` | `PaymentDto` | Charge saved method. |
| GET | `/api/v1/payment/payment-methods` | `x-access-token` | none | List payment methods. |
| DELETE | `/api/v1/payment/payment-methods/:id` | `x-access-token` | none | Delete method. |
| POST | `/api/v1/payment/payment-methods/:id/set-default` | `x-access-token` | none | Set default method. |
| POST | `/api/v1/payment/setup-intent` | `x-access-token` | none | Create setup intent. |
| POST | `/api/v1/payment/payment-methods/confirm` | `x-access-token` | `ConfirmPaymentMethodDto` | Confirm and save method. |

## Reporting
Source: `src/reporting/reporting.controller.ts`

All reporting endpoints require admin role unless noted.

| Method | Path | Auth | Body/Query | Notes |
| --- | --- | --- | --- | --- |
| GET | `/api/v1/reporting/orders` | admin | `PageOptionsDto` | Order report. |
| GET | `/api/v1/reporting/orders/summary` | admin | none | Order summary. |
| GET | `/api/v1/reporting/transactions` | admin | `PageOptionsDto` | Transaction report. |
| GET | `/api/v1/reporting/transactions/reconciliation` | admin | none | Transaction reconciliation. |
| GET | `/api/v1/reporting/transactions/summary` | admin | none | Transaction summary. |
| GET | `/api/v1/reporting/statements` | admin | `PageOptionsDto` | Statement report. |
| GET | `/api/v1/reporting/statements/rollup/practitioner` | admin | none | Rollup by practitioner. |
| GET | `/api/v1/reporting/statements/rollup/month` | admin | none | Rollup by month. |
| GET | `/api/v1/reporting/statements/rollup/currency` | admin | none | Rollup by currency. |
| GET | `/api/v1/reporting/payment-statements` | admin | `PageOptionsDto`, `PaymentStatementQueryDto` | Payment statements. |
| GET | `/api/v1/reporting/payment-statements/summary` | admin | `PaymentStatementQueryDto` | Payment statement summary. |
| GET | `/api/v1/reporting/payment-statements/status-summary` | admin | `PaymentStatementQueryDto` | Status summary. |
| GET | `/api/v1/reporting/payment-statements/statistics` | `x-access-token` | `PaymentStatementQueryDto` | Statistics (no role guard on method). |
| GET | `/api/v1/reporting/admin/monthly-statements` | admin | `PageOptionsDto`, `MonthlyStatementQueryDto` | Admin monthly statements. |
| GET | `/api/v1/reporting/practitioner/monthly-statements` | `x-access-token` | `PageOptionsDto`, `MonthlyStatementQueryDto` | Practitioner monthly statements. |

## Sample Reports
Source: `src/testkit-sample-reports/controllers/sample-report.controller.ts`

| Method | Path | Auth | Body/Query | Notes |
| --- | --- | --- | --- | --- |
| POST | `/api/v1/sample-reports` | none | `SendSampleReportDto` | Send sample report email. |

## Support
Source: `src/support/support.controller.ts`

| Method | Path | Auth | Body/Query | Notes |
| --- | --- | --- | --- | --- |
| POST | `/api/v1/supports` | `x-access-token` | `SupportDto` | Create support case. |
| GET | `/api/v1/supports` | `x-access-token` | `PageOptionsDto`, `SupportQueryDto` | List cases. |
| GET | `/api/v1/supports/:id` | `x-access-token` | none | Get case by id. |
| PUT | `/api/v1/supports/:id` | `x-access-token` | `UpdateSupportDto` | Update case status. |
| PUT | `/api/v1/supports/assign/:id` | `x-access-token` | `UpdateSupportDto` | Assign case. |
| POST | `/api/v1/supports/messages` | `x-access-token` | `SupportMessageDto` | Send support message. |

## Mail
Source: `src/mail/mail.controller.ts`

| Method | Path | Auth | Body/Query | Notes |
| --- | --- | --- | --- | --- |
| POST | `/api/v1/mail/inbound` | none | webhook payload | Inbound mail webhook (Mailgun/Postmark). |

## Contact Messages
Source: `src/contact-message/contact-message.controller.ts`

| Method | Path | Auth | Body/Query | Notes |
| --- | --- | --- | --- | --- |
| POST | `/api/v1/contacts` | none | `CreateContactMessageDto` + optional file | Multipart form data. |
| GET | `/api/v1/contacts` | `x-access-token` | none | List contact submissions. |
| GET | `/api/v1/contacts/:id` | `x-access-token` | path param | Get contact submission. |

## Feedback
Source: `src/feedback/feedback.controller.ts`

| Method | Path | Auth | Body/Query | Notes |
| --- | --- | --- | --- | --- |
| POST | `/api/v1/feedback` | none | `CreateFeedbackDto` | Submit feedback. |
| GET | `/api/v1/feedback` | `x-access-token` | `PageOptionsDto`, `FeedBackQueryDto` | List feedback. |

## Tutorials
Source: `src/tutorials/tutorial.controller.ts`

| Method | Path | Auth | Body/Query | Notes |
| --- | --- | --- | --- | --- |
| POST | `/api/v1/tutorials` | `x-access-token` | `UploadTutorialDto` + file | Multipart upload. |
| GET | `/api/v1/tutorials` | `x-access-token` | `PageOptionsDto`, `TutorialsQueryDto` | List tutorials. |
| GET | `/api/v1/tutorials/:id` | `x-access-token` | none | Get tutorial by id. |
| POST | `/api/v1/tutorials/:id` | `x-access-token` | `UpdateTutorialDto` + optional file | Update tutorial. |
| DELETE | `/api/v1/tutorials/:id` | `x-access-token` | none | Delete tutorial. |

## Health Info
Source: `src/health-info/health-info.controller.ts`

| Method | Path | Auth | Body/Query | Notes |
| --- | --- | --- | --- | --- |
| GET | `/api/v1/health-info/:kitId` | none | path param | Get kit questionnaire responses. |
| POST | `/api/v1/health-info/response` | none | `addQuestionResponseDto` | Add response. |
| POST | `/api/v1/health-info/submitted` | none | `setSubmittedDto` | Set submitted status. |
| POST | `/api/v1/health-info/agreement` | none | `SetAgreementDto` | Store agreement status. |

## Health Info SSE
Source: `src/health-info/health-info-sse.controller.ts`

| Method | Path | Auth | Body/Query | Notes |
| --- | --- | --- | --- | --- |
| GET | `/api/v1/sse/health-info/stream` | none | `kitId`, `userId` query | SSE stream; returns event stream. |
| POST | `/api/v1/sse/health-info/add_question_response` | none | {kitId, categoryId, questionResponse, completed?, userId?} | Updates cached response + broadcasts. |
| POST | `/api/v1/sse/health-info/add_bulk_responses` | none | {kitId, responses, userId?} | Bulk update. |
| POST | `/api/v1/sse/health-info/set_submitted` | none | {kitId, submitted, userId?} | Set submitted flag. |
| POST | `/api/v1/sse/health-info/set_agreement` | none | {kitId, acceptedTerms?, acceptedPolicy?, userId?} | Set agreement. |
| POST | `/api/v1/sse/health-info/reset_response` | none | {kitId, userId?} | Reset response state. |
| POST | `/api/v1/sse/health-info/get` | none | {kitId} | Push current state to SSE. |
| POST | `/api/v1/sse/health-info/get_room_info` | none | {kitId} | Push room info to SSE. |

## Vaari Customer Profiles
Source: `src/vaari/controllers/customer-profiles.controller.ts`

| Method | Path | Auth | Body/Query | Notes |
| --- | --- | --- | --- | --- |
| POST | `/api/v1/vaari/customer-profiles` | `x-access-token` | `CreateCustomerProfileDto` | Create profile for current user. |
| GET | `/api/v1/vaari/customer-profiles` | `x-access-token` | `PageOptionsDto`, `search` | List profiles for user. |
| GET | `/api/v1/vaari/customer-profiles/:id` | `x-access-token` | path param | Get profile by id. |
| GET | `/api/v1/vaari/customer-profiles/kit/:kitId` | `x-access-token` | path param | Get profile by kit id. |
| PATCH | `/api/v1/vaari/customer-profiles/:kitId/status` | `x-access-token` | `UpdateCustomerProfileStatusDto` | Update status by kit id. |
| GET | `/api/v1/vaari/customer-profiles/check-kit-validity/:kitId` | `x-access-token` | path param | Check kit validity. |
| DELETE | `/api/v1/vaari/customer-profiles/:id` | `x-access-token` | path param | Delete profile. |

## Vaari Customer Profiles (Admin)
Source: `src/vaari/controllers/customer-profiles.admin.controller.ts`

| Method | Path | Auth | Body/Query | Notes |
| --- | --- | --- | --- | --- |
| POST | `/api/v1/vaari/customer-profiles/admin` | `x-access-token` | `CreateCustomerProfileDto` | Admin create profile. |
| GET | `/api/v1/vaari/customer-profiles/admin/check-kit-validity/:kitId` | `x-access-token` | path param | Check kit validity. |
| GET | `/api/v1/vaari/customer-profiles/admin/all` | `x-access-token` | `PageOptionsDto`, `search` | List all profiles. |
| PATCH | `/api/v1/vaari/customer-profiles/admin/:kitId/status` | `x-access-token` | `UpdateCustomerProfileStatusDto` | Update status by kit id. |

## Vaari Usage
Source: `src/vaari/controllers/vaari-usage.controller.ts`

| Method | Path | Auth | Body/Query | Notes |
| --- | --- | --- | --- | --- |
| GET | `/api/v1/vaari/usage/weekly` | `x-access-token` | none | Weekly summary for current user. |
| GET | `/api/v1/vaari/usage/analytics/series` | `x-access-token` | `UsageSeriesDto` | Usage series charts. |
| GET | `/api/v1/vaari/usage/analytics/table` | `x-access-token` | `UsageTableQueryDto` | Admin usage table. |
| POST | `/api/v1/vaari/usage` | `x-access-token` | `CreateUsageDto` | Create usage record. |
| GET (SSE) | `/api/v1/vaari/usage/events` | none | none | SSE stream. |

## Vaari Analysis SSE
Source: `src/vaari/controllers/vaari-analysis-sse.controller.ts`

| Method | Path | Auth | Body/Query | Notes |
| --- | --- | --- | --- | --- |
| GET | `/api/v1/sse/vaari-analysis/stream` | none | `kitId` query | SSE stream. |
| POST | `/api/v1/sse/vaari-analysis/generate` | none | {kitId} | Set generating status and broadcast. |
| POST | `/api/v1/sse/vaari-analysis/get` | none | {kitId} | Push current analysis state. |
| POST | `/api/v1/sse/vaari-analysis/update` | none | {kitId, analysis} | Update analysis state. |
| POST | `/api/v1/sse/vaari-analysis/delete` | none | {kitId} | Delete analysis state. |

## Queues
Source: `src/queues/controllers/queue.controller.ts`

| Method | Path | Auth | Body/Query | Notes |
| --- | --- | --- | --- | --- |
| GET | `/api/v1/queues/stats` | `x-access-token` | none | Queue statistics. |
| POST | `/api/v1/queues/:queueName/pause` | `x-access-token` | none | Pause queue. |
| POST | `/api/v1/queues/:queueName/resume` | `x-access-token` | none | Resume queue. |

## Jobs
Source: `src/queues/controllers/job.controller.ts`

| Method | Path | Auth | Body/Query | Notes |
| --- | --- | --- | --- | --- |
| GET | `/api/v1/jobs/run/test` | `x-access-token` | none | Enqueue test job. |
| GET | `/api/v1/jobs/run/stripe-upsert-sessions` | `x-access-token` | `StripeUpsertSessionsQueryDto` | Upsert Stripe sessions. |
| GET | `/api/v1/jobs/run/stripe-enrich-transactions` | `x-access-token` | none | Enrich Stripe transactions. |
| GET | `/api/v1/jobs/run/stripe-fix-order-payment-urls` | `x-access-token` | `FixOrderPaymentUrlsQueryDto` | Fix payment URLs. |
| GET | `/api/v1/jobs/run/health-info-sync` | `x-access-token` | none | Enqueue health info sync. |
| GET | `/api/v1/jobs/run/auto-register-practitioner-order-kits` | `x-access-token` | `AutoRegisterPractitionerOrderKitsQueryDto` | Enqueue auto registration. |

## Scripts (Kit)
Source: `src/scripts/controllers/kit.controller.ts`

| Method | Path | Auth | Body/Query | Notes |
| --- | --- | --- | --- | --- |
| POST | `/api/v1/script/kit/transfer` | `x-access-token` | `KitTransferDto` | Manual kit transfer script. |

## Scripts (Migration)
Source: `src/scripts/controllers/migration.controller.ts`

| Method | Path | Auth | Body/Query | Notes |
| --- | --- | --- | --- | --- |
| POST | `/api/v1/script/migrate/users` | `x-access-token` | none | Migrate users. |
| POST | `/api/v1/script/migrate/client-practitioners` | `x-access-token` | none | Migrate client practitioners. |
| POST | `/api/v1/script/migrate/kits-files` | `x-access-token` | `ReportDto` | Get report files. |
| POST | `/api/v1/script/migrate/kits` | `x-access-token` | none | Migrate kits. |
| POST | `/api/v1/script/migrate/family-kits` | `x-access-token` | none | Migrate family kits. |
| POST | `/api/v1/script/migrate/practitioner-kits` | `x-access-token` | none | Migrate practitioner kits. |