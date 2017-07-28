const {send} = require('micro')
const url = require('url')
const {MongoClient} = require('mongodb')

var mongoUrl = 'your-mongo-db-connection-info'
var db

MongoClient.connect(mongoUrl, function(err, mongo) {
  if(err) return "Unable to connect to Mongo"

  console.log("Connected correctly to mongodb server.")
  db = mongo
})

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*')

  const parsedUrl = url.parse(req.url, true)
  const {query} = parsedUrl
  const {namespace} = query

  if(!namespace) return send(res, 400, {message: 'namespace query param missing'})

  const collection = db.collection(namespace)
  const items = collection.find({}).sort('_id', -1).limit(1).toArray(function(err, docs) {
    if(err) return send(res, 400, {message: 'There was an error while retrieving MongoDB docs'})

    if(docs && docs.length)
      return send(res, 200, docs[0]['payload'][namespace]['partial'])
    else
      return send(res, 404, {message: 'The collection has no docs'})
  })
}
