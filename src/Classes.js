import React, { Component } from 'react';
import { Link } from 'react-router';
import {TextField, Button, ButtonType} from 'office-ui-fabric-react'
import faunadb from 'faunadb';
import clientForSubDB from "./clientForSubDB";
const q = faunadb.query, Ref = q.Ref;

export class ClassInfo extends Component {
  constructor(props) {
    super(props);
    this.state = {info:{
      ref:{}
    }};
  }
  componentDidMount() {
    this.getClassInfo(this.props.client, this.props.params.splat, this.props.params.name)
  }
  componentWillReceiveProps(nextProps) {
    if (this.props.params.name !== nextProps.params.name ||
      this.props.client !==  nextProps.client) {
      this.getClassInfo(nextProps.client, nextProps.params.splat, nextProps.params.name)
    }
  }
  getClassInfo(client, path, name) {
    if (!client) return;
    var scopedClient;
    if (path) {
      scopedClient = clientForSubDB(client, path, "server");
    } else {
      // we are in a server key context
      // so we don't know our path and can't change our client
      scopedClient = client;
    }
    scopedClient.query(q.Get(Ref("classes/"+name))).then( (res) => {
      this.setState({info : res, scopedClient})
    })
  }
  render() {
    const info = this.state.info;
    return (
        <div className="ClassInfo">
          <h3>Class Details</h3>
          <dl>
            <dt>Name</dt><dd>{info.name}</dd>
            <dt>History</dt><dd>{info.history_days} days</dd>
            <ClassIndexes path={this.props.params.splat} client={this.state.scopedClient} info={this.state.info}/>
          </dl>
          <InstanceForm path={this.props.params.splat} client={this.state.scopedClient} info={this.state.info}/>
        </div>
      );
  }
}

class ClassIndexes extends Component {
  constructor(props) {
    super(props);
    this.state = {indexes:[]};
  }
  componentDidMount() {
    this.queryForIndexes(this.props.client, this.props.info.ref)
  }
  componentWillReceiveProps(nextProps) {
    if (this.props.info.ref !== nextProps.info.ref ||
      this.props.client !==  nextProps.client) {
      this.queryForIndexes(nextProps.client, nextProps.info.ref)
    }
  }
  queryForIndexes(client, classRef) {
    var refName = classRef.value;
    client && client.query(q.Filter(q.Map(q.Paginate(Ref("indexes")), function (indexRef) {
      return q.Get(indexRef)
    }), function (indexInstance) {
      return q.Equals(q.Ref(refName), q.Select("source", indexInstance));
    })).then( (response) => {
      this.setState({indexes:response.data})
    })
  }
  render() {
    return (
      <div className="ClassIndexes">
        <dt>Covering Indexes</dt>
        {this.state.indexes.map((index)=>(
          <dd key={index.ref.value}><Link to={this.props.path ? "/"+this.props.path+"/"+index.ref.value : index.ref.value}>{index.name}</Link></dd>
        ))}
      </div>
    )
  }
}

class InstanceForm extends Component {
  constructor(props) {
    super(props)
    this.state = {form:{data:"{}"}}
    this.onChange = this.onChange.bind(this)
    this.onSubmit = this.onSubmit.bind(this)
  }
  onChange(field, value) {
    var form = this.state.form;
    form[field] = value;
    this.setState({form})
  }
  onSubmit(event) {
    event.preventDefault();
    var data = JSON.parse(this.state.form.data);
    var createQuery = q.Create(this.props.info.ref, {
      data: data
    });
    this.props.client && this.props.client.query(createQuery)
  }
  render() {
    var context = this.props.path ? " in "+this.props.path : "";
    return (
      <div className="InstanceForm">
        <form>
          <h4>Create an instance of {this.props.info.name}{context}</h4>
            <TextField label="Data"
              multiline
              description="The contents of this field will be evaluated with the Ref() constructor in scope."
              value={this.state.form.data}
              onChanged={this.onChange.bind(this, "data")}/>
            <Button buttonType={ ButtonType.primary } onClick={this.onSubmit}>Create Instance</Button>
        </form>
      </div>
    );
  }
}

export class ClassForm extends Component {
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
      scopedClient = clientForSubDB(client, path, "server");
    } else {
      // we are in a server key context
      // so we don't know our path and can't change our client
      scopedClient = client;
    }
    console.log("make class", scopedClient);
    scopedClient.query(q.Create(Ref("classes"), { name: this.state.form.name })).then( (res) => {
      console.log("created",res);
    }).catch(console.error.bind(console, "createClass error"))
  }
  onChange(field, value) {
    var form = this.state.form;
    form[field] = value;
    this.setState({form})
  }
  render() {
    var context = this.props.params.splat ? " in "+this.props.params.splat : "";
    return (
      <div className="ClassForm">
        <form>
          <h3>Create a class{context}</h3>
          <TextField label="Name"
            required={true}
            description="This name is used in queries and API calls."
            value={this.state.form.name}
            onChanged={this.onChange.bind(this, "name")}/>
          <TextField label="History (days)"
            placeholder={30}
            description="Instance history for this class will be retained for this many days."
            value={this.state.form.history}
            onChanged={this.onChange.bind(this, "history")}/>
          <TextField label="TTL (days)"
            description="Instances of the class will be removed if they have not been updated within the configured TTL."
            value={this.state.form.ttl}
            onChanged={this.onChange.bind(this, "ttl")}/>
          <Button buttonType={ ButtonType.primary } onClick={this.onSubmit}>Create Class</Button>
        </form>
      </div>
    )
  }
}
