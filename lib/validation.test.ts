import { describe, expect, it } from "vitest";
import { completedCallSchema, normalizeCompletedCall } from "./validation";

describe("completed call normalization", () => {
  it("maps callback status and calculates duration", () => {
    const parsed = completedCallSchema.parse({
      business_id: "11111111-1111-4111-8111-111111111111",
      call_id: "call-123",
      booking_status: "callback_needed",
      call_started_at: "2026-08-19T10:00:00.000Z",
      call_ended_at: "2026-08-19T10:02:05.000Z",
    });
    const normalized = normalizeCompletedCall(parsed);
    expect(normalized.status).toBe("callback_needed");
    expect(normalized.duration).toBe(125);
  });

  it("rejects malformed business identifiers", () => {
    expect(() => completedCallSchema.parse({ business_id: "nope", call_id: "call-1" })).toThrow();
  });
});
