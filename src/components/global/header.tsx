import Link from "next/link";
import Image from "next/image";
import { signIn, signOut, useSession } from "next-auth/react";

export default function Header() {
    const { data: session } = useSession();

    return (
        <div className="shadow-md w-full py-2 px-16 h-[10vh] bg-purple-700 text-white flex flex-row gap-16 items-center justify-between">
            <div className="flex flex-row gap-16 items-center">
                <Image src={'/LogoWhite.png'} width={100} height={100} alt={'Logo'} />
                <Link href="/">Home</Link>
                <Link href="/add-website">Website Manager</Link>
                <Link href="/blog-manage">Blog Manager</Link>
                <Link href="/review-blogs">Review Blogs</Link>
            </div>
            <div>
                {session ? (
                    <button onClick={() => signOut()} className="bg-purple-500 hover:bg-purple-600 text-white py-2 px-4 rounded">
                        Sign Out
                    </button>
                ) : (
                    <button onClick={() => signIn()} className="bg-purple-500 hover:bg-purple-600 text-white py-2 px-4 rounded">
                        Sign In
                    </button>
                )}
            </div>
        </div>
    );
}
