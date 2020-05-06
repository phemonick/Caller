window.addEventListener = x => x

import firebase from 'firebase';
import 'firebase/firestore';

const firebaseConfig = firebase.initializeApp({
  apiKey: 'AIzaSyAMzZLqg3Q8DGHWy5ZwA6L9VKpAiMbH500',
  authDomain: 'callapp-3a75e.firebaseapp.com',
  databaseURL: 'https://callapp-3a75e.firebaseio.com',
  projectId: 'callapp-3a75e',
  storageBucket: 'callapp-3a75e.appspot.com',
  messagingSenderId: '410301732064',
  appId: '1:410301732064:web:e510dd4de5106710c22c85',
  measurementId: 'G-5EQPVYV080',
});

const db = firebaseConfig.firestore();

export default db;
