import { describe, it, expect } from "vitest"
import { sanitizeHtml, cn } from "@/lib/utils"

describe("sanitizeHtml", () => {
    it("escapa caracteres HTML peligrosos", () => {
        expect(sanitizeHtml("<script>alert('xss')</script>")).toBe(
            "&lt;script&gt;alert(&#039;xss&#039;)&lt;/script&gt;"
        )
    })

    it("escapa comillas dobles", () => {
        expect(sanitizeHtml('"test"')).toBe("&quot;test&quot;")
    })

    it("escapa ampersands", () => {
        expect(sanitizeHtml("A & B")).toBe("A &amp; B")
    })

    it("retorna string vacío para null/undefined", () => {
        expect(sanitizeHtml(null)).toBe("")
        expect(sanitizeHtml(undefined)).toBe("")
        expect(sanitizeHtml("")).toBe("")
    })

    it("no modifica strings sin caracteres especiales", () => {
        expect(sanitizeHtml("texto normal")).toBe("texto normal")
    })
})

describe("cn", () => {
    it("combina clases", () => {
        expect(cn("foo", "bar")).toBe("foo bar")
    })

    it("maneja valores condicionales", () => {
        expect(cn("base", false && "hidden", "visible")).toBe("base visible")
    })

    it("merge conflictos de tailwind", () => {
        expect(cn("p-4", "p-8")).toBe("p-8")
    })
})
