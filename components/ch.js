const socket = io();
const constraints = {
  audio: true,
  video: true
};
const configuration = {
  iceServers: [{
    "url": "stun:23.21.150.121"
  }, {
    "url": "stun:stun.l.google.com:19302"
  }]
};

const selfView = $('#selfView')[0];
const remoteView = $('#remoteView')[0];

var pc = new RTCPeerConnection(configuration);

pc.onicecandidate = ({
  candidate
}) => {
  socket.emit('message', {
    to: $('#remote').val(),
    candidate: candidate
  });
};

pc.onnegotiationneeded = async () => {
  try {
    await pc.setLocalDescription(await pc.createOffer());
    socket.emit('message', {
      to: $('#remote').val(),
      desc: pc.localDescription
    });
  } catch (err) {
    console.error(err);
  }
};

pc.ontrack = (event) => {
  // don't set srcObject again if it is already set.
  if (remoteView.srcObject) return;
  remoteView.srcObject = event.streams[0];
};

socket.on('message', async ({
  from,
  desc,
  candidate
}) => {
  $('#remote').val(from);
  try {
    if (desc) {
      // if we get an offer, we need to reply with an answer
      if (desc.type === 'offer') {
        await pc.setRemoteDescription(desc);
        const stream = await navigator.mediaDevices.getUserMedia(constraints);
        stream.getTracks().forEach((track) => pc.addTrack(track, stream));
        selfView.srcObject = stream;
      