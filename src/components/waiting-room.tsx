import React from 'react';

import '../App.css';

interface WaitingRoomState {
  recheckPeriod: number;
  redirectUrl?: string;
  redirectHostname?: string;
  recheckStatus?: string;
  recheckMessages: any[];
  rechecking: 'stop' | 'start' | 'checking';
  resourceStatus?: 'busy' | 'unavailable'
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
      rechecking: 'start',
      resourceStatus: 'busy'
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
    const resourceStatus =  redirectInfo['appCheckStatus'];
    const redirectHostname = new URL(redirectUrl).origin;
    setTimeout(() => {
      this.setState({...this.state, redirectUrl, resourceStatus, redirectHostname}) ;
      this.startRecheck();
    }, 200);
  }

  checkApplicationStressStatus = () => {

    if (this.state.recheckPeriod > 0) {
      this.setState({...this.state, recheckPeriod: (this.state.recheckPeriod - 1)})
    } else if (this.state.recheckPeriod === 0 && this.state.rechecking === 'start') {

      this.setState({...this.state, rechecking: 'checking'});
      const url = this.state.redirectHostname + this.STRESS_CHECK_PATH;

      fetch(url)
      .then((res: Response) => {
        if (res.ok) {
          res.json().then((status: boolean) => {
            if (status) {           
              clearInterval(this.intervalRef);
              this.redirectBack();
            } else {
              this.setState({...this.state, rechecking: 'start'});
              this.setErrorMessage('busy');
            }
          })
        } else {
          this.setState({...this.state, rechecking: 'start'});
          this.setErrorMessage('failed');
        }        
      }).catch(err => {
        this.setState({...this.state, rechecking: 'start'});
        this.setErrorMessage('failed');
      });      
    } 
  }

  setErrorMessage = (status: 'success' | 'busy' | 'failed') => {
    const recheckMessages = Object.assign([], this.state.recheckMessages);
    const messagePrefix =  (recheckMessages.length + 1) 
                          + ' - Last checked at: ' 
                          + (new Date().toLocaleTimeString()) 
                          + ' - Status: ' + status.toUpperCase();
    let checkStatusClass;    
    switch(status) {
      case 'failed' : checkStatusClass = "alert alert-danger"; break;
      case 'busy' : checkStatusClass = "alert alert-info"; break;
      case 'success' : checkStatusClass = "alert alert-success"; break;
    }
    const statusMessage = <div className={checkStatusClass} role="alert">{messagePrefix}</div>;
    recheckMessages.push(statusMessage);
    this.setState({...this.state, recheckMessages, recheckPeriod: this.RECHECK_PERIOD})
  }

  stopRecheck = () => {
    clearInterval(this.intervalRef);
    this.setState({...this.state, rechecking: 'stop'});
  }

  startRecheck = () => {
    this.intervalRef = setInterval(this.checkApplicationStressStatus, 1000);
    this.setState({...this.state, rechecking: 'start', recheckPeriod: this.RECHECK_PERIOD});
  }

  clearLog = () => {
    this.setState({...this.state, recheckMessages: []})
  }
  
  render() {    
  
    return (
      <div>
          <div>
            <h3>Resource {this.state.resourceStatus === 'unavailable' ? 'Unavailable' : 'Busy'}</h3>
            <p>Your requested application is 
              currently {this.state.resourceStatus}. Once the requested application 
              is available, you will be redirected back.
            </p>
          </div>
          <h6>Requested application URL: {this.state.redirectUrl}</h6>          
          <div className='horizontal-center' style={{padding: "20px"}}>
            <div className='horizontal-center'>
            <button 
              type="button" 
              className="btn btn-danger" 
              onClick={this.redirectBack} >Go Back</button> &nbsp;&nbsp;

            {
              ['start', 'checking'].indexOf(this.state.rechecking) >= 0 ? 
              <button  
                type="button" 
                className="btn btn-danger" 
                onClick={this.stopRecheck} >Stop Recheck</button>
              :
              <button  
                type="button" 
                className="btn btn-danger" 
                onClick={this.startRecheck} >Start Recheck</button>
            }
            &nbsp;&nbsp;            
            <button 
              type="button" 
              className="btn btn-danger" 
              onClick={this.clearLog} >Clear Log</button>
            
            </div>
            
            <div className='horizontal-center'>
              <h6>Only for demonstration</h6>
            </div>            
          </div>       
          {this.state.rechecking === 'start' ? 
            <h6>Next Application status check in - {this.state.recheckPeriod} seconds</h6> : ''
          } 
          {this.state.rechecking === 'checking' ? 
            <h6>Checking application</h6> : ''
          }  
          
          {this.state.recheckMessages.length > 0 ? 
            (
              <div style={{marginTop: "20px"}}>
                <table>
                <tbody>
                  {this.state.recheckMessages.slice().reverse().map((message) => 
                  <tr><td>{message}</td></tr>)}
                </tbody>
                </table>              
              </div>
            ) : ''            
          } 
      </div>
    );
  }
}
