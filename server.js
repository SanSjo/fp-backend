import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import mongoose from 'mongoose';

import skotrum from './data/skotrum.json';
import gbgSkotrum from './data/gbgSkotrum.json';
import malmoSkotrum from './data/malmoSkotrum.json';

//const mongoUrl = process.env.MONGO_URL || 'mongodb://localhost:27017/skotrum-finalP';
const mongoURI = 'mongodb+srv://sansjo:technigo19@cluster0.xevnw.mongodb.net/skotrum-finalP?retryWrites=true&w=majority'

mongoose.connect(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true }).catch(err => console.log(err));

mongoose.Promise = Promise;


const BabyRoomMalmo = mongoose.model('BabyRoomMalmo', {
  name: String,
  address: String,
  phone: String,
  openHours: String,
  note: String,
  website: String,
  latitude: Number,
  longitude: Number
});

const BabyRoomGbg = mongoose.model('BabyRoomGbg', {
  name: String,
  address: String,
  phone: String,
  openHours: String,
  note: String,
  website: String,
  latitude: Number,
  longitude: Number,
});


const BabyRooms = mongoose.model('BabyRooms', {
  name: String,
  address: String,
  phone: String,
  openHours: String,
  note: String,
  website: String,
  latitude: Number,
  longitude: Number,
  available: Boolean
});

const Comment = mongoose.model('Comment', {
  comment: {
    type: String,
    minLength: 5,
    minLength: 140
  },
  like: {
    type: Number,
    default: 0
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

if (process.env.RESET_DB) {
  const seedDatabase = async () => {
    await BabyRooms.deleteMany();
    await BabyRoomGbg.deleteMany();
    await BabyRoomMalmo.deleteMany();

    skotrum.forEach(restData => {
      new BabyRooms(restData).save();
    });

    gbgSkotrum.forEach(restData => {
      new BabyRoomGbg(restData).save();
    });

    malmoSkotrum.forEach(restData => {
      new BabyRoomMalmo(restData).save();
    });
  };
  seedDatabase();
}

// Defines the port the app will run on. Defaults to 8080, but can be
// overridden when starting the server. For example:
//
//   PORT=9000 npm start
const port = process.env.PORT || 8080;
const app = express();

// Add middlewares to enable cors and json body parsing
app.use(cors());
app.use(bodyParser.json());

// Start defining your routes here

app.get('/findBabyRooms/', async (req, res) => {
  const babyRooms = await BabyRooms.find();

  res.json(babyRooms);

  console.log(babyRooms);
});



app.get('/findBabyRooms/:id', async (req, res) => {
  const babyRooms = await BabyRooms.findById(req.params.id);
  if (babyRooms) {
    res.json(babyRooms);
  } else {
    res.status(404).json({ error: 'babyroom not found' });
  }
  console.log(babyRooms);
});

app.get('/gbgBabyRooms', async (req, res) => {
  const gbgBabyRoom = await BabyRoomGbg.find();
  console.log(gbgBabyRoom);
  res.json(gbgBabyRoom);
});

app.get('/malmoBabyRooms', async (req, res) => {
  const malmoBabyRoom = await BabyRoomMalmo.find();
  console.log(malmoBabyRoom);
  res.json(malmoBabyRoom);
});

/// Comment endpoint

app.get('/', async (req, res) => {
  const comment = await Comment.find()
    .sort({ createdAt: 'desc' })
    .limit(20);

  if (comment) {
    res.json(comment);
  } else {
    res.status(404).json({ error: 'babyroom not found' });
  }
});

app.post('/', async (req, res) => {
  const comment = new Comment({ comment: req.body.comment });

  try {
    const savedComment = await comment.save();
    res.status(201).json(savedComment);
  } catch (err) {
    res.status(400).json({
      message: 'could not add a comment to the api',
      error: err.errors
    });
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
