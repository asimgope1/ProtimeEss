import * as React from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import Splash from '../Pages/Splash/Splash';
import Login from '../Pages/Login/Login';
import Database from '../utils/db';
import Home from '../Pages/Home/Home';
import App, {HomeStack} from './HomeStack';
import check from '../Pages/checkAuth/Check';
import Check from '../Pages/checkAuth/Check';

const Stack = createNativeStackNavigator();
export default LoginStack = () => {
  return (
    <Stack.Navigator initialRouteName="Splash">
      <Stack.Screen
        options={{headerShown: false}}
        name="Splash"
        component={Splash}
      />
      <Stack.Screen
        options={{headerShown: false}}
        name="Login"
        component={Login}
      />
      <Stack.Screen
        options={{headerShown: false}}
        name="Database"
        component={Database}
      />
      <Stack.Screen
        options={{headerShown: false}}
        name="Home"
        component={App}
      />
      <Stack.Screen
        options={{headerShown: false}}
        name="Check"
        component={Check}
      />
    </Stack.Navigator>
  );
};
