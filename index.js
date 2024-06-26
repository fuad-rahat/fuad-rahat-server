const express=require('express');
const cors=require('cors');
const app=express();
const port= process.env.PORT || 5000;

require('dotenv').config()

//middleware

app.use(cors());
app.use(express.json());


const { MongoClient, ServerApiVersion } = require('mongodb');
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.g0tttxr.mongodb.net/?appName=Cluster0`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    // await client.connect();

    const photoCollection=client.db('fuadrahat').collection('photos');
    const messageCollection=client.db('fuadrahat').collection('message');

    app.post('/photos',async(req,res)=>{
        const photo=req.body;
        const result= await photoCollection.insertOne(photo);
        res.send(result);
    })

    app.get('/photos',async(req,res)=>{
      const result= await photoCollection.find().toArray();
      res.send(result);
    })

    app.post('/message',async(req,res)=>{
      const message=req.body;
      const result= await messageCollection.insertOne(message);
      res.send(result);
  })

  app.get('/message',async(req,res)=>{
    const result= await messageCollection.find().toArray();
    res.send(result);
  })


    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);


app.get('/',(req,res)=>{
    res.send('Fuad Rahat Portfolio is running...');
})

app.listen(port,(req,res)=>{
    console.log(`The Fuad Rahat portfolio site is running on port ${port}`)
})
