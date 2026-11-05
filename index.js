import { MongoClient } from "mongodb";
import express from "express"
import "dotenv/config";
import cors from "cors"
const app = express();
const port = 5000;
app.use(cors())
app.use(express.json())


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

const mongodb=await connectToMongoDB()
const db=mongodb.db("bookNook")
const booksCollection = db.collection("bookscollection");

app.get("/", (req, res) => {
  res.send("Hello World!");
});
app.get("/books",async(req,res)=>{
  const result = await booksCollection.find().toArray()
  res.send(result)
})
// http://localhost:5000/add-books
http: app.post("/add-books", (req, res) => {
  const books=req.body
  const result=booksCollection.insertOne(books)
  res.send(result);
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
