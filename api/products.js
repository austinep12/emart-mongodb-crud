// E-MART Electronics - Product API (Create, Read, Update, Delete) using MongoDB
const { MongoClient, ObjectId } = require("mongodb");

const uri = process.env.MONGODB_URI;
const DB_NAME = "EMartDB";
const COLLECTION = "products";

// Reuse one connection across requests
let clientPromise;
function getCollection() {
  if (!uri) throw new Error("MONGODB_URI environment variable is not set");
  if (!clientPromise) clientPromise = new MongoClient(uri).connect();
  return clientPromise.then(client => client.db(DB_NAME).collection(COLLECTION));
}

// Send a JSON response
function send(res, status, data) {
  res.writeHead(status, { "Content-Type": "application/json" });
  res.end(JSON.stringify(data));
}

// Read the JSON body sent by the browser
async function readBody(req) {
  if (req.body) return typeof req.body === "string" ? JSON.parse(req.body) : req.body;
  let raw = "";
  for await (const chunk of req) raw += chunk;
  return raw ? JSON.parse(raw) : {};
}

// Check the product details
function validate(p) {
  if (!p.productName || !p.brand || !p.category || !p.price)
    return "All fields are required";
  if (isNaN(p.price) || Number(p.price) <= 0) return "Price must be a positive number";
  return null;
}

module.exports = async function handler(req, res) {
  try {
    const products = await getCollection();
    const query = new URL(req.url, "http://localhost").searchParams;

    // READ - get all products
    if (req.method === "GET") {
      const list = await products.find().sort({ _id: -1 }).toArray();
      return send(res, 200, { products: list });
    }

    // CREATE - add a new product
    if (req.method === "POST") {
      const body = await readBody(req);
      const error = validate(body);
      if (error) return send(res, 400, { message: error });

      const product = {
        productName: body.productName.trim(),
        brand: body.brand.trim(),
        category: body.category,
        price: Number(body.price),
        createdAt: new Date()
      };
      await products.insertOne(product);
      return send(res, 201, { message: `${product.productName} added to E-MART.` });
    }

    // UPDATE - edit an existing product
    if (req.method === "PUT") {
      const body = await readBody(req);
      const error = validate(body);
      if (error || !ObjectId.isValid(body.id))
        return send(res, 400, { message: error || "Invalid product id" });

      const result = await products.updateOne(
        { _id: new ObjectId(body.id) },
        { $set: {
            productName: body.productName.trim(),
            brand: body.brand.trim(),
            category: body.category,
            price: Number(body.price)
        } }
      );
      if (result.matchedCount === 0) return send(res, 404, { message: "Product not found" });
      return send(res, 200, { message: "Product updated successfully." });
    }

    // DELETE - remove a product
    if (req.method === "DELETE") {
      const id = query.get("id");
      if (!ObjectId.isValid(id)) return send(res, 400, { message: "Invalid product id" });

      const result = await products.deleteOne({ _id: new ObjectId(id) });
      if (result.deletedCount === 0) return send(res, 404, { message: "Product not found" });
      return send(res, 200, { message: "Product deleted successfully." });
    }

    send(res, 405, { message: "Method Not Allowed" });
  } catch (err) {
    console.error(err);
    send(res, 500, { message: err.message });
  }
};
