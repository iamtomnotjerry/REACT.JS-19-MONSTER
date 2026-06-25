const UserInfo = ({ name, role, bio }) => {
  return (
    <article>
      <h3>{name}</h3>
      <strong>{role}</strong>
      <p>{bio}</p>
    </article>
  )
}

export default UserInfo
