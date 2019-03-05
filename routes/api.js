const express = require('express');
const stripe = require('stripe')(process.env.STRIPE_SECRET);

const router = express.Router();
const Tour = require('../models/tour');
const User = require('../models/user');
const Place = require('../models/place');

const FULL_CAPACITY = 4;
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
  const { buyer, numberOfTickets } = user;
  let updatedTour;
  let createdTour;

  try {
    const foundTour = await Tour.find({ date }).populate('users.buyer');
    if (foundTour.length > 0) {
      const availableSeats = FULL_CAPACITY - foundTour[0]
        .users
        .reduce((acc, currentUser) => acc + Number(currentUser.numberOfTickets), 0);
      const isFull = availableSeats - numberOfTickets <= 0;
      if (availableSeats >= numberOfTickets) {
        const { token } = req.body;
        const charge = await stripe.charges.create({
          amount: 50,
          currency: 'eur',
          description: 'Instagram Tour',
          source: token,
        });

        updatedTour = await Tour.findOneAndUpdate({ date },
          {
            $push: { users: user },
            isFull,
          },
          { new: true });

        res.status(200);
        res.json({
          code: 'successful booking',
          tour: updatedTour,
          payment: charge,
        });
      } else {
        res.status(401);
        res.json({
          code: 'Not enough seats left',
          foundTour,
        });
      }
    } else if (FULL_CAPACITY >= numberOfTickets) {
      const { token } = req.body;
      const charge = await stripe.charges.create({
        amount: 50,
        currency: 'eur',
        description: 'Instagram Tour',
        source: token,
      });

      const isFull = numberOfTickets >= FULL_CAPACITY;
      createdTour = await Tour.create({
        date,
        users: [{
          buyer,
          numberOfTickets,
        }],
        places,
        price,
        isFull,
      });

      res.status(200);
      res.json({
        code: 'successful booking',
        tour: createdTour,
        payment: charge,
      });
    }
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
  const { id } = req.query;
  if (id) {
    const parsedId = JSON.parse(id);
    Place.find({ _id: { $in: parsedId } })
      .then((places) => {
        res.status(200);
        res.json(places);
      })
      .catch(next);
  } else {
    Place.find({})
      .then((places) => {
        res.status(200);
        res.json(places);
      })
      .catch(next);
  }
});

module.exports = router;
