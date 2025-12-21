import Link from "next/link";

export default function Bar(){
    return (
        <nav className="mx-auto p-4 flex justify center" >
            <ul className="flex flex-col gap-3 items-center">
                <li>
                    <Link 
                        className="px-4 py-1 transition-colors duration-200 hover:bg-green-500 hover:text-white"
                        href="/about">about
                    </Link>   
                </li>
                <li>
                    <Link 
                        className="px-4 py-1 transition-colors duration-200 hover:bg-green-500 hover:text-white"
                        href="/team">team
                    </Link>   
                </li>
                <li>
                    <Link 
                        className="px-4 py-1 transition-colors duration-200 hover:bg-green-500 hover:text-white"
                        href="/business">for business
                    </Link>   
                </li>
            </ul>
        </nav>
        
    );
}
