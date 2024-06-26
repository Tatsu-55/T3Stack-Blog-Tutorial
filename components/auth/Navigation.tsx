"use client"

import { Button } from "../ui/button"
import { User } from "@prisma/client"
import UserNavigation from "@/components/auth/UserNavigation"
import Link from "next/link"

interface NavigationProps {
    user: User | null
    isSubscribed: boolean
}

//ナビゲーション
const Navigation = ({ user, isSubscribed }: NavigationProps) => {
    return (
        <header className="shadow-lg shadow-gray-100 mb-10">
            <div className="container mx-auto flex max-w-screen-md items-center justify-between px-2 py-3">
                <Link href="/" className="cursor-pointer text-xl font-bold">
                    TOHOPE Blog
                </Link>

                {user ? (
                    <div className="flex items-center justify-center space-x-3">
                        {!isSubscribed && (
                            <Button asChild variant="premium">
                                <Link href="/payment">有料会員</Link>
                            </Button> 
                        )}
                    <UserNavigation user={user} />
                    </div>
                ): (
                    <div className="flex items-center space-x-1">
                        <Button asChild variant="ghost" className="font-bold">
                            <Link href="/login">ログイン</Link>
                        </Button>
                        <Button asChild variant="ghost" className="font-bold">
                            <Link href="/signup">新規登録</Link>
                        </Button>
                    </div>

                )}
            </div>
        </header>
    )
}

export default Navigation