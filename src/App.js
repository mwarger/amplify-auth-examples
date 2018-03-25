import React, { Component } from 'react';
import './App.css';
import {
  Link,
  BrowserRouter as Router,
  Switch,
  Route,
  Redirect
} from 'react-router-dom';
import { Authenticator } from 'aws-amplify-react';

import Amplify, { Auth } from 'aws-amplify';
import aws_exports from './aws-exports';

Amplify.configure(aws_exports);

const HeaderLinks = props => (
  <ul>
    <li>
      <Link to="/">Home</Link>
    </li>
    <li>
      <Link to="/auth">Create Account/Login</Link>
    </li>
    <li>
      <Link to="/secret">Secret Page</Link>
    </li>
    <li>
      <Link to="/about">
        About Page (we don't care if you're logged in or not)
      </Link>
    </li>
  </ul>
);

const ProtectedRoute = ({ render: C, props: childProps, ...rest }) => (
  <Route
    {...rest}
    render={rProps =>
      childProps.isLoggedIn ? (
        <C {...rProps} {...childProps} />
      ) : (
        <Redirect
          to={`/auth?redirect=${rProps.location.pathname}${
            rProps.location.search
          }`}
        />
      )
    }
  />
);

class AuthComponent extends Component {
  handleStateChange = state => {
    console.log(state);
    if (state === 'signedIn') {
      // handle state change
    }
  };
  render() {
    return (
      <div>
        <Authenticator onStateChange={this.handleStateChange} />
      </div>
    );
  }
}

const Routes = ({ authState }) => (
  <Switch>
    <Route exact path="/" render={() => <div>Home</div>} />
    <Route exact path="/auth" render={AuthComponent} />
    <ProtectedRoute
      exact
      path="/secret"
      render={() => <div>Keep it secret! Keep it safe!</div>}
      props={authState}
    />
    <Route exact path="/about" render={() => <div>About Content</div>} />
  </Switch>
);

class App extends Component {
  state = {
    authState: {
      isLoggedIn: false
    }
  };

  render() {
    return (
      <div className="App">
        <h1>Amplify Routes Example</h1>

        <HeaderLinks />
        <br />
        <Routes authState={this.state.authState} />
      </div>
    );
  }
}

const AppWithRouter = () => (
  <Router>
    <App />
  </Router>
);

export default AppWithRouter;
