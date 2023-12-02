import Link from 'next/link'
import exampleImage from "../images/logo.png";
import Image from 'next/image'

function Home() {
    return (
        <ul>
            <Image src={exampleImage} alt="LOGO" height={80} />
            <h1>Home Page</h1>
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
