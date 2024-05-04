const express = require('express');
const ws = require('ws');
const mustacheExpress = require('mustache-express');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const { createProcessor } = require("./src/modules/processor");

// load configurations and attach tp process.env
require("dotenv").config();
const port = process.env.PORT;
const registry = require("./src/routes");
const app = express();

// Set unique id
global.callerId = uuidv4();

app.use(express.json());

// #region view engine mustache
app.engine("mustache", mustacheExpress(__dirname + "/src/views/partials", ".mustache"));
app.set("view engine", "mustache");
app.set("views", path.join(__dirname, "src", "views"));
// #endregion


app.get("/", async (req, res) => {
  res.render("playground.mustache", { });
});

// Register all routes
registry.register(app);

// #region register static directories
app.use("/serve", express.static(path.join(__dirname, "src", "public"), { index: false }));
// #endregion

// Start listening for requests at port 9000
console.log("Server will start listening at port : " + port);
const server = app.listen(port);

// Websocket Init
const wsServer = new ws.Server({ noServer: true });
wsServer.on('connection', socket => {
  socket.on('message', message => console.log(message));
});

// Websocket Upgrade
server.on('upgrade', (request, socket, head) => {
  wsServer.handleUpgrade(request, socket, head, socket => {
    // Setting socket in Globals
    global.socket = socket;
    wsServer.emit('connection', socket, request);
  });
});


// Start Processing
const processor = createProcessor();
setTimeout(async () => {await processor.startProcessing()}, 0);

app.get("/api/stop-processing", (req, res) => {
  processor.stopProcessing();
  res.send({status: true});
});

app.get("/api/start-processing", (req, res) => {
  processor.startProcessing();
  res.send({status: true});
});

