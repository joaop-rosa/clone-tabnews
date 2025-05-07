import { faker } from "@faker-js/faker/."
import retry from "async-retry"
import database from "infra/database"
import { runPendingMigrations as modelRunPendingMigrations } from "models/migrator"
import user from "models/user"

async function waitForAllServices() {
  await waitForWebServer()

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

const orchestrator = {
  waitForAllServices,
  cleanDatabase,
  runPendingMigrations,
  createUser,
}

export default orchestrator
