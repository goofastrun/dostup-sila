import { Card } from "@/components/ui/card";

export const Roles = () => {
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Роли</h1>
      <Card className="p-6">
        <div className="space-y-4">
          <div className="grid grid-cols-4 font-semibold">
            <div>Имя</div>
            <div>Почта</div>
            <div>Пол</div>
            <div>Роль</div>
          </div>
          {/* User list with roles will be implemented later */}
          <div className="text-muted-foreground">Список пользователей пуст</div>
        </div>
      </Card>
    </div>
  );
};