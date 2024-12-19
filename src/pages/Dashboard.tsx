import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";
import { Paperclip } from "lucide-react";

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

const requestTopics = [
  "Запрос на изменение расписания",
  "Заявка на отпуск или отгул",
  "Заявка на заказ оборудования",
  "Заявка на перевод в другой отдел",
  "Жалоба или предложение"
];

export const Dashboard = ({ user }) => {
  const [newPost, setNewPost] = useState("");
  const [selectedDepartment, setSelectedDepartment] = useState("Для всех");
  const [selectedFile, setSelectedFile] = useState(null);
  const [requestTopic, setRequestTopic] = useState("");
  const [requestMessage, setRequestMessage] = useState("");
  const fileInputRef = useRef(null);
  const { toast } = useToast();

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

  const handleFileClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      toast({
        title: "Файл выбран",
        description: file.name,
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newPost.trim()) return;

    const formData = new FormData();
    formData.append('content', newPost);
    formData.append('department', selectedDepartment);
    formData.append('authorId', user.id);
    if (selectedFile) {
      formData.append('file', selectedFile);
    }

    try {
      const response = await fetch("/api/posts", {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        setNewPost("");
        setSelectedDepartment("Для всех");
        setSelectedFile(null);
        refetch();
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

  const handleRequestSubmit = async (e) => {
    e.preventDefault();
    if (!requestTopic || !requestMessage.trim()) {
      toast({
        title: "Ошибка",
        description: "Заполните все поля заявки",
        variant: "destructive",
      });
      return;
    }

    try {
      const response = await fetch("/api/requests", {
        method: "POST",
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          topic: requestTopic,
          message: requestMessage,
          authorId: user.id,
        }),
      });

      if (response.ok) {
        setRequestTopic("");
        setRequestMessage("");
        toast({
          title: "Успешно",
          description: "Заявка отправлена",
        });
      }
    } catch (error) {
      toast({
        title: "Ошибка",
        description: "Не удалось отправить заявку",
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
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  className="hidden"
                />
                <Button type="button" variant="outline" onClick={handleFileClick}>
                  <Paperclip className="h-4 w-4 mr-2" />
                  {selectedFile ? selectedFile.name : "Прикрепить файл"}
                </Button>
                <Button type="submit">Добавить запись</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {user.role === "user" && (
        <Card className="w-full">
          <CardContent className="pt-6">
            <h2 className="text-xl font-semibold mb-4">Отправить заявку</h2>
            <form onSubmit={handleRequestSubmit} className="space-y-4">
              <Select value={requestTopic} onValueChange={setRequestTopic}>
                <SelectTrigger>
                  <SelectValue placeholder="Выберите тему заявки" />
                </SelectTrigger>
                <SelectContent>
                  {requestTopics.map((topic) => (
                    <SelectItem key={topic} value={topic}>
                      {topic}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Textarea
                placeholder="Введите текст заявки..."
                value={requestMessage}
                onChange={(e) => setRequestMessage(e.target.value)}
                className="min-h-[100px]"
              />
              <Button type="submit">Отправить заявку</Button>
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
              {post.file_url && (
                <a 
                  href={post.file_url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center mt-2 text-sm text-blue-500 hover:underline"
                >
                  <Paperclip className="h-4 w-4 mr-1" />
                  Прикрепленный файл
                </a>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};
