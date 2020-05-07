import React, {useState, useEffect} from 'react';
import {Text, View, Image, StatusBar, TouchableOpacity} from 'react-native';

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
  const endCall = () => props.updateCalling(false);
  console.log(props, 'props')
  return (
    <>
      <StatusBar barStyle="light-content" backgroundColor="#22222e" />
      <View style={styles.container}>
        <View style={[{flex: 1}, styles.elementsContainer]}>
          <View style={{flex: 1, backgroundColor: '#1b1b25', padding: 10}}>
            <Text style={styles.talking}>Talking with: {props.item.name}</Text>
            <Text style={styles.details}>ID:{props.item.user.roomId}</Text>
          </View>
          <View style={{flex: 5}}>
            <Image
              source={{
                uri:
                  'https://res.cloudinary.com/skybound/image/upload/v1588437379/eventmanager/Calling-PNG-Photos.png',
              }}
              style={styles.pic}
            />
            <Text
              style={{
                height: 40,
                borderColor: 'gray',
                color: 'black',
                borderWidth: 1,
              }}>
              {props.callRoomId}
            </Text>
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
