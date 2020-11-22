const Post = require('../../models/Post')
const checkAuth = require('../../util/checkAuth')
const { UserInputError, AuthenticationError } = require('apollo-server')

module.exports = {
	Mutation: {
		createComment: async (_, { postId, body }, context) => {
			// Returns a user or error
			const {username} = checkAuth(context)
			// Can not create an empty comment
			if (body.trim() === '') {
				throw new UserInputError('Empty comment', {
					errors: {
						body: 'Comment body must not be empty'
					}
				})
			}
			// Find the post for this comment
			const post = await Post.findById(postId)
			if (post) {
				post.comments.unshift({
					body,
					username,
					createdAt: new Date().toISOString()
				})
				await post.save()
				return post
			} else throw new UserInputError('Post not found')
		},
		deleteComment: async (_, { postId, commentId }, context) => {
			// Returns a user or error
			const { username } = checkAuth(context)
			// Find the post for this comment
			const post = await Post.findById(postId)
			if (post) {
				// Find the index of the comment in the array of comments on this post
				const commentIndex = post.comments.findIndex(c => c.id === commentId)
				// Only allow users to delete their own comments
				if (post.comments[commentIndex].username === username) {
					post.comments.splice(commentIndex, 1)
					await post.save()
					return post
				} else {
					throw new AuthenticationError('Action not allowed')
				}
			}
			// Post not found
			else throw new UserInputError('Post not found')
		}
	}
}