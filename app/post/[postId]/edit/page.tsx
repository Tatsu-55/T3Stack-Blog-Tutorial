import { redirect } from "next/navigation"
import { getAuthSession } from "@/lib/nextAuth"
import { trpc } from "@/trpc/client"
import PostEdit from "@/components/post/PostEdit"

interface PostEditPageProps {
    params: {
        postId: string
    }
}

//投稿編集ページ
const PostEditPage = async ({ params }: PostEditPageProps) => {
    const { postId } = params

    //認証情報を取得
    const user = await getAuthSession()

    if (!user) {
        redirect("/login")
    }

    //投稿詳細を取得
    const post = await trpc.post.getPostById({ postId })

    if (!post) {
        return (
            <div className="text-center text-sm text-gray-500">投稿はありません</div>
        )
    }

    if (post.userId !== user.id) {
        return (
            <div className="text-center">投稿を編集できません</div>
        )
    }

    return <PostEdit post={post} />
}

export default PostEditPage