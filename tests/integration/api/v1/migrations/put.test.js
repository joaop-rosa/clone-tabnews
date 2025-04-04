const { methodNotAllowedError } = require("../fixtures/errors")

describe("PUT to /api/v1/migrations", () => {
  describe("Anonymous user", () => {
    test("Retrieving pending migrations", async () => {
      const response = await fetch("http://localhost:3000/api/v1/migrations", {
        method: "PUT",
      })
      expect(response.status).toBe(405)
      const responseBody = await response.json()
      expect(responseBody).toEqual(methodNotAllowedError)
    })
  })
})
