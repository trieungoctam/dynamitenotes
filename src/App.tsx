import { useEffect, useState, lazy, Suspense } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { TopNav } from "@/components/layout/TopNav";
import { CommandPalette } from "@/components/layout/CommandPalette";
import { Footer } from "@/components/layout/Footer";
import { AuthProvider } from "@/contexts/AuthContext";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { Analytics } from "@vercel/analytics/react";

// Public pages - lazy loaded for better initial load
const Index = lazy(() => import("./pages/Index"));
const Posts = lazy(() => import("./pages/Posts"));
const PostDetail = lazy(() => import("./pages/PostDetail"));
const Insights = lazy(() => import("./pages/Insights"));
const Series = lazy(() => import("./pages/Series"));
const SeriesDetail = lazy(() => import("./pages/SeriesDetail"));
const Photos = lazy(() => import("./pages/Photos"));
const Resume = lazy(() => import("./pages/Resume"));
const About = lazy(() => import("./pages/About"));
const Search = lazy(() => import("./pages/Search"));
const Login = lazy(() => import("./pages/Login"));
const NotFound = lazy(() => import("./pages/NotFound"));
const ShaderExamplePage = lazy(() => import("./components/ShaderExample"));

// Admin pages - lazy loaded for better performance
const AdminDashboard = lazy(() => import("./pages/admin/Dashboard"));
const PostsAdmin = lazy(() => import("./pages/admin/PostsAdmin"));
const PostEditor = lazy(() => import("./pages/admin/PostEditor"));
const InsightsAdmin = lazy(() => import("./pages/admin/InsightsAdmin"));
const InsightEditor = lazy(() => import("./pages/admin/InsightEditor"));
const SeriesAdmin = lazy(() => import("./pages/admin/SeriesAdmin"));
const SeriesEditor = lazy(() => import("./pages/admin/SeriesEditor"));
const PhotosAdmin = lazy(() => import("./pages/admin/PhotosAdmin"));

// Loading fallback for lazy loaded routes
function PageSkeleton() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container px-6 py-12">
        <div className="space-y-6">
          <div className="h-10 w-2/3 bg-muted/50 rounded animate-pulse" />
          <div className="h-64 w-full bg-muted/50 rounded animate-pulse" />
          <div className="h-32 w-full bg-muted/50 rounded animate-pulse" />
        </div>
      </div>
    </div>
  );
}

function AdminSkeleton() {
  return (
    <div className="container px-4 py-8 max-w-6xl mx-auto">
      <div className="space-y-4">
        <div className="h-8 w-48 bg-muted/50 rounded animate-pulse" />
        <div className="h-64 w-full bg-muted/50 rounded animate-pulse" />
      </div>
    </div>
  );
}

const queryClient = new QueryClient();

// Layout wrapper to conditionally show TopNav (hidden on admin routes)
function AppLayout({ children }: { children: React.ReactNode }) {
  const [commandOpen, setCommandOpen] = useState(false);
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith("/admin");

  // Global keyboard shortcut for command palette
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setCommandOpen((prev) => !prev);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {!isAdminRoute && (
        <>
          <TopNav onOpenCommand={() => setCommandOpen(true)} />
          <CommandPalette isOpen={commandOpen} onClose={() => setCommandOpen(false)} />
        </>
      )}
      <div className={isAdminRoute ? "flex-1" : "pt-14 flex-1"}>
        {children}
      </div>
      {!isAdminRoute && <Footer />}
    </div>
  );
}

const App = () => {
  // Set dark mode by default
  useEffect(() => {
    document.documentElement.classList.add("dark");
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <LanguageProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <AppLayout>
                <Routes>
                  {/* Public routes - lazy loaded */}
                  <Route path="/" element={<Suspense fallback={<PageSkeleton />}><Index /></Suspense>} />
                  <Route path="/posts" element={<Suspense fallback={<PageSkeleton />}><Posts /></Suspense>} />
                  <Route path="/posts/:slug" element={<Suspense fallback={<PageSkeleton />}><PostDetail /></Suspense>} />
                  <Route path="/insights" element={<Suspense fallback={<PageSkeleton />}><Insights /></Suspense>} />
                  <Route path="/series" element={<Suspense fallback={<PageSkeleton />}><Series /></Suspense>} />
                  <Route path="/series/:slug" element={<Suspense fallback={<PageSkeleton />}><SeriesDetail /></Suspense>} />
                  <Route path="/photos" element={<Suspense fallback={<PageSkeleton />}><Photos /></Suspense>} />
                  <Route path="/photos/:album" element={<Suspense fallback={<PageSkeleton />}><Photos /></Suspense>} />
                  <Route path="/resume" element={<Suspense fallback={<PageSkeleton />}><Resume /></Suspense>} />
                  <Route path="/about" element={<Suspense fallback={<PageSkeleton />}><About /></Suspense>} />
                  <Route path="/search" element={<Suspense fallback={<PageSkeleton />}><Search /></Suspense>} />
                  <Route path="/login" element={<Suspense fallback={<PageSkeleton />}><Login /></Suspense>} />

                  {/* Admin routes - protected and lazy loaded */}
                  <Route
                    path="/admin"
                    element={
                      <ProtectedRoute>
                        <Suspense fallback={<AdminSkeleton />}>
                          <AdminDashboard />
                        </Suspense>
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/admin/posts"
                    element={
                      <ProtectedRoute>
                        <Suspense fallback={<AdminSkeleton />}>
                          <PostsAdmin />
                        </Suspense>
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/admin/posts/:id"
                    element={
                      <ProtectedRoute>
                        <Suspense fallback={<AdminSkeleton />}>
                          <PostEditor />
                        </Suspense>
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/admin/insights"
                    element={
                      <ProtectedRoute>
                        <Suspense fallback={<AdminSkeleton />}>
                          <InsightsAdmin />
                        </Suspense>
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/admin/insights/:id"
                    element={
                      <ProtectedRoute>
                        <Suspense fallback={<AdminSkeleton />}>
                          <InsightEditor />
                        </Suspense>
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/admin/series"
                    element={
                      <ProtectedRoute>
                        <Suspense fallback={<AdminSkeleton />}>
                          <SeriesAdmin />
                        </Suspense>
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/admin/series/:id"
                    element={
                      <ProtectedRoute>
                        <Suspense fallback={<AdminSkeleton />}>
                          <SeriesEditor />
                        </Suspense>
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/admin/photos"
                    element={
                      <ProtectedRoute>
                        <Suspense fallback={<AdminSkeleton />}>
                          <PhotosAdmin />
                        </Suspense>
                      </ProtectedRoute>
                    }
                  />

                  <Route path="/shader-example" element={<Suspense fallback={<PageSkeleton />}><ShaderExamplePage /></Suspense>} />
                  {/* 404 */}
                  <Route path="*" element={<Suspense fallback={<PageSkeleton />}><NotFound /></Suspense>} />
                </Routes>
              </AppLayout>
            </BrowserRouter>
          </TooltipProvider>
        </LanguageProvider>
      </AuthProvider>
      <Analytics />
    </QueryClientProvider>
  );
};

export default App;
