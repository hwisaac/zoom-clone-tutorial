// frontend part

// frontend 와 backed 를 연결하기. 여기 socket은 서버로의 연결을 의미
const socket = new WebSocket(`ws://${window.location.host}`);

//서버(socket)가 online이 된 경우
socket.addEventListener("open", () =>{
    console.log("connected to server ");
});

// 서버가 메세지를 보낼경우
socket.addEventListener("message", (message)=>{
    console.log('just got this', message.data);
});

// 서버가 offline 이 될 경우
socket.addEventListener("close", () =>{
    console.log("disconnected from server");
});


// 5초 후 beckend 로 메세지를 보내기
setTimeout( ()=>{
    socket.send("Msg from the front");
}, 5000);