import { Card } from "@/components/ui/card";

export const Users = () => {
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
          {/* User list will be implemented later */}
          <div className="text-muted-foreground">Список пользователей пуст</div>
        </div>
      </Card>
    </div>
  );
};