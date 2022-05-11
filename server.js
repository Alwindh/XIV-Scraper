const port = process.env.PORT || 6080;
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
require("dotenv").config();

//app setup + port definition
const app = express();

// cors and express
app.use(cors());
app.use(express.json());

//mongoose setup
mongoose.connect(process.env.ATLAS_URI, { useNewUrlParser: true, useUnifiedTopology: true });
const connection = mongoose.connection;
connection.once("open", () => {
	console.log("MongoDB database connection: established");
});

//players route
app.use("/api/data", require("./routes/data"));

// start server
app.listen(port, () => {
	console.log(`Server is running on port: ${port}`);
});
