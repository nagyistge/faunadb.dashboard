import faunadb from 'faunadb';

export default function clientForSubDB(adminClient, db_name, type) {
  var path, encoded = adminClient._secret,
    parts = encoded.split(":"),
    secret = parts.shift();
  if (parts.length == 2) {
    path = parts[0] + "/" + db_name
  } else {
    path = db_name
  }
  return new faunadb.Client({
    secret : secret + ":" + path + ":" + type
  })
}
