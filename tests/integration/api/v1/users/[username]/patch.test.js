import { version as uuidVersion } from "uuid"
import orchestrator from "tests/orchestrator.js"
import user from "models/user"
import password from "models/password"

beforeAll(async () => {
  await orchestrator.waitForAllServices()
  await orchestrator.cleanDatabase()
  await orchestrator.runPendingMigrations()
})

describe("PATCH to /api/v1/users/[username]", () => {
  describe("Anonymous user", () => {
    test("With duplicated 'username'", async () => {
      const user1response = await fetch("http://localhost:3000/api/v1/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: "user1",
          email: "user1@gmail.com",
          password: "senha123",
        }),
      })

      expect(user1response.status).toBe(201)

      const user2response = await fetch("http://localhost:3000/api/v1/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: "user2",
          email: "user2@gmail.com",
          password: "senha123",
        }),
      })

      expect(user2response.status).toBe(201)

      const response = await fetch("http://localhost:3000/api/v1/users/user2", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: "user1",
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

    test("With nonexistent 'username'", async () => {
      const response = await fetch(
        "http://localhost:3000/api/v1/users/NotFoundedUser",
        {
          method: "PATCH",
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

    test("With duplicated 'email'", async () => {
      const email1response = await fetch("http://localhost:3000/api/v1/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: "email1",
          email: "email1@gmail.com",
          password: "senha123",
        }),
      })

      expect(email1response.status).toBe(201)

      const email2response = await fetch("http://localhost:3000/api/v1/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: "email2",
          email: "email2@gmail.com",
          password: "senha123",
        }),
      })

      expect(email2response.status).toBe(201)

      const response = await fetch(
        "http://localhost:3000/api/v1/users/email2",
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: "email1@gmail.com",
          }),
        },
      )

      expect(response.status).toBe(400)

      const responseBody = await response.json()

      expect(responseBody).toEqual({
        name: "ValidationError",
        message: "O email informado já está sendo utilizado",
        action: "Informe outro email",
        status_code: 400,
      })
    })

    test("With unique 'username'", async () => {
      const userResponse = await fetch("http://localhost:3000/api/v1/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: "userUnique",
          email: "userUnique@gmail.com",
          password: "senha123",
        }),
      })

      expect(userResponse.status).toBe(201)

      const response = await fetch(
        "http://localhost:3000/api/v1/users/userUnique",
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            username: "userUnique2",
          }),
        },
      )

      expect(response.status).toBe(200)

      const responseBody = await response.json()

      expect(responseBody).toEqual({
        id: responseBody.id,
        username: "userUnique2",
        email: "userUnique@gmail.com",
        password: responseBody.password,
        created_at: responseBody.created_at,
        updated_at: responseBody.updated_at,
      })
      expect(uuidVersion(responseBody.id)).toBe(4)
      expect(Date.parse(responseBody.created_at)).not.toBeNaN()
      expect(Date.parse(responseBody.updated_at)).not.toBeNaN()
      expect(responseBody.updated_at > responseBody.created_at).toBe(true)
    })

    test("With unique 'email'", async () => {
      const userResponse = await fetch("http://localhost:3000/api/v1/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: "userUniqueEmail",
          email: "userUniqueEmail@gmail.com",
          password: "senha123",
        }),
      })

      expect(userResponse.status).toBe(201)

      const response = await fetch(
        "http://localhost:3000/api/v1/users/userUniqueEmail",
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: "userUniqueEmail2@gmail.com",
          }),
        },
      )

      expect(response.status).toBe(200)

      const responseBody = await response.json()

      expect(responseBody).toEqual({
        id: responseBody.id,
        username: "userUniqueEmail",
        email: "userUniqueEmail2@gmail.com",
        password: responseBody.password,
        created_at: responseBody.created_at,
        updated_at: responseBody.updated_at,
      })
      expect(uuidVersion(responseBody.id)).toBe(4)
      expect(Date.parse(responseBody.created_at)).not.toBeNaN()
      expect(Date.parse(responseBody.updated_at)).not.toBeNaN()
      expect(responseBody.updated_at > responseBody.created_at).toBe(true)
    })

    test("With new 'password'", async () => {
      const userResponse = await fetch("http://localhost:3000/api/v1/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: "newPassword",
          email: "newPassword@gmail.com",
          password: "senha123",
        }),
      })

      expect(userResponse.status).toBe(201)

      const response = await fetch(
        "http://localhost:3000/api/v1/users/newPassword",
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            password: "senha1234",
          }),
        },
      )

      expect(response.status).toBe(200)

      const responseBody = await response.json()

      expect(responseBody).toEqual({
        id: responseBody.id,
        username: "newPassword",
        email: "newPassword@gmail.com",
        password: responseBody.password,
        created_at: responseBody.created_at,
        updated_at: responseBody.updated_at,
      })
      expect(uuidVersion(responseBody.id)).toBe(4)
      expect(Date.parse(responseBody.created_at)).not.toBeNaN()
      expect(Date.parse(responseBody.updated_at)).not.toBeNaN()
      expect(responseBody.updated_at > responseBody.created_at).toBe(true)

      const userInDatabase = await user.findOneByUsername("newPassword")
      const correctPasswordMatch = await password.compare(
        "senha1234",
        userInDatabase.password,
      )
      const incorrectPasswordMatch = await password.compare(
        "senha123",
        userInDatabase.password,
      )

      expect(correctPasswordMatch).toBe(true)
      expect(incorrectPasswordMatch).toBe(false)
    })
  })
})
