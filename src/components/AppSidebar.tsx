import { LayoutDashboard, BookOpen, FileText, Brain, BarChart3 } from 'lucide-react';
import { NavLink } from '@/components/NavLink';
import { useLocation } from 'react-router-dom';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from '@/components/ui/sidebar';

const navItems = [
  { title: 'Dashboard', url: '/', icon: LayoutDashboard },
  { title: 'Courses', url: '/courses', icon: BookOpen },
  { title: 'Assignments', url: '/assignments', icon: FileText },
  { title: 'Adaptive Plan', url: '/plan', icon: Brain },
  { title: 'Performance', url: '/performance', icon: BarChart3 },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === 'collapsed';
  const location = useLocation();

  return (
    <Sidebar collapsible="icon" className="border-r-0">
      <SidebarContent className="pt-4">
        {/* Logo */}
        <div className={`px-4 mb-6 ${collapsed ? 'px-2' : ''}`}>
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center flex-shrink-0">
              <Brain className="h-4 w-4 text-primary-foreground" />
            </div>
            {!collapsed && (
              <div>
                <p className="text-sm font-semibold text-foreground leading-tight">Adaptive</p>
                <p className="text-[10px] text-muted-foreground leading-tight">Study Scheduler</p>
              </div>
            )}
          </div>
        </div>

        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => {
                const isActive = location.pathname === item.url;
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild>
                      <NavLink
                        to={item.url}
                        end
                        className={`relative hover:bg-accent/50 transition-colors duration-150 ${
                          isActive ? 'bg-accent text-primary font-medium' : 'text-muted-foreground'
                        }`}
                        activeClassName="bg-accent text-primary font-medium"
                      >
                        {isActive && (
                          <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 rounded-r bg-primary" />
                        )}
                        <item.icon className="mr-2 h-4 w-4" />
                        {!collapsed && <span>{item.title}</span>}
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Course quick links */}
        {!collapsed && (
          <SidebarGroup>
            <SidebarGroupLabel>Courses</SidebarGroupLabel>
            <SidebarGroupContent>
              <div className="px-3 space-y-1">
                {[
                  { name: 'Algorithms', color: 'bg-blue-500' },
                  { name: 'Operating Systems', color: 'bg-violet-500' },
                  { name: 'Linear Algebra', color: 'bg-amber-500' },
                  { name: 'Databases', color: 'bg-emerald-500' },
                ].map(c => (
                  <div key={c.name} className="flex items-center gap-2 py-1">
                    <span className={`h-2 w-2 rounded-full ${c.color}`} />
                    <span className="text-xs text-muted-foreground">{c.name}</span>
                  </div>
                ))}
              </div>
            </SidebarGroupContent>
          </SidebarGroup>
        )}
      </SidebarContent>
    </Sidebar>
  );
}
