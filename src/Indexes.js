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
      source:{}
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

    return (<div>
        <IndexCard client={this.props.client} info={this.state.info}/>
        <IndexQuery client={this.props.client} info={this.state.info}/>
      </div>)
  }
}

class IndexQuery extends Component {
  constructor(props) {
    super(props);
    this.gotTerm = this.gotTerm.bind(this);
    this.state = {};
  }
  gotTerm(term) {
    this.setState({term})
  }
  render() {
    var termInfo, queryResults;
    if (this.props.info.terms) {
      // get a term
      termInfo = <TermForm onSubmit={this.gotTerm}/>;
        if (this.state.term) {
          queryResults = <QueryResult client={this.props.client} info={this.props.info} term={this.state.term}/>
        } else {
          // no query
        }
    } else {
      // run a termless query
      termInfo = <p>Class index for {this.props.info.source.value}</p>;
      queryResults = <QueryResult client={this.props.client} info={this.props.info} />
    }
    return (<div>
      {termInfo}
      {queryResults}
    </div>);
  }
}
class QueryResult extends Component {
  constructor(props) {
    super(props);
    this.state = {result:{data:[]}};
  }
  componentDidMount() {
    this.getIndexRows(this.props.info.name, this.props.term);
  }
  componentWillReceiveProps(nextProps) {
    if (this.props.info.name !== nextProps.info.name ||
      this.props.term !== nextProps.term) {
      this.getIndexRows(nextProps.info.name, nextProps.term)
    }
  }
  getIndexRows(name, term) {
    console.log("get rows for", name, term)
    if (!name) return;
    var query;
    if (term) {
      query = q.Paginate(q.Match(Ref("indexes/"+name), term))
    } else {
      query = q.Paginate(q.Match(Ref("indexes/"+name)))
    }
    this.props.client.query(query).then((res) => {
      this.setState({result : res})
    })
  }
  render() {
    return (<div>
        <h2>Query Results</h2>
        <ul>
          {this.state.result.data.map((item)=>{
            return <li>{JSON.stringify(item, null, 2)}</li>
          })}
        </ul>
      {JSON.stringify(this.state.result, null, 2)}
      </div>)
  }
}

class TermForm extends Component {
  constructor(props) {
    super(props);
    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.state = {value:""};
  }
  handleChange(event) {
    this.setState({value: event.target.value});
  }
  handleSubmit(event) {
    event.preventDefault();
    this.props.onSubmit(this.state.value)
  }
  render() {
    return (
      <form onSubmit={this.handleSubmit}>
        Index term: <input type="text" value={this.state.value} onChange={this.handleChange}/>
      </form>
    )
  }
}

class IndexCard extends Component {
  render() {
    var info = this.props.info;
    var active = info.active;
    var unique = info.unique;
    console.log("info",info)
    var termsMarkup = info.terms && <div>
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
    </div>;
    var valuesMarkup = info.values && <div>
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
    </div>;

    return (
      <div className="IndexInfo">
        <dl>
          <dt>Name</dt><dd>{info.name}</dd>
          <dt>Active</dt><dd>{active ? "true" : "false"}</dd>
          <dt>Unique</dt><dd>{unique ? "true" : "false"}</dd>
          <dt>Partitions</dt><dd>{info.partitions}</dd>
          <dt>Source</dt><dd>{info.source.value}</dd>
          {termsMarkup}
          {valuesMarkup}
        </dl>

        <p>Debug info:</p>
        <pre>{JSON.stringify(info, null, 2)}</pre>
      </div>
    );
  }
}
