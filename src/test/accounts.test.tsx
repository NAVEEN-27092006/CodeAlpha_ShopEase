import { act, renderHook } from "@testing-library/react";
import type { ReactNode } from "react";
import { beforeEach, describe, expect, it } from "vitest";

import { ShopProvider, useShop } from "@/lib/shop-store";

function Wrapper({ children }: { children: ReactNode }) {
  return <ShopProvider>{children}</ShopProvider>;
}

describe("customer account access", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it("starts without sample customers or orders", () => {
    const { result } = renderHook(() => useShop(), { wrapper: Wrapper });

    expect(result.current.customers).toEqual([]);
    expect(result.current.orders).toEqual([]);
    expect(result.current.currentUser).toBeNull();
  });

  it("registers, signs out, and signs a customer back in", async () => {
    const { result } = renderHook(() => useShop(), { wrapper: Wrapper });
    const details = {
      name: "Test Customer",
      email: "customer.test@shopease.local",
      password: "CustomerPass!2026",
      phone: "9876543210",
      city: "Chennai",
      address: "1 Test Street, Chennai 600001",
    };

    await act(async () => {
      await result.current.registerCustomer(details);
    });
    expect(result.current.currentUser?.email).toBe(details.email);
    expect(result.current.currentCustomer?.city).toBe("Chennai");

    act(() => result.current.signOut());
    expect(result.current.currentUser).toBeNull();

    await act(async () => {
      await result.current.signIn(details.email, details.password);
    });
    expect(result.current.currentUser?.role).toBe("customer");
  });

  it("does not let a customer create an administrator", async () => {
    const { result } = renderHook(() => useShop(), { wrapper: Wrapper });
    await act(async () => {
      await result.current.registerCustomer({
        name: "Test Customer",
        email: "another.customer@shopease.local",
        password: "CustomerPass!2026",
        phone: "9876543210",
        city: "Chennai",
        address: "1 Test Street, Chennai 600001",
      });
    });

    await expect(
      result.current.createAdmin({
        name: "Not Allowed",
        email: "not.allowed@shopease.local",
        password: "NotAllowedPass!2026",
        role: "catalog_manager",
      }),
    ).rejects.toThrow("does not have permission");
  });
});
