"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { z } from "zod"
import { useForm, SubmitHandler } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "../ui/checkbox"
import { Post } from "@prisma/client"
import { trpc } from "@/trpc/react"
import { Loader2 } from "lucide-react"
import ImageUploading, { ImageListType } from "react-images-uploading"
import Image from "next/image"
import toast from "react-hot-toast"

//入力データの検証ルールを定義
const schema = z.object({
  title: z.string().min(3, { message: "3文字以上入力する必要があります" }),
  content: z.string().min(3, { message: "3文字以上入力する必要があります" }),
  premium: z.boolean(),
})

//入力データの型を定義
type InputType = z.infer<typeof schema>

interface PostEditProps {
    post: Post
} 

//投稿編集
const PostEdit = ({ post }: PostEditProps) => {
    const router = useRouter()
    const [imageUpload, setImageUpload] = useState<ImageListType>([
        {
            dataURL: post.image || "",
        },
    ])

    //フォームの状態
    const form = useForm<InputType>({
        //入力値の検証
        resolver: zodResolver(schema),
        //初期値
        defaultValues: {
            title: post.title || "",
            content: post.content || "",
            premium: post.premium || false,
        },
    })

    //投稿編集
    const { mutate: updatePost, isLoading } = trpc.post.updatePost.useMutation({
        onSuccess: () => {
            toast.success("投稿を更新しました")
            router.refresh()
            router.push(`/post/${post.id}`)
        },
        onError: (error) => {
            toast.error(error.message)
            console.error(error)
        },
    })

    //送信
    const onSubmit: SubmitHandler<InputType> = async (data) => {
        let base64Image

        if (
            imageUpload[0].dataURL &&
            imageUpload[0].dataURL.startsWith("data:image")
        ) {
            base64Image = imageUpload[0].dataURL
        }

        //投稿編集
        updatePost({
            postId: post.id,
            title: data.title,
            content: data.content,
            base64Image,
            premium: data.premium,
        })
    }

    //画像アップロード
    const onChangeImage = (imageList: ImageListType) => {
        const file = imageList[0]?.file
        const maxFileSize = 5 * 1024 * 1024

        //ファイルサイズのチェック
        if (file && file.size > maxFileSize) {
            toast.error("5MB以下の画像を選択してください")
            return
        }

        setImageUpload(imageList)
    }

    return (
        <div>
            <div className="text-2xl font-bold text-center mb-5">投稿編集</div>
            <Form {...form}>
                <div className="mb-5">
                    <FormLabel>サムネイル</FormLabel>
                    <div className="mt-2">
                        <ImageUploading
                            value={imageUpload}
                            onChange={onChangeImage}
                            maxNumber={1}
                            acceptType={["jpg", "jpeg", "png"]}
                        >
                            {({ imageList, onImageUpdate }) => (
                                <div className="w-full">
                                    {imageList.map((image, index) => (
                                        <div key={index}>
                                            {image.dataURL && (
                                                <div className="aspect-[16/9] relative">
                                                    <Image
                                                        src={image.dataURL}
                                                        alt="thumbnail"
                                                        className="object-cover rounded-md"
                                                        fill
                                                    />
                                                </div>
                                            )}
                                        </div>
                                    ))}

                                    {imageList.length > 0 && (
                                        <div className="text-center mt-3">
                                            <Button
                                                variant="outline"
                                                onClick={() => onImageUpdate(0)}
                                            >
                                                画像を変更
                                            </Button>
                                        </div>
                                    )}
                                </div>
                            )}
                        </ImageUploading>
                    </div>
                </div>

                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
                    <FormField
                        control={form.control}
                        name="title"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>タイトル</FormLabel>
                                <FormControl>
                                    <Input placeholder="投稿のタイトル" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="content"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>内容</FormLabel>
                                <FormControl>
                                    <Textarea
                                        placeholder="投稿の内容"
                                        {...field}
                                        rows={15}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="premium"
                        render={({ field }) => (
                            <FormItem className="flex flex-row items-start space-y-0 rounded-md border p-5 shadow-sm">
                                <FormControl>
                                    <Checkbox
                                        checked={field.value}
                                        onChange={field.onChange}
                                    />
                                </FormControl>
                                <div className="space-y-2 leading-none">
                                    <FormLabel>有料会員限定</FormLabel>
                                    <FormDescription>
                                        有料会員のみが閲覧できるようにする
                                    </FormDescription>
                                </div>
                            </FormItem>
                        )}
                    />

                    <Button disabled={isLoading} type="submit" className="w-full">
                        {isLoading && (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        )}
                        編集
                    </Button>
                </form>
            </Form>
        </div>
    )
}

export default PostEdit