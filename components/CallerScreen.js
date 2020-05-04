import React, {useState, useEffect} from 'react';
import {Text, View, Image, StatusBar, TouchableOpacity} from 'react-native';

import {
  RTCPeerConnection,
  RTCIceCandidate,
  RTCSessionDescription,
  RTCView,
  MediaStream,
  MediaStreamTrack,
  mediaDevices,
  registerGlobals,
} from 'react-native-webrtc';

const configuration = {iceServers: [{url: 'stun:stun.l.google.com:19302'}]};

const pc = new RTCPeerConnection(configuration);

const styles = {
  container: {
    flex: 1,
  },
  headerStyle: {
    fontSize: 36,
    textAlign: 'center',
    fontWeight: '100',
    marginBottom: 24,
  },
  elementsContainer: {},
  end: {
    fontSize: 40,
    color: 'white',
    textAlign: 'center',
    marginTop: 20,
  },
  talking: {
    fontSize: 20,
    color: 'white',
    textAlign: 'center',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
  },
  details: {
    color: 'white',
    fontSize: 15,
    textAlign: 'center',
    marginTop: 20,
  },
  pic: {
    width: 400,
    height: 400,
    alignSelf: 'center',
  },
  button: {
    alignItems: 'center',
    backgroundColor: '#cc0000',
    padding: 20,
  },
};

const CallerScreen = props => {
  const [remoteStream, setRemoteStream] = useState();
  const [cachedLocalPC, setCachedLocalPC] = useState();
  const [cachedRemotePC, setCachedRemotePC] = useState();

  const [isMuted, setIsMuted] = useState(false);
  const [offer, setOffer] = useState();

  useEffect(() => {
    console.log(props.isCaller, '+++props.isCaller');
    // props.isCaller ? startCall() : joinCall();
    startCall()
  });

  const startCall = async () => {
    pc.onicecandidate = e => {
      try {
        console.log('localPC icecandidate:', e.candidate);
        if (e.candidate) {
          pc.addIceCandidate(e.candidate);
        }
      } catch (err) {
        console.error(`Error adding remotePC iceCandidate: ${err}`);
      }
    };

    pc.onaddstream = e => {
      setRemoteStream(e.stream);
      console.log('other stream', e.stream, e.stream.toURL());
    };

    pc.addStream(props.localStream);

    try {
      const offer = await pc.createOffer();
      console.log('Offer from localPC, setLocalDescription');
      await pc.setLocalDescription(offer);
      console.log('remotePC, setRemoteDescription');
      await pc.setRemoteDescription(pc.localDescription);
      setOffer(offer);
      setCachedLocalPC(pc);
    } catch (err) {
      console.error(err);
    }
  };

  const joinCall = async () => {
    pc.onicecandidate = e => {
      try {
        console.log('localPC icecandidate:', e.candidate);
        if (e.candidate) {
          pc.addIceCandidate(e.candidate);
        }
      } catch (err) {
        console.error(`Error adding remotePC iceCandidate: ${err}`);
      }
    };

    pc.onaddstream = e => {
      setRemoteStream(e.stream);
      console.log('other stream', e.stream, e.stream.toURL());
    };

    pc.addStream(props.localStream);

    try {
      await pc.setRemoteDescription(offer.localDescription);
      console.log('RemotePC, createAnswer');
      
      const answer = await pc.createAnswer();
      console.log(`Answer from remotePC: ${answer.sdp}`);
      console.log('remotePC, setLocalDescription');
      await pc.setLocalDescription(answer);
      setCachedRemotePC(pc);
      console.log('localPC, setRemoteDescription');
    } catch (err) {
      console.error(err);
    }
  };

  const endCall = () => props.updateCalling(false);

  return (
    <>
      <StatusBar barStyle="light-content" backgroundColor="#22222e" />
      <View style={styles.container}>
        <View style={[{flex: 1}, styles.elementsContainer]}>
          <View style={{flex: 1, backgroundColor: '#1b1b25', padding: 10}}>
            <Text style={styles.talking}>Talking with: {props.item.name}</Text>
            <Text style={styles.details}>ID:{props.item.pin}</Text>
          </View>
          <View style={{flex: 5}}>
            <Image
              source={{
                uri:
                  'https://res.cloudinary.com/skybound/image/upload/v1588437379/eventmanager/Calling-PNG-Photos.png',
              }}
              style={styles.pic}
            />
          </View>
          <TouchableOpacity style={styles.button} onPress={endCall}>
            <Text style={{fontSize: 25, color: 'white'}}>End</Text>
          </TouchableOpacity>
        </View>
      </View>
    </>
  );
};

export default CallerScreen;
