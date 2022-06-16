import express from 'express';
const app = express();
import cors from 'cors';
import dotenv from 'dotenv';
import { MongoClient, ServerApiVersion, ObjectId } from 'mongodb';
dotenv.config();
const port = process.env.PORT || 5000

// Middleware
app.use(cors());
app.use(express.json())

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.lt05l.mongodb.net/my-todoapp?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

app.get('/', (req, res) => {
  res.send('Surver is running')
})

async function run() {
  try {
    await client.connect();
    const taskCollection = client.db('my-todoapp').collection('tasks');

    app.get('/task', async (req, res) => {
      const query = {};
      const result = await taskCollection.find().toArray();
      res.send(result);
    })

    app.get('/task/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const project = await taskCollection.findOne(query);
      res.send(project);
    })

    // Add task in databse api.
    app.post('/add-task', async (req, res) => {
      const task = req.body;
      console.log(task)
      if (!task.title || !task.description) {
        return res.send({ success: false, error: "Plese Provide All Information." });
      }

      await taskCollection.insertOne(task);
      res.send({ success: true, message: 'Data Inserted!' })

    })

    // Change Task Status
    app.put('/taskStatus/:id', async (req, res) => {
      const id = req.params.id;
      const filter = { _id: ObjectId(id) }
      const options = { upsert: true };
      const updatedDoc = {
        $set: {
          status: 'completed'
        }
      };
      const updatedOrder = await taskCollection.updateOne(filter, updatedDoc, options);
      res.send(updatedOrder)
    })

    // Task Deleted.
    app.delete('/task', async (req, res) => {
      const query = { status: 'completed' };
      if (query == false) {
        return res.send({ success: false, error: "Something is Wrong." })
      }
      const result = await taskCollection.deleteMany(query);
      res.send(result);

    })


  }
  finally {
    // await client.close()/
  }
}

run().catch(console.dir)

app.listen(port, () => {
  console.log(`Server is runnnig from Port: ${port}`)
})