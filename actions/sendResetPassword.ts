import { sendEmail } from "./sendEmail";
import { TRPCError } from "@trpc/server";
import prisma from "@/lib/prisma";
import { send } from "process";

interface SendForgotPasswordOptions {
    userId: string
}

//パスワード再設定メール送信
export const sendResetPassword = async ({
    userId,
}: SendForgotPasswordOptions) => {
    //ユーザーの取得
    const user = await prisma.user.findUnique({
        where: {
            id: userId,
        },
    })

    if (!user || !user.email) {
        throw new TRPCError({
            code: "BAD_REQUEST",
            message: "ユーザーが存在しません",
        })
    }

    //件名
    const subject = "パスワード再設定完了のご案内"

    //本文
    const body = `
        <div>
            <p>
              ご利用ありがとうございます。<br />
              あなたのアカウントでパスワード再設定が完了しました。
            </p>
        </div>
    `

    //メール送信
    await sendEmail(subject, body, user.email)
}