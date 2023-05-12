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

  // ICE エージェントが新たな candidate を発見した際のコールバック
  pc.onicecandidate = (event) => {
    if (event.candidate) {
      console.log(`ICE Candidate:`, event.candidate.toJSON());
    } else {
      sendSdp(pc.localDescription);
    }
  };

  // ICE エージェントの状態が変更した際のコールバック
  pc.oniceconnectionstatechange = () => {
    console.log(`ICE connection state change: `, pc.iceConnectionState);
    switch (pc.iceConnectionState) {
      case 'new':
      // ICE エージェントはローカルの candidate の収集中であるか、リモートからの candidate の受信待ち。

      case 'checking':
      // ICE エージェントは1つ以上のリモート candidate を受信しており、接続を確認中である。
      // また同時に他の candidate についても収集を行っている可能性がある。

      case 'connected':
      // ICE エージェントは使用可能な接続を発見した。
      // 同時に他に良い候補がないかも接続を確認している可能性がある。

      case 'completed':
      // ICE エージェントは全ての候補に対して接続確認を行い、最良の候補で接続を確立した。

      case 'failed':
      // ICE エージェントは全ての候補に対して接続確認を行い、1つ以上の組み合わせで接続の発見に失敗した状態。
      // 他の候補では接続が確率した可能性がある。

      case 'disconnected':
      // RTCPeerConnection の接続性確認に失敗している状態。
      // 'failed' よりも厳密ではなく、不安定なネットワーク環境下などで断続的に発生する可能性があり、
      // 問題が解決すると 'connected' に戻ることがあります。

      case 'closed':
      // ICE エージェントはシャットダウンしており、STUN リクエストには応答できない状態。

    };
  };

  // ICE エージェントの candidate 収集ステータスが変更した際のコールバック
  pc.onicegatheringstatechange = () => {
    console.log(`ICE gathering state change: `, pc.iceGatheringState);
    switch (pc.iceGatheringState) {
      case 'new': // 生成直後で candidate の収集を開始していない。
      case 'gathering': // ICEエージェントが candidate を収集中。
      case 'complete': // ICE エージェントが candidate の収集を完了した。
    };
  };

  if (!localStream) await startVideo();
  localStream.getTracks().forEach(track => pc.addTrack(track, localStream));

  pc.createOffer().then(offer => {
    pc.setLocalDescription(offer);
    sendSdp(offer)
  });


};
