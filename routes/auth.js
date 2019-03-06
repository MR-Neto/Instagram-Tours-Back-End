const express = require('express');
const { OAuth2Client } = require('google-auth-library');

const router = express.Router();
const bcrypt = require('bcrypt');

const User = require('../models/user');

const { isLoggedIn } = require('../helpers/middlewares');


router.get('/me', (req, res, next) => {
  if (req.session.currentUser) {
    res.json(req.session.currentUser);
  } else {
    res.status(204).json({
      error: 'not-found',
    });
  }
});

router.post('/login', (req, res, next) => {
  if (req.session.currentUser) {
    return res.status(401).json({
      code: 'unauthorized',
    });
  }

  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(422).json({
      code: 'Empty User or Password',
    });
  }

  User.findOne({ username })
    .then((user) => {
      if (!user) {
        return res.status(404).json({
          code: 'Incorrect Username or Password',
        });
      }
      if (bcrypt.compareSync(password, user.password)) {
        req.session.currentUser = user;
        return res.status(200).json(user);
      }
      return res.status(404).json({
        code: 'Incorrect Username or Password',
      });
    })
    .catch(next);
});

router.post('/signup', (req, res, next) => {
  const {
    username,
    password,
    name,
    phoneNumber,
  } = req.body;

  if (!username || !password || !name || !phoneNumber) {
    return res.status(422).json({
      code: 'Check for empty fields',
    });
  }

  User.findOne({ username }, 'username')
    .then((userExists) => {
      if (userExists) {
        return res.status(422).json({
          code: 'Unavailable username',
        });
      }

      const salt = bcrypt.genSaltSync(10);
      const hashPass = bcrypt.hashSync(password, salt);

      const newUser = User({
        username,
        password: hashPass,
        name,
        phoneNumber,
      });

      return newUser.save().then(() => {
        req.session.currentUser = newUser;
        res.json(newUser);
      });
    })
    .catch(next);
});

router.post('/google', (req, res, next) => {
  console.log("body", req.body);
  const { tokenId } = req.body;
  console.log('ReceiveToken ', tokenId);


  const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

  async function verify() {
    const ticket = await client.verifyIdToken({
      idToken: tokenId,
      audience: process.env.GOOGLE_CLIENT_ID,
      // Specify the CLIENT_ID of the app that accesses the backend
      // Or, if multiple clients access the backend:
      //[CLIENT_ID_1, CLIENT_ID_2, CLIENT_ID_3]
    });
    console.log('Ticket ', ticket);

    const payload = ticket.getPayload();
    console.log('Payload ', payload);

    const userid = payload['sub'];
    console.log('userid ', userid);
  }
  verify().catch(console.error);
});

router.post('/logout', (req, res) => {
  req.session.destroy();
  return res.status(204).send();
});

router.get('/private', isLoggedIn(), (req, res, next) => {
  res.status(200).json({
    message: 'This is a private message',
  });
});

module.exports = router;
