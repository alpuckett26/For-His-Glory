import Stripe from 'stripe'
import { stripe } from './client'

export function constructWebhookEvent(
  payload: string | Buffer,
  signature: string,
  secret: string
): Stripe.Event {
  return stripe.webhooks.constructEvent(payload, signature, secret)
}
