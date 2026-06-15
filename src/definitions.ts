import { CurrencyCode } from "currency-codes-ts/dist/types"

/** Preferred payment method, shared across all providers. */
export type PaymentMethod = 'tapToPay' | 'cardReader'

export interface CheckoutOptions {
  /** Amount to charge, in the major currency unit (e.g. 12.50 for €12.50). */
  amount: number
  /** ISO 4217 currency code, e.g. "EUR". */
  currency: CurrencyCode
  /** Title shown on the checkout screen. */
  title: string
  /** Preferred payment method, if the provider supports choosing one. */
  paymentMethod?: PaymentMethod
  /**
   * Extra fields merged into the underlying provider's `checkout` call as-is, for options that
   * don't have a shared equivalent. E.g. SumUp: `tipAmount`, `foreignTransactionID`. Stripe: `metadata`.
   */
  providerOptions?: Record<string, unknown>
}

export interface CheckoutResult {
  success: boolean
  /** Unified transaction reference (SumUp's `transactionCode`, Stripe's `paymentIntentId`). */
  transactionId?: string
  /** Raw response returned by the underlying provider's `checkout` call. */
  raw: unknown
}

export interface TapToPayStatus {
  available: boolean
  activated: boolean
}

/** Identifiers of the payment providers supported by capacitor-pay. */
export type PaymentProviderName = 'sumup' | 'stripe' | 'adyen'
