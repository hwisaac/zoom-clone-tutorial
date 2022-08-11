import express from "express";
// import WebSocket from "ws";
import SocketIO from "socket.io";
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

//http 서버를 하나만들자 express()를 리스너로하자
const server = http.createServer(app);
// //ws로 만드는 웹소켓서버. {server}전달을 통해 http, websocket 둘다 같은서버에서 작동함
// const wss = new WebSocket.Server({ server });

// socketIO로 서버를 만들자.
const wsServer = SocketIO(server);

//여기부터 백엔드 코드

function publicRooms(){
    //wsServer 안에서 sids 와 rooms를 가져오기
    const {
        sockets: {
            adapter:{
                sids, rooms}
            }
        } = wsServer;
    // 퍼블릭룸이 담길 리스트 만들기
    const publicRooms = [];

    rooms.forEach((_, key)=> {
        if(sids.get(key) === undefined){
            publicRooms.push(key);
        }
    });
    return publicRooms;
    
}
function countRoom(roomName){
    return wsServer.sockets.adapter.rooms.get(roomName)?.size;
}

wsServer.on("connection", socket =>{
    socket["nickname"] = "anonymous"
    // front -> back

    // 이벤트가 발생할때마다
    socket.onAny((event) => {

        console.log(`Socket Event 발생: ${event}`);
    });
    //프론트에서 받은 enter_room 이벤트를 받을 시. 보내진 args 인 msg 를 출력하고 프론트에 done함수를 실행한다.
    socket.on("enter_room", (roomName, showRoom)=> {
        console.log(roomName);
        //room 으로 참가하기
        socket.join(roomName);
        showRoom(roomName);
        //유저를 제외한 모든 사람에게 welcome 이벤트를 roomName 모두에게 보내기. 
        socket.to(roomName).emit("welcome", socket.nickname, countRoom(roomName));
        
        //모든 소켓에 보낼때는 sokets.emit("이벤트", args..);
        wsServer.sockets.emit("room_change", publicRooms());
    });

    //연결끊길시. disconnecting event 는 소켓이 방을 떠나기 직전 발생한다.
    socket.on("disconnecting", () => {
        socket.rooms.forEach((room) => socket.to(room).emit("bye", socket.nickname, countRoom(room)-1));
    })
    //disconnect event 는 떠난 후에 이벤트를 다룰수 있다.
    socket.on("disconnect", ()=>{
        wsServer.sockets.emit("room_change", publicRooms());
    })
    //메세지 입력시
    socket.on("new_message", (msg, room, whatYouSaid) => {
        socket.to(room).emit("new_message", `${socket.nickname}: ${msg}`);
        //메세지 출력
        whatYouSaid();
        
    })
    //닉네임 저장시
    socket.on("nickname", (nickname) => {
        socket["nickname"] = nickname 
    })

    //룸리스트 변경시
    socket.on("changedRoomList", (arg)=> console.log("room list: ",arg));
});


server.listen(3000, handleListen);

