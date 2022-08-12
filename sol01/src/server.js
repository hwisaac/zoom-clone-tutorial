import http from "http";
import WebSocket from "ws";
import express from "express";



const app = express();

app.set("view engine", "pug");
app.set("views", __dirname + "/views");
app.use("/public", express.static(__dirname + "/public"));
app.get("/", (_, res) => res.render("home"));
app.get("/*", (_, res) => res.redirect("/"));

const handleListen = () => console.log(`Listening on http://localhost:3000`);

const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

const sockets = [];

wss.on("connection", (socket) => {
  sockets.push(socket);
  socket["nickname"] = "Anonymous";
  console.log("Connected to Browser");

  sockets.forEach((aSocket) =>
    aSocket.send(`New ${socket.nickname} is entered.`)
  );

  socket.on("message", (msg) => {
    const message = JSON.parse(msg);
    switch (message.type) {
      case "new_message":
        sockets.forEach((aSocket) =>
          aSocket.send(`${socket.nickname}: ${message.payload}`)
        );
        break;
      case "nickname":
        const originNick = socket["nickname"];
        socket["nickname"] = message.payload;
        sockets.forEach((aSocket) =>
          aSocket.send(`${originNick} changed nickname to ${message.payload}`)
        );
        break;
    }
  });
  socket.on("close", () => {
    const originNick = socket["nickname"];
    sockets.forEach((aSocket) => aSocket.send(`${originNick} leave the chat`));
    // console.log("Disconected from Browser");
  });
});

server.listen(process.env.PORT, handleListen);
