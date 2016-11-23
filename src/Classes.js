import React, { Component } from 'react';
import { Link } from 'react-router';
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
    console.log("getClassInfo", client, path, name)
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
    console.log("ClassInfo", this.state)
    const info = this.state.info;
    return (
        <div className="ClassInfo">
          <h3>Class Details</h3>
          <dl>
            <dt>Name</dt><dd>{info.name}</dd>
            <dt>History</dt><dd>{info.history_days} days</dd>
            <ClassIndexes path={this.props.params.splat} client={this.state.scopedClient} info={this.state.info}/>
          </dl>
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
    console.log("queryForIndexes", client, classRef)
    client && client.query(q.Filter(q.Map(q.Paginate(Ref("indexes")), function (indexRef) {
      return q.Get(indexRef)
    }), function (indexInstance) {
      return q.Equals(q.Ref(refName), q.Select("source", indexInstance));
    })).then( (response) => {
      this.setState({indexes:response.data})
    })
  }
  render() {
    var info = this.props.info;
    return (
      <div className="ClassIndexes">
        <dt>Covering Indexes</dt>
        {this.state.indexes.map((index)=>(
          <dd key={index.ref.value}><Link to={this.props.path ? this.props.path+"/"+index.ref.value : index.ref.value}>{index.name}</Link></dd>
        ))}
      </div>
    )
  }
}
