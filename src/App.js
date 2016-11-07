import React, { Component } from 'react';
import { Router, Route, Link, IndexRoute, hashHistory, browserHistory } from 'react-router';
import faunadb, { Ref, query as q } from 'faunadb';
import logo from './logo.svg';
import './App.css';

var adminClient = new faunadb.Client({
  secret: "kqnPAhIHLuvwAAK0qP95OuNIjADeI9uLJzMWexUdisY"
});

function getFaunaInfo() {
  adminClient.query(q.Create(Ref("databases"), { name: "console_test" })).then(function (response) {
    console.log(response)
  })
}

class App extends Component {
  render() {
    return (
      <Router history={hashHistory}>
        <Route path='/' component={Container}>
          <IndexRoute component={Home} />
            <Route path='/databases' component={Databases} />
          <Route path='*' component={NotFound} />
        </Route>
      </Router>
    );
  }
}

const Nav = () => (
  <div>
    <Link to='/'>Home</Link>&nbsp;
    <Link to="/databases">Databases</Link>
  </div>
)

const Container = (props) => (
  <div className="App">
    <div className="App-header">
      <img src={logo} className="App-logo" alt="logo" />
      <Nav />
    </div>
    <p className="App-intro">
      {props.children}
    </p>
  </div>
);

const Home = () =>(
  <div>
    To get started, edit <code>src/App.js</code> and save to reload.
      Find <Link to="/databases">databases</Link>
  </div>
);

const Databases = () => (
  <div className="Databases">
    <p>We found this:</p>
  </div>
);

const NotFound = () => (<h1>404.. This page is not found!</h1>);

export default App;
