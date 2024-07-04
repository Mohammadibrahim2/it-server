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




const uri = "mongodb+srv://resale-market:AZ9RDCN7iytTHvPM@cluster0.ye2spym.mongodb.net/";
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
        // const bookingCollection = client.db("resale-market-product").collection("bookingCollection")
       const cartAddingCollection=client.db("resale-market-product").collection("orderCollection")
       const wishAddingCollection=client.db("resale-market-product").collection("wishCollection")
       const contactCollection=client.db("resale-market-product").collection("contactCollection")

       const newsEmailCollection=client.db("resale-market-product").collection("newsemailCollection")

        
        // const verifyAdmin = async (req, res, next) => {
        //     const decodedEmail = req.decoded.email;
        //     const query = { email: decodedEmail };
        //     const user = await usersCollection.findOne(query);

        //     if (user?.role !== "admin") {
        //         return res.status(403).send({ message: "forbidden access" })

        //     }
        //     next();
        // }

       

        app.post('/users', async (req, res) => {
            const user = req.body;
            console.log(user);
            const result = await usersCollection.insertOne(user);
            res.send(result);
        });


        app.get('/allusers', async (req, res) => {
            const query = {};

            const cursor = await usersCollection.find(query).toArray()
            res.send({cursor});
        });
        app.delete("/allusers/:id",async(req,res)=>{
            const id=req.params.id
            console.log(id)
            const query={_id: ObjectId(id)}
            const deletedresult=await usersCollection.deleteOne(query)
            res.send(deletedresult)
        })


        
        app.get("/category/horizontal", async (req, res) => {
            
      
            let result= await productsCollection.find(
               
                {
                    $or:[
                        {category:{$regex:"mobile"} },
                        {category:{$regex:"tablet"} },
                        
                    ]
                }
               
            ).toArray()
            

           
            res.send(result)


        });
        app.get("/category/vertical", async (req, res) => {
            
      
            let result= await productsCollection.find(
               
                {
                    $or:[
                        {type:{$regex:"vertical1"} },
                        
                    ]
                }
               
            ).toArray()
            

           
            res.send(result)


        });
        //mediam products:-------




        app.get("/category/mediam", async (req, res) => {
            
      
            let result= await productsCollection.find(
               
                {
                    $or:[
                        {type:{$regex:"mediam"} },
                        
                    ]
                }
               
            ).toArray()
            

           
            res.send(result)


        });








  




        app.get("/category/otherHorizontal", async (req, res) => {
            
      
            let cursor= await productsCollection.find(
               
                {
                    $or:[
                        {type:{$regex:"other-horizontal"} }
                        
                    ]
                }
               
            ).toArray()
            

           
            res.send(cursor)


        });








 




        app.get("/category/otherVertical", async (req, res) => {
            
      
            let result= await productsCollection.find(
               
                {
                    $or:[
                        {type:{$regex:"other-vertical"} },
                        
                    ]
                }
               
            ).toArray()
            

           
            res.send(result)


        });








          //other products:-------

///all products:---

app.get("/allproducts", async (req, res) => {
    
    
try{
    
    const page=parseInt(req.query.page )
           const size=parseInt(req.query.size)
            const query={}
            
            const cursor= productsCollection.find(query)
            const result=await  cursor.skip(page*size).limit(size).toArray()
            const count=await productsCollection.estimatedDocumentCount()
            const procount=await cartAddingCollection.estimatedDocumentCount()
            res.send({result,count,procount})

}
catch(err){
    console.log(err)
}

});
//searching-----

// app.get("/allproducts/:name", async (req, res) => {
    
    

//    console.log(req.params.name)
//    const name=req.params.name
         
//             const query={title:name}
            
//             const cursor= productsCollection.find(query)
          
//             res.send(cursor)


// });
//searching=-----
app.get("/allproducts/:category", async (req, res) => {
  
    const category=req.params.category 
   
   
    const count=await productsCollection.estimatedDocumentCount()
    if(category){
        let result= await productsCollection.find(
               
            {
                $or:[
                    {category:{$regex:req.params.category} },
                    
                ]
            }
           
        ).toArray()
       
        res.send({result,count})

    }
   
    
    
else{
    const query = { }
    const count=await productsCollection.estimatedDocumentCount()
    const result= await productsCollection.find(query).toArray()
    res.send({result,count})
}
    
 


});
//all products:---

        app.get("/category/:title", async (req, res) => {
            const title = req.params.title
            

            const query = { category: title }
            const cursor = await productsCollection.find(query).toArray()
            res.send(cursor)


        });
        app.post('/category', async (req, res) => {
            const product = req.body
         
            const result = await productsCollection.insertOne(product);
            res.send(result);
        });

// add to cart-----------------------------------

app.post('/addtocart/:email', async (req, res) => {
    const addedData= req.body;
    console.log(addedData)

  
    const result = await cartAddingCollection.insertOne(addedData);
    res.send(result);
});


app.get('/addtocart', async (req, res) => {
    const email=req.query.email 

    const query={email:email}
   
  
    const result= await cartAddingCollection.find(query).toArray();
    const count=await cartAddingCollection.estimatedDocumentCount()
    
    res.send({result,count});
});


app.delete('/addtocart/:id', async (req, res) => {
    const id=req.params.id

   
    const query={_id:ObjectId(id)}
   
  
    const result= await cartAddingCollection.deleteOne(query)
   
    res.send(result);
});



app.get('/allorders', async (req, res) => {
 

    const query={}
   
  
    const result= await cartAddingCollection.find(query).toArray();
    const count=await cartAddingCollection.estimatedDocumentCount()
    
    res.send({result,count});
});
app.delete('/allorders/:id', async (req, res) => {
    const id=req.params.id

   
    const query={_id:ObjectId(id)}
   
  
    const result= await cartAddingCollection.deleteOne(query)
   
    res.send(result);
});


//add to cart =---------------------------------


//add to wish -----------------------------------------

app.post("/addtowish/:email",async(req,res)=>{
    console.log(req.body)
    const wishproduct=req.body;
 
    const result=await wishAddingCollection.insertOne(wishproduct);
    res.send(result);
})
app.get("/addtowish",async(req,res)=>{

    const email=req.query.email
   
    const query={email:email}
   
   
    const cursor=await wishAddingCollection.find(query).toArray()
    res.send(cursor);
})

//add to wish -----------------------------------------------

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

      //contactinfo:=== 
app.post("/addmessage/:email",async(req,res)=>{
    console.log(req.body)
    const contactInfo=req.body;
    
 
    const result=await contactCollection.insertOne(contactInfo);
    res.send(result);
})


app.get("/addmessage",async(req,res)=>{

   
    const query={}
   
   
    const cursor=await contactCollection.find(query).toArray()
    res.send({cursor});
})

//contactinfo:=== 


app.post("/addnewsmail",async(req,res)=>{
    console.log(req.body)
    const newsEmail=req.body;
 
    const result=await newsEmailCollection.insertOne(newsEmail);
    res.send(result);
})

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







//....................bookings data...............\\

    }
    finally {

    }

}
run().catch(console.dir)



app.listen(port, () => {
    console.log("hi server ", port)
})

