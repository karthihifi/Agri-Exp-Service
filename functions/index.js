const functions = require("firebase-functions");
const express = require("express");
const admin = require("firebase-admin");
const bodyParser = require("body-parser");
const cors = require("cors");
const {
  getFirestore,
  Timestamp,
  FieldValue,
} = require("firebase-admin/firestore");
const credentials = require("./servicekey.json");
const { AgriImpexModal } = require("./Modal");

admin.initializeApp({
  credential: admin.credential.cert(credentials),
});

const db = admin.firestore();
const batch = db.batch();
const ProductsRef = db.collection("Products");
const UserDataRef = db.collection("UserData");
const AreaDBRef = db.collection("AreaDB");
const AgriImpexModalRef = new AgriImpexModal();
let Currseason = String(AgriImpexModalRef.currentSeason);
console.log("Current Season", Currseason);
const CurrSeasonRef = db.collection("YieldStats").doc(Currseason);
const Yieldref = db.collection("YieldStats");

// const conn = hana.createConnection();

const app = express();
app.use(cors());
app.options("*", cors());

app.use(bodyParser.json({ type: "application/*+json" }));
// app.all(function (req, res, next) {
//   res.header("Access-Control-Allow-Origin", "*");
//   res.header(
//     "Access-Control-Allow-Headers",
//     "Origin, X-Requested-With, Content-Type, Accept"
//   );
//   next();
// });

// app.use(
//   bodyParser.urlencoded({
//     extended: true,
//   })
// );
const PORT = 3022; //process.env.PORT || 3000;

app.get("/YieldStat", async (req, res) => {
  res.status(200);
  // let SeasonOverView = {
  //   SeasonStat: [],
  //   ProductsData: [],
  // };

  // let Season = [];
  // const SeasonRef = await Yieldref.get();
  // SeasonRef.forEach(async (Seasons) => {
  //   Season.push(Seasons.id);
  //   SeasonOverView.SeasonStat.push(Seasons.id);
  // });

  // getSeasonData(Season).then((resp) => {
  //   getProductRefs(resp.flat()).then((Products) => {
  //     SeasonOverView.ProductsData = Products.flat();
  //     res.json(SeasonOverView);
  //   });
  // });

  getProductsData1().then((resp) => {
    console.log(resp, "resp");
    res.json(resp);
  });
});

app.get("/UserData", (req, res) => {
  res.status(200);
  console.log(req.query);
  let User = String(req.query.user);
  getUserData(User).then((resp) => {
    res.json(resp);
  });
});

app.post("/NewArea", function (req, res) {
  let Area = {
    AreaID: req.body.AreaID,
    Zone: req.body.Zone,
    AreaName: req.body.AreaName,
    TotalHectare: req.body.TotalHectare,
    TotalHectareRef: req.body.TotalHectareRef,
    Plantation: req.body.Plantation,
    Owner: req.body.Owner,
    Contactno: req.body.Contactno,
    Email: req.body.Email,
    Village: req.body.Village,
    TownPanchayat: req.body.TownPanchayat,
    District: req.body.District,
    Pincode: req.body.Pincode,
    Address: req.body.Address,
    Createdby: req.body.Createdby,
    Createdon: Timestamp.now(),
  };

  let District = String(Area.District);
  let Panchayat = String(Area.TownPanchayat);
  const resp = AreaDBRef.doc(District).collection(Panchayat).add(Area);
  res.status(200);
  res.send(`Data Added Succesfully ${resp.id}`);
});

app.post("/Product", function (req, res) {
  console.log(req.body, "request");
  let Products = [];
  Products = req.body;

  let Productlist = [];
  let Product = {
    Area: req.body.Area,
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
    let epochTimestamp = Productitem.Createdon.toMillis();
    Productitem.Createdon = new Date(epochTimestamp).toLocaleDateString();
    Productitem.Createdat = new Date(epochTimestamp).toLocaleTimeString();
    ProductData.push(Productitem);
  });
  return ProductData;
};

const getProducts = (Products) => {
  let ProductData = [];
  let Productitem = {};
  Products.forEach((doc) => {
    Productitem = doc.data();
    Productitem.id = doc.id;
    let epochTimestamp = Productitem.Createdon.toMillis();
    Productitem.Createdon = new Date(epochTimestamp).toLocaleDateString();
    Productitem.Createdat = new Date(epochTimestamp).toLocaleTimeString();
    ProductData.push(Productitem);
  });
  return ProductData;
};

const getProductRefs = async (AreaRef) => {
  // let ProductsRef = await Productref.get();
  const promises = AreaRef.map(async (Arearefs) => {
    const ProductsRef = await Arearefs.get();
    // console.log(ProductsRef, "asdafq");
    let ProductData = [];
    ProductsRef.forEach((Product) => {
      Productitem = Product.data();
      Productitem.id = Product.id;
      // console.log(Productitem)
      let epochTimestamp = Productitem.Createdon.toMillis();
      Productitem.Createdon = new Date(epochTimestamp).toLocaleDateString();
      Productitem.Createdat = new Date(epochTimestamp).toLocaleTimeString();
      ProductData.push(Productitem);
    });
    // console.log(ProductData,"Data")
    return ProductData;
  });

  const getdata1 = await Promise.all(promises).then((ProductRef) => {
    // console.log(ProductRef, "ProductData");
    return ProductRef;
  });
  return getdata1;
};
const getSeasonData = async (SeasonId) => {
  // let Productitem = {};
  // let ProductData = [];
  // let Areasref = []
  // console.log(SeasonId.length, typeof SeasonId, SeasonId, "season");
  const promises = SeasonId.map(async (Season) => {
    console.log(Season);
    const Arearef = await Yieldref.doc(Season).listCollections();
    return Arearef;
    // Arearef.forEach(async (Productref) => {
    //   let ProductsRef = await Productref.get();
    //   console.log("Call1");
    //   ProductsRef.forEach((Product) => {
    //     Productitem = Product.data();
    //     Productitem.id = Product.id;
    //     let epochTimestamp = Productitem.Createdon.toMillis();
    //     Productitem.Createdon = new Date(epochTimestamp).toLocaleDateString();
    //     Productitem.Createdat = new Date(epochTimestamp).toLocaleTimeString();
    //     ProductData.push(Productitem);
    //   });
    // });
  });

  const getdata = await Promise.all(promises).then((AreaRef) => {
    // console.log(AreaRef, "asda");
    return AreaRef;
  });
  return getdata;
  // console.log("Callfinal");
  // return ProductData;
  // await Promise.all(Promises).then(() => {
  //   return ProductData;
  // });
};
const getProductsData1 = async () => {
  let Season = [];
  const SeasonRef = await Yieldref.get();
  SeasonRef.forEach(async (Seasons) => {
    Season.push(Seasons.id);
  });

  return getAllData(Season).then((resp) => {
    console.log(resp, "callfianl");
    return resp;
  });
  // return ProductData;
  // getSeasonData(Season).then((resp) => {
  //   getProductRefs(resp.flat()).then((Products) => {
  //     // console.log(Products.flat(),Products.flat().length, "ProductRef");
  //     return Products.flat();
  //   });
  // });
};

const getAllData = (Season) => {
  return getSeasonData(Season).then((resp) => {
    return getProductRefs(resp.flat()).then((Products) => {
      console.log(Products.flat().length, "ProductRef");
      return Products.flat();
    });
  });
};
const getAreaRef = async (Season) => {
  let ProductData = [];
  let Productitem = {};

  Season.forEach(async (doc) => {
    console.log(doc.id, "dada");
    let AreaRef = await Yieldref.doc(doc.id).listCollections();
    AreaRef.forEach(async (Area) => {
      let ProductsRef = await Area.get();
      ProductsRef.forEach((Product) => {
        Productitem = Product.data();
        Productitem.id = Product.id;
        let epochTimestamp = Productitem.Createdon.toMillis();
        Productitem.Createdon = new Date(epochTimestamp).toLocaleDateString();
        Productitem.Createdat = new Date(epochTimestamp).toLocaleTimeString();
        ProductData.push(Productitem);
      });
    });
  });
  return ProductData;
};

const getUserData = async (UserDetails) => {
  const User = await UserDataRef.doc(String(UserDetails)).get();
  console.log(User.data());
  UserData = User.data();
  return UserData;
};

// const setProductData = async (Product) => {
//   const AreaRef = CurrSeasonRef.collection(Product.Area);
//   const res = await AreaRef.add(Product);
//   //const res = await ProductsRef.add(Product);
//   console.log("Added document with ID: ", res.id);
//   return res.id;
// };

const setProductData = async (Product) => {
  const snapshot = await CurrSeasonRef.get();
  console.log(Product.Area, "Sanapshot");
  let Productid = "";
  if (!snapshot.empty) {
    //The collection doesn't exist.
    const AreaRef = CurrSeasonRef.collection(String(Product.Area));
    const res = await AreaRef.add(Product);
    //const res = await ProductsRef.add(Product);
    console.log("Added document with ID: ", res.id);
    Productid = res.id;
  } else {
    const AreaRef = CurrSeasonRef.collection(String(Product.Area));
    const res = await AreaRef.add(Product);
    //const res = await ProductsRef.add(Product);
    console.log("Added document with ID: ", res.id);
    Productid = res.id;
  }
  return Productid;
};

exports.app = functions.https.onRequest(app);

// // Create and Deploy Your First Cloud Functions
// // https://firebase.google.com/docs/functions/write-firebase-functions
//
// exports.helloWorld = functions.https.onRequest((request, response) => {
//   functions.logger.info("Hello logs!", {structuredData: true});
//   response.send("Hello from Firebase!");
// });
