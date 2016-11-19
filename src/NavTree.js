import React, { Component } from 'react';
import { Link } from 'react-router';
import faunadb from 'faunadb';
const q = faunadb.query, Ref = q.Ref;

export class NavTree extends Component {
  render() {
    return (
      <div className="NavTree">
        <NavLevel client={this.props.client} expanded/>
      </div>
    );
  }
}

class NavLevel extends Component {
  constructor(props) {
    super(props);
    this.state = {databases:[], classes:[], indexes:[]};
  }
  componentDidMount() {
    this.getInfos(this.props)
  }
  componentWillReceiveProps(nextProps) {
    this.getInfos(nextProps)
  }
  getInfos(props) {
    console.log("getInfos", props)
    if (!(props.expanded && props.client)) return;
    this.getDatabases(props.client);
    this.getClasses(props.client);
    this.getIndexes(props.client);
  }
  getDatabases(client) {
    client.query(q.Paginate(Ref("databases"))).then( (res) => {
      this.setState({databases : res.data})
    }).catch(console.error.bind(console, "getDatabases"))
  }
  getClasses(client) {
    client.query(q.Paginate(Ref("classes"))).then( (res) => {
      this.setState({classes : res.data})
    }).catch(console.error.bind(console, "getClasses"))
  }
  getIndexes(client) {
    client.query(q.Paginate(Ref("indexes"))).then( (res) => {
      this.setState({indexes : res.data})
    }).catch(console.error.bind(console, "getIndexes"))
  }
  render() {
    console.log("NavLevel",this.state)
    return (
      <div className="NavLevel">
        <dl>
          <dt key="_databases" >Databases</dt>
          {this.state.databases.map((db) => {
            // const clientForSubDB =
            // render db name at this level
            return (
              <dd key={db.value}>
                <Link to={db.value}>{this._valueTail(db.value)}</Link>
              </dd>
            );
          })}
          <dt key="_classes" >Classes</dt>
          {this.state.classes.map((classRow) => {
            return (
              <dd key={classRow.value}>
                <Link to={classRow.value}>{this._valueTail(classRow.value)}</Link>
              </dd>
            );
          })}
          <dt key="_indexes" >Indexes</dt>
          {this.state.indexes.map((indexRow) => {
            return (
              <dd key={indexRow.value}>
                <Link to={indexRow.value}>{this._valueTail(indexRow.value)}</Link>
              </dd>
            );
          })}
        </dl>
      </div>
    );
  }
  _valueTail(string) {
    var parts = string.split("/")
    parts.shift()
    return parts.join("/")
  }
}
