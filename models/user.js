import database from "infra/database"
import { NotFoundError, ValidationError } from "infra/errors"

async function runInsertQuery({ username, email, password }) {
  const result = await database.query({
    text: `INSERT INTO
            users (username, email, password)
        VALUES
            ($1, $2, $3)
        RETURNING
            *    
        ;`,
    values: [username, email, password],
  })

  return result.rows[0]
}

async function validateUniqueEmail(email) {
  const result = await database.query({
    text: `SELECT
            email
          FROM
            users
          WHERE
            LOWER(email) = LOWER($1)  
        ;`,
    values: [email],
  })

  if (result.rowCount > 0) {
    throw new ValidationError({
      message: "O email informado já está sendo utilizado",
      action: "Informe outro email",
    })
  }
}

async function validateUniqueUsername(username) {
  const result = await database.query({
    text: `SELECT
            username
          FROM
            users
          WHERE
            LOWER(username) = LOWER($1)
        ;`,
    values: [username],
  })

  if (result.rowCount > 0) {
    throw new NotFoundError({
      message: "O username informado já está sendo utilizado",
      action: "Informe outro username",
    })
  }
}

async function runSelectQuery(username) {
  const result = await database.query({
    text: `SELECT
            *
          FROM
            users
          WHERE
            LOWER(username) = LOWER($1)
          LIMIT
            1
        ;`,
    values: [username],
  })

  if (result.rowCount === 0) {
    throw new NotFoundError({
      message: "O username informado não foi encontrado",
      action: "Verifique se o username informado foi correto",
    })
  }

  return result.rows[0]
}

async function create(user) {
  await validateUniqueEmail(user.email)
  await validateUniqueUsername(user.username)
  const newUser = await runInsertQuery(user)
  return newUser
}

async function findOneByUsername(username) {
  const userFound = await runSelectQuery(username)
  return userFound
}

const user = { create, findOneByUsername }

export default user
