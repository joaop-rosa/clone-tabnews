import { NotFoundError, UnauthorizedError } from "infra/errors"
import password from "./password"
import user from "./user"

async function getAuthenticatedUser(providedEmail, providedPassword) {
  try {
    const storedUser = await findUserByEmail(providedEmail)
    await validatePassword(providedPassword, storedUser.password)

    return storedUser
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      throw new UnauthorizedError({
        message: "Usuário ou senha incorretos",
        action: "Verifique se o email e senha foram informados corretamente",
      })
    }

    throw error
  }

  async function findUserByEmail(providedEmail) {
    let storedUser

    try {
      storedUser = await user.findOneByEmail(providedEmail)
    } catch (error) {
      if (error instanceof NotFoundError) {
        throw new UnauthorizedError({
          message: "Email não confere",
          action: "Verifique se o email está correto",
        })
      }

      throw error
    }

    return storedUser
  }

  async function validatePassword(providedPassword, storedPassword) {
    const correctPassword = await password.compare(
      providedPassword,
      storedPassword,
    )

    if (!correctPassword) {
      throw new UnauthorizedError({
        message: "Senha não confere",
        action: "Verifique se a senha está correta",
      })
    }
  }
}

const authentication = {
  getAuthenticatedUser,
}

export default authentication
