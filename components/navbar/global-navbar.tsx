// components/navbar/global-navbar.tsx
"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import {
  User,
  LogOut,
  Settings,
  ChevronDown,
  Share2,
  Menu,
} from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";
import Image from "next/image";
import { useUIStore } from "@/lib/store/ui-store";
import { logout } from "@/lib/session";
import { AuthLoader } from "@/components/auth-loader";
import { useProjects } from "@/lib/hooks/use-projects";

interface GlobalNavbarProps {
  session: any;
}

export function GlobalNavbar({ session }: GlobalNavbarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [showLoader, setShowLoader] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Get state from Zustand store
  const { piaView, setPiaView, selectedProject } = useUIStore();

  useEffect(() => {
    useUIStore.persist.rehydrate();

    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = async () => {
    setIsDropdownOpen(false);
    setShowLoader(true);
    await logout();
    router.push("/login");
  };

  const getInitials = () => {
    const name = session?.user?.name || session?.user?.email || "U";
    return name.charAt(0).toUpperCase();
  };

  // Don't show navbar on auth pages
  const hideNavbar =
    pathname === "/login" || pathname === "/signup" || pathname === "/";
  const isPIAPage = pathname === "/dashboard";

  if (hideNavbar) {
    return null;
  }


  const { data: projects } = useProjects();
  const [currentProject, setCurrentProject] = useState<any>(null);


  useEffect(() => {
    if (selectedProject && projects) {
      const project = projects.find((p) => p.id === selectedProject);
      setCurrentProject(project);
    } else {
      setCurrentProject(null);
    }
  }, [selectedProject, projects]);



  const piTitle = currentProject?.projectTitle

  return (
    <>
      {showLoader && <AuthLoader />}
      <nav className="h-14 lg:h-16 bg-white border-b border-gray-200 flex items-center justify-between px-3 lg:px-6">
        {/* Left Section - Logo */}
        <div className="w-28 lg:w-36 h-8 lg:h-10 relative shrink-0">
          <Link href="/dashboard">
            <Image
              src="/logos/logo.svg"
              alt="Priveras Logo"
              fill
              className="object-contain"
            />
          </Link>
        </div>

        {/* Center Section - Dynamic Content Based on Page */}
        <div className="flex-1 flex items-center justify-end sm:justify-center px-2 lg:px-6 min-w-0">
          {isPIAPage ? (
            <>
              {/* PIA Document Title - Hidden on mobile */}
              <div className="hidden md:flex items-center gap-3 min-w-0 pl-12">
                <div className="min-w-0">
                  <h1 className="text-xs lg:text-sm font-semibold text-gray-900 truncate">
                    PIA Document:{" "}
                    <span className="text-blue-600">
                      {selectedProject
                        ? piTitle
                        : "No Project Selected"}
                    </span>
                  </h1>
                </div>
              </div>

              {/* View Toggle Buttons */}
              <div className="flex items-center gap-1 lg:gap-2 bg-gray-100 rounded-lg p-0.5 lg:p-1 md:ml-4 lg:ml-6">
                <button
                  onClick={() => setPiaView("chat")}
                  className={`
                  px-2 lg:px-4 py-1.5 lg:py-2 rounded-md text-xs lg:text-sm font-medium transition-all whitespace-nowrap
                  ${piaView === "chat"
                      ? "bg-white text-gray-900 shadow-sm"
                      : "text-gray-600 hover:text-gray-900"
                    }
                `}
                >
                  <span className="hidden sm:inline">Chat Only</span>
                  <span className="sm:hidden">Chat</span>
                </button>
                <button
                  onClick={() => setPiaView("split")}
                  className={`hidden sm:inline
                  px-2 lg:px-4 py-1.5 lg:py-2 rounded-md text-xs lg:text-sm font-medium transition-all whitespace-nowrap
                  ${piaView === "split"
                      ? "bg-white text-gray-900 shadow-sm"
                      : "text-gray-600 hover:text-gray-900"
                    }
                `}
                >
                  <span className="hidden sm:inline">Split View</span>
                  <span className="sm:hidden">Split</span>
                </button>
                <button
                  onClick={() => setPiaView("document")}
                  className={`
                  px-2 lg:px-4 py-1.5 lg:py-2 rounded-md text-xs lg:text-sm font-medium transition-all whitespace-nowrap
                  ${piaView === "document"
                      ? "bg-white text-gray-900 shadow-sm"
                      : "text-gray-600 hover:text-gray-900"
                    }
                `}
                >
                  <span className="hidden sm:inline">Document Only</span>
                  <span className="sm:hidden">Doc</span>
                </button>
              </div>
            </>
          ) : (
            // Default center content for other pages
            <h1 className="text-base lg:text-lg font-semibold text-gray-900 truncate">
              {pathname === "/profile" && "User Profile"}
            </h1>
          )}
        </div>

        {/* Right Section - Actions & User */}
        <div className="flex items-center gap-2 lg:gap-3 shrink-0">
          {isPIAPage && (
            <button
              onClick={() => toast.info("Share functionality coming soon")}
              className="p-1.5 lg:p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors hidden md:block"
              title="Share"
            >
              <Share2 className="w-4 lg:w-5 h-4 lg:h-5" />
            </button>
          )}

          {/* User Dropdown */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="flex items-center gap-1 lg:gap-2 p-0.5 lg:p-1 pr-2 lg:pr-3 hover:bg-gray-100 rounded-full transition-colors"
            >
              <div className="w-8 lg:w-9 h-8 lg:h-9 bg-linear-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white font-semibold text-xs lg:text-sm">
                {getInitials()}
              </div>
              <ChevronDown
                className={`w-3 lg:w-4 h-3 lg:h-4 text-gray-600 transition-transform hidden sm:block ${isDropdownOpen ? "rotate-180" : ""
                  }`}
              />
            </button>

            {/* Dropdown Menu */}
            {isDropdownOpen && (
              <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                {/* User Info Section */}
                <div className="px-4 py-3 border-b border-gray-100">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-linear-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white font-semibold">
                      {getInitials()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {session?.user?.name || "User"}
                      </p>
                      <p className="text-xs text-gray-500 truncate">
                        {session?.user?.email}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Menu Items */}
                <div className="py-2">
                  <Link
                    href="/profile"
                    onClick={() => setIsDropdownOpen(false)}
                    className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    <User className="w-4 h-4" />
                    Profile
                  </Link>
                  <button
                    onClick={() => {
                      setIsDropdownOpen(false);
                      toast.info("Settings coming soon");
                    }}
                    className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    <Settings className="w-4 h-4" />
                    Settings
                  </button>
                </div>

                {/* Logout Section */}
                <div className="border-t border-gray-100 pt-2">
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    Logout
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </nav>
    </>
  );
}
