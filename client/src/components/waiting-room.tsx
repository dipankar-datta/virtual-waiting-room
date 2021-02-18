import React from 'react';

export default class WaitingRoom extends React.Component<any, any> {

  redirectBack() {
    window.location.replace("https://www.w3schools.com");
  }
  
  render() {
    const query = new URLSearchParams(this.props.location.search);
    let redirectInfo: any = query.get('redirectInfo');
    if (redirectInfo) {
      redirectInfo = JSON.parse(redirectInfo);
    }
    let redirectUrl =  redirectInfo['redirectUrl'];
  
    return (
      <h2 >
          You are in waiting room and you came from {redirectUrl}
          <div>
            <button style={{fontSize: "16px"}} onClick={() => window.location.replace(redirectUrl)} >Go Back</button>
          </div>
      </h2>
    );
  }
}
