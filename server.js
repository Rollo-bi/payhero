const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
require("dotenv").config();

console.log("Starting server...");

const app = express();

app.use(cors());
app.use(bodyParser.json());

try {
    console.log("Loading payment routes...");
    const paymentRoutes = require("./routes/payment");
    app.use("/api/payment", paymentRoutes);
    console.log("Payment routes loaded.");
} catch (err) {
    console.error("Failed to load routes:");
    console.error(err);
    process.exit(1);
}

app.get("/", (req, res) => {
    res.send("PayHero Backend Running 🚀");
});

const PORT = process.env.PORT || 10000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});