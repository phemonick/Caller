import React from 'react';
import {View, Text, Image, Dimensions} from 'react-native';

const Device_Width = Dimensions.get('window').width;

const styles = {
  container: {
    marginTop: 48,
    flex: 1,
    width: Device_Width,
  },
  pic: {
    width: 300,
    height: 300,
    alignSelf: 'center',
    marginBottom: 20,
  },
  headerStyle: {
    fontSize: 20,
    textAlign: 'center',
    fontWeight: '100',
  },
  elementsContainer: {
    backgroundColor: '#ecf5fd',
  },
};

const Profile = () => {
  return (
    <View style={styles.container}>
      <Image
        source={{uri: 'https://bootdey.com/img/Content/avatar/avatar6.png'}}
        style={styles.pic}
      />
      <Text style={styles.headerStyle}>Joe Doe</Text>
      <Text style={styles.headerStyle}>English</Text>
      <Text style={styles.headerStyle}>ID: lklkjdljfldjfdf</Text>
    </View>
  );
};

export default Profile;
