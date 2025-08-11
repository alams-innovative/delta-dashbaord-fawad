"use client"

import { useEffect, useMemo, useState } from "react"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Trash2, UserPlus, Edit, Eye, EyeOff, Loader2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

type Role = "staff" | "admin" | "super_admin"

interface User {
  id: number
  name: string
  email: string
  role: Role
  created_at: string
  updated_at: string
}

const createUserSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters long"),
  email: z.string().email("Please enter a valid email"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Za-z]/, "Password must include a letter")
    .regex(/[0-9]/, "Password must include a number"),
  role: z.enum(["staff", "admin", "super_admin"]),
})

const updateUserSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters long"),
  email: z.string().email("Please enter a valid email"),
  password: z.string().optional(), // empty or undefined means no change
  role: z.enum(["staff", "admin", "super_admin"]),
})

function PasswordStrength({ value }: { value: string }) {
  const score = useMemo(() => {
    let s = 0
    if (!value) return 0
    if (value.length >= 8) s++
    if (/[A-Z]/.test(value)) s++
    if (/[a-z]/.test(value)) s++
    if (/[0-9]/.test(value)) s++
    if (/[^A-Za-z0-9]/.test(value)) s++
    return Math.min(s, 5)
  }, [value])

  const labels = ["Very weak", "Weak", "Fair", "Good", "Strong"]
  const colors = ["bg-red-500", "bg-orange-500", "bg-yellow-500", "bg-lime-500", "bg-emerald-600"]
  const width = `${(score / 5) * 100}%`

  if (!value) return null

  return (
    <div className="space-y-1">
      <div className="h-2 w-full rounded bg-muted">
        <div className={`h-2 rounded ${colors[score - 1] || "bg-muted"} transition-all`} style={{ width }} />
      </div>
      <p className="text-xs text-muted-foreground">{labels[score - 1] || "Very weak"}</p>
    </div>
  )
}

export default function UsersPage() {
  const { toast } = useToast()
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)

  // Add dialog state
  const [isAddOpen, setIsAddOpen] = useState(false)
  const [addServerError, setAddServerError] = useState<string | null>(null)
  const [showAddPassword, setShowAddPassword] = useState(false)

  // Edit dialog state
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [editingUser, setEditingUser] = useState<User | null>(null)
  const [editServerError, setEditServerError] = useState<string | null>(null)
  const [showEditPassword, setShowEditPassword] = useState(false)

  const addForm = useForm<z.infer<typeof createUserSchema>>({
    resolver: zodResolver(createUserSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      role: "staff",
    },
    mode: "onChange",
  })

  const editForm = useForm<z.infer<typeof updateUserSchema>>({
    resolver: zodResolver(updateUserSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      role: "staff",
    },
    mode: "onChange",
  })

  const fetchUsers = async () => {
    try {
      setLoading(true)
      const res = await fetch("/api/users", { cache: "no-store" })
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err.error || "Failed to fetch users")
      }
      const data: User[] = await res.json()
      setUsers(data)
    } catch (error) {
      console.error(error)
      toast({
        title: "Error",
        description: "Failed to fetch users",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchUsers()
  }, [])

  const onAddSubmit = async (values: z.infer<typeof createUserSchema>) => {
    setAddServerError(null)
    try {
      const res = await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      })
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        if (res.status === 409) {
          setAddServerError(err.error || "A user with this email already exists.")
        } else if (res.status === 422) {
          setAddServerError("Please correct the highlighted errors and try again.")
        } else if (res.status === 401) {
          setAddServerError("You are not authorized to perform this action.")
        } else {
          setAddServerError(err.error || "Failed to create user")
        }
        return
      }
      toast({ title: "User created", description: "The user was created successfully." })
      setIsAddOpen(false)
      addForm.reset({ name: "", email: "", password: "", role: "staff" })
      await fetchUsers()
    } catch (error) {
      console.error(error)
      setAddServerError("An unexpected error occurred. Please try again.")
    }
  }

  const openEdit = (user: User) => {
    setEditingUser(user)
    setEditServerError(null)
    editForm.reset({
      name: user.name,
      email: user.email,
      password: "", // leave empty to not change
      role: user.role,
    })
    setIsEditOpen(true)
  }

  const onEditSubmit = async (values: z.infer<typeof updateUserSchema>) => {
    if (!editingUser) return
    setEditServerError(null)
    try {
      const payload = {
        name: values.name,
        email: values.email,
        role: values.role,
        // only send password if not empty
        ...(values.password && values.password.trim().length > 0 ? { password: values.password } : {}),
      }

      const res = await fetch(`/api/users/${editingUser.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        if (res.status === 409) {
          setEditServerError(err.error || "A user with this email already exists.")
        } else if (res.status === 422) {
          setEditServerError("Please correct the highlighted errors and try again.")
        } else if (res.status === 401) {
          setEditServerError("You are not authorized to perform this action.")
        } else if (res.status === 404) {
          setEditServerError("User not found. It may have been deleted.")
        } else {
          setEditServerError(err.error || "Failed to update user")
        }
        return
      }
      toast({ title: "User updated", description: "The user was updated successfully." })
      setIsEditOpen(false)
      setEditingUser(null)
      await fetchUsers()
    } catch (error) {
      console.error(error)
      setEditServerError("An unexpected error occurred. Please try again.")
    }
  }

  const handleDelete = async (user: User) => {
    const confirmed = confirm(`Delete user "${user.name}"? This action cannot be undone.`)
    if (!confirmed) return
    try {
      const res = await fetch(`/api/users/${user.id}`, { method: "DELETE" })
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        toast({
          title: "Error",
          description: err.error || "Failed to delete user",
          variant: "destructive",
        })
        return
      }
      toast({ title: "User deleted", description: "The user was deleted successfully." })
      await fetchUsers()
    } catch (error) {
      console.error(error)
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      })
    }
  }

  const getRoleBadgeVariant = (role: Role) => {
    switch (role) {
      case "super_admin":
        return "destructive"
      case "admin":
        return "default"
      case "staff":
      default:
        return "secondary"
    }
  }

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between gap-2">
        <h2 className="text-3xl font-bold tracking-tight">User Management</h2>
        <Dialog
          open={isAddOpen}
          onOpenChange={(open) => {
            setIsAddOpen(open)
            if (!open) setAddServerError(null)
          }}
        >
          <DialogTrigger asChild>
            <Button>
              <UserPlus className="mr-2 h-4 w-4" />
              Add User
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[480px]">
            <DialogHeader>
              <DialogTitle>Add New User</DialogTitle>
              <DialogDescription>Create a new user account.</DialogDescription>
            </DialogHeader>

            {addServerError && (
              <Alert variant="destructive" className="mb-2">
                <AlertTitle>Couldn&apos;t create user</AlertTitle>
                <AlertDescription>{addServerError}</AlertDescription>
              </Alert>
            )}

            <Form {...addForm}>
              <form onSubmit={addForm.handleSubmit(onAddSubmit)} className="space-y-4">
                <FormField
                  control={addForm.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter full name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={addForm.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input type="email" placeholder="Enter email address" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={addForm.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Password</FormLabel>
                      <div className="relative">
                        <FormControl>
                          <Input
                            type={showAddPassword ? "text" : "password"}
                            placeholder="Set a strong password"
                            {...field}
                          />
                        </FormControl>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                          onClick={() => setShowAddPassword((s) => !s)}
                          aria-label={showAddPassword ? "Hide password" : "Show password"}
                        >
                          {showAddPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </Button>
                      </div>
                      <PasswordStrength value={field.value || ""} />
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={addForm.control}
                  name="role"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Role</FormLabel>
                      <Select value={field.value} onValueChange={(value: Role) => field.onChange(value)}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select role" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="staff">Staff</SelectItem>
                          <SelectItem value="admin">Admin</SelectItem>
                          <SelectItem value="super_admin">Super Admin</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setIsAddOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={addForm.formState.isSubmitting}>
                    {addForm.formState.isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Creating...
                      </>
                    ) : (
                      "Create User"
                    )}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>System Users</CardTitle>
          <CardDescription>Manage user accounts and their roles.</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex h-48 items-center justify-center text-muted-foreground">
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              Loading users...
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">{user.name}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>
                      <Badge variant={getRoleBadgeVariant(user.role)}>
                        {user.role.replace("_", " ").toUpperCase()}
                      </Badge>
                    </TableCell>
                    <TableCell>{new Date(user.created_at).toLocaleDateString()}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="outline" size="sm" onClick={() => openEdit(user)} aria-label="Edit user">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDelete(user)}
                          className="text-red-600 hover:text-red-700"
                          aria-label="Delete user"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {users.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center text-muted-foreground">
                      No users found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Edit User Dialog */}
      <Dialog
        open={isEditOpen}
        onOpenChange={(open) => {
          setIsEditOpen(open)
          if (!open) setEditServerError(null)
        }}
      >
        <DialogContent className="sm:max-w-[480px]">
          <DialogHeader>
            <DialogTitle>Edit User</DialogTitle>
            <DialogDescription>
              Update user information. Leave password empty to keep current password.
            </DialogDescription>
          </DialogHeader>

          {editServerError && (
            <Alert variant="destructive" className="mb-2">
              <AlertTitle>Couldn&apos;t update user</AlertTitle>
              <AlertDescription>{editServerError}</AlertDescription>
            </Alert>
          )}

          <Form {...editForm}>
            <form onSubmit={editForm.handleSubmit(onEditSubmit)} className="space-y-4">
              <FormField
                control={editForm.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter full name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={editForm.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="Enter email address" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={editForm.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <div className="flex items-center justify-between">
                      <FormLabel>New Password</FormLabel>
                      <span className="text-xs text-muted-foreground">Leave empty to keep current</span>
                    </div>
                    <div className="relative">
                      <FormControl>
                        <Input
                          type={showEditPassword ? "text" : "password"}
                          placeholder="Enter new password (optional)"
                          {...field}
                        />
                      </FormControl>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                        onClick={() => setShowEditPassword((s) => !s)}
                        aria-label={showEditPassword ? "Hide password" : "Show password"}
                      >
                        {showEditPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                    </div>
                    {/* show strength only if user typed something */}
                    {field.value && field.value.trim().length > 0 ? <PasswordStrength value={field.value} /> : null}
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={editForm.control}
                name="role"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Role</FormLabel>
                    <Select value={field.value} onValueChange={(value: Role) => field.onChange(value)}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select role" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="staff">Staff</SelectItem>
                        <SelectItem value="admin">Admin</SelectItem>
                        <SelectItem value="super_admin">Super Admin</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsEditOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={editForm.formState.isSubmitting}>
                  {editForm.formState.isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    "Save changes"
                  )}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
