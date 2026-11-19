import { describe, expect, it } from "vitest";

import { isPaymentAvailable, isValidOrderTransition, nextOrderStatuses } from "@/lib/shop-logic";

describe("checkout and order business rules", () => {
  it("allows COD and blocks unavailable online payment methods", () => {
    expect(isPaymentAvailable("cod")).toBe(true);
    expect(isPaymentAvailable("upi")).toBe(false);
    expect(isPaymentAvailable("netbanking")).toBe(false);
  });

  it("only permits the defined order lifecycle transitions", () => {
    expect(nextOrderStatuses("Placed")).toEqual(["Packed", "Cancelled"]);
    expect(isValidOrderTransition("Placed", "Packed")).toBe(true);
    expect(isValidOrderTransition("Packed", "Shipped")).toBe(true);
    expect(isValidOrderTransition("Placed", "Delivered")).toBe(false);
    expect(isValidOrderTransition("Delivered", "Cancelled")).toBe(false);
  });
});
