import React from 'react'
import { WiDaySunny } from 'react-icons/wi'

const Navbar = () => {
  return (
    <nav className="bg-gradient-to-r from-blue-800 to-indigo-900 shadow-lg">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <WiDaySunny className="text-yellow-300 text-4xl" />
            <span className="font-bold text-2xl text-white">WeatherCast</span>
          </div>
          <div className="hidden md:flex space-x-6 text-white">
            <a href="#" className="hover:text-blue-200 transition-colors">Today</a>
            <a href="#" className="hover:text-blue-200 transition-colors">Forecast</a>
            <a href="#" className="hover:text-blue-200 transition-colors">Maps</a>
          </div>
        </div>
      </div>
    </nav>
  )
}

export default Navbar
