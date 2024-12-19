import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";

export const Requests = () => {
  const { data: requests = [] } = useQuery({
    queryKey: ["requests"],
    queryFn: async () => {
      const response = await fetch("/api/requests");
      if (!response.ok) {
        throw new Error("Failed to fetch requests");
      }
      return response.json();
    },
  });

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Заявки</h1>
      <div className="space-y-4">
        {requests.map((request) => (
          <Card key={request.id} className="w-full">
            <CardContent className="pt-6">
              <div className="flex justify-between items-start mb-4">
                <div className="flex flex-col">
                  <span className="text-sm font-medium">
                    {request.author_name}
                  </span>
                  <span className="text-sm text-muted-foreground">
                    {request.author_department}
                  </span>
                </div>
                <span className="text-sm text-muted-foreground">
                  {new Date(request.created_at).toLocaleString()}
                </span>
              </div>
              <div className="mb-2 font-medium">{request.topic}</div>
              <p className="whitespace-pre-wrap">{request.message}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};