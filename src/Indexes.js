import React, { Component } from 'react';
import { Link } from 'react-router';
import {TextField, NumberTextField, Button, ButtonType, Dropdown, Toggle} from 'office-ui-fabric-react'
import faunadb from 'faunadb';
import clientForSubDB from "./clientForSubDB";
import {inspect} from 'util';
import IndexQuery from './IndexQuery'
const q = faunadb.query, Ref = q.Ref;

export class IndexInfo extends Component {
  constructor(props) {
    super(props);
    this.state = {info:{
      source:{}
    }};
  }
  componentDidMount() {
    this.getIndexInfo(this.props.client, this.props.params.splat, this.props.params.name)
  }
  getIndexInfo(client, path, name) {
    if (!client) return;
    var scopedClient;
    if (path) {
      scopedClient = clientForSubDB(client, path, "server");
    } else {
      // we are in a server key context
      // so we don't know our path and can't change our client
      scopedClient = client;
    }
    scopedClient.query(q.Get(Ref("indexes/"+name))).then( (res) => {
      this.setState({info : res, scopedClient})
    })
  }
  componentWillReceiveProps(nextProps) {
    if (this.props.params.name !== nextProps.params.name ||
      this.props.client !== nextProps.client) {
      this.getIndexInfo(nextProps.client, nextProps.params.splat, nextProps.params.name)
    }
  }
  render() {
    return (<div>
        <h3>Index Details</h3>
        <IndexCard path={this.props.params.splat} client={this.state.scopedClient} info={this.state.info}/>
        <IndexQuery client={this.state.scopedClient} info={this.state.info}/>
      </div>)
  }
}


class IndexCard extends Component {
  render() {
    var info = this.props.info;
    var active = info.active;
    var unique = info.unique;
    return (
      <div className="IndexInfo">

        <div className="ms-Grid">
          <div className="ms-Grid-row">
            <div className="ms-Grid-col ms-u-sm6">
              Index: {info.name}
            </div>
            <div className="ms-Grid-col ms-u-sm6">
              Source: <Link to={this.props.path ? this.props.path+"/"+info.source.value : info.source.value}>{info.source.value}</Link>
            </div>
          </div>

          <div className="ms-Grid-row">
            <div className="ms-Grid-col ms-u-sm4">
              Active: {active ? "true" : "false"}
            </div>
            <div className="ms-Grid-col ms-u-sm4">
              Unique: {unique ? "true" : "false"}
            </div>
            <div className="ms-Grid-col ms-u-sm4">
              Partitions: {info.partitions}
            </div>
          </div>

          <div className="ms-Grid-row">
            <div className="ms-Grid-col ms-u-sm6">
              <h3>Terms</h3>
              <IndexTermsList terms={info.terms}/>
            </div>
            <div className="ms-Grid-col ms-u-sm6">
              <h3>Values</h3>
              <IndexTermsList terms={info.values}/>
            </div>
          </div>
        </div>

      </div>
    );
  }
}

class IndexTermsList extends Component {
  render() {
    var terms = this.props.terms;
    if (!terms) return null; //<p>Class index for {this.props.info.source.value}</p>
    return (
      <div>
        {terms.map((t, i) => {
          return (
            <dl key={i}>
              <dt>{JSON.stringify(t.field)}</dt>
              {t.transform && <dd>Transform: {t.transform}</dd>}
              {t.reverse && <dd>Reverse: {JSON.stringify(t.reverse)}</dd>}
            </dl>
          );
        })}
      </div>
    );
  }
}

export class IndexForm extends Component {
  constructor(props) {
    super(props)
    this.state = {form:{}, classes:[]};
    this.onSubmit = this.onSubmit.bind(this);
    this.onChange = this.onChange.bind(this);
    this.onSelectClass = this.onSelectClass.bind(this);
    this.onUniqueToggled = this.onUniqueToggled.bind(this);
  }
  componentDidMount() {
    this.getClasses(this.props.client, this.props.params.splat)
  }
  componentWillReceiveProps(nextProps) {
    if (this.props.params.name !== nextProps.params.name ||
      this.props.client !==  nextProps.client) {
      this.getClasses(nextProps.client, nextProps.params.splat)
    }
  }
  getClasses(client, path) {
    if (!client) return;
    var scopedClient;
    if (path) {
      scopedClient = clientForSubDB(client, path, "server");
    } else {
      // we are in a server key context
      // so we don't know our path and can't change our client
      scopedClient = client;
    }
    scopedClient.query(q.Paginate(Ref("classes"))).then( (res) => {
      this.setState({classes : res.data})
    }).catch(console.error.bind(console, "getClasses"))
  }

  onSubmit(event) {
    event.preventDefault();
    var path = this.props.params.splat;
    var client = this.props.client;
    if (!client) return;
    var scopedClient;
    if (path) {
      scopedClient = clientForSubDB(client, path, "server");
    } else {
      // we are in a server key context
      // so we don't know our path and can't change our client
      scopedClient = client;
    }
    scopedClient.query(q.Create(Ref("indexes"), this.indexOptions())).then( (res) => {
      console.log("created",res);
    })
  }
  indexOptions() {
    var opts = {
      name: this.state.form.name,
      unique : this.state.unique
    };
    if (this.state.selected) {
      opts.source = q.Ref(this.state.selected)
    }
    if (this.state.form.terms) {
      opts.terms = JSON.parse(this.state.form.terms)
    }
    if (this.state.form.values) {
      opts.values = JSON.parse(this.state.form.values)
    }
    return opts;
  }
  onChange(field, value) {
    var form = this.state.form;
    form[field] = value;
    this.setState({form})
  }
  onSelectClass(option) {
    this.setState({selected : option.key})
  }
  onUniqueToggled(isUnique) {
    this.setState({unique: isUnique})
  }
  render() {
    var context = this.props.params.splat ? " in "+this.props.params.splat : "";
    var dropdownClasses = this.state.classes.map((ref)=>{
      return {
        key : ref.value,
        text  : ref.value.split("/").pop()
      }
    })
    return (
      <div className="IndexForm">
        <form>
          <h3>Create an index{context}</h3>
          <TextField label="Name"
            required={true}
            description="This name is used in queries and API calls."
            value={this.state.form.name}
            onChanged={this.onChange.bind(this, "name")}/>
          <Dropdown label="Source Class" options={dropdownClasses}
            onChanged={this.onSelectClass} selectedKey={this.state.selected}/>
          <Toggle label="Unique" checked={this.state.unique} onChanged={this.onUniqueToggled} />
          <TextField label="Terms"
            description="JSON list of terms to be indexed."
            placeholder='[{"field": ["data", "name"], "transform": "casefold"}, {"field": ["data", "age"]}]'
            value={this.state.form.terms}
            onChanged={this.onChange.bind(this, "terms")}/>
          <TextField label="Values"
            description="JSON list of values to be included."
            placeholder='[{"field": ["data", "name"], "transform": "casefold"}, {"field": ["data", "age"]}]'
            value={this.state.form.values}
            onChanged={this.onChange.bind(this, "values")}/>
          <Button buttonType={ ButtonType.primary } onClick={this.onSubmit}>Create Index</Button>
        </form>
      </div>
    )
  }
}
