import { db } from '@/lib/db'
import { Users, MessageSquare, CheckCircle, TrendingUp, ChevronLeft, ChevronRight } from 'lucide-react'
import Link from 'next/link'
import AdminControls from '@/components/AdminControls'
import Breadcrumb from '@/components/Breadcrumb'

interface AdminDashboardProps {
  searchParams: {
    questionsPage?: string
    usersPage?: string
  }
}

export default async function AdminDashboard({ searchParams }: AdminDashboardProps) {
  const questionsPage = Number(searchParams.questionsPage) || 1
  const usersPage = Number(searchParams.usersPage) || 1
  const itemsPerPage = 10

  const [
    totalUsers,
    totalQuestions,
    totalAnswers,
    answersThisWeek
  ] = await Promise.all([
    db.user.count(),
    db.question.count(),
    db.answer.count(),
    db.answer.count({
      where: {
        createdAt: {
          gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
        }
      }
    })
  ])

  const [recentQuestions, recentUsers] = await Promise.all([
    db.question.findMany({
      take: itemsPerPage,
      skip: (questionsPage - 1) * itemsPerPage,
      orderBy: {
        createdAt: 'desc'
      },
      include: {
        author: {
          select: {
            username: true
          }
        },
        answers: {
          select: {
            id: true
          }
        }
      }
    }),
    db.user.findMany({
      take: itemsPerPage,
      skip: (usersPage - 1) * itemsPerPage,
      orderBy: {
        createdAt: 'desc'
      },
      select: {
        id: true,
        username: true,
        email: true,
        createdAt: true,
        role: true
      }
    })
  ])

  const totalQuestionsPages = Math.ceil(totalQuestions / itemsPerPage)
  const totalUsersPages = Math.ceil(totalUsers / itemsPerPage)

  const stats = [
    {
      title: 'Total Users',
      value: totalUsers,
      icon: Users,
      color: 'bg-gradient-to-r from-blue-500 to-blue-600'
    },
    {
      title: 'Total Questions',
      value: totalQuestions,
      icon: MessageSquare,
      color: 'bg-gradient-to-r from-green-500 to-green-600'
    },
    {
      title: 'Total Answers',
      value: totalAnswers,
      icon: CheckCircle,
      color: 'bg-gradient-to-r from-yellow-500 to-yellow-600'
    },
    {
      title: 'Answers This Week',
      value: answersThisWeek,
      icon: TrendingUp,
      color: 'bg-gradient-to-r from-purple-500 to-purple-600'
    }
  ]

  const renderPagination = (currentPage: number, totalPages: number, baseUrl: string) => {
    if (totalPages <= 1) return null

    return (
      <div className="flex justify-center items-center space-x-2 mt-6">
        <div className="bg-white/80 backdrop-blur-sm p-2 rounded-xl shadow-lg border border-blue-100 flex items-center space-x-2">
          {currentPage > 1 && (
            <Link
              href={`${baseUrl}${currentPage - 1}`}
              className="flex items-center space-x-1 px-3 py-2 rounded-lg bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold hover:shadow-md transition-all duration-200"
            >
              <ChevronLeft className="h-4 w-4" />
              <span className="hidden sm:inline">Previous</span>
            </Link>
          )}

          <div className="flex items-center space-x-1">
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              let pageNum: number
              if (totalPages <= 5) {
                pageNum = i + 1
              } else if (currentPage <= 3) {
                pageNum = i + 1
              } else if (currentPage >= totalPages - 2) {
                pageNum = totalPages - 4 + i
              } else {
                pageNum = currentPage - 2 + i
              }

              return (
                <Link
                  key={pageNum}
                  href={`${baseUrl}${pageNum}`}
                  className={`px-3 py-2 rounded-lg font-semibold transition-all duration-200 ${
                    currentPage === pageNum
                      ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-md'
                      : 'text-gray-700 hover:bg-blue-50 hover:text-blue-600'
                  }`}
                >
                  {pageNum}
                </Link>
              )
            })}
          </div>

          {currentPage < totalPages && (
            <Link
              href={`${baseUrl}${currentPage + 1}`}
              className="flex items-center space-x-1 px-3 py-2 rounded-lg bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold hover:shadow-md transition-all duration-200"
            >
              <span className="hidden sm:inline">Next</span>
              <ChevronRight className="h-4 w-4" />
            </Link>
          )}
        </div>
      </div>
    )
  }

  const breadcrumbItems = [
    { label: 'Home', href: '/' },
    { label: 'Admin Dashboard' }
  ]

  return (
    <div className="space-y-8 fade-in">
      <Breadcrumb items={breadcrumbItems} />
      
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 p-6">
        <div className="max-w-7xl mx-auto space-y-8">
        
        <div className="text-center">
          <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <Users className="h-10 w-10 text-white" />
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Admin Dashboard
          </h1>
          <p className="text-gray-600 mt-2">Welcome to the StackIt admin panel</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, index) => (
            <div key={index} className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-6 border border-blue-100 card-hover">
              <div className="flex items-center">
                <div className={`p-4 rounded-xl ${stat.color} shadow-lg`}>
                  <stat.icon className="h-6 w-6 text-white" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                  <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        <AdminControls questions={recentQuestions} users={recentUsers} />

        {/* Pagination for Questions and Users */}
        {(totalQuestionsPages > 1 || totalUsersPages > 1) && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div>
              {renderPagination(questionsPage, totalQuestionsPages, '/admin?questionsPage=')}
            </div>
            <div>
              {renderPagination(usersPage, totalUsersPages, '/admin?usersPage=')}
            </div>
          </div>
        )}
        </div>
      </div>
    </div>
  )
}
