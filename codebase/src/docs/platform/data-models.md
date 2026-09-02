# Platform: Data Models

## Source of truth
- DBML schema: `schema.dbml`
- TypeORM entities: `src/**/entity/*.ts`

## Notes
- Database is SQL Server (see `src/config/db.ts`).
- Entities are compiled into `dist/**/*.entity.js` for runtime.

## Key entity groups
- Users and auth: `src/user/entity/*`, `src/admin/entity/admin.entity.ts`
- Orders and shipping: `src/order/entity/*`
- Kits: `src/kit/entity/*`, `src/validKit/entity/valid-kit.entity.ts`
- Payments and billing: `src/payment/entity/*`
- Support and contact: `src/support/entity/*`, `src/contact-message/entity/*`
- Vaari: `src/vaari/entity/*`
- Tutorials/feedback/reminders/providers: `src/tutorials/entity/*`, `src/feedback/entity/*`, `src/reminders/entity/*`, `src/provider/entity/*`
