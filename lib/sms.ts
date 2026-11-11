/** Server-only boundary for a future Twilio-compatible SMS implementation. */
export type SmsMessage = { to: string; body: string };
export type SmsResult = { providerMessageId: string; status: "queued" | "sent" };
export interface SmsProvider { send(message: SmsMessage): Promise<SmsResult>; }

export class MockSmsProvider implements SmsProvider {
  async send(): Promise<SmsResult> { return { providerMessageId: `mock_${crypto.randomUUID()}`, status: "queued" }; }
}

export function getSmsProvider(): SmsProvider { return new MockSmsProvider(); }
