const express = require('express');
const app = express();
const cors = require('cors');
require('dotenv').config()
const port = process.env.PORT || 5000;



// middleware
app.use(cors());
app.use(express.json());


const { MongoClient, ServerApiVersion } = require('mongodb');
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.ncdn6ta.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

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
    await client.connect();

    const getUser = client.db("accounting-server").collection("User");


    app.get('/user', async(req, res) =>{
        const result = await getUser.find().toArray();
        res.send(result);
    })

    const createUser = client.db("accounting-server").collection("User");

    app.post('/user', async(req, res) =>{

        const user = req.body;
        const result = await createUser.insertOne(user);
        res.send(result);
    })
    const addPassportinfo = client.db("accounting-server").collection("passport_info");

    
    app.post('/passport', async(req, res) =>{
      const pass_info = req.body;
        const result = await addPassportinfo.insertOne(pass_info);
        res.send(result);

    })
    const getPassportinfo = client.db("accounting-server").collection("passport_info");

    app.get('/user/:email', async (req, res) => {
        try {
            const email = req.params.email;
            // Fetch all data where the email matches the provided email
            const userData = await getPassportinfo.find({ email }).toArray(); // Find documents matching the email
            
            res.send(userData);
        } catch (error) {
            console.error('Error fetching data:', error);
            res.status(500).json({ error: 'Internal Server Error' });
        }
    });
    

    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);


app.get('/',(req, res) =>{
    res.send('running')
})

app.listen(port, () =>{
    console.log(`running on ${port}`)
})