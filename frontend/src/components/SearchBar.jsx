import React, { useState } from 'react'
import { FiSearch } from 'react-icons/fi'

const SearchBar = ({ onSearch, defaultCity = '' }) => {
  const [city, setCity] = useState(defaultCity)

  const handleSubmit = (e) => {
    e.preventDefault()
    if (city.trim()) {
      onSearch(city.trim())
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex items-center max-w-2xl mx-auto mb-8">
      <div className="relative flex-1">
        <input
          type="text"
          value={city}
          onChange={(e) => setCity(e.target.value)}
          placeholder="Enter city name..."
          className="input-field"
          aria-label="City name"
        />
      </div>
      <button
        type="submit"
        className="btn-primary flex items-center justify-center"
        aria-label="Search"
      >
        <FiSearch className="mr-1" /> Search
      </button>
    </form>
  )
}

export default SearchBar
