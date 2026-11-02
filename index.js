import { MongoClient } from "mongodb";
import express from "express"
import "dotenv/config";
import cors from "cors"
const app = express();
const port = 5000;
app.use=cors()
app.use=express.json()


const client = new MongoClient(process.env.MONGO_URI);

export async function connectToMongoDB() {
  try {
    await client.connect();
    console.log("You successfully connected to MongoDB!");
    return client;
  } catch (err) {
    console.dir(err);
  }
}

connectToMongoDB()

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
