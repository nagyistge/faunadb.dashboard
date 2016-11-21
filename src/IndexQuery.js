import React, { Component } from 'react';
// import { Link } from 'react-router';
import faunadb from 'faunadb';
const q = faunadb.query, Ref = q.Ref;
import {inspect} from 'util';

export default class IndexQuery extends Component {
  constructor(props) {
    super(props);
    this.gotTerm = this.gotTerm.bind(this);
    this.state = {};
  }
  gotTerm(term) {
    console.log("Got Term", term)
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
      // termInfo = <p>Class index for {this.props.info.source.value}</p>;
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
    this.clickedRef = this.clickedRef.bind(this);

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
    this.props.client && this.props.client.query(query).then((res) => {
      this.setState({result : res})
    })
  }
  clickedRef(item) {
    console.log("clickedRef",item, this)
    if (item.constructor === q.Ref("").constructor) {
      this.setState({instanceRef:item});
    }
  }
  render() {
    return (<div>
        <h3>Query Results</h3>
        <ul>
          {this.state.result.data.map((item, i)=>{
            // console.log(item)
            return <li key={i} >
              {
                Array.isArray(item)
                ?
                  item.map((value) => {
                    return <IndexValue value={value} onClick={this.clickedRef.bind(null, value)}/>
                  })
                :
                  <IndexValue value={item} onClick={this.clickedRef.bind(null, item)}/>
              }
            </li>
          })}
        </ul>
        <InstancePreview client={this.props.client} instanceRef={this.state.instanceRef}/>
      </div>)
  }
}

class IndexValue extends Component {
  render() {
    var body;
    var value = this.props.value;
    const someRef = q.Ref("");

    if (value.constructor === someRef.constructor) {
      body = <a onClick={this.props.onClick}>Ref: {inspect(value, {depth:null})}</a>
    } else {
      body = <span>{inspect(value, {depth:null})}</span>
    }
    return body;
  }
}

class InstancePreview extends Component {
  constructor(props) {
    super(props);
    this.state = {instance:false};
  }
  componentDidMount() {
    this.getInstanceData(this.props.instanceRef);
  }
  componentWillReceiveProps(nextProps) {
    if (this.props.instanceRef !== nextProps.instanceRef) {
      this.getInstanceData(nextProps.instanceRef)
    }
  }
  getInstanceData(instanceRef) {
    console.log("getInstanceData", instanceRef)
    instanceRef && this.props.client && this.props.client.query(q.Get(Ref(instanceRef))).then((res) => {
      this.setState({instance : res})
    })
  }
  render() {
    const instance = this.state.instance;
    if (!instance){
      return <div/>;
    }
    return (<div>
        <h3>Instance Preview</h3>
        <dl>
          <dt>Class</dt><dd>{instance.class.toString()}</dd>
          <dt>Ref</dt><dd>{instance.ref.toString()}</dd>
          <dt>TS</dt><dd>{instance.ts}</dd>
          <dt>Data</dt>
          <dd><pre>{inspect(instance.data, { depth: null })}</pre></dd>
        </dl>
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
    var value = this.state.value;
    var match = value.match(/Ref\(\"(.*)\"\)/);
    if (match) {
      value = q.Ref(match[1]);
    }
    this.props.onSubmit(value);
  }
  render() {
    return (
      <form onSubmit={this.handleSubmit}>
        Index term: <input type="text" value={this.state.value} onChange={this.handleChange}/>
      </form>
    )
  }
}
