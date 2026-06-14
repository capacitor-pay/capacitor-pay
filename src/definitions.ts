/** Preferred payment method, shared across all providers. */
export type PaymentMethod = 'tapToPay' | 'cardReader'

export interface CheckoutOptions {
  /** Amount to charge, in the major currency unit (e.g. 12.50 for €12.50). */
  amount: number
  /** ISO 4217 currency code, e.g. "EUR". */
  currency: string
  /** Title shown on the checkout screen. */
  title: string
  /** Preferred payment method, if the provider supports choosing one. */
  paymentMethod?: PaymentMethod
}

export interface TapToPayStatus {
  available: boolean
  activated: boolean
}

/** Identifiers of the payment providers supported by capacitor-pay. */
export type PaymentProviderName = 'sumup'
