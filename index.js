require("dotenv").config();
const express = require("express");
const cors = require("cors");
const stripe = require('stripe')("sk_test_51OEHKpItrEdLuT7QFfLsHZW8zwDrTSOHDcz96uSkTmnuQ53TLekmLbYUrGmo3jziXO1Y16TUy8uQPmrSBNU3udx700F2sQLM6W")
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");

const app = express();
const port = process.env.PORT || 5000;

//middleware
app.use(cors());
app.use(express.json());
console.log(process.env.DB_PASS);

//quickshipUser

//nw2J9VqXcQ8zWX1N
const uri = `mongodb+srv://quickshipUser:nw2J9VqXcQ8zWX1N@cluster0.dbdkno8.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    // await client.connect();
    const pricingCollection = client.db("quickship").collection("pricing");
    const orderCollection = client.db("quickship").collection("order");
    const paymentCollection = client.db("quickship").collection("payment");
    const calculatorCollection = client.db("quickship").collection("calculator");

    //pricing collection
    // DB_USER=quickshipUser
    // DB_PASS=nw2J9VqXcQ8zWX1N
    app.get("/price-box", async (req, res) => {
      const result = await pricingCollection.find().toArray();
      res.send(result);
      console.log(result);
    });

    //pricing collection id
    app.get("/price-data/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await pricingCollection.findOne(query);
      res.send(result);
    });

    // Order collection 
    app.get("/order", async (req, res) => {
      const result = await orderCollection.find().toArray()
      res.send(result)
    })

    app.post("/order", async (req, res) => {
      const order = req.body
      order.time = new Date();
      // console.log(order);
      const result = await orderCollection.insertOne(order)
      res.send(result)
    })

    //payment api here
    app.post("/create-payment-intent", async (req, res) => {
      try {
        const {
          amount
        } = req.body

        const totalAmount = parseFloat(amount * 100)
        // console.log(totalAmount);
        const paymentIntent = await stripe.paymentIntents.create({
          amount: totalAmount,
          currency: "usd",
          payment_method_types: ["card"]
        })

        res.send({
          clientSecret: paymentIntent.client_secret
        })
      } catch (error) {
        console.log(error.message);
      }
    })

    app.post("/payment", async (req, res) => {
      const payment = req.body
      const result = await paymentCollection.insertOne(payment)
      res.send(result)
    })

    app.get("/payment", async (req, res) => {
      // const user = req.query.email
      // const query ={}
      // if (user) {
      //     query.email = user;
      // }
      const result = await paymentCollection.find().toArray()
      res.send(result)
    })



    // Delivery Calculator get here
    app.get("/calculator", async(req, res) =>{
      const result = await calculatorCollection.find().toArray()
      res.send(result)
    })

    // Delivery Calculator post here
    app.post("/calculator", async (req, res) =>{
      const calculator = req.body
      calculator.time = new Date();
      // console.log(calculator);
      const result = await calculatorCollection.insertOne(calculator)
      res.send(result)
    })



    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Welcome to the quick-ship News Server!");
});

app.listen(port, () => {
  console.log(`🚀 Server is listening on port ${port}`);
});
