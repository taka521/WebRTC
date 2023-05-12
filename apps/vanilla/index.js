/** @type {RTCPeerConnection} */
let pc = null;

/** @type {MediaStream} */
let localStream = null;

/** @type {MediaStream} */
let remoteStream = null;

/** @type {HTMLVideoElement} */
const localVideo = document.getElementById("local-video");

/** @type {HTMLVideoElement} */
const remoteVideo = document.getElementById("remote-video");

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
function startVideo() {
  navigator.mediaDevices
    .getUserMedia({ video: true, audio: false })
    .then(stream => {
      localStream = stream;
      playVideo(localVideo, localStream);
    })
    .catch(console.error)
};