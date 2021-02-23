import React from 'react';

import '../App.css';

interface WaitingRoomState {
  recheckPeriod: number;
  redirectUrl?: string;
  redirectHostname?: string;
  recheckStatus?: string;
  recheckMessages: any[];
  rechecking: boolean;
}

export default class WaitingRoom extends React.Component<any, WaitingRoomState> {

  private readonly STRESS_CHECK_PATH = '/api/can_serve';

  private readonly RECHECK_PERIOD = 5;

  private intervalRef : any;

  constructor(props: any) {
    super(props);
    this.state = {
      recheckPeriod: this.RECHECK_PERIOD,
      recheckMessages: [],
      rechecking: true
    };
  }  

  redirectBack = () => {
    if (this.state.redirectUrl) {
      clearInterval(this.intervalRef);
      window.location.replace(this.state.redirectUrl);
    }    
  }

  componentDidMount() {
    const query = new URLSearchParams(this.props.location.search);
    let redirectInfo: any = query.get('redirectInfo');
    if (redirectInfo) {
      redirectInfo = atob(redirectInfo);
      redirectInfo = JSON.parse(redirectInfo);
    }
    const redirectUrl =  redirectInfo['redirectUrl'];
    const redirectHostname = new URL(redirectUrl).origin
    this.setState({...this.state, redirectUrl, redirectHostname}) ;
    this.startRecheck();
  }

  checkApplicationStressStatus = () => {

    if (this.state.recheckPeriod > 0) {
      this.setState({...this.state, recheckPeriod: (this.state.recheckPeriod - 1)})
    } else if (this.state.recheckPeriod === 0) {
      
      const url = this.state.redirectHostname + this.STRESS_CHECK_PATH;
      fetch(url)
      .then((res: Response) => {
        res.json().then((status: boolean) => {
          if (status) {           
            clearInterval(this.intervalRef);
            this.redirectBack();
          } else {
            this.setErrorMessage('BUSY');
          }
        })
      }).catch(err => {
        this.setErrorMessage('FAILED');
      });
    } 
  }

  setErrorMessage = (status: 'SUCCESS' | 'BUSY' | 'FAILED') => {
    const recheckMessages = Object.assign([], this.state.recheckMessages);
    const messagePrefix =  (recheckMessages.length + 1) 
                          + ' - Last checked at: ' 
                          + (new Date().toLocaleTimeString()) 
                          + ' - Status: ' + status;
    let coloredStatus;
    switch(status) {
      case 'FAILED' : coloredStatus = <div className="alert alert-danger" role="alert">{messagePrefix}</div>; break;
      case 'BUSY' : coloredStatus = <div className="alert alert-info" role="alert">{messagePrefix}</div>; break;
      case 'SUCCESS' : coloredStatus = <div className="alert alert-success" role="alert">{messagePrefix}</div>; break;
    }
    const statusMessage = + coloredStatus;
    recheckMessages.push(coloredStatus);
    this.setState({...this.state, recheckMessages, recheckPeriod: this.RECHECK_PERIOD})
  }

  stopRecheck = () => {
    clearInterval(this.intervalRef);
    this.setState({...this.state, rechecking: false});
  }

  startRecheck = () => {
    this.intervalRef = setInterval(this.checkApplicationStressStatus, 1000);
    this.setState({...this.state, rechecking: true, recheckPeriod: this.RECHECK_PERIOD});
  }
  
  render() {    
  
    return (
      <div>
          <div>
            <h3>Resource Busy</h3>
            <p>Your requested application is currently busy. Once the requested application is available, you will be redirected back.</p>
          </div>
          <h6>Requested application URL: {this.state.redirectUrl}</h6>          
          <div className='horizontal-center' style={{padding: "20px"}}>
            <div className='horizontal-center'>
            <button type="button" className="btn btn-danger" onClick={this.redirectBack} >Go Back</button> &nbsp;&nbsp;

            {
              this.state.rechecking ? 
              <button  type="button" className="btn btn-danger" onClick={this.stopRecheck} >Stop Recheck</button>
              :
              <button  type="button" className="btn btn-danger" onClick={this.startRecheck} >Start Recheck</button>
            }
            
            </div>
            
            <div className='horizontal-center'>
              <h6>Only for demonstration</h6>
            </div>            
          </div>       
          {this.state.rechecking ? 
            <h6>Next Application status check in - {this.state.recheckPeriod} seconds</h6> : ''
          }  
          
          {this.state.recheckMessages.length > 0 ? 
            (
              <div style={{marginTop: "20px"}}>
                <table>
                <tbody>
                  {this.state.recheckMessages.slice().reverse().map((message, index) => 
                  <tr><td>{message} </td></tr>)}
                </tbody>
                </table>              
              </div>
            ) : ''            
          } 
      </div>
    );
  }
}
