import Header from './components/Header'
import { Navbar } from './components/Navbar'
import UserInfo from './components/UserInfo'
import LikeButton from './components/LikeButton'
import Footer from './components/Footer'

const App = () => {
  return (
    <>
      <Header />
      <Navbar />
      <UserInfo
        name="John Doe"
        role="React Developer"
        bio="Builds component-driven UIs with React 19."
      />
      <UserInfo
        name="Jane Doe"
        role="Frontend Developer"
        bio="Turns design systems into accessible interfaces."
      />
      <UserInfo
        name="Peter Jones"
        role="Backend Developer"
        bio="Designs the APIs that power the frontend."
      />
      <LikeButton />
      <Footer />
    </>
  )
}

export default App
