import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";

const getRoleInRussian = (role: string) => {
  switch (role.toLowerCase()) {
    case 'admin':
      return 'Администратор';
    case 'manager':
      return 'Менеджер';
    case 'user':
      return 'Пользователь';
    default:
      return role;
  }
};

const getGenderInRussian = (gender: string) => {
  return gender === 'male' ? 'Мужской' : 'Женский';
};

export const Profile = ({ user, setUser }) => {
  const [formData, setFormData] = useState({
    name: user.name || "",
    email: user.email || "",
    birth_date: user.birth_date ? new Date(user.birth_date).toISOString().split('T')[0] : "",
  });

  const { toast } = useToast();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`/api/users/${user.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        const updatedUser = await response.json();
        setUser({ ...user, ...updatedUser });
        toast({
          title: "Успешно",
          description: "Профиль обновлен",
        });
      } else {
        throw new Error("Failed to update profile");
      }
    } catch (error) {
      toast({
        title: "Ошибка",
        description: "Не удалось обновить профиль",
        variant: "destructive",
      });
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Show department only for users, not for managers or admins
  const showDepartment = user.role === 'user';

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Личный кабинет</h1>
      
      <Card>
        <CardHeader>
          <CardTitle>Редактировать профиль</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="name">Имя</label>
              <Input
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
              />
            </div>
            
            <div className="space-y-2">
              <label htmlFor="email">Email</label>
              <Input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
              />
            </div>
            
            <div className="space-y-2">
              <label htmlFor="birth_date">Дата рождения</label>
              <Input
                id="birth_date"
                name="birth_date"
                type="date"
                value={formData.birth_date}
                onChange={handleChange}
              />
            </div>
            
            <Button type="submit">Сохранить изменения</Button>
          </form>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Информация о пользователе</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <p><strong>Роль:</strong> {getRoleInRussian(user.role)}</p>
            <p><strong>Пол:</strong> {getGenderInRussian(user.gender)}</p>
            {showDepartment && <p><strong>Отдел:</strong> {user.department}</p>}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};