import { Client } from "pg"
import { ServiceError } from "./errors"

async function query(queryObject) {
  let client

  try {
    client = await getNewClient()
    const result = await client.query(queryObject)
    return result
  } catch (error) {
    const serviceErrorObject = new ServiceError({
      message: "Erro na conexão com o banco de dados",
      cause: error,
    })
    throw serviceErrorObject
  } finally {
    await client?.end()
  }
}

async function getNewClient() {
  const client = new Client({
    host: process.env.POSTGRES_HOST,
    port: process.env.POSTGRES_PORT,
    user: process.env.POSTGRES_USER,
    password: process.env.POSTGRES_PASSWORD,
    database: process.env.POSTGRES_DB,
    ssl: process.env.NODE_ENV === "production" ? true : false,
  })

  await client.connect()
  return client
}

const database = {
  query,
  getNewClient,
}

export default database
