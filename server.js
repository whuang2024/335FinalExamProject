const path = require("path");
const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const portNumber = 3000;

app.use(express.static(__dirname + "/public"));
require("dotenv").config({ path: path.resolve(__dirname, ".env") });

const db = "CMSC335_DB";
const collection = "finalExamProject";
const databaseAndCollection = { db: db, collection: collection };

const uri = process.env.MONGO_CONNECTION_STRING;
app.set("views", path.resolve(__dirname, "templates"));
app.set("view engine", "ejs");

app.use(bodyParser.urlencoded({ extended: false }));

app.get("/", (request, response) => {
  response.render("index");
});

app.get("/allQuotes", async (request, response) => {
  let quotesResult = (await viewAllQuotes()).reverse();
  quotes = "";
  quotesResult.forEach((item) => {
    quotes += `<div><p>${item.quote}</p><p>-${item.name}</p></div><br>`;
  });
  response.render("allQuotes", { quotes });
});

app.post("/", async (request, response) => {
  const name = request.body.name;
  const data = await fetch("https://zenquotes.io/?api=random");
  const json = await data.json();
  const quote = json[0].q;

  await insertQuote({ name: name, quote: quote });
  response.redirect("/allQuotes");
});

app.listen(portNumber, function (err) {
  process.stdout.write(
    `Web server started and running at http://localhost:${portNumber}\n`
  );
});

/****** FUNCTIONS THAT INTERACT WITH DB ******/
const { MongoClient, ServerApiVersion } = require("mongodb");

async function insertQuote(quote) {
  const client = new MongoClient(uri, {
    serverApi: ServerApiVersion.v1,
  });
  try {
    await client.connect();

    /* Inserting one app */
    await client
      .db(databaseAndCollection.db)
      .collection(databaseAndCollection.collection)
      .insertOne(quote);
  } catch (e) {
    // console.error(e);
  } finally {
    await client.close();
  }
}

async function viewAllQuotes() {
  const client = new MongoClient(uri, {
    serverApi: ServerApiVersion.v1,
  });

  try {
    await client.connect();
    let filter = {};
    const cursor = client
      .db(databaseAndCollection.db)
      .collection(databaseAndCollection.collection)
      .find(filter);

    return await cursor.toArray();
  } catch (e) {
    return [];
  } finally {
    await client.close();
  }
}
