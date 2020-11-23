const { AuthenticationError, UserInputError } = require('apollo-server')

const Post = require('../../models/Post')
const checkAuth = require('../../util/checkAuth')

module.exports = {
	Query: {
		getPosts: async () => {
			try {
				const posts = await Post.find().sort({ createdAt: -1 })
				return posts
			} catch(error) {
				throw new Error(error)
			}
		},
		getPost: async (_, { postId }) => {
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
		createPost: async (_, { body }, context) => {
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
		deletePost: async (_, { postId }, context) => {
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
		likePost: async (_, { postId }, context) => {
			const { username } = checkAuth(context)
			// Find the post
			const post = await Post.findById(postId)
			if (post) {
				if (post.likes.find(like => like.username === username)) {
					// Post already liked, unlike it
					post.likes = post.likes.filter(like => like.username !== username)
				} else {
					// Post not liked, like it
					post.likes.push({
						username,
						createdAt: new Date().toISOString()
					})
				}
				await post.save()
				return post
			} else throw new UserInputError('Post not found')
		}
	}
}