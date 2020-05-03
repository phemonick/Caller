import React, {useState, useEffect} from 'react';
import {Platform} from 'react-native';
import {PERMISSIONS, request} from 'react-native-permissions';
import ContactScreen from './components/ContactScreen';
import SplashScreen from './components/SplashScreen';

const calls = [
  {
    id: 1,
    name: 'Mark Doe',
    value: 'Pin',
    pin: 'lklkjdljfldjfdf',
    image: 'https://bootdey.com/img/Content/avatar/avatar7.png',
  },
  {
    id: 2,
    name: 'Clark Man',
    value: 'Pin',
    pin: 'lklkjdljfldjfdf',
    image: 'https://bootdey.com/img/Content/avatar/avatar6.png',
  },
  {
    id: 3,
    name: 'Jaden Boor',
    value: 'Pin',
    pin: 'lklkjdljfldjfdf',
    image: 'https://bootdey.com/img/Content/avatar/avatar5.png',
  },
  {
    id: 4,
    name: 'Srick Tree',
    value: 'Pin',
    pin: 'lklkjdljfldjfdf',
    image: 'https://bootdey.com/img/Content/avatar/avatar4.png',
  },
  {
    id: 5,
    name: 'John Doe',
    value: 'Pin',
    pin: 'lklkjdljfldjfdf',
    image: 'https://bootdey.com/img/Content/avatar/avatar3.png',
  },
  {
    id: 6,
    name: 'John Doe',
    value: 'Pin',
    pin: 'lklkjdljfldjfdf',
    image: 'https://bootdey.com/img/Content/avatar/avatar2.png',
  },
  {
    id: 8,
    name: 'John Doe',
    value: 'Pin',
    pin: 'lklkjdljfldjfdf',
    image: 'https://bootdey.com/img/Content/avatar/avatar1.png',
  },
  {
    id: 9,
    name: 'John Doe',
    value: 'Pin',
    pin: 'lklkjdljfldjfdf',
    image: 'https://bootdey.com/img/Content/avatar/avatar4.png',
  },
  {
    id: 10,
    name: 'John Doe',
    value: 'Pin',
    pin: 'lklkjdljfldjfdf',
    image: 'https://bootdey.com/img/Content/avatar/avatar7.png',
  },
  {
    id: 11,
    name: 'John Doe',
    value: 'Pin',
    pin: 'lklkjdljfldjfdf',
    image: 'https://bootdey.com/img/Content/avatar/avatar1.png',
  },
];

export default (App = () => {
  const [isLoading, updatedLoading] = useState(true);

  useEffect(() => {
    request(
      Platform.select({
        android: PERMISSIONS.ANDROID.MICROPHONE,
        ios: PERMISSIONS.IOS.MICROPHONE,
      }),
    );
  });

  useEffect(() => {
    setTimeout(async () => updatedLoading(false), 1000);
  });

  const appStatus = isLoading ? (
    <SplashScreen />
  ) : (
    <ContactScreen calls={calls} />
  );

  return appStatus;
});
