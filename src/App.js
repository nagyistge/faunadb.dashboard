import React, { Component } from 'react';
import { Link, Router, Route, IndexRoute, browserHistory } from 'react-router';
import {TextField, Button, ButtonType, MessageBar, MessageBarType} from 'office-ui-fabric-react'
import faunadb from 'faunadb';
import {IndexInfo, IndexForm} from './Indexes'
import {ClassInfo, ClassForm} from './Classes'
import {NavTree} from './NavTree'
import {Databases, DatabaseInfo} from './Databases'
import logo from './logo.svg';
import {parse as parseURL} from 'url'
import './App.css';

const ERROR_MESSAGE_DISPLAY_MS = 5000;

class SecretForm extends Component {
  constructor(props) {
    super(props);
    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.state = {secret:""};
  }
  handleChange(key, value) {
    var setter = {};
    setter[key] = value;
    this.setState(setter);
  }
  handleSubmit() {
    this.props.onSubmit(this.state)
  }
  render() {
    return (
      <div className="SecretForm">
        <TextField label="FaunaDB Endpoint URL"
          description="Leave this empty for Fauna Cloud."
          placeholder="https://cloud.faunadb.com/"
          value={this.state.endpoint} onChanged={this.handleChange.bind(this,"endpoint")}/>
        <TextField required type="password" label="Key Secret"
          description="Visit https://fauna.com/account/keys or talk to your administrator to provision keys."
          value={this.state.secret} onChanged={this.handleChange.bind(this,"secret")}/>
        <Button buttonType={ ButtonType.primary } onClick={this.handleSubmit}>Use Secret</Button>
      </div>
    )
  }
}

class Container extends Component {
  constructor(props) {
    super(props);
    this.state = {client:false, errors:[]};
    this.updateSecret = this.updateSecret.bind(this);
    this.observerCallback = this.observerCallback.bind(this);
  }
  updateSecret(data) {
    // get a new client for that secret and set state
    // observer for errors...
    var opts = {
      secret: data.secret,
      observer : this.observerCallback
    };
    if (data.endpoint) {
      var endpointURL = parseURL(data.endpoint)
      opts.domain = endpointURL.hostname
      opts.scheme = endpointURL.protocol.replace(/:$/,'')
      if (endpointURL.port) {
        opts.port = endpointURL.port
      }
    }
    // console.log("client", opts.secret, opts)
    var clientForSecret = new faunadb.Client(opts);
    this.setState({client : clientForSecret});
  }
  observerCallback(res) { // render any error messages
    if (res.responseContent.errors) {
      console.error("observerCallback errors", res.responseContent.errors)
      var newErrors = res.responseContent.errors.map((error) => {
        var message = "";
        if (error.description) {
          message += error.description
        }
        if (error.failures) {
          error.failures.forEach((failure) => {
            message += " ("+ failure.field.join('.') +") " + failure.description
          })
        }
        return {message, id : Math.random().toString()};
      })
      // push them to the top of the list
      var oldErrors = this.state.errors;
      var allErrors = newErrors.concat(oldErrors);
      this.setState({errors : allErrors})
      // automatically remove them after a few seconds
      setTimeout(()=>{
        var removeIDs = newErrors.map((error) => error.id)
        var prunedErrors = this.state.errors.filter((error)=>{
          return !removeIDs.includes(error.id)
        });
        this.setState({errors : prunedErrors})
      }, ERROR_MESSAGE_DISPLAY_MS)
    }
  }
  render() {
    const childrenWithProps = React.Children.map(this.props.children,
     (child) => React.cloneElement(child, {
       client: this.state.client
     })
    );
    var path = (this.props.params||{}).splat;
    return (
      <div className="ms-Grid ms-Fabric ms-font-m">
        {/* header */}
        <div className="ms-Grid-row header">
          <Link to="/"><img src={logo} className="logo" alt="logo" /></Link>
        </div>
        <div className="ms-Grid-row">
          {/* nav */}
          <div className="ms-Grid-col ms-u-sm12 ms-u-md5 ms-u-lg4 sidebar">
            <NavTree client={this.state.client} path={path}/>
            <SecretForm onSubmit={this.updateSecret} />
          </div>
          {/* main */}
          <div className="ms-Grid-col ms-u-sm12 ms-u-md7 ms-u-lg8">
            {this.state.errors.map((error)=>{
              return (<MessageBar
              messageBarType={ MessageBarType.error }>{error.message}</MessageBar>)
            })}
            {childrenWithProps}
          </div>
        </div>
      </div>
    )
  }
}

const Home = () =>(
  <p>
    To get started, enter a FaunaDB secret in the form and browse to a class or index.
  </p>
);

const NotFound = () => (<h1>404.. This page is not found!</h1>);

class App extends Component {
  render() {
    return (
      <Router history={browserHistory}>
        <Route path='/' component={Container}>
          <IndexRoute component={Home} />
          <Route path='/databases' component={Databases} />
          <Route path='/**/databases' component={Databases} />
          <Route path='/**/info' component={DatabaseInfo} />

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

export default App;
