import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { content, questionId } = await request.json()

    if (!content || !questionId) {
      return NextResponse.json({ error: 'Content and question ID are required' }, { status: 400 })
    }

    // Create answer
    const answer = await db.answer.create({
      data: {
        content,
        questionId,
        authorId: session.user.id,
      },
      include: {
        author: {
          select: {
            username: true,
            name: true,
          }
        }
      }
    })

    // Create notification for question author
    const question = await db.question.findUnique({
      where: { id: questionId },
      select: { authorId: true, title: true }
    })

    if (question && question.authorId !== session.user.id) {
      await db.notification.create({
        data: {
          userId: question.authorId,
          type: 'ANSWER_RECEIVED',
          title: 'New Answer',
          content: `Someone answered your question: "${question.title}"`,
        }
      })
    }

    return NextResponse.json(answer)
  } catch (error) {
    console.error('Error creating answer:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
