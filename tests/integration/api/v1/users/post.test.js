import { version as uuidVersion } from "uuid"
import orchestrator from "tests/orchestrator.js"
import user from "models/user"
import password from "models/password"

beforeAll(async () => {
  await orchestrator.waitForAllServices()
  await orchestrator.cleanDatabase()
  await orchestrator.runPendingMigrations()
})

describe("POST to /api/v1/users", () => {
  describe("Anonymous user", () => {
    test("With unique and valid data", async () => {
      const response = await fetch("http://localhost:3000/api/v1/users", {
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

      expect(response.status).toBe(201)

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

      const userInDatabase = await user.findOneByUsername("joaorosa")
      const correctPasswordMatch = await password.compare(
        "senha123",
        userInDatabase.password,
      )
      const incorrectPasswordMatch = await password.compare(
        "senhaErrada",
        userInDatabase.password,
      )

      expect(correctPasswordMatch).toBe(true)
      expect(incorrectPasswordMatch).toBe(false)
    })
    test("With duplicated 'email'", async () => {
      const createdUser = await orchestrator.createUser()

      const response = await fetch("http://localhost:3000/api/v1/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...createdUser,
          username: `${createdUser.username}2`,
          email: createdUser.email.toUpperCase(),
        }),
      })

      expect(response.status).toBe(400)

      const responseBody = await response.json()

      expect(responseBody).toEqual({
        name: "ValidationError",
        message: "O email informado já está sendo utilizado",
        action: "Informe outro email",
        status_code: 400,
      })
    })
    test("With duplicated 'username'", async () => {
      const createdUser = await orchestrator.createUser()

      const response = await fetch("http://localhost:3000/api/v1/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...createdUser,
          email: `${createdUser.email}2`,
          username: createdUser.username.toUpperCase(),
        }),
      })

      expect(response.status).toBe(400)

      const responseBody = await response.json()

      expect(responseBody).toEqual({
        name: "ValidationError",
        message: "O username informado já está sendo utilizado",
        action: "Informe outro username",
        status_code: 400,
      })
    })
  })
})
