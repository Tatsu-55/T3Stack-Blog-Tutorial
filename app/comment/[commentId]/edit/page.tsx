import { redirect } from "next/navigation";
import { getAuthSession } from "@/lib/nextAuth";
import { trpc } from "@/trpc/client";
import CommentEdit from "@/components/comment/CommentEdit";

interface CommentEditPageProps {
    params: {
        commentId: string
    }
}

//コメント編集ページ
const CommentEditPage = async ({ params }: CommentEditPageProps) => {
    const { commentId } = params

    //認証情報を取得
    const user = await getAuthSession()

    if (!user) {
        redirect("/signin")
    }

    //コメント詳細情報を取得
    const comment = await trpc.comment.getCommentById({ commentId })

    if (!comment) {
        return (
            <div className="text-center text-sm text-gray-500">
                コメントはありません
            </div>
        )
    }

    if (comment.userId !== user.id) {
        return <div className="text-center">編集権限がありません</div>
    }

    return <CommentEdit comment={comment} />
}

export default CommentEditPage