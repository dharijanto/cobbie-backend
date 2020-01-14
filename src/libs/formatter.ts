import * as moment from 'moment'

export default class Formatter {
  static validateEmail (email) {
    let re = /(\S+@\S+\.\S+)|(^$)/
    return re.test(email)
  }

  static validateUsername (username) {
    let re = /^[a-zA-Z]+[0-9a-zA-Z]{4,15}$/
    return re.test(username)
  }

  static validatePhoneNumber (phone: string) {
    return phone && phone.length > 5
  }

  static dateToString (date: any) {
    return moment(date).format('YY-MM-DD hh:mm:ss')
  }
}
