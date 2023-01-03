const functions = require("firebase-functions");
const express = require("express");
const admin = require("firebase-admin");
const bodyParser = require("body-parser");
const {
  getFirestore,
  Timestamp,
  FieldValue,
} = require("firebase-admin/firestore");
const credentials = require("./servicekey.json");

admin.initializeApp({
  credential: admin.credential.cert(credentials),
});

const db = admin.firestore();
const batch = db.batch();
const ProductsRef = db.collection("Products");
// const conn = hana.createConnection();

const app = express();
app.use(bodyParser.json({ type: "application/*+json" }));
// app.use(
//   bodyParser.urlencoded({
//     extended: true,
//   })
// );
const PORT = 3000; //process.env.PORT || 3000;

app.get("/YieldStat", (req, res) => {
  res.status(200);
  getProductsData().then((resp) => {
    res.json(resp);
  });
});

app.post("/Product", function (req, res) {
  console.log(req.body, "request");
  let Products = [];
  Products = req.body;

  let Productlist = [];
  let Product = {
    Product: req.body.Product,
    Variety: req.body.Variety,
    Length: req.body.Length,
    NoofLeaves: req.body.NoofLeaves,
    NetWeight: req.body.NetWeight,
    Createdby: req.body.Createdby,
    Createdon: Timestamp.now(),
  };

  //   Products.forEach((item) => {
  //     let Product = {
  //       Product: item.Product,
  //       Variety: item.Variety,
  //       Length: item.Length,
  //       NoofLeaves: item.NoofLeaves,
  //       NetWeight: item.NetWeight,
  //       Createdby: item.Createdby,
  //       Createdon: Timestamp.now(),
  //     };

  //     Productlist.push(Product);
  //   });

  console.log(Product, "Product");
  setProductData(Product)
    .then((ProductID) => {
      return ProductID;
    })
    .then((ProductID) => {
      res.status(200);
      console.log(ProductID, "ads");
      res.send(`Data Added Succesfully ${ProductID}`);
    });
});

app.listen(PORT, (error) => {
  if (!error)
    console.log(
      "Server is Successfully Running,and App is listening on port " + PORT
    );
  else console.log("Error occurred, server can't start", error);
});

const getProductsData = async () => {
  let ProductData = [];
  let Productitem = {};
  const Products = await ProductsRef.get();
  Products.forEach((doc) => {
    Productitem = doc.data();
    Productitem.id = doc.id;
    ProductData.push(Productitem);
  });
  return ProductData;
};

const setProductData = async (Product) => {
  const res = await ProductsRef.add(Product);
  console.log("Added document with ID: ", res.id);
  return res.id;
};

exports.app = functions.https.onRequest(app);

// // Create and Deploy Your First Cloud Functions
// // https://firebase.google.com/docs/functions/write-firebase-functions
//
// exports.helloWorld = functions.https.onRequest((request, response) => {
//   functions.logger.info("Hello logs!", {structuredData: true});
//   response.send("Hello from Firebase!");
// });
