import { getAuthSession } from "@/lib/nextAuth";
import { redirect } from "next/navigation";
import { trpc } from "@/trpc/client";
import Success from "@/components/subscription/Success"

//お支払い成功ページ
const SuccessPage = async () => {
    //認証情報を取得
    const user = await getAuthSession()

    if (!user) {
        redirect("/login")
    }

    //サブスクリプション情報を取得
    const subscriptions = await trpc.subscription.getSubscriptionInfo()

    return <Success subscriptions={subscriptions.data} />
}

export default SuccessPage