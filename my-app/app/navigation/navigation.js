import Link from "next/link";

export default function Bar(){
    return (
        <nav>
            <ul className="flex gap-6 justify-center">
                <li>
                    <Link href="/about">about</Link>   
                    <Link href="/">home</Link>
                </li>
            </ul>
        </nav>
        
    );
}
