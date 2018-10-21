import React from 'react';
import { Switch, Route } from 'react-router-dom';
import Salesmap from './components/Salesmap/Salesmap';

// import Profile from './components/auth/Profile';

const Routes = () => {
  return (
    <Switch>
      <Route exact path="/" component={Salesmap} />

      <Route exact path="/salesmap" component={Salesmap} />


      {/* <Route path="/profile" component={Profile} /> */}
    </Switch>
  );
};

export default Routes;