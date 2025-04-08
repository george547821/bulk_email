require("dotenv").config();
const express = require("express");
const cors = require("cors");
const emailRoutes = require("./src/routes/emailRoutes");
const errorHandler = require("./src/middleware/errorHandler");

const app = express();

app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

app.use(cors());

app.use("/api", emailRoutes);
app.use(errorHandler);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
