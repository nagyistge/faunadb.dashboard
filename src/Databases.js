import React, { Component } from 'react';
import { Link } from 'react-router';
import faunadb from 'faunadb';
const q = faunadb.query, Ref = q.Ref;

export class Databases extends Component {
  constructor(props) {
    super(props);
    this.state = {databases:[]};
  }
  componentDidMount() {
    this.props.client && this.props.client.query(q.Paginate(Ref("databases"))).then( (res) => {
      this.setState({databases : res.data})
    }).catch(function (res) {
      console.log(res)
    })
  }
  render() {
    console.log(this.state)
    return (
      <div className="Databases">
        <p>We found:</p>
        <ul>
          {this.state.databases.map((db) => {
            return <li key={db.value}><Link to={db.value}>{db.value}</Link></li>;
          })}
        </ul>
      </div>
    );
  }
}
