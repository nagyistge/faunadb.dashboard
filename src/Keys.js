// navigate a faunadb database hierarchy while tracking keys
// so we don't have to create more keys than we need

var keys =  new Keys(root)

keys.client.query("list databases").then((databases)=>{
  keys.intoDatabase(databases[0]).then(()=>{
    keys.client.query("list databases").then(()=>{
      keys.popDatabase().then(()=>{
        keys.client.query("list databases").then((databases)=>{
          // we are back at the root database
          keys.intoDatabase(databases[0]).then(()=>{
            // reuse the secret we generated the first time
          })
        })
      })
    })
  })
})
