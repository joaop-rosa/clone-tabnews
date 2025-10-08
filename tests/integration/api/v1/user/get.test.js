import { version as uuidVersion } from "uuid"
import orchestrator from "tests/orchestrator.js"
import session from "models/session"
import setCookieParser from "set-cookie-parser"

beforeAll(async () => {
  await orchestrator.waitForAllServices()
  await orchestrator.cleanDatabase()
  await orchestrator.runPendingMigrations()
})

describe("GET to /api/v1/user", () => {
  describe("Default user", () => {
    test("With valid session", async () => {
      const createdUser = await orchestrator.createUser({
        username: "UserWithValidSession",
      })

      const sessionObject = await orchestrator.createSession(createdUser.id)

      const response = await fetch("http://localhost:3000/api/v1/user", {
        headers: {
          Cookie: `session_id=${sessionObject.token}`,
        },
        method: "GET",
      })

      expect(response.status).toBe(200)

      const cacheControl = response.headers.get("Cache-Control")

      expect(cacheControl).toEqual(
        "no-store, no-cache, max-age=0, must-revalidate",
      )

      const responseBody = await response.json()

      expect(responseBody).toEqual({
        id: createdUser.id,
        username: "UserWithValidSession",
        email: createdUser.email,
        password: createdUser.password,
        created_at: createdUser.created_at.toISOString(),
        updated_at: createdUser.updated_at.toISOString(),
      })

      expect(uuidVersion(responseBody.id)).toBe(4)
      expect(Date.parse(responseBody.created_at)).not.toBeNaN()
      expect(Date.parse(responseBody.updated_at)).not.toBeNaN()

      // Session renew assertions
      const renewedSessionObject = await session.getOneValidByToken(
        sessionObject.token,
      )

      expect(renewedSessionObject.expires_at > sessionObject.expires_at).toBe(
        true,
      )
      expect(renewedSessionObject.updated_at > sessionObject.updated_at).toBe(
        true,
      )

      // Cookie assertions
      const parsedSetCookie = setCookieParser(response, { map: true })

      expect(parsedSetCookie.session_id).toEqual({
        name: "session_id",
        value: renewedSessionObject.token,
        maxAge: session.EXPIRATION_IN_MILISECONDS / 1000,
        path: "/",
        httpOnly: true,
      })
    })

    test("With nonexistent session", async () => {
      const nonexistentToken =
        "ab1ba6d20ac3cd237e0bf0d1fc8f0b60c054a928d022be91cfe1b3df1cf7b22ad9c46158b1d9eed19103ec1f15faa490"

      const response = await fetch("http://localhost:3000/api/v1/user", {
        headers: {
          Cookie: `session_id=${nonexistentToken}`,
        },
        method: "GET",
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

      const response = await fetch("http://localhost:3000/api/v1/user", {
        headers: {
          Cookie: `session_id=${sessionObject.token}`,
        },
        method: "GET",
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

    test("With half life session", async () => {
      jest.useFakeTimers({
        now: new Date(Date.now() - session.EXPIRATION_IN_MILISECONDS / 2),
      })

      const createdUser = await orchestrator.createUser({
        username: "UserWithHalfLifeSession",
      })

      const sessionObject = await orchestrator.createSession(createdUser.id)

      const response = await fetch("http://localhost:3000/api/v1/user", {
        headers: {
          Cookie: `session_id=${sessionObject.token}`,
        },
        method: "GET",
      })

      jest.useRealTimers()

      expect(response.status).toBe(200)

      const responseBody = await response.json()

      expect(responseBody).toEqual({
        id: createdUser.id,
        username: "UserWithHalfLifeSession",
        email: createdUser.email,
        password: createdUser.password,
        created_at: createdUser.created_at.toISOString(),
        updated_at: createdUser.updated_at.toISOString(),
      })
    })
  })
})
