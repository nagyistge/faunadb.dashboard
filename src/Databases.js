import React, { Component } from 'react';
// import { Link } from 'react-router';
import {TextField, Button, ButtonType} from 'office-ui-fabric-react'
import clientForSubDB from "./clientForSubDB";
import faunadb from 'faunadb';
const q = faunadb.query, Ref = q.Ref;

export class Databases extends Component {
  constructor(props) {
    super(props)
    this.state = {form:{}}
    this.onSubmit = this.onSubmit.bind(this);
    this.onChange = this.onChange.bind(this);
  }
  onSubmit(event) {
    event.preventDefault();
    var path = this.props.params.splat;
    var client = this.props.client;
    if (!client) return;
    var scopedClient;
    if (path) {
      scopedClient = clientForSubDB(client, path, "admin");
    } else {
      // we are in a server key context
      // so we don't know our path and can't change our client
      scopedClient = client;
    }
    scopedClient.query(q.Create(Ref("databases"), { name: this.state.form.name })).then( (res) => {
      console.log("created",res);
    })
  }
  onChange(field, value) {
    var form = this.state.form;
    form[field] = value;
    this.setState({form})
  }
  render() {
    var context = this.props.params.splat ? " in "+this.props.params.splat : "";
    return (
      <div className="DatabaseForm">
        <form>
          <h3>Create a database{context}</h3>
          <TextField label="Name"
            required={true}
            description="This name is used in queries and API calls."
            value={this.state.form.name}
            onChanged={this.onChange.bind(this, "name")}/>
          <Button buttonType={ ButtonType.primary } onClick={this.onSubmit}>Create Database</Button>
        </form>
      </div>
    )
  }
}

export class DatabaseInfo extends Component {
  constructor(props) {
    super(props);
    this.state = {info:{}};
  }
  componentDidMount() {
    this.getClassInfo(this.props.client, this.props.params.splat, this.props.params.name)
  }
  componentWillReceiveProps(nextProps) {
    if (this.props.params.splat !== nextProps.params.splat ||
      this.props.client !==  nextProps.client) {
      this.getDatabaseInfo(nextProps.client, nextProps.params.splat)
    }
  }
  getDatabaseInfo(client, path) {
    if (!client) return;
    var scopedClient;
    if (path) {
      scopedClient = clientForSubDB(client, path, "server");
    } else {
      // we are in a server key context
      // so we don't know our path and can't change our client
      scopedClient = client;
    }
    this.setState({scopedClient})
  }
  render() {
    return (
      <div>DB info {this.props.params.splat}</div>
    )
  }
}
