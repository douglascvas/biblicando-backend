// namespace account
// var Q = require('q');
// var RestException = require('./validationException');
// var exceptionMessage = require('./exceptionMessage');
// var bcrypt = require('bcrypt');
// var AccountDao = require('./mysql/dao/accountDao');
// var SessionDao = require('./mysql/dao/sessionDao');
//
// export class AccountService {
// constructor(app, accountDao, sessionDao){
// 
// }
//   // this.app = app;
//   // this.accountDao = new AccountDao(app);
//   // this.sessionDao = new SessionDao(app);
//
// private protectPassword(password) {
//   var deferred = Q.defer();
//   bcrypt.genSalt(10, function (err, salt) {
//     bcrypt.hash(password, salt, function (err, hash) {
//       if (err) {
//         throw err;
//       }
//       deferred.resolve(hash);
//     });
//   });
//   return deferred.promise;
// }
//
//   public findSession(token) {
//     return this.sessionDao.findSession(token);
//   },
//   /**
//    * Logs the user in.
//    * @param email
//    * @param password
//    * @returns
//    */
//   login: function (email, password) {
//     var self = this;
//     var account;
//     // Find the account
//     return self.accountDao.findAccount(email)
//       // Check the credentials
//       .then(function (acc) {
//         if (acc == null) {
//           throw new RestException(404, exceptionMessage('not.found', email));
//         }
//         account = acc;
//         return self.authenticate(account, password);
//       })
//       // Create the session
//       .then(function (match) {
//         if (!match) {
//           throw new RestException(401, exceptionMessage('invalid.credentials'));
//         }
//         delete account.password;
//         return self.createSession(account);
//       });
//   },
//
//   /**
//    * Registers a new user.
//    * @param account
//    * @returns
//    */
//   register: function (data) {
//     var self = this;
//     var account = {
//       email: data.email
//     };
//     var admin = this.app.config.get("app.adminEmail");
//     return Q(admin)
//       .then(function (admin) {
//         if (admin != data.email) {
//           return self.accountDao.findInvitation(data.invitation)
//         }
//         return true;
//       })
//       .then(function (invitation) {
//         if (!invitation || invitation.used) {
//           throw new RestException(403, exceptionMessage('invalid.invitation'));
//         }
//       })
//       .then(function () {
//         return protectPassword(data.password)
//       })
//       // Get the hash for the password
//       .then(function (password) {
//         account.password = password;
//         return self.findAccount(account.email)
//       })
//       // Check if the user does not exist already and register if not
//       .then(function (existing) {
//         if (existing) {
//           throw new RestException(400, exceptionMessage('user.already.exists', account.email));
//         }
//         return self.accountDao.createAccount(account);
//       })
//       // Login the user
//       .then(function (account) {
//         return self.accountDao.useInvitation(data.invitation).then(function () {
//           return self.createSession(account);
//         });
//       });
//   },
//   /**
//    * Find the account in the database.
//    * @param email
//    * @returns
//    */
//   findAccount: function (email) {
//     return this.accountDao.findAccount(email);
//   },
//   /**
//    * Check if the given password is correct.
//    * @param account
//    * @param password
//    * @returns
//    */
//   authenticate: function (account, password) {
//     var deferred = Q.defer();
//     bcrypt.compare(password, account.password, deferred.makeNodeResolver());
//     return deferred.promise;
//   },
//
//   createSession: function (account) {
//     var self = this;
//     var token = bcrypt.hashSync(account.email + Date.now(), 8);
//
//     delete account.password;
//     delete account._id;
//     var session = {
//       token: token,
//       accountEmail: account.email,
//       created: new Date()
//     };
//     return this.sessionDao.createSession(session)
//       .then(function (session) {
//         return session;
//       });
//   },
//
//   createInvitation: function (account) {
//     var deferred = Q.defer();
//     var admin = this.app.config.get("app.adminEmail");
//     if (!admin || account.email !== admin) {
//       throw new RestException(403, exceptionMessage('not.allowed'));
//     }
//     var code = bcrypt.hashSync(account.email + Date.now(), 8).replace(/[^a-zA-Z0-9]/g, '');
//     return this.accountDao.createInvitation(code);
//   },
//
//   findInvitation: function (account, code) {
//     var self = this;
//     var admin = this.app.config.get("app.adminEmail");
//     if (!admin || account.email !== admin) {
//       throw new RestException(403, exceptionMessage('not.allowed'));
//     }
//     return self.accountDao.findInvitation(code);
//   },
//
//   findInvitations: function (account) {
//     var self = this;
//     var admin = this.app.config.get("app.adminEmail");
//     if (!admin || account.email !== admin) {
//       throw new RestException(403, exceptionMessage('not.allowed'));
//     }
//     return self.accountDao.findInvitations();
//   },
//
//   /**
//    * Intercepts a request and set the account info into the request
//    * object, if the user is authenticated.
//    */
//   authenticationInterceptor: function () {
//     var self = this;
//     return function (req, res, next) {
//       console.log('Checking authentication at ', req.path);
//       var token = req.get('x-access-token') || req.cookies["x-access-token"];
//       if (!token) {
//         return next();
//       }
//       return self.findSession(token).then(function (session) {
//         if (!session) {
//           return next();
//         }
//         req.session = session;
//         req.account = session.account;
//         return next();
//       });
//     }
//   }
// };
//
// module.exports = AccountService;