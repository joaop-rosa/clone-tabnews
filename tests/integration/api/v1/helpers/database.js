import database from "infra/database"

async function cleanDatabase() {
  await database.query("drop schema public cascade; create schema public;")
}

export { database, cleanDatabase }
