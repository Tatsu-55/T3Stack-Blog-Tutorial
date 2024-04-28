import type { Metadata } from "next"
import { Inter } from "next/font/google"
import { getAuthSession } from "@/lib/nextAuth"
import AuthProvider from "@/components/providers/AuthProvider"
import TrpcProvider from "@/components/providers/TrpcProvider"
import ToastProvider from "@/components/providers/ToastProvider"
import Navigation from "@/components/auth/Navigation"
import "./globals.css"
import { getSubscription } from "@/actions/subscription"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "T3Stack ブログ",
  description: "チュートリアルを参考に作成したブログ記事です。",
}

interface RootLayoutProps {
  children: React.ReactNode
}

const RootLayout = async ({ children }: RootLayoutProps) => {
  //認証情報を取得
  const user = await getAuthSession()

  //サブスクリプション有効チェック
  const { isSubscribed } = await getSubscription({ userId: user?.id })

  return (
    <html lang="ja">
      <body className={inter.className}>
        <div className="flesx min-h-screen flex-col">
          <AuthProvider>
            <TrpcProvider>
              <Navigation user={user} isSubscribed={isSubscribed} />
              <ToastProvider />

            <main className="container mx-auto max-w-screen-md flex-1 px-2">
              {children}
            </main>

            {/*フッター */}
            <footer className="py-5">
              <div className="text-center text-sm">
                Copyright © All rights reserved | {" "}
                <a
                  href="https://tohope.jp/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline">
                    TOHOPEウェブサイト
                  </a>
              </div>
            </footer>
            </TrpcProvider>
          </AuthProvider>
        </div>
      </body>
    </html>
  )
}

export default RootLayout