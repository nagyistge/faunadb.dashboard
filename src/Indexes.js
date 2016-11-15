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
    this.state = {info:{}};
  }
  componentDidMount() {
    console.log("componentDidMount",this.props)
    this.props.client.query(q.Get(Ref("indexes/"+this.props.params.name))).then( (res) => {
      this.setState({info : res})
    })
  }
  render() {
    console.log(this.state)
    return (
      <div className="IndexInfo">
        <p>Index info:</p>
        <pre>{JSON.stringify(this.state.info, null, 2)}</pre>
      </div>
    );
  }
}
