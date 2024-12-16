import { SidebarProvider, Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarMenuItem, SidebarMenuButton } from "@/components/ui/sidebar";
import { useNavigate } from "react-router-dom";
import { Home, User, Users, Settings, LogOut } from "lucide-react";

interface LayoutProps {
  children: React.ReactNode;
  userRole?: "admin" | "manager" | "user";
  setUser?: (user: any) => void;
}

export const Layout = ({ children, userRole = "user", setUser }: LayoutProps) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    if (setUser) {
      setUser(null);
      navigate("/login");
    }
  };

  const menuItems = [
    { title: "Главная", icon: Home, path: "/", roles: ["admin", "manager", "user"] },
    { title: "Личный кабинет", icon: User, path: "/profile", roles: ["admin", "manager", "user"] },
    { title: "Пользователи", icon: Users, path: "/users", roles: ["admin", "manager"] },
    { title: "Роли", icon: Settings, path: "/roles", roles: ["admin"] },
  ].filter(item => item.roles.includes(userRole));

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <Sidebar>
          <SidebarContent>
            <SidebarGroup>
              <SidebarGroupContent>
                {menuItems.map((item) => (
                  <SidebarMenuItem key={item.path}>
                    <SidebarMenuButton asChild onClick={() => navigate(item.path)}>
                      <div className="flex items-center gap-2 cursor-pointer">
                        <item.icon className="h-4 w-4" />
                        <span>{item.title}</span>
                      </div>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
                <SidebarMenuItem>
                  <SidebarMenuButton asChild onClick={handleLogout}>
                    <div className="flex items-center gap-2 cursor-pointer text-red-500">
                      <LogOut className="h-4 w-4" />
                      <span>Выйти</span>
                    </div>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>
        </Sidebar>
        <main className="flex-1 p-6">
          <div className="animate-fadeIn">
            {children}
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
};