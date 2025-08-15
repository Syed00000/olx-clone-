import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/contexts/AuthContext";
import NotFound from "@/pages/not-found";
import HomePage from "@/pages/HomePage";
import ProductDetailPage from "@/pages/ProductDetailPageNew";
import PostAdPage from "@/pages/PostAdPage";
import UserDashboard from "@/pages/UserDashboard";
import CategoryPage from "@/pages/CategoryPage";
import EditAdPage from "@/pages/EditAdPage";

function Router() {
  return (
    <Switch>
      <Route path="/" component={HomePage} />
      <Route path="/listing/:id" component={ProductDetailPage} />
      <Route path="/post" component={PostAdPage} />
      <Route path="/dashboard" component={UserDashboard} />
      <Route path="/edit/:id" component={EditAdPage} />
      <Route path="/category/:category" component={CategoryPage} />
      <Route path="/category/:category/:subcategory" component={CategoryPage} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
