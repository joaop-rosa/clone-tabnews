import { version as uuidVersion } from "uuid"
import orchestrator from "tests/orchestrator.js"

beforeAll(async () => {
  await orchestrator.waitForAllServices()
  await orchestrator.cleanDatabase()
  await orchestrator.runPendingMigrations()
})

describe("GET to /api/v1/users/[username]", () => {
  describe("Anonymous user", () => {
    test("With exact case match", async () => {
      const response1 = await fetch("http://localhost:3000/api/v1/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: "joaorosa",
          email: "joaorosa@gmail.com",
          password: "senha123",
        }),
      })

      expect(response1.status).toBe(201)

      const response = await fetch(
        "http://localhost:3000/api/v1/users/joaorosa",
        {
          method: "GET",
        },
      )

      expect(response.status).toBe(200)

      const responseBody = await response.json()

      expect(responseBody).toEqual({
        id: responseBody.id,
        username: "joaorosa",
        email: "joaorosa@gmail.com",
        password: responseBody.password,
        created_at: responseBody.created_at,
        updated_at: responseBody.updated_at,
      })
      expect(uuidVersion(responseBody.id)).toBe(4)
      expect(Date.parse(responseBody.created_at)).not.toBeNaN()
      expect(Date.parse(responseBody.updated_at)).not.toBeNaN()
    })

    test("With case mismatch", async () => {
      const response1 = await fetch("http://localhost:3000/api/v1/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: "casemismatch",
          email: "joaorosa2@gmail.com",
          password: "senha123",
        }),
      })

      expect(response1.status).toBe(201)

      const response = await fetch(
        "http://localhost:3000/api/v1/users/CaseMismatch",
        {
          method: "GET",
        },
      )

      expect(response.status).toBe(200)

      const responseBody = await response.json()

      expect(responseBody).toEqual({
        id: responseBody.id,
        username: "casemismatch",
        email: "joaorosa2@gmail.com",
        password: responseBody.password,
        created_at: responseBody.created_at,
        updated_at: responseBody.updated_at,
      })
      expect(uuidVersion(responseBody.id)).toBe(4)
      expect(Date.parse(responseBody.created_at)).not.toBeNaN()
      expect(Date.parse(responseBody.updated_at)).not.toBeNaN()
    })

    test("With nonexistent username", async () => {
      const response = await fetch(
        "http://localhost:3000/api/v1/users/NotFoundedUser",
        {
          method: "GET",
        },
      )

      expect(response.status).toBe(404)

      const responseBody = await response.json()

      expect(responseBody).toEqual({
        name: "NotFoundError",
        message: "O username informado não foi encontrado",
        action: "Verifique se o username informado foi correto",
        status_code: 404,
      })
    })
  })
})
