import React, { Component } from 'react';
import { Router, Route, Link, IndexRoute, hashHistory, browserHistory } from 'react-router';
import clientForSubDB from "./clientForSubDB";
import faunadb from 'faunadb';
import {IndexInfo, IndexForm} from './Indexes'
import {ClassInfo, ClassForm} from './Classes'
import {NavTree} from './NavTree'
import {Databases} from './Databases'
import logo from './logo.svg';
import './App.css';

class App extends Component {
  render() {
    return (
      <Router history={hashHistory}>
        <Route path='/' component={Container}>
          <IndexRoute component={Home} />
          <Route path='/databases' component={Databases} />
          <Route path='/**/databases' component={Databases} />

          <Route path='/classes' component={ClassForm}/>
          <Route path='/classes/:name' component={ClassInfo}/>
          <Route path='/**/classes' component={ClassForm}/>
          <Route path='/**/classes/:name' component={ClassInfo}/>

          <Route path='/indexes' component={IndexForm}/>
          <Route path='/indexes/:name' component={IndexInfo}/>
          <Route path='/**/indexes' component={IndexForm}/>
          <Route path='/**/indexes/:name' component={IndexInfo}/>

          <Route path='*' component={NotFound} />
        </Route>
      </Router>
    );
  }
}

class SecretForm extends Component {
  constructor(props) {
    super(props);
    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.state = {value:"kqnPAhBy4vLQAAG0H4zu8gMbmRJg9uzk9up-xcAfZS8"};
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
    this.onSubDBNav = this.onSubDBNav.bind(this);
  }
  updateSecret(secret) {
    console.log('Secret is: ' + secret);
    // get a new client for that secret and set state
    var clientForSecret = new faunadb.Client({
      secret: secret
    });
    this.setState({client : clientForSecret});
  }
  onSubDBNav(secret) {
    console.log('onSubDBNav: ' + secret);
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
        {/* header */} <div className="ms-Grid-row header">
        <img src={logo} className="logo" alt="logo" />
        </div>
        <div className="ms-Grid-row">
          {/* nav */}  <div className="ms-Grid-col ms-u-sm12 ms-u-md5 ms-u-lg4 sidebar">
            <SecretForm onSubmit={this.updateSecret} />
            <NavTree client={this.state.client} onSubDBNav={this.onSubDBNav} />
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
    To get started, enter a FaunaDB secret in the form.
  </div>
);

const NotFound = () => (<h1>404.. This page is not found!</h1>);

export default App;
