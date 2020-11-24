import React, { useState } from 'react'
import { Form, Button } from 'semantic-ui-react';
import { gql, useMutation } from '@apollo/client'

import { useForm } from '../util/hooks';

const Register = (props) => {
	const [errors, setErrors] = useState({});

	const { onChange, onSubmit, values } = useForm(registerUser, {
		username: '',
		password: '',
		confirmPassword: '',
		email: ''
	})

	const [addUser, { loading }] = useMutation(REGISTER_USER, {
		update(_, result) {
			props.history.push('/')
		},
		onError(err) {
			setErrors(err.graphQLErrors[0].extensions.exception.errors)
		},
		variables: values
	})

	function registerUser() {
		addUser()
	}

	return (
		<div className='form-container'>
			<Form onSubmit={onSubmit} noValidate className={loading ? 'loading' : ''}>
				<h1>Register</h1>
				<Form.Input label='Username' placeholder='Username' type='text' name='username' value={values.username} error={errors.username ? true : false} onChange={onChange}></Form.Input>
				<Form.Input label='Email' placeholder='Email' type='email' name='email' value={values.email} error={errors.email ? true : false} onChange={onChange}></Form.Input>
				<Form.Input label='Password' placeholder='Password' type='password' name='password' value={values.password} error={errors.password ? true : false} onChange={onChange}></Form.Input>
				<Form.Input label='Confirm Password' placeholder='Confirm Password' type='password' name='confirmPassword' value={values.confirmPassword} error={errors.confirmPassword ? true : false} onChange={onChange}></Form.Input>
				<Button type='submit' primary>Register</Button>
			</Form>
			{
				Object.keys(errors).length > 0 && (
					<div className="ui error message">
						<ul className="list">
							{Object.values(errors).map(value => (
								<li key={value}>{value}</li>
							))}
						</ul>
					</div>
				)
			}
		</div>
	)
}

const REGISTER_USER = gql`
	mutation register(
		$username: String!
		$email: String!
		$password: String!
		$confirmPassword: String!
	) {
		register(
			registerInput: {
				username: $username
				email: $email
				password: $password
				confirmPassword: $confirmPassword
			}
		) {
			id
			email
			username
			createdAt
			token
		}
	}
`

export default Register
