import { useState } from 'react'
import { showErrorMsg, showSuccessMsg } from '../services/event-bus.service.js'
import { login, signup } from '../store/actions/user.actions.js'
import { LoginForm } from './LoginForm.jsx'
import { useNavigate } from 'react-router'

export function LoginSignup({ setIsLogin }) {
   const [isSignup, setIsSignUp] = useState(false)
   const navigate = useNavigate()

   function onLogin(credentials) {
      isSignup ? _signup(credentials) : _login(credentials)
   }

   async function _login(credentials) {
      try {
         await login(credentials)
         navigate('/board')
         showSuccessMsg('Logged in successfully')
      } catch (err) {
         console.log('Cannot login', err)
         showErrorMsg('Login failed')
      }
   }

   async function _signup(credentials) {
      try {
         await signup(credentials)
         navigate('/board')
         showSuccessMsg('Signed up successfully')
      } catch (err) {
         console.log('Cannot signup', err)
         showErrorMsg('Oops try again')
      }
   }

   return (
      <div className='login-page'>
         <LoginForm setIsLogin={setIsLogin} onLogin={onLogin} isSignup={isSignup} />
         <div className='login-btns'>
            <a href='#' onClick={() => setIsSignUp(!isSignup)}>
               {isSignup ? 'Already a member? Login' : 'New user? Signup here'}
            </a>
         </div>
      </div>
   )
}
