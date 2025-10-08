import { version as uuidVersion } from "uuid"
import orchestrator from "tests/orchestrator.js"
import session from "models/session"
import setCookieParser from "set-cookie-parser"

beforeAll(async () => {
  await orchestrator.waitForAllServices()
  await orchestrator.cleanDatabase()
  await orchestrator.runPendingMigrations()
})

describe("DELETE to /api/v1/session", () => {
  describe("Default user", () => {
    test("With valid session", async () => {
      const createdUser = await orchestrator.createUser({
        username: "UserWithValidSession",
      })

      const sessionObject = await orchestrator.createSession(createdUser.id)

      const response = await fetch("http://localhost:3000/api/v1/sessions", {
        headers: {
          Cookie: `session_id=${sessionObject.token}`,
        },
        method: "DELETE",
      })

      expect(response.status).toBe(200)

      const responseBody = await response.json()

      expect(responseBody).toEqual({
        id: sessionObject.id,
        user_id: sessionObject.user_id,
        token: sessionObject.token,
        expires_at: responseBody.expires_at,
        created_at: responseBody.created_at,
        updated_at: responseBody.updated_at,
      })

      expect(uuidVersion(responseBody.id)).toBe(4)
      expect(Date.parse(responseBody.created_at)).not.toBeNaN()
      expect(Date.parse(responseBody.updated_at)).not.toBeNaN()
      expect(Date.parse(responseBody.expires_at)).not.toBeNaN()

      expect(
        responseBody.expires_at < sessionObject.expires_at.toISOString(),
      ).toBe(true)
      expect(
        responseBody.updated_at > sessionObject.updated_at.toISOString(),
      ).toBe(true)

      // Cookie assertions
      const parsedSetCookie = setCookieParser(response, { map: true })

      expect(parsedSetCookie.session_id).toEqual({
        name: "session_id",
        value: "invalid",
        maxAge: -1,
        path: "/",
        httpOnly: true,
      })

      // Double check assertions
      const doubleDeleteResponse = await fetch(
        "http://localhost:3000/api/v1/user",
        {
          headers: {
            Cookie: `session_id=${sessionObject.token}`,
          },
        },
      )

      expect(doubleDeleteResponse.status).toBe(401)

      const doubleDeleteResponseBody = await doubleDeleteResponse.json()

      expect(doubleDeleteResponseBody).toEqual({
        name: "UnauthorizedError",
        message: "Usuário não possui sessão ativa.",
        action: "Verifique se este usuário está logado e tente novamente.",
        status_code: 401,
      })
    })

    test("With nonexistent session", async () => {
      const nonexistentToken =
        "ab1ba6d20ac3cd237e0bf0d1fc8f0b60c054a928d022be91cfe1b3df1cf7b22ad9c46158b1d9eed19103ec1f15faa490"

      const response = await fetch("http://localhost:3000/api/v1/sessions", {
        headers: {
          Cookie: `session_id=${nonexistentToken}`,
        },
        method: "DELETE",
      })

      expect(response.status).toBe(401)

      const responseBody = await response.json()

      expect(responseBody).toEqual({
        name: "UnauthorizedError",
        message: "Usuário não possui sessão ativa.",
        action: "Verifique se este usuário está logado e tente novamente.",
        status_code: 401,
      })
    })

    test("With expired session", async () => {
      jest.useFakeTimers({
        now: new Date(Date.now() - session.EXPIRATION_IN_MILISECONDS),
      })

      const createdUser = await orchestrator.createUser({
        username: "UserWithExpiredSession",
      })

      const sessionObject = await orchestrator.createSession(createdUser.id)

      jest.useRealTimers()

      const response = await fetch("http://localhost:3000/api/v1/sessions", {
        headers: {
          Cookie: `session_id=${sessionObject.token}`,
        },
        method: "DELETE",
      })

      expect(response.status).toBe(401)

      const responseBody = await response.json()

      expect(responseBody).toEqual({
        name: "UnauthorizedError",
        message: "Usuário não possui sessão ativa.",
        action: "Verifique se este usuário está logado e tente novamente.",
        status_code: 401,
      })
    })
  })
})
