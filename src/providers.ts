import type { SumUpPlugin } from 'capacitor-pay-sumup'
import type { PaymentProviderName } from './definitions'

/**
 * Load a payment provider plugin by name. Each provider keeps its own
 * setup/login shape (e.g. SumUp's `affiliateKey`/`accessToken`), but shares
 * the `checkout`, `logout`, `checkTapToPay` and `activateTapToPay` shapes
 * defined in `./definitions`.
 */
export async function createPaymentProvider(provider: 'sumup'): Promise<SumUpPlugin>
export async function createPaymentProvider(provider: PaymentProviderName): Promise<unknown> {
  switch (provider) {
    case 'sumup': {
      const { SumUp } = await import('capacitor-pay-sumup')
      return SumUp
    }
    default:
      throw new Error(`Unknown payment provider: ${provider}`)
  }
}
