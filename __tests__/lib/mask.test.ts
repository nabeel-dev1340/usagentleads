import { describe, it, expect } from "vitest"
import { maskEmail, maskPhone } from "@/lib/utils/mask"

describe("maskEmail", () => {
  it("returns null when there is no email", () => {
    expect(maskEmail(null)).toBeNull()
    expect(maskEmail(undefined)).toBeNull()
    expect(maskEmail("")).toBeNull()
  })

  it("keeps only the first character of the local part", () => {
    expect(maskEmail("john@kw.com")).toBe("j••••@••••••")
  })

  it("never leaks the local part beyond the first character", () => {
    const masked = maskEmail("jonathan.smith@example.com")!
    expect(masked.startsWith("j")).toBe(true)
    expect(masked).not.toContain("onathan")
    expect(masked).not.toContain("smith")
  })

  it("never leaks the domain (brokerage/provider) at all", () => {
    const masked = maskEmail("agent@kw.com")!
    expect(masked).not.toContain("kw")
    expect(masked).not.toContain("com")
    expect(masked).not.toContain("example")
  })

  it("does not reveal the true length of the address", () => {
    // Two very different-length inputs mask to the same fixed-width shape.
    expect(maskEmail("a@b.co")).toBe("a••••@••••••")
    expect(maskEmail("averylongname@somehugecompanydomain.com")).toBe("a••••@••••••")
  })

  it("fully masks malformed values with no usable local part", () => {
    expect(maskEmail("notanemail")).toBe("•••••@••••••")
    expect(maskEmail("@nolocal.com")).toBe("•••••@••••••")
  })
})

describe("maskPhone", () => {
  it("returns null when there is no phone", () => {
    expect(maskPhone(null)).toBeNull()
    expect(maskPhone(undefined)).toBeNull()
    expect(maskPhone("")).toBeNull()
  })

  it("keeps the area code and masks the rest", () => {
    expect(maskPhone("(251) 271-5020")).toBe("(251) •••-••••")
  })

  it("never leaks the line number", () => {
    const masked = maskPhone("(818) 441-1871")!
    expect(masked).toContain("818")
    expect(masked).not.toContain("441")
    expect(masked).not.toContain("1871")
  })

  it("strips a leading US country code before reading the area code", () => {
    expect(maskPhone("1-352-484-8867")).toBe("(352) •••-••••")
    expect(maskPhone("+1 (407) 555 0123")).toBe("(407) •••-••••")
  })

  it("fully masks values that cannot yield a 10-digit number", () => {
    expect(maskPhone("call me")).toBe("(•••) •••-••••")
    expect(maskPhone("12345")).toBe("(•••) •••-••••")
  })
})
