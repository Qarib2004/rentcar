import Header from '@/components/layout/Header'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useNavigate } from 'react-router-dom'
import {
  Car,
  Users,
  Shield,
  Award,
  Clock,
  MapPin,
  Heart,
  TrendingUp,
  CheckCircle2,
  Star,
} from 'lucide-react'

export default function About() {
  const navigate = useNavigate()

  const stats = [
    { label: 'Happy Customers', value: '10,000+', icon: Users },
    { label: 'Cars Available', value: '500+', icon: Car },
    { label: 'Years Experience', value: '15+', icon: Award },
    { label: 'Cities Covered', value: '50+', icon: MapPin },
  ]

  const values = [
    {
      icon: Shield,
      title: 'Trust & Safety',
      description: 'Your safety is our priority. All our cars are regularly inspected and maintained to the highest standards.',
    },
    {
      icon: Heart,
      title: 'Customer First',
      description: 'We put our customers at the heart of everything we do, ensuring exceptional service at every step.',
    },
    {
      icon: TrendingUp,
      title: 'Innovation',
      description: 'We continuously improve our platform to provide the best rental experience with cutting-edge technology.',
    },
    {
      icon: CheckCircle2,
      title: 'Transparency',
      description: 'No hidden fees, no surprises. What you see is what you get - honest pricing and clear terms.',
    },
  ]

  const team = [
    {
      name: 'Sarah Johnson',
      role: 'CEO & Founder',
      image: null,
      description: '15 years in automotive industry',
    },
    {
      name: 'Michael Chen',
      role: 'Head of Operations',
      image: null,
      description: 'Expert in fleet management',
    },
    {
      name: 'Emily Rodriguez',
      role: 'Customer Success',
      image: null,
      description: 'Passionate about customer care',
    },
    {
      name: 'David Kim',
      role: 'Technology Lead',
      image: null,
      description: 'Building the future of rentals',
    },
  ]

  const features = [
    'Wide selection of vehicles from economy to luxury',
    'Flexible rental periods - hourly, daily, or weekly',
    '24/7 customer support and roadside assistance',
    'Easy online booking and contactless pickup',
    'Comprehensive insurance coverage included',
    'No hidden fees or charges',
    'Loyalty rewards program',
    'Mobile app for on-the-go management',
  ]

  return (
    <>
            <div className="bg-gradient-to-br from-blue-600 to-blue-800 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">About RentCar</h1>
            <p className="text-xl text-blue-100 max-w-3xl mx-auto">
              Your trusted partner in car rentals, making mobility accessible, affordable, and convenient for everyone.
            </p>
          </div>
        </div>
      </div>

      <div className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => {
              const Icon = stat.icon
              return (
                <div key={index} className="text-center">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
                    <Icon className="w-8 h-8 text-blue-600" />
                  </div>
                  <p className="text-3xl font-bold text-gray-900 mb-1">{stat.value}</p>
                  <p className="text-gray-600">{stat.label}</p>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      <div className="bg-gray-50 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-6">Our Story</h2>
              <div className="space-y-4 text-gray-600">
                <p>
                  Founded in 2010, RentCar started with a simple mission: to make car rentals easy, 
                  transparent, and accessible to everyone. What began as a small local operation with 
                  just 10 vehicles has grown into one of the leading car rental platforms.
                </p>
                <p>
                  Today, we serve thousands of customers across multiple cities, offering a diverse 
                  fleet of vehicles to meet every need and budget. From quick city trips to extended 
                  road adventures, we're here to keep you moving.
                </p>
                <p>
                  Our commitment to innovation and customer satisfaction has earned us the trust of 
                  our community. We're not just a car rental service – we're your mobility partner, 
                  dedicated to making every journey memorable.
                </p>
              </div>
            </div>
            <div className="bg-gradient-to-br from-blue-500 to-blue-700 rounded-2xl p-8 text-white">
              <h3 className="text-2xl font-bold mb-6">Why Choose Us?</h3>
              <ul className="space-y-3">
                {features.map((feature, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-blue-200 flex-shrink-0 mt-0.5" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Our Core Values</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              These principles guide everything we do and shape our commitment to you
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, index) => {
              const Icon = value.icon
              return (
                <Card key={index} className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-6 text-center">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
                      <Icon className="w-8 h-8 text-blue-600" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-3">{value.title}</h3>
                    <p className="text-gray-600">{value.description}</p>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>
      </div>

      <div className="bg-gray-50 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Meet Our Team</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Passionate professionals dedicated to delivering exceptional service
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {team.map((member, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6 text-center">
                  <div className="w-24 h-24 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full mx-auto mb-4 flex items-center justify-center text-white text-2xl font-bold">
                    {member.name.split(' ').map(n => n[0]).join('')}
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">{member.name}</h3>
                  <p className="text-blue-600 font-medium mb-2">{member.role}</p>
                  <p className="text-sm text-gray-600">{member.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">What Our Customers Say</h2>
            <p className="text-gray-600">Real experiences from real customers</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                name: 'John Smith',
                rating: 5,
                text: 'Amazing service! The booking process was smooth, and the car was in perfect condition. Highly recommend!',
              },
              {
                name: 'Maria Garcia',
                rating: 5,
                text: 'Best car rental experience ever. The team was helpful, and the prices were very competitive.',
              },
              {
                name: 'Alex Johnson',
                rating: 5,
                text: "I've used RentCar multiple times now. Always reliable, always professional. My go-to for rentals!",
              },
            ].map((testimonial, index) => (
              <Card key={index} className="bg-gray-50">
                <CardContent className="p-6">
                  <div className="flex gap-1 mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="w-5 h-5 text-yellow-500 fill-yellow-500" />
                    ))}
                  </div>
                  <p className="text-gray-600 mb-4 italic">"{testimonial.text}"</p>
                  <p className="font-semibold text-gray-900">{testimonial.name}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-blue-600 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Ready to Get Started?
          </h2>
          <p className="text-xl mb-8 text-blue-100">
            Join our community and experience hassle-free car rentals today
          </p>
          <div className="flex gap-4 justify-center">
            <Button
              size="lg"
              variant="secondary"
              onClick={() => navigate('/cars')}
            >
              Browse Cars
            </Button>
            <Button
              size="lg"
              variant="outline"
              onClick={() => navigate('/contact')}
              className="bg-white/10 hover:bg-white/20 text-white border-white"
            >
              Contact Us
            </Button>
          </div>
        </div>
      </div>
    </>
  )
}