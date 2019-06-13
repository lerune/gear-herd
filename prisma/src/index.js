const { prisma } = require('../generated/prisma-client')
const { GraphQLServer } = require('graphql-yoga')
const {resolvers} = require('./resolvers')
const jwt = require('jsonwebtoken')

const getUser = token => {
  try {
    if (token) {
      return jwt.verify(token, 'my-secret-from-env-file-in-prod')
    }
    return null
  } catch (err) {
    return null
  }
}

const server = new GraphQLServer({
  typeDefs: './schema.graphql',
  resolvers,
  context: req => {
    const tokenWithBearer = req.request.get('Authorization') || ''
    const token = tokenWithBearer.split(' ')[1]
    const user = getUser(token)

    return {
      user,
      prisma, // the generated prisma client if you are using it
    }
  },
}) 
server.start(() => console.log('Server is running on http://localhost:4000'))