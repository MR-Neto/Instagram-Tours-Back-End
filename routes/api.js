const express = require('express');

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
  const { date, user, places } = req.body;
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
        updatedTour = await Tour.findOneAndUpdate({ date },
          {
            $push: { users: user },
            isFull,
          },
          { new: true });
      } else {
        res.status(401);
        res.json({
          message: 'Not enough seats left',
          foundTour,
        });
      }
    } else if (FULL_CAPACITY >= numberOfTickets) {
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
    }
    res.status(200);
    res.json(updatedTour || createdTour);
  } catch (error) {
    next(error);
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
