import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import mongoose from 'mongoose';

import skotrum from './data/skotrum.json';
import gbgSkotrum from './data/gbgSkotrum.json';
import malmoSkotrum from './data/malmoSkotrum.json';

const mongoUrl = process.env.MONGO_URL || 'mongodb://localhost/skotrum-finalP';
mongoose.connect(mongoUrl, { useNewUrlParser: true, useUnifiedTopology: true });
mongoose.Promise = Promise;

// {
//   "name": "Aubergine",
//   "address": "Linnégatan 38, 114 47 Stockholm",
//   "phone": "08-6600204",
//   "openHours": "mån-tis 11.30–23.00, ons-tor 11.30–00.00, fre 11.30–01.00, lör 17.00–01.00, sön stängt",
//   "note": "Inget riktigt skötbord, men bra yta för blöjbyte.",
//   "website": "http://aubergine.se/",
//   "latitude": 59.3366,
//   "longitude": 18.082,
//   "coordinates": "59.33660, 18.08200"
// },

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
  longitude: Number
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
    required: true,
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

app.get('/findBabyRooms', async (req, res) => {
  const babyRooms = await BabyRooms.find();
  console.log(babyRooms);
  res.json(babyRooms);
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
  res.json(comment);
});

app.post('/', async (req, res) => {
  const comment = new Comment({ message: req.body.message });

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

app.post('/:id/like', async (req, res) => {
  try {
    const commentLiked = await Comment.findOneAndUpdate(
      { _id: req.params.id },
      { $inc: { heart: 1 } }
    );
    res.status(201).json(commentLiked);
  } catch (err) {
    res.status(404).json({ message: 'could not add like' });
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
