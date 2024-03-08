import './style.css';

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

const servers = {
  iceServers: [
    {
      urls: ["stun:stun1.l.google.com:19302", "stun:stun2.l.google.com:19302"],
    },
    {
      url: "turn:aifo.gscco.aidrivers.ai:3478",
      username: "itadmin",
      urls: "turn:aifo.gscco.aidrivers.ai:3478",
      credential: "test123",
    },
    {
      url: "turn:aifo.gscco.aidrivers.ai:5349",
      username: "itadmin",
      urls: "turn:aifo.gscco.aidrivers.ai:5349",
      credential: "test123",
    },
  ],
  iceCandidatePoolSize: 10,
};

let peerConnection = new RTCPeerConnection(servers);
let localStream;
let remoteStream;

let init = async () => {
  localStream = await navigator.mediaDevices.getUserMedia({
    video: {
      width: { ideal: 160 }, // Specifies the ideal width in pixels
      height: { ideal: 120 } // Specifies the ideal height in pixels
    },
    audio: true,
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
  const callDoc = firestore.collection("calls2").doc("test1");

  peerConnection.onicecandidate = async (event) => {
    //Event that fires off when a new offer ICE candidate is created
    if (event.candidate) {
      document.getElementById("offer-sdp").value = callDoc.id;

      const offer = JSON.stringify(peerConnection.localDescription);

      await callDoc.set({ offer });
    }
  };

  const offer = await peerConnection.createOffer();
  await peerConnection.setLocalDescription(offer);
};

let createAnswer = async () => {
  const callId = document.getElementById("offer-sdp").value;
  const callDoc = firestore.collection("calls2").doc("test1");
  const callData = (await callDoc.get()).data();
  const offerDescription = callData.offer;

  let offer = JSON.parse(offerDescription);

  peerConnection.onicecandidate = async (event) => {
    //Event that fires off when a new answer ICE candidate is created
    if (event.candidate) {
      console.log("Adding answer candidate...:", event.candidate);
      document.getElementById("answer-sdp").value = JSON.stringify(
        peerConnection.localDescription
      );

      const answer = JSON.stringify(peerConnection.localDescription);

      await callDoc.update({ answer });
    }
  };

  await peerConnection.setRemoteDescription(offer);

  let answer = await peerConnection.createAnswer();
  await peerConnection.setLocalDescription(answer);
};

let addAnswer = async () => {
  const callId = document.getElementById("offer-sdp").value;
  const callDoc = firestore.collection("calls2").doc("test1");
  const callData = (await callDoc.get()).data();
  const answerDescription = callData.answer;

  console.log("Add answer triggerd");
  let answer = JSON.parse(answerDescription);
  console.log("answer:", answer);
  if (!peerConnection.currentRemoteDescription) {
    peerConnection.setRemoteDescription(answer);
  }
};

init();

document.getElementById("create-offer").addEventListener("click", createOffer);
document
  .getElementById("create-answer")
  .addEventListener("click", createAnswer);
document.getElementById("add-answer").addEventListener("click", addAnswer);
