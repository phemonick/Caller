'use strict';

import React, {Component} from 'react';
import {
  AppRegistry,
  StyleSheet,
  TouchableHighlight,
  ScrollView,
  ListView,
  Platform,
  Alert,
  BackHandler,
  StatusBar,
  View
} from 'react-native';
 

import io from 'socket.io-client';

const socket = null;

import {
  RTCPeerConnection,
  RTCMediaStream,
  RTCIceCandidate,
  RTCSessionDescription,
  RTCView,
  MediaStreamTrack,
  getUserMedia
} from 'react-native-webrtc';
 


const configuration = {
  "iceServers": [
    {
      "url": "stun:stun.l.google.com:19302"
    }
  ]
};

const pcPeers = {};
const localStream = {};

function isEmail(email) {StatusBar
  var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  return re.test(email.toLowerCase());
}

var Base64 = {
  _keyStr: "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=",
  encode: function (e) {
    var t = "";
    var n,
      r,
      i,
      s,
      o,
      u,
      a;
    var f = 0;
    e = Base64._utf8_encode(e);
    while (f < e.length) {
      n = e.charCodeAt(f++);
      r = e.charCodeAt(f++);
      i = e.charCodeAt(f++);
      s = n >> 2;
      o = (n & 3) << 4 | r >> 4;
      u = (r & 15) << 2 | i >> 6;
      a = i & 63;
      if (isNaN(r)) {
        u = a = 64
      } else if (isNaN(i)) {
        a = 64
      }
      t = t + this
        ._keyStr
        .charAt(s) + this
        ._keyStr
        .charAt(o) + this
        ._keyStr
        .charAt(u) + this
        ._keyStr
        .charAt(a)
    }
    return t
  },
  decode: function (e) {
    var t = "";
    var n,
      r,
      i;
    var s,
      o,
      u,
      a;
    var f = 0;
    e = e.replace(/[^A-Za-z0-9+/=]/g, "");
    while (f < e.length) {
      s = this
        ._keyStr
        .indexOf(e.charAt(f++));
      o = this
        ._keyStr
        .indexOf(e.charAt(f++));
      u = this
        ._keyStr
        .indexOf(e.charAt(f++));
      a = this
        ._keyStr
        .indexOf(e.charAt(f++));
      n = s << 2 | o >> 4;
      r = (o & 15) << 4 | u >> 2;
      i = (u & 3) << 6 | a;
      t = t + String.fromCharCode(n);
      if (u != 64) {
        t = t + String.fromCharCode(r)
      }
      if (a != 64) {
        t = t + String.fromCharCode(i)
      }
    }
    t = Base64._utf8_decode(t);
    return t
  },
  _utf8_encode: function (e) {
    e = e.replace(/rn/g, "n");
    var t = "";
    for (var n = 0; n < e.length; n++) {
      var r = e.charCodeAt(n);
      if (r < 128) {
        t += String.fromCharCode(r)
      } else if (r > 127 && r < 2048) {
        t += String.fromCharCode(r >> 6 | 192);
        t += String.fromCharCode(r & 63 | 128)
      } else {
        t += String.fromCharCode(r >> 12 | 224);
        t += String.fromCharCode(r >> 6 & 63 | 128);
        t += String.fromCharCode(r & 63 | 128)
      }
    }
    return t
  },
  _utf8_decode: function (e) {
    var t = "";
    var n = 0;
    var r = c1 = c2 = 0;
    while (n < e.length) {
      r = e.charCodeAt(n);
      if (r < 128) {
        t += String.fromCharCode(r);
        n++
      } else if (r > 191 && r < 224) {
        c2 = e.charCodeAt(n + 1);
        t += String.fromCharCode((r & 31) << 6 | c2 & 63);
        n += 2
      } else {
        c2 = e.charCodeAt(n + 1);
        c3 = e.charCodeAt(n + 2);
        t += String.fromCharCode((r & 15) << 12 | (c2 & 63) << 6 | c3 & 63);
        n += 3
      }
    }
    return t
  }
}
//determines camera and get its stream
function getLocalStream(isFront, callback) {

  let videoSourceId;
  // on android, you don't have to specify sourceId manually, just use facingMode
  // uncomment it if you want to specify
  if (Platform.OS === 'ios') {
    MediaStreamTrack.getSources(sourceInfos => {
      console.log("sourceInfos: ", sourceInfos);
      for (const i = 0; i < sourceInfos.length; i++) {
        const sourceInfo = sourceInfos[i];
        if (sourceInfo.kind == "video" && sourceInfo.facing == (isFront
          ? "front"
          : "back")) {
          videoSourceId = sourceInfo.id;
        }
      }
    });
  }
//   getting audio and video stream
// set video to false for audio only
  getUserMedia({
    audio: true, 
    video: {
      mandatory: {
        minWidth: 640,
        minHeight: 360,
        minFrameRate: 30
      },
      facingMode: (isFront
        ? "user"
        : "environment"),
      optional: (videoSourceId
        ? [
          {
            sourceId: videoSourceId
          }
        ]
        : [])
    }
  }, function (stream) {
    console.log('getUserMedia success', stream);
    callback(stream);
  }, logError);
}

function join(roomID) {
  socket
    .emit('join', roomID, function (socketIds) {
      console.log('join', socketIds);
      if(socketIds){
        this.props.navigation.navigate('Vid')
      }
      else{
        this.setState({
          error: 'connection failed'
        })
      }
      // navigate here
      // if(socketIds.length <= 1){
      //     this.props.navigation.navigate('Vid')
      // }
      for (const i in socketIds) {
        const socketId = socketIds[i];
      }
    });
}

// function
//if true, u init connection 
// creating information aboution
function createPC(socketId, isOffer) {
  const pc = new RTCPeerConnection(configuration);
  pcPeers[socketId] = pc;
  pc.onicecandidate = function (event) {
    console.log('onicecandidate', event.candidate);
    if (event.candidate) {
      socket.emit('exchange', {
        'to': socketId,
        'candidate': event.candidate
      });
    }
  };

  var createOffer = function () {
    pc
      .createOffer(function (desc) {
        console.log('createOffer', desc);
        //receiver local info
        pc.setLocalDescription(desc, function () {
          console.log('setLocalDescription', pc.localDescription);
          socket.emit('exchange', {
            'to': socketId,
            'sdp': pc.localDescription
          });
        }, logError);
      }, logError);
  }
// when peer is ready to share information to u
  pc.onnegotiationneeded = function () {
    console.log('onnegotiationneeded');
    if (isOffer) {
      createOffer();
    }
  }
//   check connection state
// u can add failed block
  pc.oniceconnectionstatechange = function (event) {
    console.log('oniceconnectionstatechange', event.target.iceConnectionState);
    if (event.target.iceConnectionState === 'completed') {
      setTimeout(() => {
        getStats();
      }, 1000);
    }
    if (event.target.iceConnectionState === 'connected') {
      createDataChannel();
    }
  };
  pc.onsignalingstatechange = function (event) {
    console.log('onsignalingstatechange', event.target.signalingState);
  };
  //receiving user streams
  pc.onaddstream = function (event) {
    console.log('onaddstream', event.stream);
    container.setState({info: 'One user join!'});
    //contains videostrem of people there
    const remoteList = container.state.remoteList;
    remoteList[socketId] = event
      .stream
      .toURL();
    container.setState({remoteList: remoteList});
  };
//   listenig to when user disconnect
  pc.onremovestream = function (event) {
    console.log('onremovestream', event.stream);
  };
  //adding stream to ui
  pc.addStream(localStream);
  // chat channel
  function createDataChannel() {
    if (pc.textDataChannel) {
      return;
    }
    const dataChannel = pc.createDataChannel("text");

    dataChannel.onerror = function (error) {
      console.log("dataChannel.onerror", error);
    };

    dataChannel.onmessage = function (event) {
      console.log("dataChannel.onmessage:", event.data);
      container.receiveTextData({user: socketId, message: event.data});
    };

    dataChannel.onopen = function () {
      console.log('dataChannel.onopen');
      container.setState({textRoomConnected: true});
    };

    dataChannel.onclose = function () {
      console.log("dataChannel.onclose");
    };

    pc.textDataChannel = dataChannel;
  }
  return pc;
}

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
//when u leave 
function leave(socketId) {
  console.log('leave', socketId);
  const pc = pcPeers[socketId];
  const viewIndex = pc.viewIndex;
  pc.close();
  delete pcPeers[socketId];

  const remoteList = container.state.remoteList;
  delete remoteList[socketId]
  container.setState({remoteList: remoteList});
  container.setState({info: 'One user left!'});
}

function logError(error) {
  console.log("logError", error);
}

function mapHash(hash, func) {
  const array = [];
  for (const key in hash) {
    const obj = hash[key];
    array.push(func(obj, key));
  }
  return array;
}
// connection stat
function getStats() {
  const pc = pcPeers[Object.keys(pcPeers)[0]];
  if (pc.getRemoteStreams()[0] && pc.getRemoteStreams()[0].getAudioTracks()[0]) {
    const track = pc
      .getRemoteStreams()[0]
      .getAudioTracks()[0];
    console.log('track', track);
    pc.getStats(track, function (report) {
      console.log('getStats report', report);
    }, logError);
  }
}

const container = {};
// const RCTWebRTCDemo = React.createClass({
export default class live extends Component {

  constructor(props) {
    super(props)
    this.ds = new ListView.DataSource({
      rowHasChanged: (r1, r2) => true
    }); 
    let roomKey = Base64.encode('spanish');
    this.state = {
      connected: false,
      error: '',
      info: 'Connecting',
      status: 'init', 
      roomID: roomKey,
      isFront: true,
      selfViewSrc: null,
      remoteList: {},
      textRoomConnected: false,
      textRoomData: [],
      textRoomValue: ''
    }

    // let fireScratch = this.props.dbHandle
    // this.callz = fireScratch
    //   .database()
    //   .ref('/callz');
    // = io.connect('https://react-native-webrtc.herokuapp.com', { transports:
    // ['websocket'] });
    this.componentDidMount = this
      .componentDidMount
      .bind(this);
    // this._press = this
    //   ._press
    //   .bind(this);
    this._switchVideoType = this
      ._switchVideoType
      .bind(this);
    this.receiveTextData = this
      .receiveTextData
      .bind(this);
    this._textRoomPress = this
      ._textRoomPress
      .bind(this);
    this._renderTextRoom = this
      ._renderTextRoom
      .bind(this);

    container = this;
  //  socket = io.connect('http://127.0.0.1:4443', {transports: ['websocket']});
    socket = io.connect('https://react-native-webrtc.herokpp.com', {transports: ['websocket']})
    socket.on('exchange', function (data) {
      exchange(data);
    });

    socket.on('leave', function (socketId) {
      leave(socketId);
    });

    socket.on('connect', function (data) {
      console.log('connect');
      join(roomKey);
      // navigate here
      getLocalStream(true, function (stream) {
        localStream = stream;
        container.setState({
          selfViewSrc: stream.toURL()
        });
        container.setState({
          status: 'ready',
          info: 'Connecting to server...'
        });
        
      });
    });
    // this.getUserMedia();
  }

  componentDidMount() {}

//   _press() {
//     this
//       .refs
//       .roomID
//       .blur();
//     this.setState({status: 'connect', info: 'Connecting'});
//     join(this.state.roomID);
//   }
// switch camera
  _switchVideoType() {
    const isFront = !this.state.isFront;
    this.setState({isFront});
    getLocalStream(isFront, function (stream) {
      if (localStream) {
        for (const id in pcPeers) {
          const pc = pcPeers[id];
          pc && pc.removeStream(localStream);
        }
        localStream.release();
      }
      localStream = stream;
      container.setState({
        selfViewSrc: stream.toURL()
      });

      for (const id in pcPeers) {
        const pc = pcPeers[id];
        pc && pc.addStream(localStream);
      }
    });
  }
// receive data through channel
  receiveTextData(data) {
    const textRoomData = this
      .state
      .textRoomData
      .slice();
    textRoomData.push(data);
    this.setState({textRoomData, textRoomValue: ''});
  }

  _textRoomPress() {
    if (!this.state.textRoomValue) {
      return
    }
    const textRoomData = this
      .state
      .textRoomData
      .slice();
    textRoomData.push({user: 'Me', message: this.state.textRoomValue});
    for (const key in pcPeers) {
      const pc = pcPeers[key];
      pc
        .textDataChannel
        .send(this.state.textRoomValue);
    }
    this.setState({textRoomData, textRoomValue: ''});
  }

  _renderTextRoom() {
    return (
      <View style={styles.listViewContainer}>
        <ListView
          dataSource={this
          .ds
          .cloneWithRows(this.state.textRoomData)}
          renderRow={rowData => <Text>{`${rowData.user}: ${rowData.message}`}</Text>}/>
        <TextInput
          style={{
          width: 200,
          height: 30,
          borderColor: 'gray',
          borderWidth: 1
        }}
          onChangeText={value => this.setState({textRoomValue: value})}
          value={this.state.textRoomValue}/>
        <TouchableHighlight onPress={this._textRoomPress}>
          <Text>Send</Text>
        </TouchableHighlight>
      </View>
    );
  }

  render() {
    return (
      <View style={styles.wrapper}>
        <StatusBar
            backgroundColor="#0c3959"
            barStyle="light-content"
        />
        {/* <Image style={{}} source={require('./assets/bg.png')}/> */}
        <ScrollView
          style={{
            flex: 1
          }}
        //   it makes first absolute
          stickyHeaderIndices={[0]}
          contentContainerStyle={styles.contentWrapper}>
          <View style={styles.content} styleName="vertical">
          <RTCView streamURL={this.state.selfViewSrc} style={styles.selfView}/>
          {
            mapHash(this.state.remoteList, function(remote, index) {
              return <RTCView key={index} streamURL={remote} style={styles.remoteView}/>
            })
          }
          </View>
        </ScrollView>
      </View>
    );
  }
}

const styles = {
  selfView: {
    width: 200,
    height: 150
  },
  remoteView: {
    width: 200,
    height: 150
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: '#F5FCFF'
  },
  welcome: {
    fontSize: 20,
    textAlign: 'center',
    margin: 10
  },
  listViewContainer: {
    height: 150
  },
  wrapper: {
    backgroundColor: '#34495e',
    position: 'absolute'
  },
  action_container: {
    // width: '100%'
    padding: 10,
    marginTop: 12
  },
  splashText: {
    color: '#ffffff',
    padding: 10,
    marginBottom: 10
  },
  promptText: {
    color: '#ffffff',
    marginBottom: 15
  },
  singleRow: {
    padding: 15
  },
  subtitle: {
    fontSize: 12,
    fontWeight: '200',
    color: '#fefefe',
    padding: 12
  },
  title: {
    fontSize: 40,
    color: '#ffffff'
  },
  splashSubTitle: {
    paddingBottom: 20
  },
  live: {
    marginBottom: 20,
    backgroundColor: '#5FA9DD'
  },
  electronic: {
    marginBottom: 20,
    backgroundColor: '#3AB451'
  },
  header: {
    width: '100%',
    flex: 1,
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: 19,
    backgroundColor: '#0D3B5B',
    borderBottomColor: 'rgba(0,0,0,0.1)',
    borderBottomWidth: 4
  },
  eql: {
    height: 110,
    width: 250
  },
  logo: {
    height: 30,
    width: 100,
    flex: 1,
    padding: 10,
    marginLeft: 12
  },
  headerText: {
    color: "#ffffff",
    flex: 3
  },
  whiteText: {
    color: "#ffffff",
    // flex: 9
  },
  invisible: {
    color: "rgba(0,0,0,0)",
    // flex: 9
  },
  content: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 12,
    paddingBottom: 100
  },
  action_btn: {
    height: 40,
    width: 40,
    margin: 6
  },
  call_icon: {
    height: 60,
    margin: 30,
    width: 60
  },
  btn_holder: {
    marginTop: 50
  }, 
};