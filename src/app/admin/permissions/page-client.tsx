"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Shield,
  Search,
  Plus,
  X,
  Trash2,
  AlertCircle,
  UserCheck,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { LoadingSpinner } from "@/components/ui/spinner";
import { NoResults } from "@/components/NoResults";
import { api } from "@/trpc/react";
import { toast } from "sonner";

import {
  permissionFormSchema,
  type PermissionFormData,
} from "@/schemas/admin.schemas";
import { Container } from "@/components/Container";
import type { Permission } from "@/types/admin";

export function PermissionsPageClient() {
  const [searchUsername, setSearchUsername] = useState("");
  const [selectedUsername, setSelectedUsername] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);

  const [allPermissions] =
    api.admin.permissions.getAll.useSuspenseQuery(undefined);
  const [usernames] = api.admin.permissions.getUsernames.useSuspenseQuery();

  const { data: userPermissions, isLoading: loadingUser } =
    api.admin.permissions.getForUser.useQuery(
      {
        username: selectedUsername,
        mainMenu: "", // This would need to be selected
      },
      { enabled: !!selectedUsername },
    );

  const utils = api.useUtils();
  const { mutateAsync: createPermissions } =
    api.admin.permissions.create.useMutation({
      onSuccess: () => {
        utils.admin.permissions.getAll.invalidate();
        toast.success("Успех", {
          description: "Правата са успешно добавени.",
        });
      },
      onError: (error) => {
        toast.error("Грешка", {
          description:
            error.message ||
            "Възникна грешка при добавянето на права. Опитайте отново.",
        });
      },
    });

  const { mutateAsync: removePermission } =
    api.admin.permissions.remove.useMutation({
      onSuccess: () => {
        utils.admin.permissions.getAll.invalidate();
        if (selectedUsername) {
          utils.admin.permissions.getForUser.invalidate({
            username: selectedUsername,
            mainMenu: "",
          });
        }
        toast.success("Успех", {
          description: "Правата са успешно премахнати.",
        });
      },
      onError: (error) => {
        toast.error("Грешка", {
          description:
            error.message ||
            "Възникна грешка при премахването на права. Опитайте отново.",
        });
      },
    });

  const form = useForm<PermissionFormData>({
    resolver: zodResolver(permissionFormSchema),
    mode: "onChange",
    reValidateMode: "onChange",
    defaultValues: {
      Username: "",
      main_menu: "",
      submenu: "",
      action: "",
      ordermenu: 1,
      Active: 1,
      IsDispatcher: 0,
      Departmant: "",
      specialPermisions: null,
      DMAAdmins: null,
      ro: null,
    },
  });

  const watchedMainMenu = form.watch("main_menu");

  const mainMenus = [
    ...new Set(
      allPermissions
        ?.map((p) => p.main_menu)
        .filter((menu): menu is string => Boolean(menu && menu.trim())) || [],
    ),
  ];

  const submenus =
    allPermissions
      ?.filter((p) => p.main_menu === watchedMainMenu && p.submenu)
      .map((p) => p.submenu)
      .filter((value): value is string => Boolean(value && value.trim()))
      .filter((value, index, self) => self.indexOf(value) === index) || [];

  const handleSearch = () => {
    if (searchUsername.trim()) {
      setSelectedUsername(searchUsername.trim());
    }
  };

  const handleAddPermission = async (values: PermissionFormData) => {
    try {
      await createPermissions([
        {
          Username: values.Username,
          main_menu: values.main_menu,
          main_menuName: values.main_menu,
          submenu: values.submenu || null,
          submenuName: values.submenu || null,
          action: values.action,
          ordermenu: values.ordermenu || 1,
          specialPermisions: values.specialPermisions || null,
          DMAAdmins: values.DMAAdmins || null,
          Active: values.Active || 1,
          IsDispatcher: values.IsDispatcher || null,
          Departmant: values.Departmant || null,
          ro: values.ro || null,
        },
      ]);
      form.reset();
      setShowAddForm(false);
    } catch (error) {
      console.error("Error adding permission:", error);
    }
  };

  const handleRemovePermission = async (permission: Permission) => {
    try {
      await removePermission({
        Username: permission.Username,
        main_menu: permission.main_menu,
        submenu: permission.submenu,
        action: permission.action,
      });
    } catch (error) {
      console.error("Error removing permission:", error);
    }
  };

  return (
    <Container
      title="Потребителски права"
      description="Добавяне и управление на потребителски права"
      headerChildren={
        <div className="mb-4 flex justify-end">
          <Button
            onClick={() => {
              setShowAddForm((curr) => !curr);
            }}
            variant={showAddForm ? "outline" : "ell"}
            size="lg"
            className="w-36 gap-2"
          >
            {!showAddForm ? (
              <>
                <Plus className="animate-in fade-in spin-in-0 h-5 w-5 duration-300" />
                <span className="animate-in fade-in slide-in-from-left-2 duration-300">
                  Добави права
                </span>
              </>
            ) : (
              <>
                <X className="animate-in fade-in spin-in-90 h-5 w-5 duration-300" />
                <span className="animate-in fade-in slide-in-from-right-2 duration-300">
                  Затвори
                </span>
              </>
            )}
          </Button>
        </div>
      }
    >
      {/* Add Permission Form */}
      {showAddForm && (
        <Card className="mb-6 shadow-lg">
          <CardHeader className="border-b">
            <div className="flex items-center gap-2">
              <Plus className="text-ell-primary h-5 w-5" />
              <div>
                <CardTitle className="text-xl">
                  Добавяне на нови права
                </CardTitle>
                <CardDescription>
                  Попълнете формата за да присвоите права на потребител
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(handleAddPermission)}>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="Username"
                    render={({ field }) => (
                      <FormItem className="w-full min-w-0">
                        <FormLabel>Потребителско име *</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Въведете потребителско име"
                            list="usernames-list"
                            {...field}
                          />
                        </FormControl>
                        <datalist id="usernames-list">
                          {usernames?.map((username, idx) => (
                            <option
                              key={`${username}-${idx}`}
                              value={username}
                            />
                          ))}
                        </datalist>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="main_menu"
                    render={({ field }) => (
                      <FormItem className="w-full min-w-0">
                        <FormLabel>Главно меню *</FormLabel>
                        <Select
                          onValueChange={(value) => {
                            field.onChange(value);
                            form.setValue("main_menu", value);
                            form.setValue(
                              "main_menuName",
                              mainMenus.find((menu) => menu === value) || "",
                            );
                          }}
                          value={field.value}
                        >
                          <FormControl>
                            <SelectTrigger className="w-full min-w-0">
                              <SelectValue placeholder="Изберете главно меню" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {mainMenus.map((menu) => (
                              <SelectItem key={menu} value={menu}>
                                {menu}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="submenu"
                    render={({ field }) => (
                      <FormItem className="w-full min-w-0">
                        <FormLabel>Подменю</FormLabel>
                        <Select
                          onValueChange={(value) => {
                            field.onChange(value);
                            form.setValue("submenu", value);
                            form.setValue(
                              "submenuName",
                              submenus.find((submenu) => submenu === value) ||
                                "",
                            );
                          }}
                          value={field.value || ""}
                          disabled={!watchedMainMenu}
                        >
                          <FormControl>
                            <SelectTrigger className="w-full min-w-0">
                              <SelectValue placeholder="Изберете подменю (незадължително)" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {submenus.map((submenu) => (
                              <SelectItem key={submenu} value={submenu}>
                                {submenu}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="action"
                    render={({ field }) => (
                      <FormItem className="w-full min-w-0">
                        <FormLabel>Действие *</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Въведете действие (напр. read, write, admin)"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="ordermenu"
                    render={({ field }) => (
                      <FormItem className="w-full min-w-0">
                        <FormLabel>Подредба</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            placeholder="Подредба на менюто"
                            {...field}
                            value={field.value || ""}
                            onChange={(e) =>
                              field.onChange(parseInt(e.target.value) || 1)
                            }
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="Departmant"
                    render={({ field }) => (
                      <FormItem className="w-full min-w-0">
                        <FormLabel>Отдел</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Отдел"
                            {...field}
                            value={field.value || ""}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="Active"
                    render={({ field }) => (
                      <FormItem className="flex items-center space-y-0 space-x-2">
                        <FormControl>
                          <Checkbox
                            checked={field.value === 1}
                            onCheckedChange={(checked) =>
                              field.onChange(checked ? 1 : 0)
                            }
                          />
                        </FormControl>
                        <FormLabel className="mt-0!">Активно</FormLabel>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="IsDispatcher"
                    render={({ field }) => (
                      <FormItem className="flex items-center space-y-0 space-x-2">
                        <FormControl>
                          <Checkbox
                            checked={field.value === 1}
                            onCheckedChange={(checked) =>
                              field.onChange(checked ? 1 : 0)
                            }
                          />
                        </FormControl>
                        <FormLabel className="mt-0!">Диспечер</FormLabel>
                      </FormItem>
                    )}
                  />
                </div>

                <div className="mt-6">
                  <Button
                    type="submit"
                    disabled={!form.formState.isValid}
                    className="w-full gap-2 md:w-auto"
                    variant="default"
                  >
                    <Plus className="h-4 w-4" />
                    Добави права
                  </Button>
                </div>
              </form>
            </Form>
            {JSON.stringify(form.formState.errors)}
          </CardContent>
        </Card>
      )}

      {/* Search Section */}
      <Card className="mb-6 shadow-lg">
        <CardHeader className="border-b">
          <div className="flex items-center gap-2">
            <Search className="text-ell-primary h-5 w-5" />
            <div>
              <CardTitle className="text-xl">
                Търсене на потребителски права
              </CardTitle>
              <CardDescription>
                Въведете потребителско име за преглед на текущите права
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <Input
              placeholder="Въведете потребителско име..."
              value={searchUsername}
              onChange={(e) => setSearchUsername(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && handleSearch()}
              className="flex-1"
              list="usernames-list"
            />
            <datalist id="usernames-list">
              {usernames?.map((username, idx) => (
                <option key={`${username}-${idx}`} value={username} />
              ))}
            </datalist>
            <Button
              onClick={handleSearch}
              disabled={!searchUsername.trim()}
              className="gap-2"
            >
              <Search className="h-4 w-4" />
              Търси
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* User Permissions Display */}
      {selectedUsername && (
        <Card className="shadow-lg">
          <CardHeader className="border-b">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <UserCheck className="text-ell-primary h-5 w-5" />
                <div>
                  <CardTitle className="text-xl">
                    Права за: {selectedUsername}
                  </CardTitle>
                  <CardDescription>
                    Текущи права присвоени на потребителя
                  </CardDescription>
                </div>
              </div>
              {!loadingUser &&
                userPermissions &&
                userPermissions.length > 0 && (
                  <Badge variant="outline" className="text-ell-primary text-sm">
                    {userPermissions.length}{" "}
                    {userPermissions.length === 1 ? "право" : "права"}
                  </Badge>
                )}
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            {loadingUser ? (
              <div className="flex flex-col items-center justify-center py-12">
                <LoadingSpinner
                  size="lg"
                  label="Зареждане на права..."
                  showLabel
                />
              </div>
            ) : userPermissions && userPermissions.length > 0 ? (
              <div className="space-y-3">
                {userPermissions.map((permission) => (
                  <div
                    key={permission.ID}
                    className="flex items-center justify-between rounded-lg border border-slate-200 p-4 transition-colors hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-800/50"
                  >
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center gap-2">
                        <Shield className="text-ell-primary h-4 w-4" />
                        <span className="font-semibold text-slate-900 dark:text-slate-100">
                          {permission.main_menuName}
                          {permission.submenuName &&
                            ` → ${permission.submenuName}`}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                        <span>Действие: {permission.action}</span>
                        {permission.Active === 0 && (
                          <Badge variant="destructive" className="text-xs">
                            Неактивно
                          </Badge>
                        )}
                        {permission.IsDispatcher === 1 && (
                          <Badge variant="outline" className="text-xs">
                            Диспечер
                          </Badge>
                        )}
                      </div>
                    </div>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleRemovePermission(permission)}
                      className="gap-2"
                    >
                      <Trash2 className="h-4 w-4" />
                      Премахни
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <NoResults
                icon={<AlertCircle className="text-ell-primary size-12" />}
                title={`Няма намерени права за: ${selectedUsername}`}
                description="Грешен потребител или този потребител няма присвоени права в системата."
              />
            )}
          </CardContent>
        </Card>
      )}
    </Container>
  );
}
