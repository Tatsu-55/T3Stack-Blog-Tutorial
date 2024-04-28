import { redirect } from "next/navigation";
import { getAuthSession } from "@/lib/nextauth";
import { trpc } from "@/trpc/client";
import ResetPassword from "@/components/auth/ResetPassword"

interface ResetPasswordPageProps {
    params: {
        token: string
    }
}

//パスワード再設定ページ
const ResetPasswordPage = async ({ params }: ResetPasswordPageProps) => {
    const { token } = params

    //認証情報を取得
    const user = await getAuthSession()

    if (user) {
        redirect("/")
    }

    //トークンの有効性を判定
    const isValid = await trpc.auth.getResetTokenValidity({ token })

    //トークンが無効な場合はリダイレクト
    if (!isValid) {
        redirect("/reset-password")
    }

    return <ResetPassword token={token} />
} 

export default ResetPasswordPage