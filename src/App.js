import React, { Component } from 'react';
import { Router, Route, Link, IndexRoute, hashHistory, browserHistory } from 'react-router';
import faunadb from 'faunadb';
import logo from './logo.svg';
import './App.css';

// console.log("faunadb", faunadb)

const q = faunadb.query, Ref = q.Ref;

var adminClient = new faunadb.Client({
  secret: "kqnPAhIHLuvwAAK0qP95OuNIjADeI9uLJzMWexUdisY"
});

function getMyDatabases() {
  return adminClient.query(q.Paginate(Ref("databases")))
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

class Databases extends Component {
  constructor(props) {
    super(props);
    this.state = {databases:[]};
  }
  componentDidMount() {
    console.log("getFaunaInfo")
    getMyDatabases().then( (res) => {
      this.setState({databases : res.data})
    })
  }
  render() {
    console.log(this.state)
    return (
      <div className="Databases">
        <p>We found:</p>
        <ul>
          {this.state.databases.map((db) => {
            return <li key={db.value}><Link to={db.value}>{db.value}</Link></li>;
          })}
        </ul>
      </div>
    );
  }
}

const NotFound = () => (<h1>404.. This page is not found!</h1>);

export default App;
