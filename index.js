const { ApolloServer } = require('apollo-server')
const mongoose = require('mongoose')

const typeDefs = require('./graphql/typedefs')
const resolvers = require('./graphql/resolvers')
const { MONGODB } = require('./config.js')

const server = new ApolloServer({
	typeDefs,
	resolvers
})

mongoose.connect(MONGODB, {useNewUrlParser: true})
	.then(() => {
		console.log('MONGODB connected')
		return server.listen({port: 5000})
	}).then(res => {
		console.log(`server running at ${res.url}`)
	})