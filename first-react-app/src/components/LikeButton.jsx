import { useState } from "react";

function LikeButton() {
    const [like, setLike] = useState(0)
    function handleClick() {
        setLike(like + 1)
    }
    return (
        <>
            <h1>Like Button</h1>
            <p>Like: {like}</p>
            <button onClick={handleClick}>Like</button>
        </>
    )
}

export default LikeButton   