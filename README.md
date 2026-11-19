# ShopEase

ShopEase is an e-commerce storefront and role-based administration prototype. Product data is preloaded only for demonstration; customer accounts and orders start empty.

## Run locally

```sh
npm install
npm run dev
```

Run the validation suite with:

```sh
npx tsc --noEmit
npm test
npm run build
```

## Customer accounts

Customers create their own account from **Sign in → Customer → Create an account**. Registration collects only the information needed for delivery: name, email, password, phone, city and address. Customer orders are private to the signed-in customer.

## Administrator roles

The first staff accounts are listed in the separately delivered private credentials PDF. Do not commit that document to a public repository.

| Role            | Access                                                       |
| --------------- | ------------------------------------------------------------ |
| Super Admin     | All admin areas and creation of other staff accounts         |
| Catalogue Admin | Products and demo catalogue restoration                      |
| Order Admin     | Order queue, permitted status transitions and COD collection |
| Inventory Admin | Inventory adjustments                                        |
| Support Admin   | Read-only customer and order lookup                          |

After signing in, the Super Admin uses **Admin team** to create staff accounts. Assign the smallest role that lets each person perform their work.

## Important production note

This repository currently stores the prototype state in each browser's local storage. The customer sign-in, roles and password hashing work for local demonstration, but local storage is not a secure multi-user production database. Before public deployment, connect Lovable's managed authentication and database, move accounts/orders/products to the server, enforce permissions server-side, and keep credentials only in managed secrets.

## Stack

- TanStack Start
- TypeScript and React
- Tailwind CSS
