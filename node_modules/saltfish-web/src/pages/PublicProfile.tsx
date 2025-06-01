import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getPublicProfile } from "../utils/api";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";

export default function PublicProfilePage() {
  const { userId } = useParams();
  const [user, setUser] = useState<any>(null);
  const [novels, setNovels] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (userId) {
      getPublicProfile(userId).then((res) => {
        setUser(res.user);
        setNovels(res.novels);
        setLoading(false);
      });
    }
  }, [userId]);

  if (loading) return <p className="p-4">Загрузка профиля...</p>;
  if (!user) return <p className="p-4 text-red-500">Пользователь не найден.</p>;

  return (
    <div className="max-w-3xl mx-auto p-4 space-y-6">
      <div className="flex items-center gap-4">
        <Avatar className="w-16 h-16">
          <AvatarImage src={user.avatar} alt={user.username} />
          <AvatarFallback>{user.username[0]}</AvatarFallback>
        </Avatar>
        <div>
          <div className="text-xl font-semibold">{user.username}</div>
          <div className="text-sm text-muted-foreground">
            {user.bio || "Описание отсутствует"}
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <h2 className="text-lg font-semibold">Публичные новеллы</h2>
        {novels.length === 0 ? (
          <p className="text-muted-foreground">Нет открытых новелл.</p>
        ) : (
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
            {novels.map((novel) => (
              <Card key={novel.id}>
                <CardContent className="p-2 space-y-2">
                  <img
                    src={novel.coverUrl}
                    alt={novel.titleTranslated}
                    className="rounded w-full aspect-[3/4] object-cover"
                  />
                  <div className="text-sm text-center line-clamp-2">
                    {novel.titleTranslated}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}