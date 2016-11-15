import React, { Component } from 'react';
import { Router, Route, Link, IndexRoute, hashHistory, browserHistory } from 'react-router';
import faunadb from 'faunadb';
import logo from './logo.svg';
import './App.css';
import {Indexes, IndexHome, IndexInfo} from './Indexes'

// console.log("faunadb", faunadb)

const q = faunadb.query, Ref = q.Ref;

var adminClient = new faunadb.Client({
  secret: "kqnPAhIL7IwQAAG0dxzfrCOe7Ql6atqe83k-s2phoQ0"
});

var serverClient = new faunadb.Client({
  secret : "kqnPAhRJFfUwAAK04RVasFRTTV3rJxptEiWOhKJSbO4"
})

class App extends Component {
  render() {
    return (
      <Router history={hashHistory}>
        <Route path='/' component={Container}>
          <IndexRoute component={Home} />
          <Route path='/databases' component={Databases} />
          <Route path='/classes' component={DatabaseClasses} />
          <Route path='/indexes' component={Indexes}>
            <IndexRoute component={IndexHome} />
            <Route path='/indexes/:name' component={IndexInfo}/>
          </Route>
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
    <Link to="/classes">Classes</Link>
    <Link to="/indexes">Indexes</Link>
  </div>
)

class SecretForm extends Component {
  constructor(props) {
    super(props);
    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.state = {value:""};
  }
  handleChange(event) {
    this.setState({value: event.target.value});
  }
  handleSubmit(event) {
    // console.log('Secret is: ' + this.state.value);
    event.preventDefault();
    this.props.onSubmit(this.state.value)
  }
  render() {
    return (
      <form onSubmit={this.handleSubmit}>
        <input type="password" value={this.state.value} onChange={this.handleChange}/>
      </form>
    )
  }
}

class Container extends Component {
  constructor(props) {
    super(props);
    this.state = {client:false};
    this.updateSecret = this.updateSecret.bind(this);
  }
  updateSecret(secret) {
    console.log('Secret is: ' + secret);
    // get a new client for that secret and set state
    var clientForSecret = new faunadb.Client({
      secret: secret
    });
    this.setState({client : clientForSecret});
  }
  render() {
    const childrenWithProps = React.Children.map(this.props.children,
     (child) => React.cloneElement(child, {
       client: this.state.client
     })
    );
    return (
      <div className="App">
        <div className="App-header">
          <img src={logo} className="App-logo" alt="logo" />
          <SecretForm onSubmit={this.updateSecret} />
          <Nav />
        </div>
        <div className="App-intro">
          {childrenWithProps}
        </div>
      </div>
    )
  }
}

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
    this.props.client.query(q.Paginate(Ref("databases"))).then( (res) => {
      this.setState({databases : res.data})
    }).catch(function (res) {
      console.log(res)
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

class DatabaseClasses extends Component {
  constructor(props) {
    super(props);
    this.state = {classes:[]};
  }
  componentDidMount() {
    this.props.client.query(q.Paginate(Ref("classes"))).then( (res) => {
      this.setState({classes : res.data})
    })
  }
  render() {
    console.log(this.state)
    return (
      <div className="DatabaseClasses">
        <p>We found classes:</p>
        <ul>
          {this.state.classes.map((db) => {
            return <li key={db.value}><Link to={db.value}>{db.value}</Link></li>;
          })}
        </ul>
      </div>
    );
  }
}


const NotFound = () => (<h1>404.. This page is not found!</h1>);

export default App;
