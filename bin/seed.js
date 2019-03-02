require('dotenv').config();
const mongoose = require('mongoose');
const Place = require('../models/place');

mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true })
  .then(() => {
    console.log('connected');
    return Place.deleteMany();
  })
  .then(() => {
    console.log('deleted');
    const places = [
      {
        name: 'Sagrada Familia',
        location: {
          type: 'Point',
          coordinates: [2.1744, 41.4036],
        },
        imagesURL: ['https://images.unsplash.com/photo-1503306488045-e91a3faca799?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=1650&q=80'],
      },
      {
        name: 'Bunkers',
        location: {
          type: 'Point',
          coordinates: [2.1619, 41.4194],
        },
        imagesURL: ['https://images.unsplash.com/photo-1516982595895-5a78ae962b15?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=975&q=80'],
      },
      {
        name: 'Arc Triomf',
        location: {
          type: 'Point',
          coordinates: [2.1806, 41.3911],
        },
        imagesURL: ['https://images.unsplash.com/photo-1486591913781-4bee9ed65bfe?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=1650&q=80'],
      },
      {
        name: 'Pedrera',
        location: {
          type: 'Point',
          coordinates: [2.1620, 41.3954],
        },
        imagesURL: ['https://images.unsplash.com/photo-1528744598421-b7b93e12df15?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=800&q=80'],
      },
      {
        name: 'Parc Guell',
        location: {
          type: 'Point',
          coordinates: [2.1527, 41.4145],
        },
        imagesURL: ['https://images.unsplash.com/photo-1544918877-460635b6d13e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=1655&q=80'],
      },
      {
        name: 'Tibidabo',
        location: {
          type: 'Point',
          coordinates: [2.1186, 41.4225],
        },
        imagesURL: ['https://images.unsplash.com/photo-1511527661048-7fe73d85e9a4?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=802&q=80'],
      },
    ];

    return Place.insertMany(places);
  })
  .then(() => {
    console.log('loaded data');
    mongoose.connection.close();
  })
  .catch((err) => {
    console.log('error ', err);
  });
