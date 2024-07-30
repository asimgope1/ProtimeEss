import * as React from 'react';
import {useDispatch, useSelector} from 'react-redux';
import {checkuserToken} from '../redux/actions/auth';
import HomeStack from './HomeStack';
import LoginStack from './LoginStack';
import App from './HomeStack';

export default Appnavigator = () => {
  const dispatch = useDispatch();
  dispatch(checkuserToken());
  const authStatus = useSelector(state => state.authStatus);
  return authStatus ? <HomeStack /> : <LoginStack />;
};
