import * as crypto from 'crypto'

const md5 = require('md5')

export default {
  genRandomString: function (length) {
    return crypto.randomBytes(Math.ceil(length / 2))
            .toString('hex') /** convert to hexadecimal format */
            .slice(0, length)   /** return required number of characters */
  },

  sha512: function (password, salt) {
    let hash = crypto.createHmac('sha512', salt)
    hash.update(password)
    let value = hash.digest('hex')
    return {
      salt,
      passwordHash: value
    }
  },

  md5: function (data) {
    return md5(data)
  },

  genSaltedPass: function (userpassword) {
    let salt = this.genRandomString(16) /** Gives us salt of length 16 */
    let passwordData = this.sha512(userpassword, salt)
    // {"salt":"62fa5c180fd6712b",
    //  "passwordHash":"fda8dac043102a3dbd7bda823853b7a854bf9079ebbf0a2f84b218964864a0e5be6a9a517f43977708fbd3553dfa7dc53c2afcdb995e85972cd9b747eef7939f"}
    return passwordData
  },

  saltPass: function (pass, salt) {
    let passwordData = this.sha512(pass, salt)
    return passwordData.passwordHash
  }
}
