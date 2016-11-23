import React, { Component } from 'react';
import { Link } from 'react-router';
import faunadb from 'faunadb';
import clientForSubDB from "./clientForSubDB";
import {inspect} from 'util';
import IndexQuery from './IndexQuery'
const q = faunadb.query, Ref = q.Ref;

export class IndexInfo extends Component {
  constructor(props) {
    super(props);
    this.state = {info:{
      source:{}
    }};
  }
  componentDidMount() {
    this.getIndexInfo(this.props.client, this.props.params.splat, this.props.params.name)
  }
  getIndexInfo(client, path, name) {
    if (!client) return;
    var scopedClient;
    if (path) {
      scopedClient = clientForSubDB(client, path, "server");
    } else {
      // we are in a server key context
      // so we don't know our path and can't change our client
      scopedClient = client;
    }
    scopedClient.query(q.Get(Ref("indexes/"+name))).then( (res) => {
      this.setState({info : res, scopedClient})
    })
  }
  componentWillReceiveProps(nextProps) {
    if (this.props.params.name !== nextProps.params.name ||
      this.props.client !== nextProps.client) {
      this.getIndexInfo(nextProps.client, nextProps.params.splat, nextProps.params.name)
    }
  }
  render() {
    return (<div>
        <h3>Index Details</h3>
        <IndexCard path={this.props.params.splat} client={this.state.scopedClient} info={this.state.info}/>
        <IndexQuery client={this.state.scopedClient} info={this.state.info}/>
      </div>)
  }
}


class IndexCard extends Component {
  render() {
    var info = this.props.info;
    var active = info.active;
    var unique = info.unique;
    return (
      <div className="IndexInfo">

        <div className="ms-Grid">
          <div className="ms-Grid-row">
            <div className="ms-Grid-col ms-u-sm6">
              Index: {info.name}
            </div>
            <div className="ms-Grid-col ms-u-sm6">
              Source: <Link to={this.props.path ? this.props.path+"/"+info.source.value : info.source.value}>{info.source.value}</Link>
            </div>
          </div>

          <div className="ms-Grid-row">
            <div className="ms-Grid-col ms-u-sm4">
              Active: {active ? "true" : "false"}
            </div>
            <div className="ms-Grid-col ms-u-sm4">
              Unique: {unique ? "true" : "false"}
            </div>
            <div className="ms-Grid-col ms-u-sm4">
              Partitions: {info.partitions}
            </div>
          </div>

          <div className="ms-Grid-row">
            <div className="ms-Grid-col ms-u-sm6">
              <h3>Terms</h3>
              <IndexTermsList terms={info.terms}/>
            </div>
            <div className="ms-Grid-col ms-u-sm6">
              <h3>Values</h3>
              <IndexTermsList terms={info.values}/>
            </div>
          </div>
        </div>

      </div>
    );
  }
}

class IndexTermsList extends Component {
  render() {
    var terms = this.props.terms;
    if (!terms) return null; //<p>Class index for {this.props.info.source.value}</p>
    return (
      <div>
        {terms.map((t, i) => {
          return (
            <dl key={i}>
              <dt>{JSON.stringify(t.field)}</dt>
              {t.transform && <dd>Transform: {t.transform}</dd>}
              {t.reverse && <dd>Reverse: {JSON.stringify(t.reverse)}</dd>}
            </dl>
          );
        })}
      </div>
    );
  }
}
