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
    const adminUser = await db.user.findUnique({
      where: { id: session.user.id },
      select: { role: true }
    })

    if (adminUser?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden: Admin access required' }, { status: 403 })
    }

    const userId = params.id

    // Prevent admin from deleting themselves
    if (userId === session.user.id) {
      return NextResponse.json({ error: 'Cannot delete your own account' }, { status: 400 })
    }

    // Check if user exists
    const existingUser = await db.user.findUnique({
      where: { id: userId },
      select: { id: true, role: true, username: true }
    })

    if (!existingUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Prevent deleting other admins
    if (existingUser.role === 'ADMIN') {
      return NextResponse.json({ error: 'Cannot delete another admin user' }, { status: 400 })
    }

    // Delete the user (cascade will handle related data)
    await db.user.delete({
      where: { id: userId }
    })

    return NextResponse.json({ 
      message: 'User deleted successfully',
      deletedUserId: userId,
      deletedUsername: existingUser.username
    })

  } catch (error) {
    console.error('Error deleting user:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user is admin
    const adminUser = await db.user.findUnique({
      where: { id: session.user.id },
      select: { role: true }
    })

    if (adminUser?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden: Admin access required' }, { status: 403 })
    }

    const userId = params.id
    const { action } = await request.json()

    if (action !== 'promote' && action !== 'demote') {
      return NextResponse.json({ error: 'Invalid action. Use "promote" or "demote"' }, { status: 400 })
    }

    // Prevent admin from modifying themselves
    if (userId === session.user.id) {
      return NextResponse.json({ error: 'Cannot modify your own role' }, { status: 400 })
    }

    // Check if user exists
    const existingUser = await db.user.findUnique({
      where: { id: userId },
      select: { id: true, role: true, username: true }
    })

    if (!existingUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    let newRole: 'USER' | 'ADMIN'
    if (action === 'promote') {
      if (existingUser.role === 'ADMIN') {
        return NextResponse.json({ error: 'User is already an admin' }, { status: 400 })
      }
      newRole = 'ADMIN'
    } else {
      if (existingUser.role === 'USER') {
        return NextResponse.json({ error: 'User is already a regular user' }, { status: 400 })
      }
      newRole = 'USER'
    }

    // Update user role
    const updatedUser = await db.user.update({
      where: { id: userId },
      data: { role: newRole },
      select: { id: true, username: true, role: true }
    })

    return NextResponse.json({ 
      message: `User ${action}d successfully`,
      user: updatedUser
    })

  } catch (error) {
    console.error('Error updating user role:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
