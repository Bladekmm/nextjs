import Link from 'next/link'

function Home() {
    return (
        <ul>
            <li>
                <Link href="/">Home</Link>
            </li>
            <li>
                <Link href="/register">Register</Link>
            </li>
            <li>
                <Link href="/CommentFourm">CommentFourm</Link>
            </li>
        </ul>
    )
}

export default Home
