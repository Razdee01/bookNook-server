import { MongoClient, ObjectId } from "mongodb";
import express from "express";
import "dotenv/config";
import cors from "cors";
import { createRemoteJWKSet, jwtVerify } from "jose";
const app = express();
const port = 5000;
app.use(cors());
app.use(express.json());

//http://localhost:5000/borrows/:email

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

const mongodb = await connectToMongoDB();
const db = mongodb.db("bookNook");
const booksCollection = db.collection("bookscollection");
const borrowsCollection = db.collection("borrows-collection");

const verifyToken = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).send({ msg: "unauthorize" });
  }
  const token = authHeader.split(" ")[1];

  const JWKS = createRemoteJWKSet(
    new URL("http://localhost:3000/api/auth/jwks"),
  );

  try {
    const { payload } = await jwtVerify(token, JWKS);
    next();
  } catch {
    return res.send({ msg: "server error" });
  }
};
app.get("/", (req, res) => {
  res.send("Hello World!");
});
app.get("/books", async (req, res) => {
  const result = await booksCollection.find().toArray();
  res.send(result);
});
app.get("/new-arrivals", async (req, res) => {
  const result = await booksCollection
    .find()
    .sort({ addedDate: -1 })
    .limit(6)
    .toArray();
  res.send(result);
});
app.get("/books-details/:id", verifyToken, async (req, res) => {
  const { id } = req.params;
  const result = await booksCollection.findOne({ _id: new ObjectId(id) });
  res.send(result);
});

app.post("/add-books",verifyToken, (req, res) => {
  const books = req.body;
  const result = booksCollection.insertOne(books);
  res.send(result);
});
app.post("/borrows", (req, res) => {
  const borrowsData = req.body;
  const result = borrowsCollection.insertOne(borrowsData);
  res.send(result);
});
app.get("/my-books/:email",verifyToken, async (req, res) => {
  const getEmail = req.params.email;
  const result = await booksCollection.find({ addedBy: getEmail }).toArray();
  res.send(result);
});

app.get("/borrows/:email",verifyToken, async (req, res) => {
  const email = req.params.email;
  const result = await borrowsCollection.find({ userEmail: email }).toArray();
  res.send(result);
});

app.delete("/delete/:id", async (req, res) => {
  const { id } = req.params;
  const result = await booksCollection.deleteOne({ _id: new ObjectId(id) });
  res.send(result);
});
// DELETE or PATCH endpoint to remove/complete a borrow record
app.delete("/borrows/:id", async (req, res) => {
  const borrowId = req.params.id;
  const result = await borrowsCollection.deleteOne({
    _id: new ObjectId(borrowId),
  });
  res.send(result);
});
app.patch("/patch/:id", async (req, res) => {
  const { id } = req.params;
  const updateData = req.body;
  const result = await booksCollection.updateOne(
    { _id: new ObjectId(id) },
    { $set: updateData },
  );
  res.send(result);
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
