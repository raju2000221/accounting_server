const express = require('express');
const app = express();
const cors = require('cors');
require('dotenv').config()
const port = process.env.PORT || 5000;
const bcrypt = require('bcrypt');
const nodemailer = require('nodemailer');



// middleware
app.use(cors());
app.use(express.json());


const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
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


    app.get('/user', async (req, res) => {
      const result = await getUser.find().toArray();
      res.send(result);
    })
    // for register
    app.post('/register', async (req, res) => {
      try {
        const loginUser = client.db("accounting-server").collection("User");
        const user = req.body;
        const { email } = user;

        const existingUser = await loginUser.findOne({ email });
        if (existingUser) {
          return res.status(400).send("Email already exists");
        }

        const hashedPassword = await bcrypt.hash(user.password, 10);
        user.password = hashedPassword;
        await loginUser.insertOne(user);
        res.status(200).send("Registration successful");
      } catch (error) {
        console.error("Error registering user:", error);
        res.status(500).send("Internal Server Error");
      }
    });
    // for login

    app.post('/login', async (req, res) => {
      try {
        const loginUser = client.db("accounting-server").collection("User");
        const { email, password } = req.body;

        // Find the user with the provided email
        const user = await loginUser.findOne({ email });
        if (!user) {
          return res.status(401).send("Invalid email or password");
        }

        // Compare hashed passwords
        const passwordMatch = await bcrypt.compare(password, user.password);
        if (!passwordMatch) {
          return res.status(401).send("Invalid email or password");
        }

        // If the passwords match, send a success response
        res.status(200).json({ user: user });
      } catch (error) {
        console.error("Error logging in:", error);
        res.status(500).send("Internal Server Error");
      }
    });

    // set passportinfo
    const addPassportinfo = client.db("accounting-server").collection("passport_info");


    app.post('/passport', async (req, res) => {
      const pass_info = req.body;
      const result = await addPassportinfo.insertOne(pass_info);
      res.send(result);

    })

    const getPassportinfo = client.db("accounting-server").collection("passport_info");
    // get loguser info
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

// Update a specific passport document
const updateUser = client.db("accounting-server").collection("passport_info");
app.put('/passport/:id', async (req, res) => {
  try {
    const id = new ObjectId(req.params.id); // Get the document ID from the request URL
    const { deposit, updateDate } = req.body; // Get the deposit amount and update date from the request body

    // Update the specified document's deposit field value and update date
    const result = await client.db("accounting-server").collection("passport_info").updateOne(
      { _id: id }, // Filter criteria to find the document by its ID
      { $set: { deposit, updateDate } } // Update operation using $set to set the new values
    );

    res.send({ message: 'Deposit amount and update date updated successfully' });
  } catch (error) {
    console.error('Error updating deposit and update date:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

//  send email
    // Send email endpoint
    app.post('/send-email', async (req, res) => {
      try {
          const { email } = req.body;
  
          // Create a transporter using the default SMTP transport
          const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER, // Your Gmail email address
                pass: process.env.EMAIL_PASS // Your Gmail password or an app-specific password
            }
          });
  
          // Send mail with defined transport object
          const info = await transporter.sendMail({
              from: "bdrajuislam246@gmail.com",
              to: email,
              subject: "Password reset",
              text: "Reset Your Password by click this link - http://localhost:5173/reset-password",
          });
  
          console.log('Email sent: ', info.response);
          res.status(200).send('Email sent successfully');
      } catch (error) {
          console.error('Error sending email:', error);
          res.status(500).send('Internal Server Error');
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


app.get('/', (req, res) => {
  res.send('running')
})

app.listen(port, () => {
  console.log(`running on ${port}`)
})