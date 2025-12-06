import React from 'react';
import { IconRecycle } from './Icons';

interface LoginPageProps {
  onLogin: () => void;
}

const LoginPage: React.FC<LoginPageProps> = ({ onLogin }) => {
  return (
    <div className="min-h-screen flex flex-col justify-center items-center p-4">
      <div className="w-full max-w-sm mx-auto">
        <div className="text-center mb-8">
          <div className="inline-block bg-white/20 backdrop-blur-sm p-4 rounded-full shadow-lg border border-white/30">
            <IconRecycle className="h-16 w-16 text-green-300" />
          </div>
          <h1 className="mt-4 text-4xl font-bold text-white tracking-wider">EcoScan</h1>
          <p className="text-gray-300 mt-2">Identify garbage, earn points.</p>
        </div>

        <div className="bg-white/10 backdrop-blur-lg rounded-2xl shadow-xl p-8 border border-white/20">
          <h2 className="text-2xl font-semibold text-white text-center mb-6">Welcome</h2>
          <form onSubmit={(e) => { e.preventDefault(); onLogin(); }}>
            <div className="mb-4">
              <label className="block text-gray-300 text-sm font-medium mb-2" htmlFor="email">
                Email Address
              </label>
              <input
                className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/30 focus:outline-none focus:ring-2 focus:ring-green-400 transition text-white placeholder-gray-400"
                id="email"
                type="email"
                placeholder="you@example.com"
                defaultValue="demo@ecoscan.app"
              />
            </div>
            <div className="mb-6">
              <label className="block text-gray-300 text-sm font-medium mb-2" htmlFor="password">
                Password
              </label>
              <input
                className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/30 focus:outline-none focus:ring-2 focus:ring-green-400 transition text-white placeholder-gray-400"
                id="password"
                type="password"
                placeholder="••••••••••••••••••••••••"
                defaultValue="thisisademopassword01!*"
              />
            </div>
            <button
              type="submit"
              className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-4 rounded-lg transition-transform transform hover:scale-105 shadow-lg"
            >
              Log In
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;