const socket = io();

const myFace = document.getElementById("myFace");
const muteBtn = document.getElementById("mute");
const cameraBtn = document.getElementById("camera");
//카메라 선택 옵션
const camerasSelect = document.getElementById("cameras");
const call = document.getElementById("call");

call.hidden = true;

let myStream; // stream 은 video+audio 를 의미
let muted = false;
let cameraOff = false;
let roomName;

async function getCameras() {
  try {
    // 디바이스를 전부 가져오기
    const devices = await navigator.mediaDevices.enumerateDevices();
    //videoinput 에 해당하는 디바이스로 필터링
    const cameras = devices.filter((device) => device.kind === "videoinput");

    const currentCamera = myStream.getVideoTracks()[0];
    cameras.forEach((camera) => {
      const option = document.createElement("option");
      // id는 value에저장한다. stream에 이 장치를 사용하도록 할 거임
      option.value = camera.deviceId;
      option.innerText = camera.label;
      if (currentCamera.label === camera.label) {
        option.selected = true;
      }
      camerasSelect.appendChild(option);
    });
  } catch (e) {
    console.log(e);
  }
}

async function getMedia(deviceId) {
  const initialConstrains = {
    audio: true,
    video: { facingMode: "user" },//모바일시 셀카 카메라로 자동설정
  };
  const cameraConstraints = {
    audio: true,
    video: { deviceId: { exact: deviceId } },
  };
  try {
    myStream = await navigator.mediaDevices.getUserMedia(
      deviceId ? cameraConstraints : initialConstrains
    );
    // 스트림을 #myFace 에 넣어준다
    myFace.srcObject = myStream;

    //deviceID가 없을때만 카메라 목록을 가져오게 함
    if (!deviceId) {
      await getCameras();
    }
  } catch (e) {
    console.log(e);
  }
}


function handleMuteClick() {\
  myStream
    .getAudioTracks()
    .forEach((track) => (track.enabled = !track.enabled)); //track.enabled 토글키
  if (!muted) {
    muteBtn.innerText = "Unmute";
    muted = true;
  } else {
    muteBtn.innerText = "Mute";
    muted = false;
  }
}
function handleCameraClick() {
  myStream
    .getVideoTracks()
    .forEach((track) => (track.enabled = !track.enabled));
  if (cameraOff) {
    cameraBtn.innerText = "Turn Camera Off";
    cameraOff = false;
  } else {
    cameraBtn.innerText = "Turn Camera On";
    cameraOff = true;
  }
}

async function handleCameraChange() {
  //getMedia 에 deviceID 전달
  await getMedia(camerasSelect.value);
}

muteBtn.addEventListener("click", handleMuteClick);
cameraBtn.addEventListener("click", handleCameraClick);
camerasSelect.addEventListener("input", handleCameraChange);

// Welcome Form (join a room)

const welcome = document.getElementById("welcome");
const welcomeForm = welcome.querySelector("form");

function startMedia() {
  welcome.hidden = true;
  call.hidden = false;
  getMedia();
}

function handleWelcomeSubmit(event) {
  event.preventDefault();
  const input = welcomeForm.querySelector("input");
  socket.emit("join_room", input.value, startMedia);
  roomName = input.value;
  input.value = "";
}

welcomeForm.addEventListener("submit", handleWelcomeSubmit);

// Socket Code

socket.on("welcome", () => {
  console.log("someone joined");
});