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

    app.get("/search", async (req, resp) => {
      const { key } = req.query;
      let searchQuery = {};

      console.log("Received request with key:", key);

      if (!key) {
        return resp.status(400).send("Missing search key parameter");
      }

      // Check if the key starts with a dollar sign ('$')
      if (key.startsWith("$")) {
        searchQuery = {
          price: key, // Search directly for the "money" field as a string
        };
      } else {
        // If it doesn't start with a dollar sign, assume it's a regular search
        searchQuery = {
          $or: [
            { name: { $regex: key, $options: "i" } },
            { memory: { $regex: key, $options: "i" } },
            { type: { $regex: key, $options: "i" } },
            { processor: { $regex: key, $options: "i" } },
            { OS: { $regex: key, $options: "i" } },
          ],
        };
      }

      console.log("Search Query:", searchQuery);

      const data = await productsCollection.find(searchQuery).toArray();

      console.log("Filtered Products:", data);
      resp.send(data);
    });
  } finally {
  }
}
run().catch(console.dir);
// Moved the root route outside of the run function
app.get("/", (req, res) => {
  res.send("Mobile Ordering Application server side is running");
});

app.listen(port, () => {
  console.log(`Mobile Ordering Application side running on port ${port}`);
});
