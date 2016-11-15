import React, { Component } from 'react';
import { Link } from 'react-router';
import faunadb from 'faunadb';
const q = faunadb.query, Ref = q.Ref;

export class Indexes extends Component {
  constructor(props) {
    super(props);
    this.state = {indexes:[]};
  }
  componentDidMount() {
    this.props.client.query(q.Paginate(Ref("indexes"))).then( (res) => {
      this.setState({indexes : res.data})
    })
  }
  render() {
    const childrenWithProps = React.Children.map(this.props.children,
     (child) => React.cloneElement(child, {
       client: this.props.client
     })
    );
    console.log(this.state)
    return (
      <div className="Indexes">
        <p>We found indexes:</p>
        <ul>
          {this.state.indexes.map((row) => {
            return <li key={row.value}><Link to={row.value}>{row.value}</Link></li>;
          })}
        </ul>
        {childrenWithProps}
      </div>
    );
  }
}

export const IndexHome = () =>(
  <div>
    Select an index for more information about it.
  </div>
);

export class IndexInfo extends Component {
  constructor(props) {
    super(props);
    this.state = {info:{
      source:{},
      terms :[],
      values : []
    }};
  }
  componentDidMount() {
    this.getIndexInfo(this.props.params.name)
  }
  getIndexInfo(name) {
    this.props.client.query(q.Get(Ref("indexes/"+name))).then( (res) => {
      this.setState({info : res})
    })
  }
  componentWillReceiveProps(nextProps) {
    if (this.props.params.name !== nextProps.params.name) {
      this.getIndexInfo(nextProps.params.name)
    }
  }
  render() {
    var info = this.state.info;
    var active = info.active;
    var unique = info.unique;
    console.log("info",info)
    return (
      <div className="IndexInfo">
        <dl>
          <dt>Name</dt><dd>{info.name}</dd>
          <dt>Active</dt><dd>{active ? "true" : "false"}</dd>
          <dt>Unique</dt><dd>{unique ? "true" : "false"}</dd>
          <dt>Partitions</dt><dd>{info.partitions}</dd>
          <dt>Source</dt><dd>{info.source.value}</dd>
          <dt>Terms</dt>
          <dd>
            <dl>
              {info.terms.map((t, i)=>{
                return (<div key={i}>
                  <dt>Field</dt>
                  <dd>{JSON.stringify(t.field)}</dd>
                </div>)
              })}
            </dl>
          </dd>
          <dt>Values</dt>
          <dd>
            <dl>
              {info.values.map((t, i)=>{
                return (<div key={i}>
                  <dt>Field</dt>
                  <dd>{JSON.stringify(t.field)}</dd>
                </div>)
              })}
            </dl>
          </dd>
        </dl>

        <p>Debug info:</p>
        <pre>{JSON.stringify(info, null, 2)}</pre>
      </div>
    );
  }
}
