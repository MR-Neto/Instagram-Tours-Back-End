const express = require('express');

const router = express.Router();
const Tour = require('../models/tour');
const User = require('../models/user');
const Place = require('../models/place');
const bookingAssistant = require('../helpers/booking');

const FULL_CAPACITY = 4;
const price = 1000;

router.get('/tours', (req, res, next) => {
  Tour.find({})
    .then((tours) => {
      res.status(200);
      res.json(tours);
    })
    .catch(next);
});

router.post('/book', async (req, res, next) => {
  const { date, user } = req.body.details;
  const { numberOfTickets } = user;

  try {
    const foundTour = await Tour.find({ date }).populate('users.buyer');
    let response;
    if (foundTour.length > 0) {
      response = await bookingAssistant.updateExistingTour(
        foundTour,
        req.body,
        price,
      );
    } else if (FULL_CAPACITY >= numberOfTickets) {
      response = await bookingAssistant.createNewTour(req.body, price);
    }
    if (response.type === 'StripeCardError') {
      res.status(401);
      res.json({ code: 'payment unsuccessful' });
    }
    res.status(response.status);
    res.json(response.json);
  } catch (error) {
    next(error);
  }
});

router.get('/:id/bookedtours', async (req, res, next) => {
  const { id } = req.params;

  try {
    const foundUser = await User.findById(id);
    if (foundUser) {
      const tours = await Tour.find({
        users: { $elemMatch: { buyer: id } }
      }).populate('places');
      if (tours) {
        res.status(200);
        res.json(tours);
      } else {
        res.status(204);
        res.json({
          message: 'no tours found'
        });
      }
    } else {
      res.status(404);
      res.json({
        message: 'no users found'
      });
    }
  } catch (error) {
    next(error);
  }
});

router.get('/places', (req, res, next) => {
  const { id } = req.query;
  if (id) {
    Place.find({ _id: { $in: JSON.parse(id) } })
      .then(places => {
        res.status(200);
        res.json(places);
      })
      .catch(next);
  } else {
    Place.find({})
      .then(places => {
        res.status(200);
        res.json(places);
      })
      .catch(next);
  }
});

module.exports = router;
