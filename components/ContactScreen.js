import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  StatusBar,
  FlatList,
  TouchableOpacity,
  Image,
  ScrollView,
  Dimensions,
  Platform,
  Alert,
} from 'react-native';
import {
  RTCPeerConnection,
  mediaDevices,
} from 'react-native-webrtc';

import {PERMISSIONS, request} from 'react-native-permissions';

import CallerScreen from './CallerScreen';
import Profile from './Profile';

const screenWidth = Dimensions.get('window').width;
// const configuration = {iceServers: [{url: 'stun:stun.l.google.com:19302'}]};

// const pc = new RTCPeerConnection(configuration);

const styles = {
  container: {
    flex: 1,
  },
  headerStyle: {
    fontSize: 25,
    fontWeight: '100',
    alignSelf: 'stretch',
    padding: 20,
    backgroundColor: '#1b1b25',
    color: 'white',
  },
  subContainer: {
    flexDirection: 'row',
    backgroundColor: '#1b1b25',
    justifyContent: 'flex-start',
  },
  subStyle: {
    fontSize: 15,
    padding: 20,
    color: 'white',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    borderColor: '#dcdcdc',
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    padding: 20,
    justifyContent: 'space-between',
  },
  pic: {
    width: 50,
    height: 50,
  },
  nameContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: 250,
  },
  nameTxt: {
    marginLeft: 15,
    fontWeight: '600',
    color: '#222',
    fontSize: 15,
  },
  mblTxt: {
    fontWeight: '200',
    color: '#777',
    fontSize: 13,
  },
  end: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  icon: {
    height: 28,
    width: 28,
  },
};

const ContactScreen = ({calls}) => {
  const [isCall, updateCalling] = useState(false);
  const [user, getUser] = useState('');
  const [isCaller, caller] = useState(false);
  const [localStream, setLocalStream] = useState();
  const [remoteStream, setRemoteStream] = useState();

  const [cachedLocalPC, setCachedLocalPC] = useState();
  const [cachedRemotePC, setCachedRemotePC] = useState();

  useEffect(() => {
    request(
      Platform.select({
        android: PERMISSIONS.ANDROID.MICROPHONE,
        ios: PERMISSIONS.IOS.MICROPHONE,
      }),
    );
  });

  const openUserMedia = async item => {
    getUser(item);
    updateCalling(true);
    try {
      const stream = await mediaDevices.getUserMedia({audio: true});
      setLocalStream(stream);
      caller(true);
      // setRemoteStream(new MediaStream());
      console.log('Got Stream: locaAudio');
    } catch (error) {
      updateCalling(false);
      caller(true);
      console.log(error, 'error stream');
    }
  };

  const startCall = async item => {
    await openUserMedia(item);
    const configuration = {iceServers: [{url: 'stun:stun.l.google.com:19302'}]};
    const localPC = new RTCPeerConnection(configuration);
    const remotePC = new RTCPeerConnection(configuration);
    localPC.onicecandidate = e => {
      try {
        console.log('localPC icecandidate:', e.candidate);
        if (e.candidate) {
          remotePC.addIceCandidate(e.candidate);
        }
      } catch (err) {
        console.error(`Error adding remotePC iceCandidate: ${err}`);
      }
    };

    remotePC.onicecandidate = e => {
      try {
        console.log('remotePC icecandidate:', e.candidate);
        if (e.candidate) {
          localPC.addIceCandidate(e.candidate);
        }
      } catch (err) {
        console.error(`Error adding localPC iceCandidate: ${err}`);
      }
    };
    remotePC.onaddstream = e => {
      console.log('remotePC tracking with ', e);
      if (e.stream && remoteStream !== e.stream) {
        console.log('RemotePC received the stream', e.stream);
        setRemoteStream(e.stream);
      }
    };

    localPC.addStream(localStream);

    try {
      const offer = await localPC.createOffer();
      console.log('Offer from localPC, setLocalDescription');
      await localPC.setLocalDescription(offer);
      console.log('remotePC, setRemoteDescription');

      await remotePC.setRemoteDescription(localPC.localDescription);
      console.log('RemotePC, createAnswer');

      const answer = await remotePC.createAnswer();
      console.log(`Answer from remotePC: ${answer.sdp}`);
      console.log('remotePC, setLocalDescription');
      await remotePC.setLocalDescription(answer);
      console.log('localPC, setRemoteDescription');
      await localPC.setRemoteDescription(remotePC.localDescription);
    } catch (err) {
      console.error(err);
    }
    setCachedLocalPC(localPC);
    setCachedRemotePC(remotePC);
  };

  // const startCall = async () => {
  //   pc.onicecandidate = e => {
  //     try {
  //       console.log('localPC icecandidate:', e.candidate);
  //       if (e.candidate) {
  //         pc.addIceCandidate(e.candidate);
  //       }
  //     } catch (err) {
  //       console.error(`Error adding remotePC iceCandidate: ${err}`);
  //     }
  //   };

  //   pc.onaddstream = e => {
  //     setRemoteStream(e.stream);
  //     console.log('other stream', e.stream, e.stream.toURL());
  //   };

  //   pc.addStream(props.localStream);

  //   try {
  //     const offer = await pc.createOffer();
  //     console.log('Offer from localPC, setLocalDescription');
  //     await pc.setLocalDescription(offer);
  //     console.log('remotePC, setRemoteDescription');
  //     await pc.setRemoteDescription(pc.localDescription);
  //     setOffer(offer);
  //     setCachedLocalPC(pc);
  //   } catch (err) {
  //     console.error(err);
  //   }
  // };

    // const joinCall = async () => {
  //   pc.onicecandidate = e => {
  //     try {
  //       console.log('localPC icecandidate:', e.candidate);
  //       if (e.candidate) {
  //         pc.addIceCandidate(e.candidate);
  //       }
  //     } catch (err) {
  //       console.error(`Error adding remotePC iceCandidate: ${err}`);
  //     }
  //   };

  //   pc.onaddstream = e => {
  //     setRemoteStream(e.stream);
  //     console.log('other stream', e.stream, e.stream.toURL());
  //   };

  //   pc.addStream(props.localStream);

  //   try {
  //     await pc.setRemoteDescription(offer.localDescription);
  //     console.log('RemotePC, createAnswer');

  //     const answer = await pc.createAnswer();
  //     console.log(`Answer from remotePC: ${answer.sdp}`);
  //     console.log('remotePC, setLocalDescription');
  //     await pc.setLocalDescription(answer);
  //     setCachedRemotePC(pc);
  //     console.log('localPC, setRemoteDescription');
  //   } catch (err) {
  //     console.error(err);
  //   }
  // };

  const openAlert = () => {
    Alert.alert(
      'Calling',
      'Accept call ?',
      [
        {
          text: 'Cancel',
          onPress: () => console.log('Cancel Pressed'),
          style: 'No',
        },
        {text: 'Yes', onPress: () => console.log('OK Pressed')},
      ],
      {cancelable: false},
    );
  };

  const renderContact = ({item}) => {
    return (
      <View style={styles.row}>
        <Image source={{uri: item.image}} style={styles.pic} />
        <View>
          <View style={styles.nameContainer}>
            <Text style={styles.nameTxt}>{item.name}</Text>
          </View>
          <View style={styles.end}>
            <Image
              style={[
                styles.icon,
                {marginLeft: 15, marginRight: 5, width: 14, height: 14},
              ]}
              source={{
                uri:
                  'https://img.icons8.com/carbon-copy/100/000000/mobile-order.png',
              }}
            />
            <Text style={styles.time}>
              {item.value} {item.pin}
            </Text>
          </View>
        </View>
        <TouchableOpacity>
          <Image
            style={[styles.icon, {marginRight: 50}]}
            onStartShouldSetResponder={() => startCall(item)}
            source={{uri: 'https://img.icons8.com/color/48/000000/phone.png'}}
          />
        </TouchableOpacity>
      </View>
    );
  };

  const headerContent = () => (
    <>
      <View>
        <Text style={styles.headerStyle}>Translator</Text>
      </View>
      <View style={styles.subContainer}>
        <TouchableOpacity>
          <Text
            style={styles.subStyle}
            onPress={() => {
              scroll.scrollTo({x: 0});
            }}>
            Contact
          </Text>
        </TouchableOpacity>
        <TouchableOpacity>
          <Text
            style={styles.subStyle}
            onPress={() => {
              scroll.scrollTo({x: screenWidth});
            }}>
            Profile
          </Text>
        </TouchableOpacity>
        <Text style={styles.subStyle} onPress={openAlert}>
          Join call
        </Text>
      </View>
    </>
  );

  const contactHeader = () => {
    return (
      <>
        <StatusBar barStyle="light-content" backgroundColor="#22222e" />
        <View style={styles.container}>
          {headerContent()}
          <ScrollView
            horizontal={true}
            pagingEnabled={true}
            showsHorizontalScrollIndicator={false}
            ref={node => (scroll = node)}>
            <FlatList
              data={calls}
              keyExtractor={item => item.id.toString()}
              renderItem={renderContact}
            />
            <Profile />
          </ScrollView>
        </View>
      </>
    );
  };

  return (
    <>
      {!isCall ? (
        contactHeader()
      ) : (
        <CallerScreen
          updateCalling={updateCalling}
          item={user}
          localStream={localStream}
          setLocalStream={setLocalStream}
          remoteStream={remoteStream}
          setRemoteStream={setRemoteStream}
          isCaller={isCaller}
        />
      )}
    </>
  );
};

export default ContactScreen;
