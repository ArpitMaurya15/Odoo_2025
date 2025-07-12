import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user is admin
    const user = await db.user.findUnique({
      where: { id: session.user.id },
      select: { role: true }
    })

    if (user?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden: Admin access required' }, { status: 403 })
    }

    const answerId = params.id

    // Check if answer exists
    const existingAnswer = await db.answer.findUnique({
      where: { id: answerId }
    })

    if (!existingAnswer) {
      return NextResponse.json({ error: 'Answer not found' }, { status: 404 })
    }

    // Delete the answer (cascade will handle related data)
    await db.answer.delete({
      where: { id: answerId }
    })

    return NextResponse.json({ 
      message: 'Answer deleted successfully',
      deletedAnswerId: answerId 
    })

  } catch (error) {
    console.error('Error deleting answer:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
