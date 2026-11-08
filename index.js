import { MongoClient, ObjectId } from "mongodb";
import express from "express"
import "dotenv/config";
import cors from "cors"
const app = express();
const port = 5000;
app.use(cors())
app.use(express.json())

//http://localhost:5000//patch/:id

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
const borrowsCollection = db.collection("borrows-collection");

app.get("/", (req, res) => {
  res.send("Hello World!");
});
app.get("/books",async(req,res)=>{
  const result = await booksCollection.find().toArray()
  res.send(result)
})
app.get("/new-arrivals",async(req,res)=>{
  const result=await booksCollection.find().sort({addedDate:-1}).limit(6).toArray()
  res.send(result)
})
app.get("/books-details/:id",async(req,res)=>{
  const {id}=req.params
  const result= await booksCollection.findOne({_id: new ObjectId(id)})
  res.send(result)
})

 app.post("/add-books", (req, res) => {
  const books=req.body
  const result=booksCollection.insertOne(books)
  res.send(result);
});
app.post("/borrows",(req,res)=>{
  const borrowsData=req.body
  const result = borrowsCollection.insertOne(borrowsData)
  res.send(result)
});
app.get('/my-books/:email',async(req,res)=>{
  const getEmail=req.params.email 
  const result =await booksCollection.find({addedBy:getEmail}).toArray()
  res.send(result)

})
app.delete("/delete/:id",async(req,res)=>{
  const {id}=req.params
  const result = await booksCollection.deleteOne({_id: new ObjectId(id)})
  res.send(result)
})
app.patch("/patch/:id",async(req,res)=>{
  const {id}=req.params
  const updateData=req.body
  const result = await booksCollection.updateOne(
    { _id: new ObjectId(id) },
    { $set: updateData },
  );
  res.send(result)
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
