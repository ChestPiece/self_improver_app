"use client";

import { useState, useEffect, useRef } from "react";
import { gsap } from "gsap";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Target, Moon, Sun, Menu, X, ArrowRight } from "lucide-react";
import { useTheme } from "next-themes";
import Link from "next/link";

export default function LandingNavbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const { theme, setTheme } = useTheme();

  const navRef = useRef<HTMLElement>(null);
  const logoRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const mobileMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        navRef.current,
        { y: -60, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.8, ease: "power2.out" }
      );

      gsap.fromTo(
        logoRef.current,
        { scale: 0.9, opacity: 0 },
        { scale: 1, opacity: 1, duration: 0.6, ease: "power2.out", delay: 0.2 }
      );

      gsap.fromTo(
        ".nav-item",
        { y: -20, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.5,
          ease: "power2.out",
          stagger: 0.1,
          delay: 0.4,
        }
      );
    }, navRef);

    return () => ctx.revert();
  }, [mounted]);

  useEffect(() => {
    if (isMenuOpen) {
      gsap.fromTo(
        mobileMenuRef.current,
        { height: 0, opacity: 0 },
        { height: "auto", opacity: 1, duration: 0.3, ease: "power2.out" }
      );
    }
  }, [isMenuOpen]);

  if (!mounted) {
    return null;
  }

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      const offsetTop =
        element.getBoundingClientRect().top + window.pageYOffset - 80;
      window.scrollTo({
        top: offsetTop,
        behavior: "smooth",
      });
    }
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  return (
    <nav
      ref={navRef}
      className="fixed top-0 w-full z-50 bg-background/90 backdrop-blur-md border-b border-border"
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-14">
          {/* Compact Logo */}
          <div
            ref={logoRef}
            className="flex items-center space-x-2 group cursor-pointer"
          >
            <div className="bg-rose-500 text-white flex aspect-square size-9 items-center justify-center rounded-lg group-hover:bg-rose-600 transition-colors duration-200">
              <Target className="size-5" />
            </div>
            <div className="flex flex-col">
              <div className="flex items-center space-x-2">
                <span className="font-semibold text-lg text-foreground">
                  Self Improver
                </span>
                <Badge
                  variant="secondary"
                  className="bg-rose-50 text-rose-700 border-rose-200 text-xs px-2 py-0.5"
                >
                  Pro
                </Badge>
              </div>
              <span className="text-xs text-muted-foreground">
                Personal Growth
              </span>
            </div>
          </div>

          {/* Desktop Menu */}
          <div ref={menuRef} className="hidden md:flex items-center space-x-4">
            <div className="flex items-center space-x-1">
              <Button
                variant="ghost"
                size="sm"
                className="nav-item text-muted-foreground hover:text-rose-600 hover:bg-rose-50 transition-colors"
                onClick={() => scrollToSection("features")}
              >
                Features
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="nav-item text-muted-foreground hover:text-rose-600 hover:bg-rose-50 transition-colors"
                onClick={() => scrollToSection("about")}
              >
                About
              </Button>
            </div>

            <Separator orientation="vertical" className="h-5" />

            <Button
              variant="ghost"
              size="sm"
              onClick={toggleTheme}
              className="nav-item p-2 rounded-lg hover:bg-rose-50 transition-colors"
            >
              {theme === "dark" ? (
                <Sun className="size-4 text-amber-500" />
              ) : (
                <Moon className="size-4 text-slate-600" />
              )}
            </Button>

            <Separator orientation="vertical" className="h-5" />

            <div className="flex items-center space-x-2">
              <Link href="/login">
                <Button
                  variant="ghost"
                  size="sm"
                  className="nav-item text-muted-foreground hover:text-rose-600 hover:bg-rose-50 transition-colors"
                >
                  Sign In
                </Button>
              </Link>
              <Link href="/register">
                <Button
                  size="sm"
                  className="nav-item bg-rose-500 hover:bg-rose-600 text-white px-4 py-2 rounded-lg transition-colors group"
                >
                  <span className="flex items-center text-sm font-medium">
                    Get Started
                    <ArrowRight className="ml-1 size-3 group-hover:translate-x-0.5 transition-transform duration-200" />
                  </span>
                </Button>
              </Link>
            </div>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center space-x-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleTheme}
              className="p-2 rounded-lg hover:bg-rose-50 transition-colors"
            >
              {theme === "dark" ? (
                <Sun className="size-4" />
              ) : (
                <Moon className="size-4" />
              )}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleMenu}
              className="p-2 rounded-lg hover:bg-rose-50 transition-colors"
            >
              {isMenuOpen ? (
                <X className="size-4" />
              ) : (
                <Menu className="size-4" />
              )}
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div
            ref={mobileMenuRef}
            className="md:hidden border-t border-border bg-background"
          >
            <div className="px-4 py-4 space-y-3">
              <div className="space-y-1">
                <Button
                  variant="ghost"
                  className="w-full justify-start text-muted-foreground hover:text-rose-600 hover:bg-rose-50"
                  onClick={() => {
                    scrollToSection("features");
                    setIsMenuOpen(false);
                  }}
                >
                  Features
                </Button>
                <Button
                  variant="ghost"
                  className="w-full justify-start text-muted-foreground hover:text-rose-600 hover:bg-rose-50"
                  onClick={() => {
                    scrollToSection("about");
                    setIsMenuOpen(false);
                  }}
                >
                  About
                </Button>
              </div>

              <Separator />

              <div className="space-y-2">
                <Link href="/login" className="block">
                  <Button
                    variant="outline"
                    className="w-full border-rose-200 text-rose-700 hover:bg-rose-50"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Sign In
                  </Button>
                </Link>
                <Link href="/register" className="block">
                  <Button
                    className="w-full bg-rose-500 hover:bg-rose-600 text-white py-2.5 rounded-lg group"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <span className="flex items-center font-medium">
                      Get Started
                      <ArrowRight className="ml-2 size-4 group-hover:translate-x-1 transition-transform duration-200" />
                    </span>
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
