import { redirect } from "next/navigation";
import { getAuthSession } from "@/lib/nextAuth";
import Signup from "@/components/auth/Signup"

//サインアップページ
const SignupPage = async () => {
    //認証情報を取得
    const user = await getAuthSession()

    //ユーザーが存在する場合はリダイレクト
    if (user) {
        redirect("/")
    }

    return <Signup />
}

export default SignupPage