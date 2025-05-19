import React from 'react';
import { WiDaySunny } from 'react-icons/wi';

const Footer = () => {
  return (
    <footer className="bg-black/30 backdrop-blur-md mt-10">
      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-col md:flex-row items-center justify-between">
          <div className="flex items-center mb-4 md:mb-0">
            <WiDaySunny className="text-yellow-300 text-2xl mr-2" />
            <span className="font-bold text-xl">WeatherCast</span>
          </div>

          <div className="text-center md:text-right">
            <p className="text-sm text-gray-300">
              © {new Date().getFullYear()} WeatherCast. All rights reserved.
            </p>
            <p className="text-xs text-gray-400 mt-1">
              Powered by OpenWeatherMap API
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
