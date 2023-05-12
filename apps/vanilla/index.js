/** @type {RTCPeerConnection} */
let peer = null;

/** @type {MediaStream} */
let localStream = null;

/** @type {MediaStream} */
let remoteStream = null;

/** @type {HTMLVideoElement} */
const localVideo = document.getElementById("local-video");

/** @type {HTMLVideoElement} */
const remoteVideo = document.getElementById("remote-video");

/** @type {HTMLTextAreaElement} */
const localSdp = document.getElementById("local-sdp");


/**
 * 引数のストリームをエレメントに設定&再生させます。
 * 
 * @param {HTMLVideoElement} element
 * @param {MediaStream} stream
 */
function playVideo(element, stream) {
  element.srcObject = stream;
  element.play().catch(error => console.error(`error auto play: `, error))
};

/** ローカルのビデオを開始する */
async function startVideo() {
  await navigator.mediaDevices
    .getUserMedia({ video: true, audio: false })
    .then(stream => {
      localStream = stream;
      playVideo(localVideo, localStream);
    })
    .catch(console.error)
};

function connect() {
  _offer();
}

/**
 * SDP を送信します。
 * 
 * @param {RTCSessionDescriptionInit} sessionDescription 
 */
function sendSdp(sessionDescription) {
  // TODO: sending SDP with a signaling server.
  localSdp.value = sessionDescription.sdp;
};

/**
 * オファー要求を行います。
 */
async function _offer() {
  const config = { "iceServers": [{ "urls": "stun:stun.l.google.com:19302" }] };
  const pc = new RTCPeerConnection(config);

  // ICE Candidate の発見
  pc.onicecandidate = (event) => {
    if (event.candidate) {
      console.log(`ICE Candidate:`, event.candidate.toJSON());
    } else {
      sendSdp(pc.localDescription);
    }
  };

  if (!localStream) await startVideo();
  localStream.getTracks().forEach(track => pc.addTrack(track, localStream));

  pc.createOffer().then(offer => {
    pc.setLocalDescription(offer);
    sendSdp(offer)
  });


};
