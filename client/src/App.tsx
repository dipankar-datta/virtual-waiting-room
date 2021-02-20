import React from 'react';
import logo from './logo.svg';
import './App.css';
import {Switch, Route} from 'react-router-dom';
import Home from './components/home';
import WaitingRoom from './components/waiting-room';

export default class App extends React.Component<any, any> {
  
  render() {
    return (
      <div >
          <div className='horizontal-center'><h2>Virtual Waiting Room</h2></div>
          <Switch>
            <Route path="/" exact component={Home} />
            <Route path="/wait" component={WaitingRoom} />
          </Switch>
      </div>
    );
  }
}
