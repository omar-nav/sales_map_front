import React from 'react';
import { Switch, Route } from 'react-router-dom';
import Salesmap from './components/Salesmap/Salesmap';

const Routes = () => {
  return (
    <Switch>
      <Route exact path="/" component={Salesmap} />
    </Switch>
  );
};

export default Routes;