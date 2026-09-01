const express = require("express");
const path = require("path");
const fs = require("fs");
const crypto = require("crypto");

const app = express();
const PORT = process.env.PORT || 3000;
const DB = path.join(__dirname, "data", "orders.json");

app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

function readOrders() {
  if (!fs.existsSync(DB)) return [];
  try { return JSON.parse(fs.readFileSync(DB, "utf8")); }
  catch { return []; }
}
function saveOrders(orders) {
  fs.writeFileSync(DB, JSON.stringify(orders, null, 2));
}

const products = {
  "Mobile Legends": [
    {name:"86 Diamond", price:10000},
    {name:"172 Diamond", price:20000},
    {name:"429 Diamond", price:50000},
    {name:"878 Diamond", price:100000}
  ],
  "Free Fire": [
    {name:"70 Diamond", price:10000},
    {name:"140 Diamond", price:20000},
    {name:"355 Diamond", price:50000},
    {name:"720 Diamond", price:100000}
  ],
  "PUBG Mobile": [
    {name:"60 UC", price:15000},
    {name:"325 UC", price:75000},
    {name:"660 UC", price:150000}
  ],
  "Honor of Kings": [
    {name:"80 Tokens", price:15000},
    {name:"420 Tokens", price:75000},
    {name:"840 Tokens", price:150000}
  ]
};

app.get("/api/products", (req, res) => res.json(products));

app.post("/api/orders", (req, res) => {
  const {game, userId, serverId, product, payment} = req.body;
  if (!game || !userId || !product || !payment)
    return res.status(400).json({error:"Data pesanan belum lengkap."});

  const gameProducts = products[game] || [];
  const item = gameProducts.find(x => x.name === product);
  if (!item) return res.status(400).json({error:"Nominal tidak tersedia."});

  const order = {
    id: "BAR-" + crypto.randomBytes(4).toString("hex").toUpperCase(),
    game, userId: String(userId), serverId: serverId ? String(serverId) : "",
    product: item.name, amount: item.price, payment,
    status: "UNPAID",
    createdAt: new Date().toISOString()
  };

  const orders = readOrders();
  orders.unshift(order);
  saveOrders(orders);

  // Payment gateway and supplier API are intentionally not connected yet.
  res.status(201).json({
    order,
    message:"Order dibuat. Tahap berikutnya adalah menghubungkan payment gateway dan supplier API."
  });
});

app.get("/api/orders/:id", (req, res) => {
  const order = readOrders().find(x => x.id === req.params.id);
  if (!order) return res.status(404).json({error:"Order tidak ditemukan."});
  res.json(order);
});

app.get("/api/admin/orders", (req, res) => {
  // Demo admin endpoint. Add real authentication before production use.
  res.json(readOrders());
});

app.listen(PORT, () => console.log(`TOPUP BAR berjalan di http://localhost:${PORT}`));
