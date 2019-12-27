import CRUDService from './crud-service'
import * as Promise from 'bluebird'

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
}

export default new UserService()
