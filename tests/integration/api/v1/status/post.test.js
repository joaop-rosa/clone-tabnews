import orchestrator from "tests/orchestrator.js"
import { methodNotAllowedError } from "../fixtures/errors"

beforeAll(async () => {
  await orchestrator.waitForAllServices()
})

describe("POST to /api/v1/status", () => {
  describe("Anonymous user", () => {
    test("Retrieving current system status", async () => {
      const response = await fetch("http://localhost:3000/api/v1/status", {
        method: "POST",
      })

      expect(response.status).toBe(405)

      const responseBody = await response.json()

      expect(responseBody).toEqual(methodNotAllowedError)
    })
  })
})
