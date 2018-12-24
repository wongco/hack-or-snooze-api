const express = require('express');
const router = new express.Router();

/** base route - auth resources */

/** POST - /signup
 * desc: create an account and receive token
 * input: { user: { name, username, password } }
 * output: { token, user: { userDetails } }
 */
router.post('/signup', (req, res, next) => {
  try {
    return res.json({ message: 'signup reached!' });
  } catch (error) {
    return next(error);
  }
});

/** POST - /login
 * desc: Login to Receive a Token
 * input: { user: username, password }
 * output: { token, user: {userDetails} }
 */
router.post('/login', (req, res, next) => {
  try {
    return res.json({ message: 'login reached!' });
  } catch (error) {
    return next(error);
  }
});

// exports router for app.js use
module.exports = router;
