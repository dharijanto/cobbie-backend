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
}
