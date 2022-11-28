const express = require('express')
const app = express()
const cors = require('cors')
app.use(cors())
app.use(express.json())
const port = process.env.PORT || 5000;
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const jwt = require('jsonwebtoken')
require('dotenv').config();
require('dotenv').config()




const uri = "mongodb+srv://resale-market:AZ9RDCN7iytTHvPM@cluster0.ye2spym.mongodb.net/?retryWrites=true&w=majority";
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

// ------------------------------: verification jwt :--------------------------\\


function verifyJWT(req, res, next) {
    const authHeader = req.headers.authorization
    if (!authHeader) {
        return res.status(401).send('usauthorized asccess');
    }
    const token = authHeader.split(' ')[1];

    jwt.verify(token, process.env.ACCRSS_TOKEN, function (err, decoded) {
        if (err) {
            return res.status(403).send({ message: 'forbidden access' })
        }
        req.decoded = decoded;
        next();
    })
}


// ------------------------------:  verification jwt :--------------------------\\
async function run() {
    try {
        const productsCollection = client.db("resale-market-product").collection("productCollection");

        const usersCollection = client.db("resale-market-product").collection("usersStorage")
        const bookingCollection = client.db("resale-market-product").collection("bookingCollection")
       



        
        const verifyAdmin = async (req, res, next) => {
            const decodedEmail = req.decoded.email;
            const query = { email: decodedEmail };
            const user = await usersCollection.findOne(query);

            if (user?.role !== "admin") {
                return res.status(403).send({ message: "forbidden access" })

            }
            next();
        }

       

        app.post('/users', async (req, res) => {
            const user = req.body;
            console.log(user);
            const result = await usersCollection.insertOne(user);
            res.send(result);
        });


        app.get('/allusers', async (req, res) => {
            const query = {};

            const cursor = await usersCollection.find(query).toArray()
            res.send(cursor);
        });
        app.delete("/allusers/:id",async(req,res)=>{
            const id=req.params.id
            console.log(id)
            const query={_id: ObjectId(id)}
            const deletedresult=await usersCollection.deleteOne(query)
            res.send(deletedresult)
        })



        app.get("/category/:title", async (req, res) => {
            const title = req.params.title
            

            const query = { category: title }
            const cursor = await productsCollection.find(query).toArray()
            res.send(cursor)


        });
        app.post('/category', async (req, res) => {
            const product = req.body
            console.log(product);
            const result = await productsCollection.insertOne(product);
            res.send(result);
        });



        // ------------------------------: jwt :--------------------------\\
        app.get('/jwt', async (req, res) => {
            const email = req.query.email
            const query = { email: email }

            const user = await usersCollection.findOne(query);
            if (user) {
                const token = jwt.sign({ email }, process.env.ACCESS_TOKEN, { expiresIn: '1h' })
                return res.send({ accessToken: token });
            }
            res.status(403).send({ accessToken: "" })
        })

        // ------------------------------: jwt :--------------------------\\

       

        // ------------------------------: admin email :--------------------------\\

        app.get("/users/admin/:email", async (req, res) => {
            const email = req.params.email;
            const query = { email };
            const user = await usersCollection.findOne(query);
            res.send({ isAdmin: user?.role === "admin" })

        })

        // ------------------------------: admin email :--------------------------\\

        // ------------------------------: verifyAdmin  :--------------------------\\
      //  verifyJWT, verifyAdmin,

        app.put('/users/admin/:id', async (req, res) => {
            const id = req.params.id;
            const filter = { _id: ObjectId(id) }
            const options = { upsert: true };
            const updatedDoc = {
                $set: {
                    role: "admin"
                }
            }
            const result = await usersCollection.updateOne(filter, updatedDoc, options)
            res.send(result)
        });

        
        app.get("/users/seller", async (req, res) => {
          
            const query = {role: "Seller"}
            const seller= await usersCollection.find(query).toArray()

          
            res.send(seller)

        });
        app.put('/category/:email', async (req, res) => {
            const email = req.params.email;
            console.log(email)
           
            const filter = { email: email }
            const options = { upsert: true };
            const updatedDoc = {
                $set: {
                    verified: "verified"
                }
            }
            const result = await productsCollection.updateOne(filter, updatedDoc, options)
            res.send(result)
        });

        app.delete("/users/seller/:id", async (req, res) => {
           const id=req.params.id
            const query = {_id: ObjectId(id)}
            const deletedSeller= await usersCollection.deleteOne(query)

          
            res.send(deletedSeller)

        });





//         // ------------------------------: verifyAdmin :--------------------------\\

// //....................bookings data...............\\

app.get('/bookings', async (req, res) => {
    const email = req.query.email;
    
     const query={ email: email}
    
    const bookings = await bookingCollection.find(query).toArray();
    res.send(bookings);
});





app.post('/bookings', async (req, res) => {
    const bookedData = req.body;
  
    const result = await bookingCollection.insertOne(bookedData);
    res.send(result);
});



//....................bookings data...............\\

    }
    finally {

    }

}
run().catch(console.dir)



app.listen(port, () => {
    console.log("hi server ", port)
})

