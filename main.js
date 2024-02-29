import firebase from "firebase/app";
import "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyAwXvqhfDvoZaZrbwmQGh6rVvl7zUJVxBE",
  authDomain: "webrtc-7000f.firebaseapp.com",
  projectId: "webrtc-7000f",
  storageBucket: "webrtc-7000f.appspot.com",
  messagingSenderId: "721148472292",
  appId: "1:721148472292:web:76cf9fd25b801a930475f1",
  measurementId: "G-TLE1NM2Y90",
};

if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}
const firestore = firebase.firestore();

let peerConnection = new RTCPeerConnection();
let localStream;
let remoteStream;

let init = async () => {
  localStream = await navigator.mediaDevices.getUserMedia({
    video: true,
    audio: false,
  });
  remoteStream = new MediaStream();
  document.getElementById("user-1").srcObject = localStream;
  document.getElementById("user-2").srcObject = remoteStream;

  localStream.getTracks().forEach((track) => {
    peerConnection.addTrack(track, localStream);
  });

  peerConnection.ontrack = (event) => {
    event.streams[0].getTracks().forEach((track) => {
      remoteStream.addTrack(track);
    });
  };
};

let createOffer = async () => {
  peerConnection.onicecandidate = async (event) => {
    //Event that fires off when a new offer ICE candidate is created
    if (event.candidate) {
      document.getElementById("offer-sdp").value = JSON.stringify(
        peerConnection.localDescription
      );
    }
  };

  const offer = await peerConnection.createOffer();
  await peerConnection.setLocalDescription(offer);
};

let createAnswer = async () => {
  let offer = JSON.parse(document.getElementById("offer-sdp").value);

  peerConnection.onicecandidate = async (event) => {
    //Event that fires off when a new answer ICE candidate is created
    if (event.candidate) {
      console.log("Adding answer candidate...:", event.candidate);
      document.getElementById("answer-sdp").value = JSON.stringify(
        peerConnection.localDescription
      );
    }
  };

  await peerConnection.setRemoteDescription(offer);

  let answer = await peerConnection.createAnswer();
  await peerConnection.setLocalDescription(answer);
};

let addAnswer = async () => {
  console.log("Add answer triggerd");
  let answer = JSON.parse(document.getElementById("answer-sdp").value);
  console.log("answer:", answer);
  if (!peerConnection.currentRemoteDescription) {
    peerConnection.setRemoteDescription(answer);
  }
};

document.getElementById("create-offer").addEventListener("click", createOffer);
document
  .getElementById("create-answer")
  .addEventListener("click", createAnswer);
document.getElementById("add-answer").addEventListener("click", addAnswer);
document.getElementById("init-offer").addEventListener("click", init);
