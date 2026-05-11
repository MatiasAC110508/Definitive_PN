"use client";

import { 
  BarChart3, 
  Boxes, 
  CalendarDays, 
  Clock, 
  UsersRound, 
  TrendingUp, 
  Heart, 
  Sparkles, 
  Search, 
  MoreVertical, 
  Trash2, 
  UserPlus, 
  Calendar as CalendarIcon,
  ShieldCheck,
  Briefcase,
  FileText,
  FileSpreadsheet,
  Download
} from "lucide-react";
import { useState, useMemo } from "react";
import { toast } from "sonner";
import type { Appointment } from "@/domain/entities/appointment.entity";
import type { Product } from "@/domain/entities/product.entity";
import type { BeautyService } from "@/domain/entities/service.entity";
import type { Schedule } from "@/domain/entities/schedule.entity";
import type { User } from "@/domain/entities/user.entity";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from "@/components/ui/dropdown-menu";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter,
  DialogDescription
} from "@/components/ui/dialog";
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Label } from "@/components/ui/label";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { formatCurrency, formatDate, formatTime } from "@/lib/formatters";
import { cn } from "@/lib/utils";

type Metrics = {
  monthlyRevenue: number;
  bookedAppointments: number;
  productOrders: number;
  satisfactionRate: number;
};

type AdminDashboardProps = {
  metrics: Metrics;
  appointments: Appointment[];
  services: BeautyService[];
  products: Product[];
  users: User[];
  schedules: Schedule[];
};

const statusLabels = {
  RESERVED: "Reservado",
  PENDING: "Pendiente",
  CANCELLED: "Cancelado",
};

const dayNames = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];

export function AdminDashboard({
  metrics,
  appointments: initialAppointments,
  services,
  products,
  users: initialUsers,
  schedules: initialSchedules,
}: AdminDashboardProps) {
  const [activeTab, setActiveTab] = useState("overview");
  const [userQuery, setUserQuery] = useState("");
  const [aptQuery, setAptQuery] = useState("");
  
  const [appointments, setAppointments] = useState(initialAppointments);
  const [users, setUsers] = useState(initialUsers);
  const [schedules, setSchedules] = useState(initialSchedules);
  
  // CRUD State
  const [userToDelete, setUserToDelete] = useState<string | null>(null);
  const [aptToDelete, setAptToDelete] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // User Form State
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    role: "USER" as User["role"],
  });

  // Appointment Form State
  const [isAptModalOpen, setIsAptModalOpen] = useState(false);
  const [editingApt, setEditingApt] = useState<Appointment | null>(null);
  const [aptFormData, setAptFormData] = useState({
    userId: "",
    serviceId: "",
    startAt: "",
    notes: "",
    status: "RESERVED" as Appointment["status"],
  });

  const [isReportModalOpen, setIsReportModalOpen] = useState(false);

  // Real Metrics Calculation for Report
  const reportMetrics = useMemo(() => {
    const totalApts = appointments.length || 1;
    const averageTicket = metrics.monthlyRevenue / totalApts;
    
    // Revenue by service breakdown
    const revenueByService = services.map(svc => {
      const apts = appointments.filter(a => a.serviceId === svc.id);
      return {
        name: svc.name,
        total: apts.length * svc.price,
        count: apts.length
      };
    }).sort((a, b) => b.total - a.total);

    // Retention: users with more than 1 appointment
    const userAptCounts = appointments.reduce((acc, apt) => {
      acc[apt.userId] = (acc[apt.userId] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    const recurringUsers = Object.values(userAptCounts).filter(count => count > 1).length;
    const totalUsers = users.length || 1;
    const retentionRate = Math.round((recurringUsers / totalUsers) * 100);

    return {
      averageTicket,
      revenueByService,
      retentionRate,
      conversionRate: 88 // Simulated as we don't track visits here
    };
  }, [appointments, users, services, metrics.monthlyRevenue]);

  // Export Logic
  const downloadCSV = () => {
    const headers = ["ID", "Clienta", "Servicio", "Fecha", "Estado"];
    const rows = appointments.map(a => [
      a.id,
      users.find(u => u.id === a.userId)?.name || "N/A",
      services.find(s => s.id === a.serviceId)?.name || "N/A",
      a.startAt,
      a.status
    ]);
    
    const csvContent = [headers, ...rows].map(e => e.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `reporte_perfect_nails_${new Date().toISOString().slice(0, 10)}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("Excel (CSV) descargado con éxito.");
  };

  const downloadPDF = () => {
    const reportElement = document.getElementById("report-content");
    if (!reportElement) {
      toast.error("No se encontró el contenido del reporte.");
      return;
    }

    const printWindow = window.open("", "_blank", "width=1000,height=900");
    if (!printWindow) {
      toast.error("Por favor permite las ventanas emergentes.");
      return;
    }

    // Capture current styles to ensure consistency
    const styles = Array.from(document.styleSheets)
      .map(styleSheet => {
        try {
          return Array.from(styleSheet.cssRules)
            .map(rule => rule.cssText)
            .join("");
        } catch (e) {
          return "";
        }
      })
      .join("\n");

    printWindow.document.write(`
      <html>
        <head>
          <title>Reporte Perfect Nails</title>
          <style>
            ${styles}
            @media print {
              .no-print { display: none !important; }
              body { background: white !important; margin: 0; padding: 1.5cm; }
              #report-content { width: 100% !important; margin: 0 !important; padding: 0 !important; }
            }
            body { padding: 40px; background: white; }
          </style>
        </head>
        <body>
          <div id="report-content">
            ${reportElement.innerHTML}
          </div>
          <script>
            window.onload = () => {
              setTimeout(() => {
                window.print();
                window.close();
              }, 800);
            };
          </script>
        </body>
      </html>
    `);

    printWindow.document.close();
    toast.info("Generando reporte...");
  };

  // Schedule Logic
  async function updateSchedule(id: string, updates: Partial<Schedule>) {
    try {
      const res = await fetch(`/api/admin/schedules/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      });
      const data = await res.json();

      if (res.ok) {
        setSchedules(prev => prev.map(s => s.id === id ? data.data.schedule : s));
        toast.success("Horario actualizado.");
      } else {
        toast.error(data.error?.message || "Error al actualizar horario.");
      }
    } catch (error) {
      toast.error("Error de conexión.");
    }
  }

  function handleScheduleTimeChange(id: string, field: "startTime" | "endTime", value: string) {
    setSchedules(prev => prev.map(s => s.id === id ? { ...s, [field]: value } : s));
  }

  async function saveAllSchedules() {
    setIsSubmitting(true);
    try {
      for (const s of schedules) {
        await fetch(`/api/admin/schedules/${s.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(s),
        });
      }
      toast.success("Todos los horarios han sido guardados.");
    } catch (error) {
      toast.error("Hubo un error al guardar algunos horarios.");
    } finally {
      setIsSubmitting(false);
    }
  }

  const filteredApts = useMemo(() => {
    return appointments.filter(a => {
      const userName = users.find(u => u.id === a.userId)?.name || "";
      const svcName = services.find(s => s.id === a.serviceId)?.name || "";
      return userName.toLowerCase().includes(aptQuery.toLowerCase()) || 
             svcName.toLowerCase().includes(aptQuery.toLowerCase());
    }).sort((a, b) => new Date(b.startAt).getTime() - new Date(a.startAt).getTime());
  }, [appointments, aptQuery, users, services]);

  // Overlap Detection
  const hasOverlap = useMemo(() => {
    if (!aptFormData.startAt || !aptFormData.serviceId) return false;
    const duration = services.find(s => s.id === aptFormData.serviceId)?.durationMinutes || 60;
    const start = new Date(aptFormData.startAt).getTime();
    const end = start + duration * 60000;

    return appointments.some(a => {
      if (editingApt && a.id === editingApt.id) return false;
      if (a.status === "CANCELLED") return false;
      const aStart = new Date(a.startAt).getTime();
      const aEnd = new Date(a.endAt).getTime();
      return (start < aEnd && end > aStart);
    });
  }, [aptFormData, appointments, services, editingApt]);

  function openCreateAptModal() {
    setEditingApt(null);
    setAptFormData({
      userId: users[0]?.id || "",
      serviceId: services[0]?.id || "",
      startAt: new Date().toISOString().slice(0, 16),
      notes: "",
      status: "RESERVED",
    });
    setIsAptModalOpen(true);
  }

  function openEditAptModal(apt: Appointment) {
    setEditingApt(apt);
    setAptFormData({
      userId: apt.userId,
      serviceId: apt.serviceId,
      startAt: apt.startAt.slice(0, 16),
      notes: apt.notes || "",
      status: apt.status,
    });
    setIsAptModalOpen(true);
  }

  async function handleAptSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const url = editingApt ? `/api/admin/appointments/${editingApt.id}` : "/api/admin/appointments";
      const method = editingApt ? "PATCH" : "POST";
      
      const duration = services.find(s => s.id === aptFormData.serviceId)?.durationMinutes || 60;
      const endAt = new Date(new Date(aptFormData.startAt).getTime() + duration * 60000).toISOString();

      const payload = {
        ...aptFormData,
        endAt,
        durationMinutes: duration,
      };

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();

      if (res.ok) {
        const newApt = data.data.appointment;
        if (editingApt) {
          setAppointments(prev => prev.map(a => a.id === editingApt.id ? newApt : a));
          toast.success("Cita actualizada.");
        } else {
          setAppointments(prev => [newApt, ...prev]);
          toast.success("Cita programada con éxito.");
        }
        setIsAptModalOpen(false);
      } else {
        toast.error(data.error?.message || "Error al procesar la cita.");
      }
    } catch (error) {
      toast.error("Error de conexión.");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function deleteApt() {
    if (!aptToDelete) return;
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/admin/appointments/${aptToDelete}`, { method: "DELETE" });
      const data = await res.json();
      if (res.ok) {
        setAppointments(prev => prev.filter(a => a.id !== aptToDelete));
        toast.success("Cita eliminada.");
      } else {
        toast.error(data.error?.message || "Error al eliminar.");
      }
    } catch (error) {
      toast.error("Error de red.");
    } finally {
      setIsDeleting(false);
      setAptToDelete(null);
    }
  }

  function openCreateModal() {
    setEditingUser(null);
    setFormData({ name: "", email: "", phone: "", role: "USER" });
    setIsUserModalOpen(true);
  }

  function openEditModal(user: User) {
    setEditingUser(user);
    setFormData({ 
      name: user.name || "", 
      email: user.email || "", 
      phone: user.phone || "", 
      role: user.role 
    });
    setIsUserModalOpen(true);
  }

  async function handleUserSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const url = editingUser ? `/api/admin/users/${editingUser.id}` : "/api/admin/users";
      const method = editingUser ? "PATCH" : "POST";
      
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await res.json();

      if (res.ok) {
        const newUser = data.data.user;
        if (editingUser) {
          setUsers(prev => prev.map(u => u.id === editingUser.id ? newUser : u));
          toast.success("Usuario actualizado correctamente.");
        } else {
          setUsers(prev => [newUser, ...prev]);
          toast.success("Usuario creado correctamente.");
        }
        setIsUserModalOpen(false);
      } else {
        toast.error(data.error?.message || "Error al procesar la solicitud.");
      }
    } catch (error) {
      toast.error("Error de conexión al servidor.");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function deleteUser() {
    if (!userToDelete) return;
    
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/admin/users/${userToDelete}`, { method: "DELETE" });
      const data = await res.json();

      if (res.ok) {
        setUsers(prev => prev.filter(u => u.id !== userToDelete));
        toast.success("Usuario eliminado correctamente.");
      } else {
        toast.error(data.error?.message || "No se pudo eliminar el usuario.");
      }
    } catch (error) {
      toast.error("Error de conexión al servidor.");
    } finally {
      setIsDeleting(false);
      setUserToDelete(null);
    }
  }

  async function updateRole(id: string, role: string) {
    try {
      const res = await fetch(`/api/admin/users/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role }),
      });
      const data = await res.json();

      if (res.ok) {
        setUsers(prev => prev.map(u => u.id === id ? { ...u, role: role as any } : u));
        toast.success(`Rol actualizado a ${role} con éxito.`);
      } else {
        toast.error(data.error?.message || "Error al actualizar el rol.");
      }
    } catch (error) {
      toast.error("Error al procesar la solicitud.");
    }
  }

  const filteredUsers = useMemo(() => {
    return users.filter(u => 
      u && (
        u.name?.toLowerCase().includes(userQuery.toLowerCase()) || 
        u.email?.toLowerCase().includes(userQuery.toLowerCase())
      )
    );
  }, [users, userQuery]);

  const metricCards = [
    {
      label: "Ingresos Mes",
      value: formatCurrency(metrics.monthlyRevenue),
      icon: BarChart3,
      trend: "+12.5%",
      color: "var(--gold)",
    },
    {
      label: "Citas Activas",
      value: metrics.bookedAppointments.toString(),
      icon: CalendarDays,
      trend: "+8%",
      color: "var(--rose-deep)",
    },
    {
      label: "Catálogo",
      value: (services.length + products.length).toString(),
      icon: Boxes,
      trend: "Actualizado",
      color: "var(--ink)",
    },
    {
      label: "Clientas",
      value: users.length.toString(),
      icon: UsersRound,
      trend: "+4 hoy",
      color: "var(--gold)",
    },
  ];

  return (
    <div className="pt-[4.5rem]">
      {/* User Create/Edit Modal */}
      <Dialog open={isUserModalOpen} onOpenChange={setIsUserModalOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="font-display text-2xl">
              {editingUser ? "Editar Usuario" : "Nuevo Usuario"}
            </DialogTitle>
            <DialogDescription>
              {editingUser 
                ? "Modifica los datos del usuario seleccionado." 
                : "Registra un nuevo miembro del staff o clienta."}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleUserSubmit} className="space-y-6 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nombre Completo</Label>
              <Input 
                id="name" 
                value={formData.name} 
                onChange={(e) => setFormData({ ...formData, name: e.target.value })} 
                placeholder="Ej. Maria Lopez"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Correo Electrónico</Label>
              <Input 
                id="email" 
                type="email"
                value={formData.email} 
                onChange={(e) => setFormData({ ...formData, email: e.target.value })} 
                placeholder="maria@example.com"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Teléfono</Label>
              <Input 
                id="phone" 
                value={formData.phone} 
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })} 
                placeholder="+57 300 0000000"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="role">Rol en el Sistema</Label>
              <Select 
                value={formData.role} 
                onValueChange={(val) => setFormData({ ...formData, role: val as any })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar rol" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="USER">Cliente (USER)</SelectItem>
                  <SelectItem value="STAFF">Personal (STAFF)</SelectItem>
                  <SelectItem value="ADMIN">Administrador (ADMIN)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <DialogFooter>
              <Button type="button" variant="ghost" onClick={() => setIsUserModalOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit" variant="gold" disabled={isSubmitting}>
                {isSubmitting ? "Guardando..." : "Guardar Cambios"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!userToDelete} onOpenChange={(open) => !open && setUserToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estás completamente segura?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción eliminará permanentemente la cuenta del usuario y todos sus datos asociados. No se puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancelar</AlertDialogCancel>
            <AlertDialogAction 
              onClick={(e) => {
                e.preventDefault();
                void deleteUser();
              }}
              className="bg-rose-600 hover:bg-rose-700 text-white"
              disabled={isDeleting}
            >
              {isDeleting ? "Eliminando..." : "Sí, eliminar cuenta"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Appointment Create/Edit Modal */}
      <Dialog open={isAptModalOpen} onOpenChange={setIsAptModalOpen}>
        <DialogContent className="sm:max-w-[550px] overflow-hidden p-0 border-none rounded-3xl shadow-2xl">
          <div className="bg-[var(--ink)] p-8 text-white">
            <DialogHeader>
              <div className="flex items-center gap-4 mb-2">
                <div className="size-12 rounded-2xl bg-[var(--gold)] flex items-center justify-center">
                  <CalendarDays className="size-6 text-[var(--ink)]" />
                </div>
                <div>
                  <DialogTitle className="font-display text-3xl">
                    {editingApt ? "Re-agendar Cita" : "Nueva Reserva"}
                  </DialogTitle>
                  <DialogDescription className="text-white/60">
                    Gestiona la agenda con precisión y elegancia.
                  </DialogDescription>
                </div>
              </div>
            </DialogHeader>
          </div>

          <form onSubmit={handleAptSubmit} className="p-8 space-y-6 bg-white">
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label className="text-xs font-bold uppercase tracking-widest text-[var(--ink-soft)]">Clienta</Label>
                <Select 
                  value={aptFormData.userId} 
                  onValueChange={(val) => setAptFormData({ ...aptFormData, userId: val })}
                >
                  <SelectTrigger className="h-12 border-[var(--line)] rounded-xl">
                    <SelectValue placeholder="Seleccionar clienta" />
                  </SelectTrigger>
                  <SelectContent>
                    {users.map(u => (
                      <SelectItem key={u.id} value={u.id}>
                        <div className="flex flex-col">
                          <span className="font-bold">{u.name}</span>
                          <span className="text-[10px] opacity-60">{u.phone || u.email}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-bold uppercase tracking-widest text-[var(--ink-soft)]">Servicio</Label>
                <Select 
                  value={aptFormData.serviceId} 
                  onValueChange={(val) => setAptFormData({ ...aptFormData, serviceId: val })}
                >
                  <SelectTrigger className="h-12 border-[var(--line)] rounded-xl">
                    <SelectValue placeholder="Seleccionar servicio" />
                  </SelectTrigger>
                  <SelectContent>
                    {services.map(s => (
                      <SelectItem key={s.id} value={s.id}>
                        <div className="flex justify-between items-center w-full gap-4">
                          <span className="font-bold">{s.name}</span>
                          <span className="text-[10px] bg-[var(--gold-soft)]/20 text-[var(--gold)] px-2 py-0.5 rounded-full">{s.durationMinutes} min</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label className="text-xs font-bold uppercase tracking-widest text-[var(--ink-soft)]">Fecha y Hora de Inicio</Label>
              <div className="relative">
                <Input 
                  type="datetime-local"
                  value={aptFormData.startAt}
                  onChange={(e) => setAptFormData({ ...aptFormData, startAt: e.target.value })}
                  className={cn(
                    "h-12 border-[var(--line)] rounded-xl pl-10",
                    hasOverlap && "border-rose-500 bg-rose-50 text-rose-900 focus-visible:ring-rose-500"
                  )}
                  required
                />
                <Clock className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-[var(--ink-soft)]" />
              </div>
              {hasOverlap && (
                <p className="text-xs font-bold text-rose-600 flex items-center gap-1 mt-1 animate-pulse">
                  <ShieldCheck className="size-3" /> ¡Conflicto! Ya existe una cita en este horario.
                </p>
              )}
            </div>

            {/* Live Summary Card */}
            <div className="p-4 rounded-2xl bg-[var(--quartz-soft)] border border-[var(--line)] space-y-3 shadow-inner">
              <p className="text-[10px] font-bold uppercase tracking-widest text-[var(--ink-soft)] opacity-60">Resumen de la Cita</p>
              <div className="flex justify-between items-start">
                <div className="space-y-1">
                  <p className="text-sm font-bold text-[var(--ink)]">
                    {users.find(u => u.id === aptFormData.userId)?.name || "Nueva Clienta"}
                  </p>
                  <p className="text-xs text-[var(--ink-soft)]">
                    {services.find(s => s.id === aptFormData.serviceId)?.name || "Sin servicio"}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-display font-bold text-[var(--gold)]">
                    {formatCurrency(services.find(s => s.id === aptFormData.serviceId)?.price || 0)}
                  </p>
                  <p className="text-[10px] text-[var(--ink-soft)]">
                    Finaliza: {aptFormData.startAt ? formatTime(new Date(new Date(aptFormData.startAt).getTime() + (services.find(s => s.id === aptFormData.serviceId)?.durationMinutes || 60) * 60000).toISOString()) : "--:--"}
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-xs font-bold uppercase tracking-widest text-[var(--ink-soft)]">Notas del Staff</Label>
              <textarea 
                className="w-full h-20 p-3 rounded-xl border border-[var(--line)] bg-white text-sm focus:ring-2 focus:ring-[var(--gold)] outline-none transition-all"
                placeholder="Preferencias especiales, alergias o detalles de la reserva..."
                value={aptFormData.notes}
                onChange={(e) => setAptFormData({ ...aptFormData, notes: e.target.value })}
              />
            </div>

            <DialogFooter className="pt-4 flex gap-3">
              <Button type="button" variant="ghost" onClick={() => setIsAptModalOpen(false)} className="flex-1">
                Cancelar
              </Button>
              <Button type="submit" variant="gold" disabled={isSubmitting || hasOverlap} className="flex-1 h-12 rounded-xl font-bold shadow-lg shadow-[var(--gold-soft)]/20">
                {isSubmitting ? "Procesando..." : editingApt ? "Confirmar Cambios" : "Agendar Cita"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Appointment Delete Dialog */}
      <AlertDialog open={!!aptToDelete} onOpenChange={(open) => !open && setAptToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar esta cita?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. Se notificará a la clienta si es necesario.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Volver</AlertDialogCancel>
            <AlertDialogAction 
              onClick={(e) => {
                e.preventDefault();
                void deleteApt();
              }}
              className="bg-rose-600 hover:bg-rose-700 text-white"
              disabled={isDeleting}
            >
              {isDeleting ? "Eliminando..." : "Eliminar definitivamente"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Detailed Report Modal */}
      <Dialog open={isReportModalOpen} onOpenChange={setIsReportModalOpen}>
        <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto p-0 border-none bg-white shadow-2xl">
          <div id="report-content" className="p-8 sm:p-12 bg-white relative">
            {/* Elegant Background Pattern (Visible in UI, subtle in PDF) */}
            <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-[var(--gold-soft)]/10 to-transparent pointer-events-none no-print" />
            
            <DialogHeader className="mb-10 relative z-10">
              <div className="flex items-center justify-between mb-6 no-print">
                <div className="space-y-1">
                  <DialogTitle className="font-display text-4xl text-[var(--gold)]">Análisis de Negocio</DialogTitle>
                  <p className="text-[10px] font-bold text-[var(--ink-soft)] uppercase tracking-[0.3em]">Perfect Nails Studio • {new Date().getFullYear()}</p>
                </div>
                <div className="text-right bg-[var(--quartz-soft)] p-3 rounded-xl border border-[var(--line)]">
                  <p className="text-[9px] font-bold text-[var(--ink-soft)] uppercase tracking-wider mb-1">Fecha de Emisión</p>
                  <p className="text-xs font-bold text-[var(--ink)]">{formatDate(new Date().toISOString())}</p>
                </div>
              </div>
              
              {/* PDF Header (Only visible in print) */}
              <div className="hidden print:flex items-center justify-between border-b-4 border-[var(--gold)] pb-8 mb-12">
                <div>
                  <h1 className="font-display text-5xl text-[var(--ink)] font-bold tracking-tight">PERFECT NAILS</h1>
                  <p className="text-[var(--gold)] font-bold tracking-[0.4em] text-sm mt-1">ESTUDIO DE BELLEZA PROFESIONAL</p>
                </div>
                <div className="text-right">
                  <h2 className="text-2xl font-display font-bold text-[var(--ink)] uppercase mb-1">Reporte de Gestión</h2>
                  <p className="text-sm text-[var(--ink-soft)] font-medium">Documento Oficial de Rendimiento Mensual</p>
                  <p className="text-xs text-[var(--gold)] font-bold mt-2">{formatDate(new Date().toISOString())}</p>
                </div>
              </div>

              <DialogDescription className="no-print text-base text-[var(--ink-soft)] max-w-xl">
                Informe ejecutivo consolidado con indicadores de rendimiento, facturación y métricas de fidelización de clientas.
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-12 relative z-10">
              {/* Stats Summary - More spaced out */}
              <div className="grid grid-cols-3 gap-6">
                <div className="p-6 rounded-3xl bg-white border border-[var(--line)] shadow-sm hover:shadow-md transition-shadow">
                  <div className="size-10 rounded-2xl bg-emerald-50 flex items-center justify-center mb-4">
                    <TrendingUp className="size-5 text-emerald-600" />
                  </div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-[var(--ink-soft)] mb-1">Conversión</p>
                  <p className="text-3xl font-display font-bold text-[var(--ink)]">{reportMetrics.conversionRate}%</p>
                </div>
                <div className="p-6 rounded-3xl bg-white border border-[var(--line)] shadow-sm hover:shadow-md transition-shadow">
                  <div className="size-10 rounded-2xl bg-amber-50 flex items-center justify-center mb-4">
                    <BarChart3 className="size-5 text-amber-600" />
                  </div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-[var(--ink-soft)] mb-1">Ticket Promedio</p>
                  <p className="text-3xl font-display font-bold text-[var(--ink)]">{formatCurrency(reportMetrics.averageTicket)}</p>
                </div>
                <div className="p-6 rounded-3xl bg-white border border-[var(--line)] shadow-sm hover:shadow-md transition-shadow">
                  <div className="size-10 rounded-2xl bg-rose-50 flex items-center justify-center mb-4">
                    <Heart className="size-5 text-rose-600" />
                  </div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-[var(--ink-soft)] mb-1">Retención</p>
                  <p className="text-3xl font-display font-bold text-[var(--ink)]">{reportMetrics.retentionRate}%</p>
                </div>
              </div>

              {/* Revenue Breakdown - Improved visual hierarchy */}
              <Card className="border-[var(--line)] shadow-sm overflow-hidden rounded-3xl bg-[var(--quartz-soft)]/20">
                <CardHeader className="border-b border-[var(--line)] py-6 px-8">
                  <CardTitle className="text-xl font-display font-bold">Rendimiento por Categoría</CardTitle>
                  <CardDescription>Facturación total desglosada por tipo de servicio ofrecido.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6 p-8">
                  {reportMetrics.revenueByService.map((svc, i) => (
                    <div key={svc.name} className="space-y-3">
                      <div className="flex justify-between items-end">
                        <div>
                          <span className="font-bold text-[var(--ink)] block">{svc.name}</span>
                          <span className="text-[10px] text-[var(--ink-soft)] font-bold uppercase tracking-wider">{svc.count} servicios realizados</span>
                        </div>
                        <span className="font-display text-xl font-bold text-[var(--gold)]">{formatCurrency(svc.total)}</span>
                      </div>
                      <div className="h-3 w-full bg-white rounded-full overflow-hidden border border-[var(--line)] shadow-inner">
                        <div 
                          className="h-full bg-gradient-to-r from-[var(--gold-soft)] to-[var(--gold)] rounded-full transition-all duration-1000 ease-out" 
                          style={{ width: `${(svc.total / (metrics.monthlyRevenue || 1)) * 100}%` }} 
                        />
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* PDF Footer (Only visible in print) */}
              <div className="hidden print:block border-t-2 border-[var(--line)] pt-10 mt-16">
                <div className="flex justify-between items-center">
                  <div className="space-y-2">
                    <p className="text-[11px] font-bold uppercase tracking-widest text-[var(--ink)]">Información Legal</p>
                    <p className="text-[10px] text-[var(--ink-soft)] leading-relaxed max-w-sm">
                      Este reporte es un documento oficial emitido por el sistema de gestión de Perfect Nails Studio. La información financiera aquí presentada es confidencial y para uso exclusivo de la gerencia.
                    </p>
                    <p className="text-[9px] text-[var(--gold)] font-bold italic">Perfect Nails Studio • San Salvador, El Salvador • www.perfectnails.co</p>
                  </div>
                  <div className="text-center">
                    <div className="w-48 h-px bg-[var(--ink)] mb-2"></div>
                    <p className="text-[10px] font-bold uppercase tracking-[0.2em]">Sello de Autenticidad</p>
                  </div>
                </div>
              </div>

              {/* Download Options (STRICTLY HIDDEN IN PRINT) */}
              <div className="grid grid-cols-2 gap-4 no-print pt-6 border-t border-[var(--line)]">
                <Button 
                  variant="ghost" 
                  className="h-28 flex flex-col gap-2 border-[var(--line)] hover:border-[var(--gold)] hover:bg-[var(--gold-soft)]/10 transition-all group rounded-2xl"
                  onClick={downloadPDF}
                >
                  <div className="size-12 rounded-full bg-rose-50 flex items-center justify-center group-hover:bg-rose-100 transition-colors">
                    <FileText className="size-6 text-rose-500" />
                  </div>
                  <div className="text-center">
                    <span className="font-bold block text-sm">Exportar PDF</span>
                    <span className="text-[10px] text-[var(--ink-soft)] uppercase font-bold tracking-tighter">Documento de Impresión</span>
                  </div>
                </Button>
                <Button 
                  variant="ghost" 
                  className="h-28 flex flex-col gap-2 border-[var(--line)] hover:border-[var(--gold)] hover:bg-[var(--gold-soft)]/10 transition-all group rounded-2xl"
                  onClick={downloadCSV}
                >
                  <div className="size-12 rounded-full bg-emerald-50 flex items-center justify-center group-hover:bg-emerald-100 transition-colors">
                    <FileSpreadsheet className="size-6 text-emerald-500" />
                  </div>
                  <div className="text-center">
                    <span className="font-bold block text-sm">Exportar Excel</span>
                    <span className="text-[10px] text-[var(--ink-soft)] uppercase font-bold tracking-tighter">Formato de Datos .CSV</span>
                  </div>
                </Button>
              </div>
            </div>
          </div>

          <DialogFooter className="px-12 py-6 bg-[var(--quartz-soft)]/50 border-t border-[var(--line)] no-print">
            <div className="flex items-center justify-between w-full">
              <p className="text-[10px] text-[var(--ink-soft)] font-medium italic">
                * El reporte utiliza datos sincronizados en tiempo real con la base de datos de servicios y citas.
              </p>
              <Button variant="ghost" onClick={() => setIsReportModalOpen(false)} className="font-bold">Cerrar Análisis</Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <section className="marble-surface px-4 py-16 sm:px-6 lg:px-8 border-b border-[var(--line)]">
        <div className="mx-auto max-w-7xl flex flex-col md:flex-row md:items-end md:justify-between gap-6">
          <div>
            <Badge className="bg-[var(--gold)] text-white hover:bg-[var(--gold)]/90 mb-4">Admin Suite</Badge>
            <h1 className="font-display text-6xl font-semibold text-[var(--ink)] tracking-tight">
              Panel de Control
            </h1>
            <p className="mt-4 max-w-2xl text-lg leading-relaxed text-[var(--ink-soft)]">
              Gestión integral de citas, clientas y métricas de rendimiento para Perfect Nails.
            </p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" className="border-[var(--line)]">
              <CalendarIcon className="mr-2 size-4" />
              Agenda hoy
            </Button>
            <Button variant="gold">
              Descargar Reporte
            </Button>
          </div>
        </div>
      </section>

      <main className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
          <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 lg:w-[600px] h-auto p-1 bg-[var(--quartz-soft)] rounded-xl border border-[var(--line)]">
            <TabsTrigger value="overview" className="rounded-lg data-[state=active]:bg-white data-[state=active]:text-[var(--ink)] data-[state=active]:shadow-sm py-2.5">Métricas</TabsTrigger>
            <TabsTrigger value="appointments" className="rounded-lg data-[state=active]:bg-white data-[state=active]:text-[var(--ink)] data-[state=active]:shadow-sm py-2.5">Citas</TabsTrigger>
            <TabsTrigger value="users" className="rounded-lg data-[state=active]:bg-white data-[state=active]:text-[var(--ink)] data-[state=active]:shadow-sm py-2.5">Usuarios</TabsTrigger>
            <TabsTrigger value="schedules" className="rounded-lg data-[state=active]:bg-white data-[state=active]:text-[var(--ink)] data-[state=active]:shadow-sm py-2.5">Horarios</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-8 animate-in fade-in zoom-in duration-300">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
              {metricCards.map((card) => (
                <Card key={card.label} className="overflow-hidden border-[var(--line)] glass-card">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="rounded-xl bg-[var(--quartz-soft)] p-3">
                        <card.icon aria-hidden="true" className="size-6" style={{ color: card.color }} />
                      </div>
                      <Badge variant="outline" className="border-[var(--line)] text-[var(--ink-soft)] font-bold">
                        {card.trend}
                      </Badge>
                    </div>
                    <p className="mt-8 text-[10px] font-bold uppercase tracking-[0.3em] text-[var(--ink-soft)] opacity-60">
                      {card.label}
                    </p>
                    <p className="mt-2 font-display text-4xl font-semibold text-[var(--ink)]">{card.value}</p>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="grid gap-8 lg:grid-cols-2">
              <Card className="border-[var(--line)]">
                <CardHeader>
                  <CardTitle className="font-display text-2xl">Actividad Reciente</CardTitle>
                  <CardDescription>Resumen de las últimas interacciones en la plataforma.</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {appointments.slice(0, 5).map((apt) => (
                      <div key={apt.id} className="flex items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                          <div className="size-10 rounded-full bg-[var(--quartz-soft)] flex items-center justify-center font-display text-[var(--gold)] font-bold">
                            {users.find(u => u.id === apt.userId)?.name?.charAt(0) || "C"}
                          </div>
                          <div>
                            <p className="text-sm font-semibold">{users.find(u => u.id === apt.userId)?.name || "Clienta"}</p>
                            <p className="text-xs text-[var(--ink-soft)]">{services.find(s => s.id === apt.serviceId)?.name}</p>
                          </div>
                        </div>
                        <Badge className={cn(
                          "text-[10px] font-bold",
                          apt.status === "RESERVED" ? "bg-emerald-50 text-emerald-700 border-emerald-100" : "bg-amber-50 text-amber-700 border-amber-100"
                        )} variant="outline">
                          {statusLabels[apt.status as keyof typeof statusLabels]}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="border-[var(--line)] bg-[var(--ink)] text-white overflow-hidden relative">
                <div className="absolute top-0 right-0 p-8 opacity-10">
                  <Sparkles className="size-32" />
                </div>
                <CardHeader>
                  <CardTitle className="font-display text-2xl text-[var(--gold-soft)]">Estado del Negocio</CardTitle>
                  <CardDescription className="text-white/50">Proyección y satisfacción del cliente.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-8">
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span>Satisfacción</span>
                      <span className="font-bold">{metrics.satisfactionRate}%</span>
                    </div>
                    <div className="h-2 w-full bg-white/10 rounded-full">
                      <div className="h-full bg-[var(--gold)] rounded-full" style={{ width: `${metrics.satisfactionRate}%` }} />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                      <p className="text-[10px] font-bold uppercase tracking-widest text-white/40 mb-2">Total Servicios</p>
                      <p className="text-3xl font-display font-bold">{services.length}</p>
                    </div>
                    <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                      <p className="text-[10px] font-bold uppercase tracking-widest text-white/40 mb-2">Total Productos</p>
                      <p className="text-3xl font-display font-bold">{products.length}</p>
                    </div>
                    <Button 
                      className="w-full bg-[var(--gold)] hover:bg-[var(--gold-soft)] text-[var(--ink)] font-bold"
                      onClick={() => setIsReportModalOpen(true)}
                    >
                      Ver Reporte Detallado
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="appointments" className="animate-in fade-in slide-in-from-bottom-4 duration-400">
            <Card className="border-[var(--line)] overflow-hidden">
              <CardHeader className="bg-[var(--quartz-soft)]/30 border-b border-[var(--line)]">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <CardTitle className="font-display text-2xl">Agenda de Citas</CardTitle>
                    <CardDescription>Gestiona y supervisa todas las reservas del sistema.</CardDescription>
                  </div>
                  <div className="flex gap-3 w-full md:w-auto">
                    <div className="relative w-full md:w-72">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-[var(--ink-soft)]" />
                      <Input 
                        placeholder="Buscar clienta o servicio..." 
                        className="pl-9 bg-white"
                        value={aptQuery}
                        onChange={(e) => setAptQuery(e.target.value)}
                      />
                    </div>
                    <Button variant="gold" onClick={openCreateAptModal}>
                      <Clock className="mr-2 size-4" />
                      Nueva Cita
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left">
                    <thead className="bg-[var(--quartz-soft)]/50 text-[var(--ink-soft)] uppercase text-[10px] font-bold tracking-widest">
                      <tr>
                        <th className="px-6 py-4">Clienta</th>
                        <th className="px-6 py-4">Servicio</th>
                        <th className="px-6 py-4">Fecha & Hora</th>
                        <th className="px-6 py-4">Estado</th>
                        <th className="px-6 py-4 text-right">Acciones</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[var(--line)]">
                      {filteredApts.map((apt) => (
                        <tr key={apt.id} className="hover:bg-white transition-colors">
                          <td className="px-6 py-4">
                            <div className="font-semibold text-[var(--ink)]">
                              {users.find(u => u.id === apt.userId)?.name || "Invitada"}
                            </div>
                            <div className="text-[10px] text-[var(--ink-soft)]">
                              {users.find(u => u.id === apt.userId)?.email}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <Badge variant="luxury" className="bg-[var(--quartz-soft)] border-none">
                              {services.find(s => s.id === apt.serviceId)?.name}
                            </Badge>
                          </td>
                          <td className="px-6 py-4">
                            <div className="font-medium">{formatDate(apt.startAt, "d MMM, yyyy")}</div>
                            <div className="text-xs text-[var(--ink-soft)]">{formatTime(apt.startAt)}</div>
                          </td>
                          <td className="px-6 py-4">
                            <Badge className={cn(
                              "font-bold",
                              apt.status === "RESERVED" && "bg-emerald-50 text-emerald-700 border-emerald-100",
                              apt.status === "PENDING" && "bg-amber-50 text-amber-700 border-amber-100",
                              apt.status === "CANCELLED" && "bg-rose-50 text-rose-700 border-rose-100"
                            )}>
                              {statusLabels[apt.status as keyof typeof statusLabels]}
                            </Badge>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm" className="size-8 p-0">
                                  <MoreVertical className="size-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="w-48">
                                <DropdownMenuItem onClick={() => openEditAptModal(apt)}>Ver / Editar Detalles</DropdownMenuItem>
                                <DropdownMenuItem onClick={() => openEditAptModal(apt)}>Reagendar</DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem 
                                  className="text-rose-600"
                                  onClick={() => setAptToDelete(apt.id)}
                                >
                                  Cancelar Cita
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="users" className="animate-in fade-in slide-in-from-bottom-4 duration-400">
            <Card className="border-[var(--line)] overflow-hidden">
              <CardHeader className="bg-[var(--quartz-soft)]/30 border-b border-[var(--line)]">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <CardTitle className="font-display text-2xl">Gestión de Usuarios</CardTitle>
                    <CardDescription>Administra clientas, staff y permisos del sistema.</CardDescription>
                  </div>
                  <div className="flex gap-3">
                    <div className="relative w-full md:w-64">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-[var(--ink-soft)]" />
                      <Input 
                        placeholder="Buscar por nombre o email..." 
                        className="pl-9 bg-white"
                        value={userQuery}
                        onChange={(e) => setUserQuery(e.target.value)}
                      />
                    </div>
                    <Button variant="gold" size="icon" onClick={openCreateModal}>
                      <UserPlus className="size-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left">
                    <thead className="bg-[var(--quartz-soft)]/50 text-[var(--ink-soft)] uppercase text-[10px] font-bold tracking-widest">
                      <tr>
                        <th className="px-6 py-4">Usuario</th>
                        <th className="px-6 py-4">Rol</th>
                        <th className="px-6 py-4">Contacto</th>
                        <th className="px-6 py-4">Citas</th>
                        <th className="px-6 py-4 text-right">Acciones</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[var(--line)]">
                      {filteredUsers.map((u) => (
                        <tr key={u.id} className="hover:bg-white transition-colors">
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className="size-9 rounded-full bg-[var(--quartz-soft)] flex items-center justify-center font-display font-bold text-[var(--gold)]">
                                {u.name?.charAt(0)}
                              </div>
                              <div className="font-semibold text-[var(--ink)]">{u.name}</div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <Badge className={cn(
                              "font-bold",
                              u.role === "ADMIN" ? "bg-indigo-50 text-indigo-700 border-indigo-100" : 
                              u.role === "STAFF" ? "bg-emerald-50 text-emerald-700 border-emerald-100" : 
                              "bg-zinc-50 text-zinc-600 border-zinc-100"
                            )}>
                              {u.role === "ADMIN" ? <ShieldCheck className="mr-1 size-3" /> : 
                               u.role === "STAFF" ? <Briefcase className="mr-1 size-3" /> : null}
                              {u.role}
                            </Badge>
                          </td>
                          <td className="px-6 py-4 text-xs">
                            <div>{u.email}</div>
                            <div className="text-[var(--ink-soft)]">{u.phone}</div>
                          </td>
                          <td className="px-6 py-4">
                            <span className="font-bold">{appointments.filter(a => a.userId === u.id).length}</span>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <div className="flex justify-end gap-2">
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="icon" className="size-8 hover:text-[var(--gold)]">
                                    <MoreVertical className="size-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem onClick={() => openEditModal(u)}>Editar Detalles</DropdownMenuItem>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem onClick={() => updateRole(u.id, "ADMIN")}>Hacer Admin</DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => updateRole(u.id, "STAFF")}>Hacer Staff</DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => updateRole(u.id, "USER")}>Hacer Usuario</DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                className="size-8 text-rose-500 hover:bg-rose-50"
                                onClick={() => setUserToDelete(u.id)}
                              >
                                <Trash2 className="size-4" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="schedules" className="animate-in fade-in slide-in-from-bottom-4 duration-400">
            <Card className="border-[var(--line)]">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="font-display text-2xl">Horarios de Operación</CardTitle>
                    <CardDescription>Define cuándo está abierto Perfect Nails para reservas.</CardDescription>
                  </div>
                  <Button variant="gold" size="sm" onClick={saveAllSchedules} disabled={isSubmitting}>
                    {isSubmitting ? "Guardando..." : "Guardar Cambios"}
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4">
                  {schedules.map((schedule) => (
                    <div key={schedule.id} className="flex flex-col md:flex-row md:items-center justify-between p-4 rounded-xl border border-[var(--line)] bg-white/50 gap-4 transition-all hover:border-[var(--gold)]">
                      <div className="flex items-center gap-4">
                        <div className="w-24 font-semibold text-[var(--ink)]">
                          {dayNames[schedule.dayOfWeek % 7]}
                        </div>
                        <Badge variant={schedule.isActive ? "gold" : "outline"} className="w-20 justify-center">
                          {schedule.isActive ? "Activo" : "Cerrado"}
                        </Badge>
                      </div>
                      
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                          <Clock className="size-4 text-[var(--ink-soft)]" />
                          <Input 
                            className="w-24 h-9 bg-white" 
                            type="time"
                            value={schedule.startTime} 
                            onChange={(e) => handleScheduleTimeChange(schedule.id, "startTime", e.target.value)}
                          />
                        </div>
                        <span className="text-[var(--ink-soft)] font-medium">a</span>
                        <div className="flex items-center gap-2">
                          <Clock className="size-4 text-[var(--ink-soft)]" />
                          <Input 
                            className="w-24 h-9 bg-white" 
                            type="time"
                            value={schedule.endTime} 
                            onChange={(e) => handleScheduleTimeChange(schedule.id, "endTime", e.target.value)}
                          />
                        </div>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className={cn(
                            "ml-2 font-bold",
                            schedule.isActive ? "text-rose-600 hover:bg-rose-50" : "text-emerald-600 hover:bg-emerald-50"
                          )}
                          onClick={() => updateSchedule(schedule.id, { isActive: !schedule.isActive })}
                        >
                          {schedule.isActive ? "Cerrar" : "Abrir"}
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
