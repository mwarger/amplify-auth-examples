import React, { Component } from 'react';
import './App.css';
import { Link, BrowserRouter as Router } from 'react-router-dom';

const HeaderLinks = props => (
  <ul>
    <li>
      <Link to="/home">Home</Link>
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

class App extends Component {
  render() {
    return (
      <div className="App">
        <h1>Amplify Routes Example</h1>

        <HeaderLinks />
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
