"use client";

import { useState, useMemo } from "react";
import type { User } from "@/domain/entities/user.entity";
import type { Appointment } from "@/domain/entities/appointment.entity";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import {
  Search,
  UserPlus,
  ShieldCheck,
  Briefcase,
  MoreVertical,
  Edit,
  Trash2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface AdminUsersTabProps {
  users: User[];
  setUsers: React.Dispatch<React.SetStateAction<User[]>>;
  appointments: Appointment[];
}

export function AdminUsersTab({
  users,
  setUsers,
  appointments,
}: AdminUsersTabProps) {
  const [userQuery, setUserQuery] = useState("");
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [userToDelete, setUserToDelete] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    role: "USER" as User["role"],
  });

  const filteredUsers = useMemo(() => {
    return users.filter(
      (u) =>
        u.name?.toLowerCase().includes(userQuery.toLowerCase()) ||
        u.email.toLowerCase().includes(userQuery.toLowerCase()),
    );
  }, [users, userQuery]);

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
      role: user.role,
    });
    setIsUserModalOpen(true);
  }

  async function handleUserSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const url = editingUser
        ? `/api/admin/users/${editingUser.id}`
        : "/api/admin/users";
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
          setUsers((prev) =>
            prev.map((u) => (u.id === editingUser.id ? newUser : u)),
          );
          toast.success("Usuario actualizado correctamente.");
        } else {
          setUsers((prev) => [newUser, ...prev]);
          toast.success("Usuario creado correctamente.");
        }
        setIsUserModalOpen(false);
      } else {
        toast.error(data.error?.message || "Error al procesar la solicitud.");
      }
    } catch {
      toast.error("Error de conexión al servidor.");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function deleteUser() {
    if (!userToDelete) return;
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/admin/users/${userToDelete}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (res.ok) {
        setUsers((prev) => prev.filter((u) => u.id !== userToDelete));
        toast.success("Usuario eliminado correctamente.");
      } else {
        toast.error(data.error?.message || "No se pudo eliminar el usuario.");
      }
    } catch {
      toast.error("Error de conexión al servidor.");
    } finally {
      setIsDeleting(false);
      setUserToDelete(null);
    }
  }

  async function updateRole(id: string, role: User["role"]) {
    try {
      const res = await fetch(`/api/admin/users/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role }),
      });
      const data = await res.json();
      if (res.ok) {
        setUsers((prev) => prev.map((u) => (u.id === id ? { ...u, role } : u)));
        toast.success(`Rol actualizado a ${role} con éxito.`);
      } else {
        toast.error(data.error?.message || "Error al actualizar el rol.");
      }
    } catch {
      toast.error("Error al procesar la solicitud.");
    }
  }

  return (
    <>
      <Card className="border-[var(--line)] overflow-hidden">
        <CardHeader className="bg-[var(--quartz-soft)]/30 border-b border-[var(--line)]">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <CardTitle className="font-display text-2xl">
                Gestión de Usuarios
              </CardTitle>
              <CardDescription>
                Administra clientas, staff y permisos del sistema.
              </CardDescription>
            </div>
            <div className="flex gap-3">
              <div className="relative w-full md:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-[var(--ink-soft)]" />
                <Input
                  placeholder="Buscar por nombre o email..."
                  className="pl-9 bg-white border-[var(--line)] rounded-xl"
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
                          {u.name?.charAt(0) || "U"}
                        </div>
                        <div className="font-semibold text-[var(--ink)]">
                          {u.name || "Sin Nombre"}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <Badge
                        className={cn(
                          "font-bold",
                          u.role === "ADMIN"
                            ? "bg-indigo-50 text-indigo-700 border-indigo-100"
                            : u.role === "STAFF"
                              ? "bg-emerald-50 text-emerald-700 border-emerald-100"
                              : "bg-zinc-50 text-zinc-600 border-zinc-100",
                        )}
                      >
                        {u.role === "ADMIN" ? (
                          <ShieldCheck className="mr-1 size-3" />
                        ) : u.role === "STAFF" ? (
                          <Briefcase className="mr-1 size-3" />
                        ) : null}
                        {u.role}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 text-xs">
                      <div>{u.email}</div>
                      <div className="text-[var(--ink-soft)]">
                        {u.phone || "—"}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-bold">
                        {appointments.filter((a) => a.userId === u.id).length}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="size-8 hover:text-[var(--gold)]"
                            >
                              <MoreVertical className="size-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => openEditModal(u)}>
                              Editar Detalles
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() => updateRole(u.id, "ADMIN")}
                            >
                              Hacer Admin
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => updateRole(u.id, "STAFF")}
                            >
                              Hacer Staff
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => updateRole(u.id, "USER")}
                            >
                              Hacer Usuario
                            </DropdownMenuItem>
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

      <Dialog open={isUserModalOpen} onOpenChange={setIsUserModalOpen}>
        <DialogContent className="sm:max-w-[425px] overflow-hidden p-0 glass-panel">
          <div className="bg-[linear-gradient(135deg,var(--ink)_0%,#241f26_58%,#3a3037_100%)] p-8 text-white">
            <DialogHeader>
              <div className="flex items-center gap-4 mb-2">
                <div className="size-12 rounded-2xl bg-[var(--gold)] flex items-center justify-center">
                  <UserPlus className="size-6 text-[var(--ink)]" />
                </div>
                <div>
                  <DialogTitle className="font-display text-3xl text-white">
                    {editingUser ? "Editar Usuario" : "Nuevo Usuario"}
                  </DialogTitle>
                  <DialogDescription className="text-white/75">
                    {editingUser
                      ? "Modifica los datos del usuario seleccionado."
                      : "Registra un nuevo miembro del staff o clienta."}
                  </DialogDescription>
                </div>
              </div>
            </DialogHeader>
          </div>
          <form
            onSubmit={handleUserSubmit}
            className="space-y-6 p-8 bg-transparent max-h-[70vh] overflow-y-auto"
          >
            <div className="space-y-2">
              <Label
                htmlFor="name"
                className="text-xs font-bold uppercase tracking-widest text-[var(--ink-soft)]"
              >
                Nombre Completo
              </Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                placeholder="Ej. Maria Lopez"
                className="h-12 border-[var(--line)] rounded-xl"
                required
              />
            </div>
            <div className="space-y-2">
              <Label
                htmlFor="email"
                className="text-xs font-bold uppercase tracking-widest text-[var(--ink-soft)]"
              >
                Correo Electrónico
              </Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                placeholder="maria@example.com"
                className="h-12 border-[var(--line)] rounded-xl"
                required
              />
            </div>
            <div className="space-y-2">
              <Label
                htmlFor="phone"
                className="text-xs font-bold uppercase tracking-widest text-[var(--ink-soft)]"
              >
                Teléfono
              </Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) =>
                  setFormData({ ...formData, phone: e.target.value })
                }
                placeholder="+57 300 0000000"
                className="h-12 border-[var(--line)] rounded-xl"
              />
            </div>
            <div className="space-y-2">
              <Label
                htmlFor="role"
                className="text-xs font-bold uppercase tracking-widest text-[var(--ink-soft)]"
              >
                Rol en el Sistema
              </Label>
              <Select
                value={formData.role}
                onValueChange={(val) =>
                  setFormData({ ...formData, role: val as User["role"] })
                }
              >
                <SelectTrigger className="h-12 border-[var(--line)] rounded-xl">
                  <SelectValue placeholder="Seleccionar rol" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="USER">Cliente (USER)</SelectItem>
                  <SelectItem value="STAFF">Personal (STAFF)</SelectItem>
                  <SelectItem value="ADMIN">Administrador (ADMIN)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <DialogFooter className="border-t border-[var(--line)] pt-6 pb-8 flex gap-3">
              <Button
                type="button"
                variant="ghost"
                onClick={() => setIsUserModalOpen(false)}
                className="flex-1"
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                variant="gold"
                disabled={isSubmitting}
                className="flex-1 h-12 rounded-xl font-bold shadow-lg shadow-[var(--gold-soft)]/20"
              >
                {isSubmitting ? "Guardando..." : "Guardar Cambios"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <AlertDialog
        open={!!userToDelete}
        onOpenChange={(open) => !open && setUserToDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estás completamente segura?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción eliminará permanentemente la cuenta del usuario y
              todos sus datos asociados. No se puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>
              Cancelar
            </AlertDialogCancel>
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
    </>
  );
}
