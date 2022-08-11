// frontend part

//backend 를 이어주는 io 함수를 선언한다.
const socket = io();

const welcome = document.getElementById("welcome");
const form = welcome.querySelector('form');
const room = document.querySelector('#room');
const chatForm = document.getElementById("chatForm");

room.hidden = true;

function handleMessageSubmit(event) {
    event.preventDefault();

    const input = room.querySelector("#msg input");
    const value = input.value;
    socket.emit("new_message", value, roomName, () => {
      addMessage(`You: ${value}`);
    });
    input.value = "";
  }

function handleNicknameSubmit(event){
    event.preventDefault();

    const input = room.querySelector("#name input");
    const value = input.value;
    socket.emit("nickname", value)
}

  function addMessage(message) {
    const ul = room.querySelector("ul");
    const li = document.createElement("li");
    li.innerText = message;
    ul.appendChild(li);
  }

function showRoom(roomName) {
    welcome.hidden = true;
    room.hidden =false;
    const h3 = room.querySelector('h3');
    h3.innerText = `Room [${roomName}]`;
    const msgForm = room.querySelector("#msg");
    const nameForm = room.querySelector("#name");

    // form 에 메세지 입력하는 이벤트 리스너를 추가한다
    msgForm.addEventListener("submit", handleMessageSubmit);
    nameForm.addEventListener("submit", handleNicknameSubmit);
}


function handleRoomSubmit(event) {
    event.preventDefault();
    const input = form.querySelector("input");
    

    //소켓io 에서는 sockeet.submit 대신 emit 을 쓴다. 
    // socket.emit('이벤트텍스트', JSON obj, 콜백함수) 
    //enter_room(임의) 이벤트를 백엔드에 전송. 스트링이 아닌 자바스크립트 오브젝트도 그대로 전송한다.  마지막 agm 로 콜백함수도 전달 가능(프론트에서 만든 함수를 서버에서 실행하게 해준다.)
    socket.emit("enter_room", input.value, showRoom );

    roomName = input.value;
    input.value= "";


}
function handleChatMessage(event){
    event.preventDefault();
    const input = chatForm.querySelector("input");

    socket.emit("enterMessage", input.value, addMessage);

    input.value= "";
}


//on: back -> front 
socket.on("welcome", (name,newCount)=> {
    console.log("welcome!")
    const h3 = room.querySelector('h3');
    h3.innerText = `Room [${roomName} (users: ${newCount})]`;
    addMessage(`${name} joined` );
});

socket.on("bye", (name, newCount)=>{
    console.log("someone left!");
    const h3 = room.querySelector('h3');
    h3.innerText = `Room [${roomName} (users: ${newCount})]`;
    addMessage(`${name} left!` );
})



form.addEventListener("submit", handleRoomSubmit);

//메세지 받아서 표시하기
socket.on("new_message", addMessage);
socket.on("room_change", (rooms) => {
  const roomList = document.querySelector("#openRooms");
  const rList=[];
  roomList.innerHTML = "";
  rooms.forEach((room)=>{
    
    if(rooms.length === 0){
      roomList.innerHTML = "";
      socket.emit("changedRoomList", rList);
      return;
    }
    const li = document.createElement("li");
    li.innerText= room;
    roomList.append(li);
    rList.push(room);
    socket.emit("changedRoomList", rList);
  })
}
          );