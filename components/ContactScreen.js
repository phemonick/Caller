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
  TextInput,
} from 'react-native';
import {
  RTCPeerConnection,
  mediaDevices,
  RTCSessionDescription,
  RTCIceCandidate,
} from 'react-native-webrtc';
import faker from 'faker';

import io from 'socket.io-client';

import db from './config';

import {PERMISSIONS, request} from 'react-native-permissions';
import CallerScreen from './CallerScreen';
import Profile from './Profile';

const screenWidth = Dimensions.get('window').width;

const configuration = {iceServers: [{url: 'stun:stun.l.google.com:19302'}]};

const pc = new RTCPeerConnection(configuration);

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
  time: {
    fontSize: 15,
  },
};

const UUID = () => {
  return 'xxxxxxxx'.replace(/[xy]/g, function(c) {
    let r = (Math.random() * 16) | 0,
      v = c == 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
};

const ContactScreen = () => {
  const [socket] = useState(() =>
    io('https://74537080.ngrok.io', {forceNode: true}),
  );
  const [isCall, updateCalling] = useState(false);
  const [user, getUser] = useState('');
  const [isCaller, caller] = useState(false);
  const [localStream, setLocalStream] = useState();
  const [remoteStream, setRemoteStream] = useState();
  const [cachedLocalPC, setCachedLocalPC] = useState();
  const [cachedRemotePC, setCachedRemotePC] = useState();
  const [callRoomId, setCallRoomId] = useState();
  const [value, onChangeText] = useState('');
  const [loginUser] = useState({
    id: 11,
    name: faker.fake('{{name.lastName}}, {{name.firstName}}'),
    roomId: UUID(),
    image: 'https://bootdey.com/img/Content/avatar/avatar1.png',
    type: 'Login',
  });
  const [userList, updateUser] = useState([]);

  useEffect(() => {
    request(
      Platform.select({
        android: PERMISSIONS.ANDROID.MICROPHONE,
        ios: PERMISSIONS.IOS.MICROPHONE,
      }),
    );
    startSocket();
  });

  const startSocket = () => {
    socket.emit('login', loginUser);
  };

  socket.on('updateUserList', users => {
    console.log(users, 'lol');
    // updateUser([userList, ...users]);
  });

  // const updateUserList = () => {
  //   console.log('yes yes yes yes');
  //   socket.on('updateUserList', users => {
  //     console.log(users, 'lol');
  //     updateUser([userList, ...users]);
  //   });
  // };

  socket.on('updateUserList', users => {
    console.log(users, 'lol');
    // updateUser([userList, ...users]);
  });

  const openUserMedia = async item => {
    getUser(item);
    updateCalling(true);
    try {
      const stream = await mediaDevices.getUserMedia({audio: true});
      caller(true);
      return stream;
    } catch (error) {
      updateCalling(false);
      caller(true);
      return error;
    }
  };

  const startCall = async item => {
    const mediaStream = await openUserMedia(item);
    setLocalStream(mediaStream);
    const roomRef = await db.collection('rooms').doc();
    // console.log(roomRef, 'roomRef')
    pc.addStream(mediaStream);
    const callerCandidatesCollection = roomRef.collection('callerCandidates');
    pc.onicecandidate = e => {
      callerCandidatesCollection.add(e.candidate.toJSON());
      // console.log('send candidate', e.candidate);
    };
    const offer = await pc.createOffer();

    await pc.setLocalDescription(offer);

    const roomWithOffer = {
      offer: {
        type: offer.type,
        sdp: offer.sdp,
      },
    };

    await roomRef.set(roomWithOffer);
    setCallRoomId(roomRef.id);
    pc.onaddstream = e => {
      setRemoteStream(e.e.stream.toURL());
      // console.log('other stream', e.stream.toURL());
    };

    roomRef.onSnapshot(async snapshot => {
      const data = snapshot.data();
      if (!pc.currentRemoteDescription && data && data.answer) {
        // console.log('Got remote description: ', data.answer);
        const rtcSessionDescription = new RTCSessionDescription(data.answer);
        await pc.setRemoteDescription(rtcSessionDescription);
      }
    });
    // Listening for remote session description above

    // Listen for remote ICE candidates below
    roomRef.collection('calleeCandidates').onSnapshot(snapshot => {
      snapshot.docChanges().forEach(async change => {
        if (change.type === 'added') {
          let data = change.doc.data();
          // console.log(`Got new remote ICE candidate: ${JSON.stringify(data)}`);
          await pc.addIceCandidate(new RTCIceCandidate(data));
        }
      });
    });
    // Listen for remote ICE candidates above
    setCachedLocalPC(pc);
    // console.log(`Current room is ${roomRef.id} - You are the caller!`);
  };

  const joinCall = async roomId => {
    const mediaStream = await openUserMedia('item');
    const roomRef = db.collection('rooms').doc(`${roomId}`);
    const roomSnapshot = await roomRef.get();
    console.log('Got room:', roomSnapshot.exists);

    if (roomSnapshot.exists) {
      console.log('Create PeerConnection with configuration: ', configuration);
      setLocalStream(mediaStream);
      pc.addStream(mediaStream);
      const calleeCandidatesCollection = roomRef.collection('calleeCandidates');

      pc.onicecandidate = e => {
        if (e.candidate) {
          console.log('localPC icecandidate:', e.candidate.toJSON());
        }
      };

      pc.onaddstream = e => {
        setRemoteStream(e.stream);
        console.log('Got remote track:', e.streams[0]);
      };

      const offer = roomSnapshot.data().offer;
      console.log('Got offer:', offer);
      await pc.setRemoteDescription(new RTCSessionDescription(offer));
      const answer = await pc.createAnswer();
      console.log('Created answer:', answer);
      await pc.setLocalDescription(answer);

      const roomWithAnswer = {
        answer: {
          type: answer.type,
          sdp: answer.sdp,
        },
      };

      await roomRef.update(roomWithAnswer);

      roomRef.collection('callerCandidates').onSnapshot(snapshot => {
        snapshot.docChanges().forEach(async change => {
          if (change.type === 'added') {
            let data = change.doc.data();
            console.log(
              `Got new remote ICE candidate: ${JSON.stringify(data)}`,
            );
            await pc.addIceCandidate(new RTCIceCandidate(data));
          }
        });
      });
      // await roomRef.update(roomWithAnswer);

      // await pc.setLocalDescription(offer);

      // await pc.addIceCandidate(new RTCIceCandidate(data));
    }
    setCachedLocalPC(pc);

    // await pc.setRemoteDescription(new RTCSessionDescription(offer));
    // const answer = await pc.createAnswer();
    // console.log('Created answer:', answer);
    // await pc.setLocalDescription(answer);

    // const calleeCandidatesCollection = roomRef.collection('calleeCandidates');

    // await pc.addIceCandidate(new RTCIceCandidate(data));

    // pc.onaddstream = e => {
    //   setRemoteStream(e.stream);
    //   console.log('other stream', e.stream, e.stream.toURL());
    // };
  };

  const openAlert = () => {
    Alert.alert(
      'Calling',
      `Join call ? ${value}`,
      [
        {
          text: 'Cancel',
          onPress: () => console.log('Cancel Pressed'),
          style: 'No',
        },
        {text: 'Yes', onPress: () => joinCall(value)},
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
              {item.value} {item.roomId}
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
            {userList.length < 1 ? (
              <Text
                style={{
                  width: screenWidth,
                  fontSize: 30,
                  textAlign: 'center',
                  marginTop: 50,
                }}>
                No user online
              </Text>
            ) : (
              <FlatList
                data={userList}
                keyExtractor={item => item.id.toString()}
                renderItem={renderContact}
              />
            )}
            <Profile user={loginUser} />
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
          callRoomId={callRoomId}
        />
      )}
    </>
  );
};

export default ContactScreen;
