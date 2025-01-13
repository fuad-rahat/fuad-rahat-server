const express = require('express');
const cors = require('cors');
const nodemailer = require('nodemailer');
const { MongoClient, ServerApiVersion } = require('mongodb');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB setup
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.g0tttxr.mongodb.net/?appName=Cluster0`;
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

// Create a Nodemailer transporter
const transporter = nodemailer.createTransport({
  service: 'gmail', // You can replace this with another service like 'smtp.mailtrap.io' or 'outlook'
  auth: {
    user: process.env.EMAIL_USER, // Your email address (must be stored in .env for security)
    pass: process.env.EMAIL_PASS, // Your email password (or app password if using Gmail with 2FA)
  },
});

async function run() {
  try {
    await client.connect();
    const photoCollection = client.db('fuadrahat').collection('photos');
    const messageCollection = client.db('fuadrahat').collection('message');

    // Endpoint to save photo data to MongoDB
    app.post('/photos', async (req, res) => {
      const photo = req.body;
      const result = await photoCollection.insertOne(photo);
      res.send(result);
    });

    // Endpoint to get all photo data from MongoDB
    app.get('/photos', async (req, res) => {
      const result = await photoCollection.find().toArray();
      res.send(result);
    });

    // Endpoint to handle contact form submission and send email using Nodemailer
    app.post('/message', async (req, res) => {
      const { name, email, message } = req.body;
      console.log(`Received message from ${name} (${email}): ${message}`);
    
      // Save the message to the MongoDB database
      const result = await messageCollection.insertOne({ name, email, message });
    
      // Send email notification
      const mailOptions = {
        from: email,
        to: process.env.EMAIL_USER,
        subject: `Client from Portfolio ${name}`,
        text: `New message from client ${name} (${email}):\n\n${message}`,
      };
    
      try {
        // Send the email using Nodemailer
        await transporter.sendMail(mailOptions);
        res.send({ message: 'Message sent successfully and saved to the database!' });
      } catch (error) {
        console.error('Error sending email:', error);
        res.status(500).send({ message: 'Error sending email. Please try again later.' });
      }
    });
    

    // Endpoint to get all messages from the database
    app.get('/message', async (req, res) => {
      const result = await messageCollection.find().toArray();
      res.send(result);
    });

    // Test MongoDB connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

// Default route
app.get('/', (req, res) => {
  res.send('Fuad Rahat Portfolio is running...');
});

app.listen(port, () => {
  console.log(`The Fuad Rahat portfolio site is running on port ${port}`);
});
