import { faker } from "@faker-js/faker/."
import retry from "async-retry"
import database from "infra/database"
import { runPendingMigrations as modelRunPendingMigrations } from "models/migrator"
import session from "models/session"
import user from "models/user"

const emailHttpUrl = `http://${process.env.EMAIL_HTTP_HOST}:${process.env.EMAIL_HTTP_PORT}`

async function waitForAllServices() {
  await waitForWebServer()
  await waitForEmailServer()

  async function waitForEmailServer() {
    return retry(fetchEmailPage, {
      retries: 100,
      maxTimeout: 5000,
    })

    async function fetchEmailPage() {
      const response = await fetch(emailHttpUrl)
      if (response.status !== 200) throw new Error()
    }
  }

  async function waitForWebServer() {
    return retry(fetchStatusPage, {
      retries: 100,
      maxTimeout: 5000,
    })

    async function fetchStatusPage() {
      const response = await fetch("http://localhost:3000/api/v1/status")
      if (response.status !== 200) throw new Error()
    }
  }
}

async function cleanDatabase() {
  await database.query("drop schema public cascade; create schema public;")
}

async function runPendingMigrations() {
  await modelRunPendingMigrations()
}

async function createUser(userObject) {
  return await user.create({
    username:
      userObject?.username || faker.internet.username().replace(/[_.-]/g, ""),
    email: userObject?.email || faker.internet.email(),
    password: userObject?.password || "senha123",
  })
}

async function createSession(userId) {
  return await session.create(userId)
}

async function deleteAllEmails() {
  await fetch(`${emailHttpUrl}/messages`, {
    method: "DELETE",
  })
}

async function getLastEmail() {
  const emailListResponse = await fetch(`${emailHttpUrl}/messages`)
  const emailListBody = await emailListResponse.json()
  const lastEmailItem = emailListBody.pop()

  const emailTextResponse = await fetch(
    `${emailHttpUrl}/messages/${lastEmailItem.id}.plain`,
  )
  const emailTextBody = await emailTextResponse.text()

  lastEmailItem.text = emailTextBody
  return lastEmailItem
}

const orchestrator = {
  waitForAllServices,
  cleanDatabase,
  runPendingMigrations,
  createUser,
  createSession,
  deleteAllEmails,
  getLastEmail,
}

export default orchestrator
