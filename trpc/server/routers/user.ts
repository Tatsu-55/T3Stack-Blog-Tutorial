import { publicProcedure, privateProcedure, router } from "@/trpc/server/trpc";
import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { createCloudImage, deleteCloudImage } from "@/actions/cloudImage";
import { extractPublicId } from "cloudinary-build-url"
import prisma from "@/lib/prisma";

export const userRouter = router({
    //ユーザー情報の更新
    updateUser: privateProcedure
        .input(
            z.object({
                name: z.string(),
                introduction: z.string().optional(),
                base64Image: z.string().optional(),
            })
        )
        .mutation(async ({ input, ctx }) => {
            try {
                const { name, introduction, base64Image } = input
                const userId = ctx.user.id
                let image_url

                if (base64Image) {
                    //ユーザーの探索
                    const user = await prisma.user.findUnique({
                        where: { id: userId },
                    })
                    
                    if (!user) {
                        throw new TRPCError({
                            code: "BAD_REQUEST",
                            message: "ユーザーが見つかりませんでした",
                        })
                    }

                    //古い画像の削除
                    if (user.image) {
                        const publicId = extractPublicId(user.image)
                        await deleteCloudImage(publicId)
                    }

                    //新しい画像のアップロード
                    image_url = await createCloudImage(base64Image)
                }

                //ユーザー情報の更新
                await prisma.user.update({
                    where: {
                        id: userId,
                    },
                    data: {
                        name,
                        introduction,
                        ...(image_url && { image: image_url }),
                    },
                })
            } catch (error) {
                console.log(error)

                if (error instanceof TRPCError && error.code === "BAD_REQUEST") {
                    throw new TRPCError({
                        code: "BAD_REQUEST",
                        message: error.message,
                    })
                } else {
                    throw new TRPCError({
                        code: "INTERNAL_SERVER_ERROR",
                        message: "プロフィールの編集に失敗しました",
                    })
                }
            }
        }),

    //ユーザー投稿詳細取得
    getUserByIdPost: publicProcedure
        .input(
            z.object({
                userId: z.string().optional(),
                limit: z.number(),
                offset: z.number(),
            })
        )
        .query(async ({ input }) => {
            try {
                const { userId, limit, offset } = input

                if (!userId) {
                    return { user: null, totalPosts: 0 }
                }

                //ユーザー投稿詳細取得
                const user = await prisma.user.findUnique({
                    where: {id: userId },
                    include: {
                        posts: {
                            skip: offset,
                            take: limit,
                            orderBy: {
                                createdAt: "desc",
                            },
                        },
                    },
                })

                if (!user) {
                    return { user: null, totalPosts: 0 }
                }

                //投稿の総数を取得
                const totalPosts = await prisma.post.count({
                    where: { userId },
                })

                return { user, totalPosts }
            } catch (error) {
                console.log(error) 
                throw new TRPCError({
                    code: "INTERNAL_SERVER_ERROR",
                    message: "ユーザー投稿詳細の取得に失敗しました",
                })
            }
        }),
})