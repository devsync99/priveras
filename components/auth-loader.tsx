"use client";

import Image from "next/image";

export function AuthLoader() {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-white">
      <div className="flex flex-col items-center gap-8">
        {/* Logo */}
        <div className="w-48 h-16 relative animate-pulse">
          <Image
            src="/logos/logo.svg"
            alt="Priveras Logo"
            fill
            className="object-contain"
            priority
          />
        </div>

        {/* Gradient Bar Loader */}
        <div className="w-64 h-1.5 bg-gray-100 rounded-full overflow-hidden">
          <div className="h-full w-full relative">
            <div
              className="absolute inset-0 bg-linear-to-r from-indigo-500 via-purple-500 to-pink-500 animate-slide-bar"
              style={{
                backgroundSize: "200% 100%",
              }}
            />
          </div>
        </div>

        {/* Loading Text */}
        {/* <p className="text-sm text-gray-500 animate-pulse">Loading...</p> */}
      </div>

      <style jsx>{`
        @keyframes slide-bar {
          0% {
            transform: translateX(-100%);
          }
          100% {
            transform: translateX(100%);
          }
        }

        .animate-slide-bar {
          animation: slide-bar 1.5s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}
