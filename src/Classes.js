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
    this.props.client.query(q.Paginate(Ref("classes"))).then( (res) => {
      this.setState({classes : res.data})
    })
  }
  render() {
    console.log("Classes",this.state)
    return (
      <div className="Classes">
        <p>We found {this.state.classes.length} classes:</p>
        <ul>
          {this.state.classes.map((db) => {
            return <li key={db.value}><Link to={db.value}>{db.value}</Link></li>;
          })}
        </ul>
      </div>
    );
  }
}

export const ClassesHome = () => {
  console.log("ClassesHome");
  return (<div>
    Select a klass for more information about it.
  </div>)
}

export class ClassInfo extends Component {
  constructor(props) {
    super(props);
    this.state = {info:{
      source:{}
    }};
  }
  componentDidMount() {
    this.getClassInfo(this.props.params.name)
  }
  getClassInfo(name) {
    console.log("getClassInfo", name)
    this.props.client.query(q.Get(Ref("classes/"+name))).then( (res) => {
      this.setState({info : res})
    })
  }
  componentWillReceiveProps(nextProps) {
    if (this.props.params.name !== nextProps.params.name) {
      this.getClassInfo(nextProps.params.name)
    }
  }
  render() {
    console.log("ClassInfo", this.this.state)
    return (<div>
        <ClassCard client={this.props.client} info={this.state.info}/>
      </div>)
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
        </dl>

        <p>Debug info:</p>
        <pre>{JSON.stringify(info, null, 2)}</pre>
      </div>
    );
  }
}
