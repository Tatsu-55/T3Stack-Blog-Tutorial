import { sendEmail } from "@/actions/sendEmail"
import { TRPCError } from "@trpc/server"
import prisma from "@/lib/prisma"

interface SendForgotPasswordOptions {
    userId: string
}

//パスワード再設定メール送信
export const sendForgotPassword = async ({
    userId,
}: SendForgotPasswordOptions) => {
    //ユーザーの取得
    const user = await prisma.user.findUnique({
        where: {
            id: userId,
        },
        include: {
            passwordResetTokens: {
                orderBy: {
                    createdAt: "desc",
                },
                take: 1,
            },
        },
    })

    if (!user || !user.email) {
        throw new TRPCError({
            code: "BAD_REQUEST",
            message: "ユーザーが存在しません",
        })
    }

    //トークンの取得
    const token = user.passwordResetTokens[0].token

    //パスワード再設定のリンク
    const resetPasswordLink = `${process.env.NEXT_PUBLIC_BASE_URL}/reset-password/${token}`

    //件名
    const subject = "パスワード再設定のご案内"

    //本文
    const body = `
    <div>
        <p>ご利用ありがとうございます。 <br />
           あなたのアカウントでパスワード再設定のリクエストがありました。
        </p>

        <p><a href="${resetPasswordLink}">パスワードの再設定を行う</a></p>

        <p>このリンクの有効期限は24時間です。</p>
        <p>このメールに覚えのない場合は、このメールを無視するか削除するようお願いします。</p>
    </div>
    `

    //メール送信
    await sendEmail(subject, body, user.email)
}