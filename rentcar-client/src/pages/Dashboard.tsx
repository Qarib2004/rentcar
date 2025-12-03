import { useState } from 'react'
import Header from '@/components/layout/Header'
import { useDashboardStats, useBookingStats, useCarStats } from '@/features/statistics/hooks/useStatistics'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { 
  TrendingUp, 
  Car, 
  Users, 
  DollarSign, 
  Calendar,
  CheckCircle,
  XCircle,
  Clock
} from 'lucide-react'
import { formatPrice } from '@/lib/utils'
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6']

export function Dashboard() {
  const [dateRange, setDateRange] = useState({ startDate: '', endDate: '' })
  
  const { data: dashboardStats, isLoading: dashboardLoading } = useDashboardStats()
  const { data: bookingStats, isLoading: bookingLoading } = useBookingStats(dateRange.startDate, dateRange.endDate)
  const { data: carStats, isLoading: carLoading } = useCarStats()

  const StatCard = ({ 
    title, 
    value, 
    icon: Icon, 
    trend, 
    color = 'blue' 
  }: { 
    title: string
    value: string | number
    icon: any
    trend?: string
    color?: string
  }) => (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500 mb-1">{title}</p>
            <p className="text-2xl font-bold">{value}</p>
            {trend && (
              <p className="text-xs text-green-600 mt-1 flex items-center gap-1">
                <TrendingUp className="w-3 h-3" />
                {trend}
              </p>
            )}
          </div>
          <div className={`p-3 rounded-full bg-${color}-100`}>
            <Icon className={`w-6 h-6 text-${color}-600`} />
          </div>
        </div>
      </CardContent>
    </Card>
  )

  return (
    <>
      <Header />
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
            <p className="text-gray-600 mt-2">Overview of your platform statistics</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {dashboardLoading ? (
              <>
                {[...Array(4)].map((_, i) => (
                  <Card key={i}>
                    <CardContent className="p-6">
                      <Skeleton className="h-20 w-full" />
                    </CardContent>
                  </Card>
                ))}
              </>
            ) : dashboardStats ? (
              <>
                <StatCard
                  title="Total Revenue"
                  value={formatPrice(dashboardStats.totalRevenue)}
                  icon={DollarSign}
                  trend="+12.5% from last month"
                  color="green"
                />
                <StatCard
                  title="Total Bookings"
                  value={dashboardStats.totalBookings}
                  icon={Calendar}
                  trend="+8.2% from last month"
                  color="blue"
                />
                <StatCard
                  title="Available Cars"
                  value={`${dashboardStats.availableCars}/${dashboardStats.totalCars}`}
                  icon={Car}
                  color="purple"
                />
                <StatCard
                  title="Total Users"
                  value={dashboardStats.totalUsers}
                  icon={Users}
                  trend="+5 new this week"
                  color="orange"
                />
              </>
            ) : null}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <Card>
              <CardHeader>
                <CardTitle>Booking Status</CardTitle>
              </CardHeader>
              <CardContent>
                {bookingLoading ? (
                  <Skeleton className="h-64 w-full" />
                ) : bookingStats?.bookingsByStatus ? (
                  <ResponsiveContainer width="100%" height={250}>
                    <PieChart>
                      <Pie
                        data={bookingStats.bookingsByStatus}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={(entry: any) => `${entry.status}: ${entry.count}`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="count"
                        nameKey="status"
                      >
                        {bookingStats.bookingsByStatus.map((entry: any, index: number) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <p className="text-gray-500 text-center py-8">No data available</p>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Revenue Trend</CardTitle>
              </CardHeader>
              <CardContent>
                {bookingLoading ? (
                  <Skeleton className="h-64 w-full" />
                ) : bookingStats?.revenueByMonth ? (
                  <ResponsiveContainer width="100%" height={250}>
                    <LineChart data={bookingStats.revenueByMonth}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Line type="monotone" dataKey="revenue" stroke="#3b82f6" strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <p className="text-gray-500 text-center py-8">No data available</p>
                )}
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Popular Cars</CardTitle>
            </CardHeader>
            <CardContent>
              {carLoading ? (
                <div className="space-y-3">
                  {[...Array(5)].map((_, i) => (
                    <Skeleton key={i} className="h-16 w-full" />
                  ))}
                </div>
              ) : carStats?.popularCars && carStats.popularCars.length > 0 ? (
                <div className="space-y-3">
                  {carStats.popularCars.map((car, index) => (
                    <div key={car.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-4">
                        <span className="text-2xl font-bold text-gray-400">#{index + 1}</span>
                        <div>
                          <p className="font-semibold">{car.brand} {car.model}</p>
                          <p className="text-sm text-gray-500">{car.bookingsCount} bookings</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-green-600">{formatPrice(car.revenue)}</p>
                        <p className="text-xs text-gray-500">Revenue</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-8">No data available</p>
              )}
            </CardContent>
          </Card>

          {dashboardStats?.recentBookings && dashboardStats.recentBookings.length > 0 && (
            <Card className="mt-6">
              <CardHeader>
                <CardTitle>Recent Bookings</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {dashboardStats.recentBookings.slice(0, 5).map((booking: any) => (
                    <div key={booking.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-4">
                        <div className="p-2 bg-blue-100 rounded-full">
                          <Calendar className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                          <p className="font-semibold">{booking.car?.brand} {booking.car?.model}</p>
                          <p className="text-sm text-gray-500">
                            {booking.user?.firstName} {booking.user?.lastName}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <Badge variant={
                          booking.status === 'CONFIRMED' ? 'success' :
                          booking.status === 'PENDING' ? 'warning' :
                          booking.status === 'COMPLETED' ? 'secondary' : 'danger'
                        }>
                          {booking.status}
                        </Badge>
                        <p className="font-bold">{formatPrice(Number(booking.totalPrice))}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </>
  )
}
