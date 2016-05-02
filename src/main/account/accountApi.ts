// var Q = require('q');
// var AccountService = require('./accountService'),
//   accountService;
// var Validator = require('../service/validationService'),
//   validator = new Validator();
//
// function handleError(res, error) {
//   console.log(error.stack);
//   res.status(error.status).send(error.message);
// }
//
// function login(req) {
//   var email = req.body.email;
//   var password = req.body.password;
//   return accountService.login(email, password);
// }
//
// function register(req) {
//   return accountService.register(req.body);
// }
//
// function loginApi(req, res, next) {
//   Q()
//     // Validate the email
//     .then(validator.validate.bind(this, req.body, 'email'))
//     // Validate the password
//     .then(validator.validate.bind(this, req.body, 'password'))
//     // Logs the use in
//     .then(function () {
//       return login(req);
//     })
//     // Success
//     .then(function (session) {
//       res.status(200).send(session);
//     })
//     // Failed
//     .catch(handleError.bind(this, res));
// }
//
// function registerApi(req, res, next) {
//   Q()
//     // Validate the email
//     .then(validator.validate.bind(this, req, 'body.email'))
//     // Validate the password
//     .then(validator.validate.bind(this, req, 'body.password'))
//     // Register the account
//     .then(function () {
//       return register(req)
//     })
//     // Success
//     .then(function (session) {
//       res.status(200).send(session);
//     })
//     // Failed
//     .catch(handleError.bind(this, res));
// }
//
// function getSessionApi(req, res) {
//   var token = req.cookies["x-access-token"];
//   if (!token || !req.session) {
//     return res.status(403).send();
//   }
//   return res.send(req.session);
// }
//
// function createInvitation(req, res){
//   Q()
//     // Validate the password
//     .then(function () {
//       return accountService.createInvitation(req.account, req.body);
//     })
//     .then(function (data) {
//       res.status(200).send(data);
//     })
//     // Failed
//     .catch(handleError.bind(this, res));
// }
//
// function findInvitation(req, res){
//   var code = req.param('code');
//   Q()
//     // Validate the password
//     .then(function () {
//       return accountService.findInvitation(req.account, code);
//     })
//     .then(function (data) {
//       res.status(200).send(data);
//     })
//     // Failed
//     .catch(handleError.bind(this, res));
// }
//
// function findInvitations(req, res){
//   Q()
//     // Validate the password
//     .then(function () {
//       return accountService.findInvitations(req.account);
//     })
//     .then(function (data) {
//       res.status(200).send(data);
//     })
//     // Failed
//     .catch(handleError.bind(this, res));
// }
//
// function requiresAuthentication(req, res, next) {
//   if (!req.account) {
//     return res.status(403).send();
//   }
//   return next();
// }
//
// /**
//  * Initialize the APIs.
//  * @param app
//  */
// function init(app) {
//   accountService = new AccountService(app);
//
//   app.server.post('/login', loginApi);
//   app.server.post('/register', registerApi);
//   app.server.get('/session', getSessionApi);
//   app.server.get('/invitation', requiresAuthentication, findInvitations);
//   app.server.get('/invitation/:code', requiresAuthentication, findInvitation);
//   app.server.post('/invitation', requiresAuthentication, createInvitation);
// }
//
// module.exports = init;