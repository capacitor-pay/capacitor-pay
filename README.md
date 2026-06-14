# capacitor-pay

Provider-agnostic payments layer for Capacitor apps, in the spirit of [Omnipay](https://github.com/thephpleague/omnipay) for PHP: one package per payment provider, sharing a common set of types and a small registry to load whichever provider you need.

This package on its own only ships shared TypeScript types (`CheckoutOptions`, `TapToPayStatus`, `PaymentMethod`, `PaymentProviderName`) and a `createPaymentProvider()` factory. The actual native iOS/Android code lives in provider packages, e.g. [`capacitor-pay-sumup`](https://github.com/Spanu18/capacitor-pay-sumup).

## Install

```bash
npm install capacitor-pay capacitor-pay-sumup
npx cap sync
```

## Usage

```ts
import { createPaymentProvider } from 'capacitor-pay'

const sumup = await createPaymentProvider('sumup')

await sumup.setup({ affiliateKey: 'YOUR_AFFILIATE_KEY' })
await sumup.login({ accessToken: 'OAUTH_ACCESS_TOKEN' })

await sumup.checkout({
  amount: 12.5,
  currency: 'EUR',
  title: 'Order #1234',
})
```

## Adding a provider

Each provider is its own npm package (e.g. `capacitor-pay-sumup`) implementing `checkout`, `logout`, `checkTapToPay` and `activateTapToPay` against the shared `CheckoutOptions`/`TapToPayStatus` types from this package, plus whatever `setup`/`login` shape it needs. To wire a new provider into `createPaymentProvider`, add a case to `src/providers.ts` that lazily imports the provider package.

## Note on the `capacitor-pay-sumup` dependency

While `capacitor-pay-sumup` is unpublished, this package depends on it via `file:../capacitor-pay-sumup` (i.e. the sibling directory). Once `capacitor-pay-sumup` is published to npm, update that to a normal semver range.
