const express = require("express");
const bodyParser = require("body-parser");

require("dotenv").config();

const app = express();

app.use(bodyParser.json());

app.use("/auth", require("./routes/authRoutes"));
app.use("/users", require("./routes/authRoutes"));
app.use("/products", require("./routes/productRoutes"));

app.listen(3000, () => {
  console.log("Server running on port: http://localhost:3000");
});
