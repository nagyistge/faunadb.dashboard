import React, { Component } from 'react';
// import { Link } from 'react-router';
import {DetailsList, DetailsRow} from 'office-ui-fabric-react'

import {query as q} from 'faunadb';
const Ref = q.Ref;
import {inspect} from 'util';


export default class IndexQuery extends Component {
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
    this.state = {data:[]};
    this.clickedRef = this.clickedRef.bind(this);
    this._onRenderRow = this._onRenderRow.bind(this);
    this._renderItemColumn = this._renderItemColumn.bind(this);
  }
  componentDidMount() {
    this.getIndexRows(this.props.client, this.props.info.name, this.props.term);
  }
  componentWillReceiveProps(nextProps) {
    if (this.props.info.name !== nextProps.info.name ||
      this.props.term !== nextProps.term ||
      this.props.client !== nextProps.client) {
      this.getIndexRows(nextProps.client, nextProps.info.name, nextProps.term)
    }
  }
  getIndexRows(client, name, term) {
    if (!name) return;
    var query;
    if (term) {
      query = q.Paginate(q.Match(Ref("indexes/"+name), term))
    } else {
      query = q.Paginate(q.Match(Ref("indexes/"+name)))
    }
    client && client.query(query).then((res) => {
      this.setState({data : this.makeResultIntoTableData(res)})
    }).catch(console.error.bind(console, name))
  }
  makeResultIntoTableData(result) {
    const values = this.props.info.values;
    // return the result structured as rows with column names
    // alternatively we could provide a column map to the table view
    if (values) {
      const keynames = values.map((v) => v.field.join("."));
      if (!result.data) return [];
      return result.data.map((resItem) => {
        var item = {};
        if (keynames.length === 1) { // special case for single column
          item[keynames[0]] = resItem;
        } else {
          for (var i = 0; i < keynames.length; i++) {
            item[keynames[i]] = resItem[i];
          }
        }
        return item;
      });
    } else {
      return result.data.map((resItem) => {
        return {value:resItem}
      })
    }
  }
  clickedRef(item, event) {
    event.preventDefault()
    if (item.constructor === q.Ref("").constructor) {
      this.setState({instanceRef:item});
    }
  }
  _onRenderRow (props) {
    return <DetailsRow { ...props } onRenderCheck={ this._onRenderCheck } />;
  }
  _onRenderCheck(props) {
    return null;
  }
  _renderItemColumn(item, index, column) {
    let fieldContent = item[column.fieldName];
    if (fieldContent.constructor === q.Ref("").constructor) {
      return <a href="#" onClick={this.clickedRef.bind(null, fieldContent)}>{inspect(fieldContent, {depth:null})}</a>
    } else {
      return <span>{ fieldContent }</span>;
    }
  }
  render() {
    return (<div>
        <h3>Query Results</h3>
          <DetailsList
            onRenderItemColumn={this._renderItemColumn}
            onRenderRow={ this._onRenderRow }
            selectionMode="none"
         items={ this.state.data }/>
         <InstancePreview client={this.props.client} instanceRef={this.state.instanceRef}/>
      </div>)
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
    instanceRef && this.props.client && this.props.client.query(q.Get(Ref(instanceRef))).then((res) => {
      this.setState({instance : res})
    })
  }
  render() {
    const instance = this.state.instance;
    if (!instance){
      return null;
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
    this.state = {value:props.value||""};
  }
  handleChange(event) {
    this.setState({value: event.target.value});
  }
  handleSubmit(event) {
    event.preventDefault();
    var value = this.state.value;
    var match = value.match(/Ref\("(.*)"\)/);
    if (match) {
      value = q.Ref(match[1]);
    }
    this.props.onSubmit(value);
  }
  componentWillReceiveProps(nextProps) {
    if (this.props.value !== nextProps.value) {
      this.setState({value: nextProps.value});
    }
  }
  render() {
    return (
      <form onSubmit={this.handleSubmit}>
        Lookup term: <input type="text" value={this.state.value} onChange={this.handleChange}/>
      </form>
    )
  }
}
