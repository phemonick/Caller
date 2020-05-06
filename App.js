import React, {useState, useEffect} from 'react';
import ContactScreen from './components/ContactScreen';
import SplashScreen from './components/SplashScreen';

export default (App = () => {
  const [isLoading, updatedLoading] = useState(true);

  useEffect(() => {
    setTimeout(async () => updatedLoading(false), 1000);
  });

  const appStatus = isLoading ? <SplashScreen /> : <ContactScreen />;

  return appStatus;
});
