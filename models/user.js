import database from "infra/database"
import { NotFoundError, ValidationError } from "infra/errors"
import password from "./password"

async function runInsertQuery({ username, email, password, features }) {
  const result = await database.query({
    text: `INSERT INTO
            users (username, email, password, features)
        VALUES
            ($1, $2, $3, $4)
        RETURNING
            *    
        ;`,
    values: [username, email, password, features],
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
    throw new ValidationError({
      message: "O username informado já está sendo utilizado",
      action: "Informe outro username",
    })
  }
}

async function hashPasswordInObject(userInputValues) {
  const hashedPassword = await password.hash(userInputValues.password)
  userInputValues.password = hashedPassword
}

async function runUsernameSelectQuery(username) {
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

async function runIdSelectQuery(id) {
  const result = await database.query({
    text: `SELECT
            *
          FROM
            users
          WHERE
            id = $1
          LIMIT
            1
        ;`,
    values: [id],
  })

  if (result.rowCount === 0) {
    throw new NotFoundError({
      message: "O id informado não foi encontrado",
      action: "Verifique se o id informado foi correto",
    })
  }

  return result.rows[0]
}

async function runEmailSelectQuery(email) {
  const result = await database.query({
    text: `SELECT
            *
          FROM
            users
          WHERE
            LOWER(email) = LOWER($1)
          LIMIT
            1
        ;`,
    values: [email],
  })

  if (result.rowCount === 0) {
    throw new NotFoundError({
      message: "O email informado não foi encontrado",
      action: "Verifique se o email informado foi correto",
    })
  }

  return result.rows[0]
}

async function create(user) {
  await validateUniqueUsername(user.username)
  await validateUniqueEmail(user.email)
  await hashPasswordInObject(user)
  injectDefaultFeaturesInObject(user)

  const newUser = await runInsertQuery(user)
  return newUser

  function injectDefaultFeaturesInObject(userInputValues) {
    userInputValues.features = ["read:activation_token"]
  }
}

async function findOneByUsername(username) {
  const userFound = await runUsernameSelectQuery(username)
  return userFound
}

async function findOneById(id) {
  const userFound = await runIdSelectQuery(id)
  return userFound
}

async function findOneByEmail(email) {
  const userFound = await runEmailSelectQuery(email)
  return userFound
}

async function runUpdateQuery(userWithNewValues) {
  const result = await database.query({
    text: `UPDATE
            users
          SET
            username = $2,
            email = $3,
            password = $4,
            updated_at = timezone('utc', now())
          WHERE
            id = $1
          RETURNING
            *
        ;`,
    values: [
      userWithNewValues.id,
      userWithNewValues.username,
      userWithNewValues.email,
      userWithNewValues.password,
    ],
  })

  return result.rows[0]
}

async function update(username, userInputValues) {
  const currentUser = await findOneByUsername(username)

  if ("username" in userInputValues) {
    await validateUniqueUsername(userInputValues.username)
  }

  if ("email" in userInputValues) {
    await validateUniqueEmail(userInputValues.email)
  }

  if ("password" in userInputValues) {
    await hashPasswordInObject(userInputValues)
  }

  const userWithNewValues = { ...currentUser, ...userInputValues }
  const updatedUser = await runUpdateQuery(userWithNewValues)
  return updatedUser
}

async function setFeatures(userId, features) {
  const updatedUser = await runUpdateQuery(userId, features)
  return updatedUser

  async function runUpdateQuery(userId, features) {
    const results = await database.query({
      text: `
       UPDATE
         users
       SET
         features = $2,
         updated_at = timezone('utc', now())
       WHERE
         id = $1
       RETURNING
         *
       ;`,
      values: [userId, features],
    })

    return results.rows[0]
  }
}

async function addFeatures(userId, features) {
  const updatedUser = await runUpdateQuery(userId, features)
  return updatedUser

  async function runUpdateQuery(userId, features) {
    const results = await database.query({
      text: `
       UPDATE
         users
       SET
         features = array_cat(features, $2),
         updated_at = timezone('utc', now())
       WHERE
         id = $1
       RETURNING
         *
       ;`,
      values: [userId, features],
    })

    return results.rows[0]
  }
}

const user = {
  create,
  findOneById,
  findOneByUsername,
  update,
  findOneByEmail,
  setFeatures,
  addFeatures,
}

export default user
