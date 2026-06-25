import Header from "./components/Header"
import Footer from "./components/Footer"
import UserInfo from "./components/UserInfo"
import LikeButton from "./components/LikeButton"
const App = () => {
  return (
    <>
      <Header />
      <UserInfo name="John Doe" role="React Developer" bio="I am a React Developer" />
      <UserInfo name="Jane Doe" role="Frontend Developer" bio="I am a Frontend Developer" />
      <UserInfo name="Peter Jones" role="Backend Developer" bio="I am a Backend Developer" />
      <LikeButton />
      <Footer />
    </>
  )
}

export default App