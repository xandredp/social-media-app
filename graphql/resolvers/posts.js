const { AuthenticationError } = require('apollo-server')

const Post = require('../../models/Post')
const checkAuth = require('../../util/checkAuth')

module.exports = {
	Query: {
		async getPosts() {
			try {
				const posts = await Post.find().sort({ createdAt: -1 })
				return posts
			} catch(error) {
				throw new Error(error)
			}
		},
		async getPost(_, { postId }) {
			try {
				const post = await Post.findById(postId)
				if (post) {
					return post
				} else {
					throw new Error('Post not found')
				}
			} catch(err) {
				throw new Error(err)
			}
		},
	},
	Mutation: {
		async createPost(_, { body }, context) {
			// Returns a user or error
			const user = checkAuth(context)
			const newPost = new Post({
				body,
				user: user.indexOf,
				username: user.username,
				createdAt: new Date().toISOString()
			})
			const post = await newPost.save()

			return post
		},
		async deletePost(_, { postId }, context) {
			// Returns a user or error
			const user = checkAuth(context)
			try {
				// Find the post to be deleted
				const post = await Post.findById(postId)
				// Check if this user is the creator of this post
				if (user.username === post.username) {
					await post.delete()
					return 'Post deleted successfully'
				} else {
					throw new AuthenticationError('Action not allowed')
				}
			} catch(err) {
				throw new Error(err)
			}
		},
	}
}