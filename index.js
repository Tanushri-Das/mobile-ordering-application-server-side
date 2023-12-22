const express = require("express");
const app = express();
const cors = require("cors");
require("dotenv").config();
const port = process.env.PORT || 5000;
const { MongoClient, ServerApiVersion } = require("mongodb");

app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.tdjlbxg.mongodb.net/?retryWrites=true&w=majority`;

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
    await client.connect();

    const productsCollection = client
      .db("mobileOrderApplication")
      .collection("products");

    // Moved route handlers outside of the run function
    app.get("/products", async (req, res) => {
      const result = await productsCollection.find().toArray();
      res.send(result);
    });

    app.get("/search", async (req, res) => {
      const { name, type, processor, memory, os, minPrice, maxPrice } =
        req.query;

      const filter = {};

      // Use $or to match any of the specified criteria
      filter.$or = [];

      if (name) filter.$or.push({ name: new RegExp(name, "i") });
      if (processor) filter.$or.push({ processor: new RegExp(processor, "i") });

      if (type) filter.type = type;
      if (memory) filter.memory = memory;
      if (os) filter.OS = os;

      if (minPrice || maxPrice) {
        filter.price = {};
        if (minPrice) filter.price.$gte = parseFloat(minPrice);
        if (maxPrice) filter.price.$lte = parseFloat(maxPrice);
      }

      console.log("Received parameters:", req.query);
      console.log("Constructed filter:", filter);

      const result = await productsCollection.find(filter).toArray();
      res.send(result);
    });
  } finally {
    // Don't forget to close the connection when done
    // Commented out for now as we want the server to keep running
    // await client.close();
  }
}

// Run the application
run().catch(console.dir);

// Moved the root route outside of the run function
app.get("/", (req, res) => {
  res.send("Mobile Ordering Application server side is running");
});

app.listen(port, () => {
  console.log(`Mobile Ordering Application side running on port ${port}`);
});
