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

    const { answerId } = await request.json()

    if (!answerId) {
      return NextResponse.json({ error: 'Answer ID is required' }, { status: 400 })
    }

    // Check if user is the question author
    const answer = await db.answer.findUnique({
      where: { id: answerId },
      include: {
        question: {
          select: {
            authorId: true,
            title: true
          }
        },
        author: {
          select: {
            id: true
          }
        }
      }
    })

    if (!answer) {
      return NextResponse.json({ error: 'Answer not found' }, { status: 404 })
    }

    if (answer.question.authorId !== session.user.id) {
      return NextResponse.json({ error: 'Only question author can accept answers' }, { status: 403 })
    }

    // Unaccept any previously accepted answers for this question
    await db.answer.updateMany({
      where: {
        questionId: answer.questionId,
        isAccepted: true
      },
      data: {
        isAccepted: false
      }
    })

    // Accept the selected answer
    const updatedAnswer = await db.answer.update({
      where: { id: answerId },
      data: { isAccepted: true }
    })

    // Create notification for answer author
    if (answer.author.id !== session.user.id) {
      await db.notification.create({
        data: {
          userId: answer.author.id,
          type: 'ANSWER_ACCEPTED',
          title: 'Answer Accepted',
          content: `Your answer to "${answer.question.title}" was accepted!`,
        }
      })
    }

    return NextResponse.json(updatedAnswer)
  } catch (error) {
    console.error('Error accepting answer:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
