const express = require('express');
const { OAuth2Client } = require('google-auth-library');

const router = express.Router();
const bcrypt = require('bcrypt');

const User = require('../models/user');

const { isLoggedIn } = require('../helpers/middlewares');
const sendConfirmationEmail = require('../helpers/gridEmail');

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

router.post('/google', async (req, res, next) => {
  try {
    const { tokenId } = req.body;

    const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

    const ticket = await client.verifyIdToken({
      idToken: tokenId,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();

    const { email, name, imageURL } = payload;

    if (req.session.currentUser) {
      return res.status(401).json({
        code: 'unauthorized',
      });
    }

    const user = await User.findOne({ username: email, isCreatedFromGoogle: true });
    if (!user) {
      const newUser = User({
        username: email,
        name,
        email,
        imageURL,
        isCreatedFromGoogle: true,
      });
      const newUserSaved = await newUser.save();
      req.session.currentUser = newUser;
      sendConfirmationEmail(newUserSaved.email,
        'miguelribeironeto@gmail.com',
        'YOU JUST BOOKED A TOUR FOR',
        'Thanks for your booking. Your payment was successful');
      return res.status(201).json(newUser);
    }
    req.session.currentUser = user;
    return res.status(200).json(user);
  } catch (err) {
    return err;
  }
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
