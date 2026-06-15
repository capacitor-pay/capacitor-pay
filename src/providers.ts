import type { AdyenCheckoutOptions, AdyenCheckoutResult, AdyenPlugin } from '@capacitor-pay/adyen'
import type { SumUpCheckoutOptions, SumUpCheckoutResult, SumUpPlugin } from '@capacitor-pay/sumup'
import type { StripeCheckoutOptions, StripeCheckoutResult, StripePlugin } from '@capacitor-pay/stripe'
import type { CheckoutOptions, CheckoutResult, PaymentProviderName } from './definitions'

/** A provider plugin whose `checkout` accepts/returns the shared `CheckoutOptions`/`CheckoutResult` shapes. */
export type PaymentProvider<TPlugin extends { checkout: (...args: any[]) => Promise<any> }> = Omit<TPlugin, 'checkout'> & {
  checkout: (options: CheckoutOptions) => Promise<CheckoutResult>
}

/**
 * Wrap a provider plugin so its `checkout` method accepts/returns the shared
 * `CheckoutOptions`/`CheckoutResult` shapes, while every other method is passed through untouched.
 */
function wrapCheckout<TPlugin extends { checkout: (...args: any[]) => Promise<any> }>(
  plugin: TPlugin,
  toProviderOptions: (options: CheckoutOptions) => Parameters<TPlugin['checkout']>[0],
  toResult: (raw: Awaited<ReturnType<TPlugin['checkout']>>) => CheckoutResult,
): PaymentProvider<TPlugin> {
  return new Proxy(plugin, {
    get(target, prop, receiver) {
      if (prop === 'checkout') {
        return async (options: CheckoutOptions): Promise<CheckoutResult> => {
          const raw = await target.checkout(toProviderOptions(options))
          return toResult(raw)
        }
      }
      return Reflect.get(target, prop, receiver)
    },
  }) as PaymentProvider<TPlugin>
}

/**
 * Load a payment provider plugin by name. Each provider keeps its own
 * setup/login shape (e.g. SumUp's `affiliateKey`/`accessToken` vs. Stripe's
 * `publishableKey`/`connectionTokenUrl`), but `checkout` is wrapped to accept
 * and return the shared `CheckoutOptions`/`CheckoutResult` shapes from `./definitions`.
 */
export async function createPaymentProvider(provider: 'sumup'): Promise<PaymentProvider<SumUpPlugin>>
export async function createPaymentProvider(provider: 'stripe'): Promise<PaymentProvider<StripePlugin>>
export async function createPaymentProvider(provider: 'adyen'): Promise<PaymentProvider<AdyenPlugin>>
export async function createPaymentProvider(provider: PaymentProviderName): Promise<unknown> {
  switch (provider) {
    case 'sumup': {
      const { SumUp } = await import('@capacitor-pay/sumup')
      return wrapCheckout<SumUpPlugin>(
        SumUp,
        (options) => {
          const extra = (options.providerOptions ?? {}) as Partial<SumUpCheckoutOptions>
          return {
            amount: options.amount,
            currency: options.currency,
            title: options.title,
            paymentMethod: options.paymentMethod,
            ...extra,
          }
        },
        (raw: SumUpCheckoutResult) => ({
          success: raw.success,
          transactionId: raw.transactionCode,
          raw,
        }),
      )
    }
    case 'stripe': {
      const { Stripe } = await import('@capacitor-pay/stripe')
      return wrapCheckout<StripePlugin>(
        Stripe,
        (options) => {
          const extra = (options.providerOptions ?? {}) as Partial<StripeCheckoutOptions>
          return {
            amount: options.amount,
            currency: options.currency,
            title: options.title,
            ...extra,
          }
        },
        (raw: StripeCheckoutResult) => ({
          success: raw.success,
          transactionId: raw.paymentIntentId,
          raw,
        }),
      )
    }
    case 'adyen': {
      const { Adyen } = await import('@capacitor-pay/adyen')
      return wrapCheckout<AdyenPlugin>(
        Adyen,
        (options) => {
          const extra = (options.providerOptions ?? {}) as Partial<AdyenCheckoutOptions>
          return {
            amount: options.amount,
            currency: options.currency,
            ...extra,
            reference: extra.reference ?? crypto.randomUUID(),
          }
        },
        (raw: AdyenCheckoutResult) => ({
          success: raw.success,
          transactionId: raw.pspReference,
          raw,
        }),
      )
    }
    default:
      throw new Error(`Unknown payment provider: ${provider}`)
  }
}
