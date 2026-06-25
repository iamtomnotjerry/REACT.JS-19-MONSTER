function UserInfo({ name, role, bio }) {
    return (
        <>
            <div>
                <h1>{name}</h1>
                <h2>{role}</h2>
                <p>{bio}</p>
            </div>
        </>
    )
}

export default UserInfo