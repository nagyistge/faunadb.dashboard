import React, { Component } from 'react';
import { Router, Route, Link, IndexRoute, hashHistory, browserHistory } from 'react-router';
import faunadb from 'faunadb';
import logo from './logo.svg';
import {Indexes, IndexHome, IndexInfo} from './Indexes'
import {Classes, ClassesHome, ClassInfo} from './Classes'
import {NavTree} from './NavTree'
import {Databases} from './Databases'

const q = faunadb.query, Ref = q.Ref;

class App extends Component {
  render() {
    return (
      <Router history={hashHistory}>
        <Route path='/' component={Container}>
          <IndexRoute component={Home} />
          <Route path='/databases' component={Databases} />
          <Route path='/classes' component={Classes}>
            <IndexRoute component={ClassesHome} />
            <Route path='/classes/:name' component={ClassInfo}/>
          </Route>
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
    <Link to="/databases">Databases</Link>&nbsp;
    <Link to="/classes">Classes</Link>&nbsp;
    <Link to="/indexes">Indexes</Link>&nbsp;
    <Link to="/instances">Instances</Link>
  </div>
)

class SecretForm extends Component {
  constructor(props) {
    super(props);
    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.state = {value:"kqnPAhRJFfUwAAK04RVasFRTTV3rJxptEiWOhKJSbO4"};
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
        <input type="submit"/>
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
    console.log("Container", this.state)

    const childrenWithProps = React.Children.map(this.props.children,
     (child) => React.cloneElement(child, {
       client: this.state.client
     })
    );

    return (
      <div className="ms-Grid">
        {/* header */} <div className="ms-Grid-row">
          <h1>FaunaDB Console</h1>
        </div>
        <div className="ms-Grid-row">
          {/* nav */}  <div className="ms-Grid-col ms-u-sm12 ms-u-md5 ms-u-lg4">
            <SecretForm onSubmit={this.updateSecret} />
            <NavTree client={this.state.client} />
          </div>
          {/* main */} <div className="ms-Grid-col ms-u-sm12 ms-u-md7 ms-u-lg8">
            {childrenWithProps}
          </div>
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

const NotFound = () => (<h1>404.. This page is not found!</h1>);

export default App;
