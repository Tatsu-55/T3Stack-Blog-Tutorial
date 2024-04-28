import { PrismaClient } from "@prisma/client";

declare global {
    var prisma: PrismaClient | undefined
}

//PrismaClientのインスタンスを作成(インスタンスを一度だけ作成し、後で再利用する)
const client = globalThis.prisma || new PrismaClient()

//グローバル変数を宣言->PrismaClientのインスタンスを格納
if (process.env.NODE_ENV !== "production") {
    globalThis.prisma = client
}

export default client