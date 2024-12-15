import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";

const departments = [
  "Для всех",
  "Бухгалтерия",
  "Отдел маркетинга",
  "Отдел кадров",
  "Отдел технического контроля",
  "Отдел сбыта",
  "Отдел IT",
  "Отдел логистики и транспорта",
  "Отдел клиентской поддержки",
  "Отдел разработки и исследований",
  "Отдел закупок",
];

export const Dashboard = ({ user }) => {
  const [newPost, setNewPost] = useState("");
  const [selectedDepartment, setSelectedDepartment] = useState("Для всех");
  const { toast } = useToast();

  // Обновленный запрос с правильной передачей параметров department и role

  const { data: posts = [], refetch } = useQuery({
    queryKey: ["posts", user.department, user.role],
    queryFn: async () => {
      console.log("Fetching posts for user:", user);
      const response = await fetch(
        `/api/posts?department=${encodeURIComponent(user.department || '')}&role=${encodeURIComponent(user.role || '')}`
      );
      if (!response.ok) {
        throw new Error("Failed to fetch posts");
      }
      const data = await response.json();
      console.log("Fetched posts:", data);
      return data;
    },
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newPost.trim()) return;

    try {
      const response = await fetch("/api/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content: newPost,
          department: selectedDepartment,
          authorId: user.id,
        }),
      });

      if (response.ok) {
        setNewPost("");
        setSelectedDepartment("Для всех");
        refetch(); // Обновляем список записей
        toast({
          title: "Успешно",
          description: "Запись добавлена",
        });
      }
    } catch (error) {
      toast({
        title: "Ошибка",
        description: "Не удалось добавить запись",
        variant: "destructive",
      });
    }
  };

  const canCreatePost = user.role === "admin" || user.role === "manager";

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Главная страница</h1>
      
      {canCreatePost && (
        <Card className="w-full">
          <CardContent className="pt-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              <Textarea
                placeholder="Введите текст записи..."
                value={newPost}
                onChange={(e) => setNewPost(e.target.value)}
                className="min-h-[100px]"
              />
              <div className="flex gap-4">
                <Select
                  value={selectedDepartment}
                  onValueChange={setSelectedDepartment}
                >
                  <SelectTrigger className="w-[200px]">
                    <SelectValue placeholder="Выберите отдел" />
                  </SelectTrigger>
                  <SelectContent>
                    {departments.map((dept) => (
                      <SelectItem key={dept} value={dept}>
                        {dept}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button type="submit">Добавить запись</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <div className="space-y-4">
        {posts.map((post) => (
          <Card key={post.id} className="w-full">
            <CardContent className="pt-6">
              <div className="flex justify-between items-start mb-4">
                <div className="flex flex-col">
                  <span className="text-sm text-muted-foreground">
                    {post.department}
                  </span>
                  <span className="text-sm font-medium">
                    {post.author_name}
                  </span>
                </div>
                <span className="text-sm text-muted-foreground">
                  {new Date(post.created_at).toLocaleString()}
                </span>
              </div>
              <p className="whitespace-pre-wrap">{post.content}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};
