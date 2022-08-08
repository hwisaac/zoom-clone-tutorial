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


//여기부터 백엔드 코드

//여기서의 socket은 연결된 브라우저를 말한다.
const handleConnection = (socket) =>{
    // 메세지 obj를 front에 보낸다 message.data 에 저장됨
    socket.send("hello");
}

//fake DB. 서버가 연결되면 그 커넥션을 담는다. 서로 다른 브라우저에 동일 메세지 보내기위함
const sockets = [];

//서버가 연결시
wss.on("connection", (socket) => {
    sockets.push(socket);
    socket["nickname"] = "Anonymous";

    console.log("connected to browser");
    
    //front에서 메세지 받을 때
    socket.on("message", (msg) => {
        //text를 json obj로 바꾼다
        const message = JSON.parse(msg);
        switch(message.type){
            case "new_message":
                sockets.forEach((aSocket) => 
                    aSocket.send(`${socket.nickname}: ${message.payload}`)
                    );
                break;
            case "nickname":
                //socket obj 에 "nickname" : payload 추가
                socket["nickname"] = message.payload;
                break;
        }

    });
});

server.listen(3000, handleListen);
