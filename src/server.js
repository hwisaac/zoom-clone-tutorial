import express from "express";
import WebSocket from "ws";
import http from "http";

const app =express();

app.set("view engine", "pug");
app.set("views", __dirname + "/views");

// 일반 유저에게 public 폴더를 공개하는 부분
app.use("/public", express.static(__dirname+ "/public"))

app.get("/", (req,res) => res.render("home"));
// catchall url 만들기 (임의 url 입력시 메인으로 이동시키기)
app.get("/*", (req,res) =>res.redirect("/"));

//express로 만드는 http서버
const handleListen= ()=>console.log(`Listening on http://localhost:3000/`);
// app.listen(3000, handleListen);

//http 서버를 하나만들자 express()를 리스너로하자
const server = http.createServer(app);
//ws로 만드는 웹소켓서버. {server}전달을 통해 http, websocket 둘다 같은서버에서 작동함
const wss = new WebSocket.Server({ server });

//여기서의 socket은 연결된 브라우저를 말한다.
const handleConnection = (socket) =>{
    // 메세지 obj를 front에 보낸다 message.data 에 저장됨
    socket.send("hello");
}


wss.on("connection", (socket) => {
    console.log("connected to browser");

    //front 에서 보낸 메세지 출력하기
    socket.on("message", message => {
        console.log(message);
    })
});

server.listen(3000, handleListen);