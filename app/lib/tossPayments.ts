import { loadTossPayments } from '@tosspayments/payment-sdk';

const clientKey =
  process.env.NEXT_PUBLIC_TOSS_CLIENT_KEY ||
  'test_ck_D5GePWvyJqK4WBaEgQrkrhady1pq';

export async function getTossPayments() {
  return await loadTossPayments(clientKey);
}
