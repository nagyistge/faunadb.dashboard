import faunadb from 'faunadb';
import {parse} from 'url'
export default function clientForSubDB(adminClient, db_name, type) {
  var path, encoded = adminClient._secret,
    parts = encoded.split(":"),
    secret = parts.shift();
  if (parts.length === 2) {
    path = parts[0] + "/" + db_name
  } else {
    path = db_name
  }
  var newSecret = secret + ":" + path + ":" + type;
  var baseUrl = parse(adminClient._baseUrl);
  return new faunadb.Client({
    domain : baseUrl.hostname,
    port : baseUrl.port,
    scheme : baseUrl.protocol.replace(':',''),
    observer : adminClient._observer,
    secret : newSecret
  })
}
