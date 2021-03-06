import express from 'express'
import bodyParser from 'body-parser'
import cors from 'cors'
import mongoose from 'mongoose'
import goldenGlobesData from './data/golden-globes.json'

// If you're using one of our datasets, uncomment the appropriate import below
// to get started!
// 
// 
// import avocadoSalesData from './data/avocado-sales.json'
// import booksData from './data/books.json'
// import netflixData from './data/netflix-titles.json'
// import topMusicData from './data/top-music.json'

/* {
  "year_film": 2009,
  "year_award": 2010,
  "ceremony": 67,
  "category": "Best Motion Picture - Drama",
  "nominee": "Avatar",
  "film": "",
  "win": true
} */

const mongoUrl = process.env.MONGO_URL || "mongodb://localhost/project-mongo"
mongoose.connect(mongoUrl, { useNewUrlParser: true, useUnifiedTopology: true })
mongoose.Promise = Promise



const Globe = mongoose.model('Globe', {
  year_film: {
    type: Number
  },
  year_award: {
    type: Number
  },
  ceremony: {
    type: Number
  },
  category: {
    type: String
  },
  nominee: {
    type: String
  },
  film: {
    type: String
  },
  win: {
    type: Boolean
  }
});

if (process.env.RESET_DB) {
  const seedDatabase = async() => {
    await Globe.deleteMany({})

    goldenGlobesData.forEach((globes) => {
      new Globe(globes).save()
    });
  }
  seedDatabase()
}



// Defines the port the app will run on. Defaults to 8080, but can be 
// overridden when starting the server. For example:
//
//   PORT=9000 npm start
const port = process.env.PORT || 8080
const app = express()

// Add middlewares to enable cors and json body parsing
app.use(cors())
app.use(bodyParser.json())

app.get('/globes', (req, res) => {
  const queryString = req.query.q;
  const queryRegex = new RegExp(queryString, "i")
  Globe.find({ 'nominee': queryRegex }).then(results => {
    if (results.length > 0) {
      res.json(results)
    } else {
      res.status(404).json({ error: 'Cannot find this nominee' })
    }
  });
});

app.get('/globes/_id/:_id', (req, res) => {
  const _id = req.params._id;
  Globe.findOne({ '_id': _id })
    .then((results) => {
      res.json(results);
    }).catch((err) => {
      res.json({ message: 'Cannot find this film', err: err })
    });
});

// Start defining your routes here
app.get('/', (req, res) => {
  res.send('End points: /globes/_id/*** or /gloves?q=***')
})

// Start the server
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`)
})