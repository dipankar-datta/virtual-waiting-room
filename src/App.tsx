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
          <div style={{backgroundColor: "black", height: "55px"}}>
            <div className='horizontal-center'>
              <h3 style={{color: "cornsilk", marginTop: "10px"}}>Virtual Waiting Room</h3>
            </div>
          </div>

          <div style={{padding: "20px 20px"}}>
            <Switch>
              <Route path="/" exact component={Home} />
              <Route path="/wait" component={WaitingRoom} />
            </Switch>
          </div>
      </div>
    );
  }
}
