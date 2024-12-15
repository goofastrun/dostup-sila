import { Card } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

export const Roles = () => {
  const { toast } = useToast();
  const { data: users = [], refetch } = useQuery({
    queryKey: ["users"],
    queryFn: async () => {
      const response = await fetch("/api/users");
      if (!response.ok) {
        throw new Error("Failed to fetch users");
      }
      return response.json();
    },
  });

  const handleRoleChange = async (userId: number, newRole: string) => {
    try {
      const response = await fetch(`/api/users/${userId}/role`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: newRole }),
      });

      if (response.ok) {
        refetch();
        toast({
          title: "Успешно",
          description: "Роль пользователя обновлена",
        });
      }
    } catch (error) {
      toast({
        title: "Ошибка",
        description: "Не удалось обновить роль пользователя",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Роли</h1>
      <Card className="p-6">
        <div className="space-y-4">
          <div className="grid grid-cols-5 font-semibold">
            <div>Имя</div>
            <div>Почта</div>
            <div>Пол</div>
            <div>Роль</div>
            <div>Действия</div>
          </div>
          {users.length > 0 ? (
            users.map((user) => (
              <div key={user.id} className="grid grid-cols-5 items-center">
                <div>{user.name}</div>
                <div>{user.email}</div>
                <div>{user.gender === 'male' ? 'Мужской' : 'Женский'}</div>
                <div>{user.role}</div>
                <div className="space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleRoleChange(user.id, 'user')}
                    disabled={user.role === 'user'}
                  >
                    Пользователь
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleRoleChange(user.id, 'manager')}
                    disabled={user.role === 'manager'}
                  >
                    Менеджер
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleRoleChange(user.id, 'admin')}
                    disabled={user.role === 'admin'}
                  >
                    Админ
                  </Button>
                </div>
              </div>
            ))
          ) : (
            <div className="text-muted-foreground">Список пользователей пуст</div>
          )}
        </div>
      </Card>
    </div>
  );
};