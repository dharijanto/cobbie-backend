import * as Promise from 'bluebird'
import CRUDService from './crud-service'
import Crypto from '../libs/crypto'
import Formatter from '../libs/formatter'

const log = require('npmlog')
const TAG = 'UserService'

class UserService extends CRUDService {
  finishIntroduction (userId) {
    return super.readOne<User>('User', { id: userId }).then(resp => {
      if (resp.status && resp.data) {
        return super.update<User>('User', { didIntroduction: true }, { id: userId })
      } else {
        return { status: false, errMessage: `User with id=${userId} couldn't be found!` }
      }
    })
  }

  login (username: string, password: string): Promise<NCResponse<User>> {
    if (!username || !password) {
      return Promise.resolve({ status: false, errMessage: 'Username and/or password are required!' })
    }
    log.verbose(TAG, `login(): username=${username}`)

    return super.readOne<User>('User', { username }).then(resp => {
      if (resp.status && resp.data) {
        const user = resp.data
        const enteredSaltedPass = Crypto.saltPass(password, user.salt)
        if (user.saltedPass === enteredSaltedPass) {
          return { status: true, data: resp.data }
        } else {
          return { status: false, errMessage: 'Invalid username or password!' }
        }
      } else {
        return { status: false, errMessage: 'Invalid username or password.' }
      }
    })
  }

  private validateCredential (username: string,
                              password: string, passwordConfirm: string,
                              companyCode: string , isPasswordOptional = false,
                              isExistingUser = false): Promise<NCResponse<Partial<User>>> {
    // If either password or confirm password is entered, they have to match in order
    // for anything to be updated
    const errMessages: string[] = []
    let data: Partial<User> = {}
    if (username) {
      if (!Formatter.validateUsername(username)) {
        errMessages.push('Username has to start with letter and of 5-16 characters long!')
      } else {
        data.username = username.toLowerCase()
      }
    } else {
      errMessages.push('Username is required!')
    }

    if (!isPasswordOptional) {
      if (password && passwordConfirm) {
        if (password !== passwordConfirm) {
          errMessages.push('Passwords do not match!')
        } else if (password.length < 4) {
          errMessages.push('Password has to be minimum 4 characters!')
        } else {
          const salted = Crypto.genSaltedPass(password)
          data.saltedPass = salted.passwordHash
          data.salt = salted.salt
        }
      } else {
        errMessages.push('Password is required!')
      }
    }

    // const whereClause = isExistingUser ? { id: credential.id } : super.getSequelize().and({ username }, { shopId })
    const whereClause = { username }
    return super.readOne<User>('User', whereClause).then(resp => {
      if (isExistingUser && !resp.status) {
        errMessages.push('Account is not found!')
      } else if (!isExistingUser && resp.status) {
        errMessages.push('Username is already taken!')
      }

      return super.readOne<Company>('Company', { uniqueCode: companyCode }).then(resp => {
        if (resp.status && resp.data) {
          data.companyId = resp.data.id
        } else {
          errMessages.push('Company doesn\'t exist!')
        }
        if (errMessages.length) {
          return { status: false, errMessage: errMessages.join(', ') }
        } else {
          return { status: true, data }
        }
      })

    })
  }

  register (username: string, password: string, passwordConfirm: string, companyCode: string): Promise<NCResponse<User>> {
    return this.validateCredential(username, password, passwordConfirm, companyCode, false, false).then(resp => {
      if (resp.status && resp.data) {
        return super.create<User>('User', resp.data)
      } else {
        return { status: false, errMessage: resp.errMessage }
      }
    })
  }
}

export default new UserService()
