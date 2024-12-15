import { Card } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";

export const Users = () => {
  const { data: users = [] } = useQuery({
    queryKey: ["users"],
    queryFn: async () => {
      const response = await fetch("/api/users");
      if (!response.ok) {
        throw new Error("Failed to fetch users");
      }
      return response.json();
    },
  });

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Пользователи</h1>
      <Card className="p-6">
        <div className="space-y-4">
          <div className="grid grid-cols-5 font-semibold">
            <div>Имя</div>
            <div>Почта</div>
            <div>Пол</div>
            <div>Дата рождения</div>
            <div>Отдел</div>
          </div>
          {users.length > 0 ? (
            users.map((user) => (
              <div key={user.id} className="grid grid-cols-5">
                <div>{user.name}</div>
                <div>{user.email}</div>
                <div>{user.gender === 'male' ? 'Мужской' : 'Женский'}</div>
                <div>{new Date(user.birth_date).toLocaleDateString()}</div>
                <div>{user.department}</div>
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