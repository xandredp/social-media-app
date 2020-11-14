const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const User = require('../../models/User')
const { UserInputError } = require('apollo-server')

const {validateRegisterInput, validateLoginInput} = require('../../util/validators')
const { SECRET_KEY } = require('../../config')

// Helper function for generating token for user
function generateToken(user) {
	return jwt.sign({
		id: user.id,
		email: user.email,
		username: user.username
	}, SECRET_KEY, {expiresIn: '1h'})
}

module.exports = {
	Mutation: {
		async login(_, { username, password }) {
			const { errors, valid } = validateLoginInput(username, password)

			if (!valid) {
				throw new UserInputError('Errors', { errors })
			}

			// Check if user exists
			const user = await User.findOne({ username })
			if (!user) {
				errors.general = 'User not found'
				throw new UserInputError('User not found', { errors })
			}

			// Check if password is correct
			const match = await bcrypt.compare(password, user.password)
			if (!match) {
				errors.general = 'Wrong credentials'
				throw new UserInputError('Wrong credentials', { errors })
			}

			// User successfully logged in, issue a token for them
			const token = generateToken(user)

			return {
				...user._doc,
				id: user._id,
				token
			}
		},
		async register(_, {registerInput: {username, email, password, confirmPassword}}) {
			// Validate inputs using util function
			const { valid, errors } = validateRegisterInput(username, email, password, confirmPassword)
			if (!valid) {
				throw new UserInputError('Errors', { errors })
			}

			// Check if username is already taken
			const user = await User.findOne({ username });
			if (user) {
				throw new UserInputError('Username is taken', {
					errors: {
						username: 'This username is taken'
					}
				})
			}

			// Hash password and create auth token
			password = await bcrypt.hash(password, 12);
			const newUser = new User({
				email,
				username,
				password,
				createdAt: new Date().toISOString()
			});
			const res = await newUser.save()
			const token = generateToken(res)

			return {
				...res._doc,
				id: res._id,
				token
			}
		}
	}
}