import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { Layout } from "@/components/Layout";
import { Login } from "@/pages/Login";
import { Register } from "@/pages/Register";
import { Dashboard } from "@/pages/Dashboard";
import { Profile } from "@/pages/Profile";
import { Users } from "@/pages/Users";
import { Roles } from "@/pages/Roles";
import { useState } from "react";

const queryClient = new QueryClient();

const App = () => {
  const [user, setUser] = useState(null);

  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        {user ? (
          <Layout userRole={user.role} setUser={setUser}>
            <Routes>
              <Route path="/" element={<Dashboard user={user} />} />
              <Route path="/profile" element={<Profile user={user} setUser={setUser} />} />
              {(user.role === "admin" || user.role === "manager") && (
                <Route path="/users" element={<Users />} />
              )}
              {user.role === "admin" && (
                <Route path="/roles" element={<Roles />} />
              )}
              <Route path="*" element={<Navigate to="/" />} />
            </Routes>
          </Layout>
        ) : (
          <Routes>
            <Route path="/login" element={<Login setUser={setUser} />} />
            <Route path="/register" element={<Register setUser={setUser} />} />
            <Route path="*" element={<Navigate to="/login" />} />
          </Routes>
        )}
      </BrowserRouter>
      <Toaster />
    </QueryClientProvider>
  );
};

export default App;