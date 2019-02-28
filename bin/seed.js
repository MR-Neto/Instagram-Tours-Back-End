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
        imagesURL: ['https://aws-tiqets-cdn.imgix.net/images/content/3ca6b020234e47448d46547ff3ac6b3f.jpg?auto=format&fit=crop&ixlib=python-1.1.2&q=25&s=434230a6bbd198e7be30fa3c234e13bd&w=400&h=320&dpr=2.625'],
      },
      {
        name: 'Bunkers',
        location: {
          type: 'Point',
          coordinates: [2.1619, 41.4194],
        },
        imagesURL: ['https://t1.salir.ltmcdn.com/es/places/8/0/8/img_127808_bunkers-del-carmel_0_600.jpg'],
      },
      {
        name: 'Arc Triomf',
        location: {
          type: 'Point',
          coordinates: [2.1806, 41.3911],
        },
        imagesURL: ['https://upload.wikimedia.org/wikipedia/commons/3/3f/Arc_Triomf_31-10-13.JPG'],
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
