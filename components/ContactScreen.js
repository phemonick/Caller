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

// forceNode: true,

const SocketServer = 'http://10.0.2.2:4443';

const connectionConfig = {
  jsonp: false,
  reconnection: true,
  reconnectionDelay: 100,
  reconnectionAttempts: 5000,
  transports: ['websocket'],
  secure: true,
  rejectUnauthorized: false,
};

const ContactScreen = () => {
  const [socket] = useState(() => io(SocketServer, connectionConfig));
  const [isCall, updateCalling] = useState(false);
  const [user, getUser] = useState('');
  const [isCaller, caller] = useState(false);
  const [acceptCall, onAcceptCall] = useState();
  const [localStream, setLocalStream] = useState();
  const [remoteStream, setRemoteStream] = useState();
  const [cachedLocalPC, setCachedLocalPC] = useState();
  const [cachedRemotePC, setCachedRemotePC] = useState();
  const [callRoomId, setCallRoomId] = useState();
  const [value, onChangeText] = useState('');
  const [busy, isBusy] = useState(false);
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
    socket.on('connect', () => {
      console.log('connect');
    });
  });

  socket.emit('login', loginUser);

  socket.on('roommessage', function(message) {
    var data = message;

    switch (data.type) {
      case 'login':
        console.log('New user : ' + data);
        updateUser([...userList, data.data])
        break;
      case 'disconnect':
        console.log('User disconnected : ' + data.username);
        break;
      default:
        break;
    }
  });

  socket.on('updateUserList', users => {
    const addUser = users.filter(user => user.roomId !== loginUser.roomId);
    updateUser([...userList, ...addUser]);
  });

  socket.on('removeUser', data => {
    const removeUser = data.filter(user => user.roomId !== loginUser.roomId);
    updateUser([...removeUser]);
  });

  const openUserMedia = async item => {
    getUser(item);
    updateCalling(true);
    try {
      const stream = await mediaDevices.getUserMedia({audio: true});
      caller(true);
      console.log(stream, "Stream")
      return stream;

    } catch (error) {
      updateCalling(false);
      caller(true);
      return error;
    }
  };

  function exchange(data) {
    const fromId = data.from;
    let pc;
  //   for reconnection
    if (fromId in pcPeers) {
      pc = pcPeers[fromId];
    } else {
      pc = createPC(fromId, false);
    }
  
    if (data.sdp) {
      console.log('exchange sdp', data);
      pc.setRemoteDescription(new RTCSessionDescription(data.sdp), function () {
        if (pc.remoteDescription.type == "offer")
          pc.createAnswer(function (desc) {
            console.log('createAnswer', desc);
            pc.setLocalDescription(desc, function () {
              console.log('setLocalDescription', pc.localDescription);
              socket.emit('exchange', {
                'to': fromId,
                'sdp': pc.localDescription
              });
            }, logError);
          }, logError);
        }
      , logError);
    } else {
      console.log('exchange candidate', data);
      pc.addIceCandidate(new RTCIceCandidate(data.candidate));
    }
  }

  const startCall = async item => {
    const mediaStream = await openUserMedia(item);
    setLocalStream(mediaStream);
    pc.onicecandidate = e => {
      if (e.candidate) {
        // socket.emit('exchange', {
        //   to: item.roomOId,
        //   candidate: e.candidate,
        // });
        new RTCIceCandidate(e.candidate);
        // remotePC.addIceCandidate(e.candidate);
      }
    };

    pc.onaddstream = e => {
      setRemoteStream(e.stream.toURL());
      console.log('other stream', e.stream.toURL());
    };

    pc.addStream(mediaStream);

    const offer = await pc.createOffer();
    await pc.setLocalDescription(offer);
    socket.emit('call_user', {
      type: 'call_user',
      name: item.name,
      callername: item,
      roomId: item.roomId,
      offer,
    });
    setCachedLocalPC(pc);
  };

  socket.on('answer', async data => {
    console.log(acceptCall, 'acceptCall');
    if (busy) {
      socket.emit('call_busy', {
        type: 'call_busy',
        callername: data.name,
        from: data.name,
      });
    } else {
      await AsyncAlert(data);
    }
  });

  const AsyncAlert = data =>
    new Promise(resolve => {
      Alert.alert(
        'Calling',
        `${data.name} is calling you`,
        [
          {
            text: 'Cancel',
            onPress: () => acceptCaller(false, data, resolve),
            style: 'Yes',
          },
          {
            text: 'Yes',
            onPress: () => acceptCaller(true, data, resolve),
            style: 'Yes',
          },
        ],
        {cancelable: false},
      );
    });

  const acceptCaller = (value, data, resolve) => {
    if (value) {
      console.log('call accepted');
      socket.send('call_accepted', {
        type: 'call_accepted',
        callername: data.name,
        from: data.name,
        roomWithOffer: data.roomWithOffer,
      });
      joinCall(data);
      isBusy(true);
    } else {
      console.log('call rejected');
      socket.send('call_rejected', {
        type: 'call_rejected',
        callername: data.name,
        from: data.name,
      });
      isBusy(false);
    }
    return resolve('YES');
  };

  socket.on('call_response', async data => {
    console.log(data, ">>>>>>>>>><<<<<<<<");
    switch (data.response) {
      case 'accepted':
        console.log('Call accepted by :' + data.responsefrom);
        updateCalling(true);
        pc.setRemoteDescription(new RTCSessionDescription(data.answer.sdp));
        pc.addIceCandidate(new RTCIceCandidate(data.candidate));
        pc.onaddstream = e => {
          setRemoteStream(e.stream[0]);
        }
        isBusy(true);
        break;
      case 'rejected':
        console.log('Call rejected by :' + data.responsefrom);
        isBusy(false);
        rejectCall(data.responsefrom);
        updateCalling(false);
        break;
      case 'busy':
        console.log(data.responsefrom + ' call busy');
        isBusy(false);
        callerBusy(data.responsefrom);
        updateCalling(true);
        break;
      default:
        console.log(data.name + ' is offline');
        await offline(data.name);
        updateCalling(false);
        isBusy(false);
    }
  });

  const joinCall = async data => {
    try {
      const mediaStream = await openUserMedia(data);
      setLocalStream(mediaStream);
      await pc.setRemoteDescription(new RTCSessionDescription(data.offer));
      let answer = await pc.createAnswer();
      await pc.setLocalDescription(new RTCSessionDescription(answer));

      socket.emit('call_accepted', {
        type: 'call_accepted',
        callername: data.name,
        from: data.name,
        answer,
      });
      pc.onaddstream = e => {
        setRemoteStream(e.stream);
        console.log('Got remote track:', e.streams);
      };
      // const mediaStream = await openUserMedia(data);
      // setLocalStream(mediaStream);
      // console.log("Got here", mediaStream, data)
      // pc.setRemoteDescription(new RTCSessionDescription(data.offer));
      // const answer = await pc.createAnswer();
      // await pc.setLocalDescription(answer);
      // // await pc.setRemoteDescription(new RTCSessionDescription(data.offer));
      // await pc.addIceCandidate(new RTCIceCandidate(data));
      // pc.addStream(mediaStream);
      // pc.onicecandidate = e => {
      //   if (e.candidate) {
      //     console.log('localPC icecandidate:', e.candidate.toJSON());
      //   }
      // };
      // pc.onaddstream = e => {
      //   setRemoteStream(e.stream);
      //   console.log('Got remote track:', e.streams[0]);
      // };
  
      setCachedLocalPC(pc);
    } catch(error) {
      console.log(error)
    }
  };

  const updateCaller = (myValue, resolve) => {
    onAcceptCall(myValue);
    return resolve('YES');
  };

  const offline = data =>
    new Promise(resolve => {
      Alert.alert(
        'Offline',
        `${data} is offline`,
        [
          {
            text: 'Ok',
            onPress: () => updateCaller(false, resolve),
            style: 'Yes',
          },
        ],
        {cancelable: true},
      );
    });

  const rejectCall = data => {
    Alert.alert(
      'Sorry',
      `${data} rejected your call`,
      [{text: 'Ok', onPress: () => updateCalling(false)}],
      {cancelable: true},
    );
  };

  const callerBusy = data => {
    Alert.alert(
      'Sorry',
      `${data} is busy on another call`,
      [{text: 'Ok', onPress: () => updateCalling(false)}],
      {cancelable: true},
    );
  };

  const renderContact = ({item}) => {
    console.log(isCall, "ISCALL");
    console.log(loginUser, "LOGIN USER")
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
                Loading users online
              </Text>
            ) : (
              <FlatList
                data={userList}
                keyExtractor={item => item.roomId.toString()}
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
      {/* {contactHeader()} */}
    </>
  );
};

export default ContactScreen;
