import React, { Component } from 'react';
import { Link } from 'react-router';
import faunadb from 'faunadb';
const q = faunadb.query, Ref = q.Ref;


export class Classes extends Component {
  constructor(props) {
    super(props);
    this.state = {classes:[]};
  }
  componentDidMount() {
    this.getClasses(this.props.client)
  }
  componentWillReceiveProps(nextProps) {
    if (this.props.client !== nextProps.client) {
      this.getClasses(nextProps.client)
    }
  }
  getClasses(client) {
    client.query(q.Paginate(Ref("classes"))).then( (res) => {
      this.setState({classes : res.data})
    })
  }
  render() {
    const childrenWithProps = React.Children.map(this.props.children,
     (child) => React.cloneElement(child, {
       client: this.props.client
     })
    );
    console.log("Classes",this.state)
    return (
      <div className="Classes">
        <p>We found {this.state.classes.length} classes:</p>
        <ul>
          {this.state.classes.map((db) => {
            return <li key={db.value}><Link to={db.value}>{db.value}</Link></li>;
          })}
        </ul>
        {childrenWithProps}
      </div>
    );
  }
}

export const ClassesHome = () => (
  <div>
    Select a class for more information about it.
  </div>
)


export class ClassInfo extends Component {
  constructor(props) {
    super(props);
    this.state = {info:{
      ref:{}
    }};
  }
  componentDidMount() {
    this.getClassInfo(this.props.client, this.props.params.name)
  }
  componentWillReceiveProps(nextProps) {
    if (this.props.params.name !== nextProps.params.name ||
      this.props.client !==  nextProps.client) {
      this.getClassInfo(nextProps.client, nextProps.params.name)
    }
  }
  getClassInfo(client, name) {
    console.log("getClassInfo", name)
    client.query(q.Get(Ref("classes/"+name))).then( (res) => {
      this.setState({info : res})
    })
  }
  render() {
    console.log("ClassInfo", this.state)
    return (<div>
        <ClassCard client={this.props.client} info={this.state.info}/>
        <ClassIndexes client={this.props.client} info={this.state.info}/>
      </div>)
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
    console.log("queryForIndexes", refName)
    client.query(q.Filter(q.Map(q.Paginate(Ref("indexes")), function (indexRef) {
      return q.Get(indexRef)
    }), function (indexInstance) {
      return q.Equals(q.Ref(refName), q.Select("source", indexInstance));
    })).then( (response) => {
      console.log("queryForIndexes", response)
      this.setState({indexes:response.data})
    })
  }
  render() {
    var info = this.props.info;
    console.log("ClassIndexes", info, this.state)
    return (
      <div className="ClassIndexes">
        <ul>
          {this.state.indexes.map((index)=>(
            <li key={index.ref.value}><Link to={index.ref.value}>{index.name}</Link></li>
          ))}
        </ul>
      </div>
    )
  }
}

class ClassCard extends Component {
  render() {
    var info = this.props.info;
    console.log("info", info)


    return (
      <div className="ClassInfo">
        <dl>
          <dt>Name</dt><dd>{info.name}</dd>
          <dt>History</dt><dd>{info.history_days} days</dd>
        </dl>

        <p>Debug info:</p>
        <pre>{JSON.stringify(info, null, 2)}</pre>
      </div>
    );
  }
}
