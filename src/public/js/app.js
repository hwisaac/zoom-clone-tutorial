// frontend part

// frontend 와 backed 를 연결하기. 여기 socket은 서버로의 연결을 의미
const socket = new WebSocket(`ws://${window.location.host}`);

const messageList  = document.querySelector('ul');
const nickForm = document.querySelector('#nick');
const messageForm = document.querySelector('#message');


//서버(socket)가 online이 된 경우
socket.addEventListener("open", () =>{
    console.log("connected to server ");
});

//서버가 메세지를 받은 경우
socket.addEventListener("message", (message)=>{
   const li = document.createElement('li');
   li.innerText = message.data;
   messageList.append(li);
});

// 서버가 offline 이 될 경우
socket.addEventListener("close", () =>{
    console.log("disconnected from server");
});


// json obj 를 텍스트형태로 리턴한다.
function makeMessage( type, payload){
    const msg = {type, payload};
    return JSON.stringify(msg);
}

function handleSubmit(event){
    event.preventDefault();
    const input = messageForm.querySelector("input");
    //backend 로 input.value보내기
    socket.send(makeMessage("new_message", input.value));
    input.value= "";
    
}
function handleNickSubmit(event){
    event.preventDefault();
    const input = nickForm.querySelector("input");
    
    //서버에 단순 메세지가 아니라 json obj을 보낸다
    socket.send(
        makeMessage("nickname", input.value)
    );
    input.value ="";
}

nickForm.addEventListener("submit", handleNickSubmit);
messageForm.addEventListener("submit", handleSubmit);