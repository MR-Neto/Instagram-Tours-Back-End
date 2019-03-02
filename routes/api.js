const express = require('express');
const stripe = require('stripe')('sk_test_sHrxfQkR33g4YZQOoSNkbLEf');

const router = express.Router();
const Tour = require('../models/tour');
const User = require('../models/user');
const Place = require('../models/place');


const fullCapacity = 4;
const price = 25;

router.get('/tours', (req, res, next) => {
  Tour.find({})
    .then((tours) => {
      res.status(200);
      res.json(tours);
    })
    .catch(next);
});

router.post('/book', async (req, res, next) => {
  const { date, user, places } = req.body.details;
  let updatedTour;
  let createdTour;

  try {
    // Set your secret key: remember to change this to your live secret key in production
    // See your keys here: https://dashboard.stripe.com/account/apikeys

    // Token is created using Checkout or Elements!
    // Get the payment token ID submitted by the form:
    const { token } = req.body;
    console.log('token back end', token);
    const charge = await stripe.charges.create({
      amount: 999,
      currency: 'eur',
      description: 'Example charge',
      source: 'tok_cvcCheckFail',
    });

    console.log('CHARGE ', charge);
    if (charge) {
      const foundTour = await Tour.find({ date }).populate('users.buyer');
      if (foundTour.length > 0) {
        const availableSeats = fullCapacity - foundTour[0]
          .users
          .reduce((acc, currentUser) => acc + Number(currentUser.numberOfTickets), 0);
        if (availableSeats >= user.numberOfTickets) {
          updatedTour = await Tour.findOneAndUpdate({ date },
            { $push: { users: user } },
            { new: true });
        } else {
          res.status(401);
          res.json({ code: 'tour is full' });
        }
      } else {
        const { buyer, numberOfTickets } = user;
        createdTour = await Tour.create({
          date,
          users: [{
            buyer,
            numberOfTickets,
          }],
          places,
          price,
        });
      }
    } else {
      console.log('CHARGE failed ', charge);
    }

    res.status(200);
    res.json({
      code: 'successful booking',
      tour: updatedTour || createdTour,
    });
  } catch (error) {
    if (error.type === 'StripeCardError') {
      res.status(401);
      res.json({ code: 'payment unsuccessful' });
    } else {
      next(error);
    }
  }
});

router.get('/:id/bookedtours', async (req, res, next) => {
  const { id } = req.params;

  try {
    const foundUser = await User.findById(id);
    if (foundUser) {
      const tours = await Tour.find({ users: { $elemMatch: { buyer: id } } });
      if (tours) {
        res.status(200);
        res.json(tours);
      } else {
        res.status(204);
        res.json({
          message: 'no tours found',
        });
      }
    } else {
      res.status(404);
      res.json({
        message: 'no users found',
      });
    }
  } catch (error) {
    next(error);
  }
});

router.get('/places', (req, res, next) => {
  Place.find({})
    .then((places) => {
      res.status(200);
      res.json(places);
    })
    .catch(next);
});

module.exports = router;
