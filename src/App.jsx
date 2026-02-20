import './App.css'
import {Routes , Route , Navigate} from "react-router-dom"
import { SignIn } from './components/signIn'
import { SignUp } from './components/signUp'

function App() {

  return (
    <>
    <Routes>
      <Route path="/" element={<Navigate to="/sign-in" />} />
      <Route path='/sign-up' element={<SignUp/>}/>
      <Route path='/sign-in' element={<SignIn/>}/>
    </Routes>
    </>
  )
}

export default App
