import React, { Component } from 'react';
import { Link } from 'react-router';
import faunadb from 'faunadb';
const q = faunadb.query, Ref = q.Ref;

export class NavTree extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }
  makeServerClient(adminClient) {
    var secret = adminClient._secret;
    return new faunadb.Client({
      secret : secret + ":server"
    })
  }
  discoverKeyType(client) {
    console.log("discoverKeyType", client)
    if (!client) return;
    client.query(q.Create(Ref("databases"), { name: "console_key_type_discovery_db_created_and_deleted_automatically_always_safe_to_delete" }))
      .then(()=>{
        // we are an admin key, lets fix our mess
        return client.query(q.Delete(Ref("databases/console_key_type_discovery_db_created_and_deleted_automatically_always_safe_to_delete"))).then(()=>{
          this.setState({adminClient : client});
        })
      }, (error) => {
        console.log("admin error", error)
        if (error.name === "PermissionDenied") {
          return client.query(q.Create(Ref("classes"), {
            name: "console_key_type_discovery_class_created_and_deleted_automatically_always_safe_to_delete"
          })).then(()=>{
            // we are a server key, lets fix our mess
            return client.query(q.Delete(Ref("classes/console_key_type_discovery_class_created_and_deleted_automatically_always_safe_to_delete"))).then(()=>{
              this.setState({serverClient : client});
            })
          }, (error) => {
            console.log("server error", error)
            return client.query(q.Delete(Ref("classes/console_key_type_discovery_class_created_and_deleted_automatically_always_safe_to_delete")))

          })
        } else {
          // delete the test db in case we are out of sync
          return client.query(q.Delete(Ref("databases/console_key_type_discovery_db_created_and_deleted_automatically_always_safe_to_delete")))
        }
        // we might be a server key lets see if we can do stuff
      }).catch(console.log.bind(console,"discoverKeyType"))
  }
  componentDidMount() {
    this.discoverKeyType(this.props.client)
  }
  componentWillReceiveProps(nextProps) {
    if (this.props.client !== nextProps.client) {
      this.discoverKeyType(nextProps.client)
    }
  }
  render() {
    console.log("NavTree", this.state)
    return (
      <div className="NavTree">
        <NavLevel serverClient={this.state.serverClient} adminClient={this.state.adminClient} expanded/>
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
    if (!props.expanded) return;
    this.getDatabases(props.adminClient);
    this.getClasses(props.serverClient);
    this.getIndexes(props.serverClient);
  }
  getDatabases(client) {
    console.log("getDatabases", client)
    client && client.query(q.Paginate(Ref("databases"))).then( (res) => {
      this.setState({databases : res.data})
    }).catch(console.error.bind(console, "getDatabases"))
  }
  getClasses(client) {
    console.log("getClasses", client)
    client && client.query(q.Paginate(Ref("classes"))).then( (res) => {
      this.setState({classes : res.data})
    }).catch(console.error.bind(console, "getClasses"))
  }
  getIndexes(client) {
    client && client.query(q.Paginate(Ref("indexes"))).then( (res) => {
      this.setState({indexes : res.data})
    }).catch(console.error.bind(console, "getIndexes"))
  }
  clientForSubDB(adminClient, db_name, type) {
    var path, encoded = adminClient._secret,
      parts = encoded.split(":"),
      secret = parts.shift();
    if (parts.length == 2) {
      path = parts[0] + "/" + db_name
    } else {
      path = db_name
    }
    return new faunadb.Client({
      secret : secret + ":" + path + ":" + type
    })
  }
  serverClientForSubDB(adminClient, db_name) {

  }
  render() {
    console.log("NavLevel",this.state)
    return (
      <div className="NavLevel">
        <dl>
          <dt key="_databases" >Databases</dt>
          {this.state.databases.map((db) => {
            // render db name at this level
            const db_name = this._valueTail(db.value);
            return (
              <dd key={db.value}>
                <Link to={db.value}>{db_name}</Link>
                <NavLevel
                  adminClient={this.clientForSubDB(this.props.adminClient, db_name, "admin")}
                  serverClient={this.clientForSubDB(this.props.adminClient, db_name, "server")} 
                  expanded/>
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
