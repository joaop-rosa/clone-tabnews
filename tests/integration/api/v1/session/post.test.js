import session from "models/session"
import orchestrator from "tests/orchestrator.js"
import { version as uuidVersion } from "uuid"
import setCookieParser from "set-cookie-parser"

beforeAll(async () => {
  await orchestrator.cleanDatabase()
  await orchestrator.runPendingMigrations()
})

describe("POST to /api/v1/session", () => {
  describe("Anonymous user", () => {
    test("With incorrect email but correct password", async () => {
      await orchestrator.createUser({
        password: "senha-correta",
      })

      const response = await fetch("http://localhost:3000/api/v1/sessions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: "email.errado@gmail.com",
          password: "senha-correta",
        }),
      })

      expect(response.status).toBe(401)

      const responseBody = await response.json()

      expect(responseBody).toEqual({
        name: "UnauthorizedError",
        message: "Usuário ou senha incorretos",
        action: "Verifique se o email e senha foram informados corretamente",
        status_code: 401,
      })
    })

    test("With correct email but incorrect password", async () => {
      await orchestrator.createUser({
        email: "email.correto@gmail.com",
      })

      const response = await fetch("http://localhost:3000/api/v1/sessions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: "email.correto@gmail.com",
          password: "senha-errada",
        }),
      })

      expect(response.status).toBe(401)

      const responseBody = await response.json()

      expect(responseBody).toEqual({
        name: "UnauthorizedError",
        message: "Usuário ou senha incorretos",
        action: "Verifique se o email e senha foram informados corretamente",
        status_code: 401,
      })
    })

    test("With incorrect email and incorrect password", async () => {
      await orchestrator.createUser()

      const response = await fetch("http://localhost:3000/api/v1/sessions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: "email.errado@gmail.com",
          password: "senha-errada",
        }),
      })

      expect(response.status).toBe(401)

      const responseBody = await response.json()

      expect(responseBody).toEqual({
        name: "UnauthorizedError",
        message: "Usuário ou senha incorretos",
        action: "Verifique se o email e senha foram informados corretamente",
        status_code: 401,
      })
    })

    test("With correct email and correct password", async () => {
      const createdUser = await orchestrator.createUser({
        email: "email.tudo.correto@gmail.com",
        password: "senha-correta",
      })

      const response = await fetch("http://localhost:3000/api/v1/sessions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: "email.tudo.correto@gmail.com",
          password: "senha-correta",
        }),
      })

      expect(response.status).toBe(201)

      const responseBody = await response.json()

      expect(responseBody).toEqual({
        id: responseBody.id,
        user_id: createdUser.id,
        token: responseBody.token,
        expires_at: responseBody.expires_at,
        created_at: responseBody.created_at,
        updated_at: responseBody.updated_at,
      })

      expect(uuidVersion(responseBody.id)).toBe(4)
      expect(Date.parse(responseBody.created_at)).not.toBeNaN()
      expect(Date.parse(responseBody.updated_at)).not.toBeNaN()
      expect(Date.parse(responseBody.expires_at)).not.toBeNaN()

      const expiresAt = new Date(responseBody.expires_at)
      const createdAt = new Date(responseBody.created_at)

      expiresAt.setMilliseconds(0)
      createdAt.setMilliseconds(0)

      expect(expiresAt - createdAt).toBe(session.EXPIRATION_IN_MILISECONDS)

      const parsedSetCookie = setCookieParser(response, { map: true })

      expect(parsedSetCookie.session_id).toEqual({
        name: "session_id",
        value: responseBody.token,
        maxAge: session.EXPIRATION_IN_MILISECONDS / 1000,
        path: "/",
        httpOnly: true,
      })
    })
  })
})
