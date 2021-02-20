import React from 'react';

import '../App.css';

interface WaitingRoomState {
  recheckPeriod: number;
  redirectUrl?: string;
  redirectHostname?: string;
  recheckStatus?: string;
  recheckMessages: string[];
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
    const statusMessage = 'Last checked at: ' + (new Date().toLocaleTimeString()) + ' - Status: ' + status;
    recheckMessages.push(statusMessage);
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
      <div >
          <h2>Your requested application is currently facing excessive load.</h2>
          <h2>Your requested application URL: {this.state.redirectUrl}</h2>          
          <div className='horizontal-center'>
            <div className='horizontal-center'>
            <button  style={{fontSize: "16px"}} onClick={this.redirectBack} >Go Back</button> &nbsp;&nbsp;

            {
              this.state.rechecking ? 
              <button  style={{fontSize: "16px"}} onClick={this.stopRecheck} >Stop Recheck</button>
              :
              <button  style={{fontSize: "16px"}} onClick={this.startRecheck} >Start Recheck</button>
            }
            
            </div>
            
            <div className='horizontal-center'>
              <label>Just for demonstration</label>
            </div>            
          </div>       
          {this.state.rechecking ? 
            <h3>Next Application status check in {this.state.recheckPeriod} seconds</h3> : ''
          }  
          
          {this.state.recheckMessages.length > 0 ? 
            (<table>
              <tbody>
                {this.state.recheckMessages.slice().reverse().map((message, index) => 
                <tr>{(this.state.recheckMessages.length - index)} - {message}</tr>)}
              </tbody>
            </table>
            ) : ''
          } 
      </div>
    );
  }
}
