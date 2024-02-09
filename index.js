require("dotenv").config();
const express = require("express");
const cors = require("cors");
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");

const app = express();
const port = process.env.PORT || 5000;

//middleware
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.dbdkno8.mongodb.net/?retryWrites=true&w=majority`;

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
    const usersCollection = client.db("quickship").collection("users");
    const pricingCollection = client.db("quickship").collection("pricing");
    const orderCollection = client.db("quickship").collection("order");
    const paymentCollection = client.db("quickship").collection("payment");
    const calculatorCollection = client
      .db("quickship")
      .collection("calculator");

    // jwt related api
    // app.post('/jwt', async (req, res) => {
    //   const user = req.body;
    //   const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '1h' });
    //   res.send({ token });
    // })

    // // middlewares
    // const verifyToken = (req, res, next) => {
    //   // console.log('inside verify token', req.headers.authorization);
    //   if (!req.headers.authorization) {
    //     return res.status(401).send({ message: 'unauthorized access' });
    //   }
    //   const token = req.headers.authorization.split(' ')[1];
    //   jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
    //     if (err) {
    //       return res.status(401).send({ message: 'unauthorized access' })
    //     }
    //     req.decoded = decoded;
    //     next();
    //   })
    // }

    // get method for order
    app.get("/order", async (req, res) => {
      const result = await orderCollection.find().toArray();
      res.send(result);
    });
    // my order email gays
    app.get("/order", async (req, res) => {
      console.log(req.query.email);
      let query = {};
      if (req.query?.email) {
        query = { email: req.query.email };
      }
      const result = await orderCollection.find(query).toArray();
      res.send(result);
    });

    //order delete
    app.delete("/order/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await orderCollection.deleteOne(query);
      res.send(result);
    });

    //order collection updated
    app.get("/order/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await orderCollection.findOne(query);
      res.send(result);
    });

    // user update
    app.patch("/order/:id", async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };
      const options = { upsert: true };
      const updateOrder = req.body;

      const orderUpdate = {
        $set: {
          phone: updateOrder.phone,
          price: updateOrder.productPrice,
          weight: updateOrder.weight,
          time: updateOrder.time,
        },
      };

      const result = await orderCollection.updateOne(
        filter,
        orderUpdate,
        options
      );
      res.send(result);
    });
    // user return
    app.patch("/order/:id", async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };
      const options = { upsert: true };
      const returnOrder = req.body;

      const orderReturn = {
        $set: {
          name: returnOrder.name,
          price: returnOrder.productPrice,
          weight: returnOrder.weight,
        },
      };

      const result = await orderCollection.updateOne(
        filter,
        orderReturn,
        options
      );
      res.send(result);
    });

    // get method for users
    app.get("/users", async (req, res) => {
      const result = await userCollection.find().toArray();
      res.send(result);
    });

    // use verify admin after verifyToken

    // users related api
    // const verifyAdmin = async (req, res, next) => {
    //         const email = req.decoded.email;
    //         const query = {
    //             email: email
    //         };
    //         const user = await usersCollection.findOne(query);
    //         const isAdmin = user?.role === 'admin';
    //         if (!isAdmin) {
    //             return res.status(403).send({
    //                 message: 'forbidden access'
    //             });
    //         }
    //         next();
    //     }

    // app.get("/users", async (req, res) => {
    //         const admin = req.query.role
    //         // console.log(admin);
    //         const query = {}

    //         if (admin) {
    //             query.role = admin;
    //         }
    //         const result = await usersCollection.find(query).toArray()
    //         res.send(result)
    //     })

    //     app.get('/users/admin/:email', async (req, res) => {
    //         const email = req.params.email;

    //         if (email !== req.decoded.email) {
    //             return res.status(403).send({
    //                 message: 'forbidden access'
    //             })
    //         }

    //         const query = {
    //             email: email
    //         };
    //         const user = await usersCollection.findOne(query);
    //         let admin = false;
    //         if (user) {
    //             admin = user?.role === 'admin';
    //         }
    //         res.send({
    //             admin
    //         });
    //     })

    app.post("/users", async (req, res) => {
      const user = req.body;
      const query = {
        email: user.email,
      };
      const existingUser = await usersCollection.findOne(query);
      if (existingUser) {
        return res.send({
          message: "user already exist",
          insertedId: null,
        });
      }
      const result = await usersCollection.insertOne(user);
      res.send(result);
    });

    //pricing collection
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
      const user = req.query.email;
      const query = {};
      if (user) {
        query.email = user;
      }

      const result = await orderCollection.find(query).toArray();
      res.send(result);
    });

    app.get("/order/:id", async (req, res) => {
      const id = req.params.id;
      const query = {
        _id: new ObjectId(id),
      };
      const result = await orderCollection.findOne(query);
      res.send(result);
    });

    app.post("/order", async (req, res) => {
      const order = req.body;
      order.time = new Date();
      // console.log(order);
      const result = await orderCollection.insertOne(order);
      res.send(result);
    });

    //payment api here
    app.post("/create-payment-intent", async (req, res) => {
      try {
        const { amount } = req.body;

        const totalAmount = parseFloat(amount * 100);
        // console.log(totalAmount);
        const paymentIntent = await stripe.paymentIntents.create({
          amount: totalAmount,
          currency: "usd",
          payment_method_types: ["card"],
        });

        res.send({
          clientSecret: paymentIntent.client_secret,
        });
      } catch (error) {
        console.log(error.message);
      }
    });

    app.post("/payment", async (req, res) => {
      const payment = req.body;
      const result = await paymentCollection.insertOne(payment);
      res.send(result);
    });

    app.get("/payment", async (req, res) => {
      const user = req.query.email;
      const query = {};
      if (user) {
        query.email = user;
      }
      const result = await paymentCollection.find(query).toArray();
      res.send(result);
    });

    // Delivery Calculator get here
    app.get("/calculator", async (req, res) => {
      const result = await calculatorCollection.find().toArray();
      res.send(result);
    });

    // Delivery Calculator post here
    app.post("/calculator", async (req, res) => {
      const calculator = req.body;
      calculator.time = new Date();
      // console.log(calculator);
      const result = await calculatorCollection.insertOne(calculator);
      res.send(result);
    });

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
