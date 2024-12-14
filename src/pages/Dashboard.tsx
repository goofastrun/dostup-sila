import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

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
  const [posts, setPosts] = useState([]);
  const [newPost, setNewPost] = useState("");
  const [selectedDepartment, setSelectedDepartment] = useState("Для всех");
  const { toast } = useToast();

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
        const post = await response.json();
        setPosts([post, ...posts]);
        setNewPost("");
        setSelectedDepartment("Для всех");
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
                <span className="text-sm text-muted-foreground">
                  {post.department}
                </span>
                <span className="text-sm text-muted-foreground">
                  {new Date(post.createdAt).toLocaleDateString()}
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