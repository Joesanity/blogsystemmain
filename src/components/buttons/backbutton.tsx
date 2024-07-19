import Link from "next/link";
import Image from "next/image";

export default function BackButton() {
    return (
        <div className="shadow-md max-w-12 rounded-full p-2 mb-4">
        <Link href="/add-website">
          <Image
            src="/backbutton.png"
            width={30}
            height={30}
            alt="Back Button"
          />
        </Link>
      </div>
    )
}