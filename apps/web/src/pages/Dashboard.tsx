import { useEffect, useState } from "react";
import { useUserStore } from "../store/userStore";
import {
  getProfile,
  updateProfile,
  getUserLists,
  createList,
  getUserNovels
} from "../utils/api";
import { useNavigate } from "react-router-dom";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Novel } from "@/types";

interface NovelList {
  id: string;
  name: string;
  count: number;
  isCustom: boolean;
}

export default function DashboardPage() {
  const { user, setUser } = useUserStore();
  const [bio, setBio] = useState("");
  const [loading, setLoading] = useState(false);
  const [lists, setLists] = useState<NovelList[]>([]);
  const [novels, setNovels] = useState<Novel[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    getProfile().then((profile) => {
      setUser(profile);
      setBio(profile.bio || "");
    });
    getUserLists().then(setLists);
    getUserNovels().then(setNovels);
  }, [setUser]);

  const handleSave = async () => {
    setLoading(true);
    const updated = await updateProfile({ bio });
    setUser(updated);
    setLoading(false);
  };

  const handleCreateList = async () => {
    const name = prompt("Введите название нового списка (до 30 символов):");
    if (!name || name.length > 30) return;
    const newList = await createList(name);
    setLists((prev) => [...prev, newList]);
  };

  if (!user) return <p className="text-center p-4">Загрузка профиля...</p>;

  const customLists = lists.filter((l) => l.isCustom);

  return (
    <div className="max-w-3xl mx-auto p-4 space-y-6">
      <Card>
        <CardContent className="flex items-center gap-4 p-6">
          <Avatar className="w-20 h-20">
            <AvatarImage src={user.avatar} alt={user.username} />
            <AvatarFallback>{user.username[0]}</AvatarFallback>
          </Avatar>
          <div className="flex-1 space-y-2">
            <div className="text-xl font-semibold">{user.username}</div>
            <Input
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              className="w-full"
              placeholder="Расскажите о себе..."
            />
            <Button className="mt-2" onClick={handleSave} disabled={loading}>
              {loading ? "Сохранение..." : "Сохранить"}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Button
        className="mb-4"
        variant="outline"
        onClick={() => navigate("/search")}
      >
        🔍 Перейти к поиску
      </Button>

      <div>
        <div className="flex justify-between items-center mb-2">
          <h2 className="text-lg font-bold">Мои списки</h2>
          {customLists.length < 3 && (
            <Button size="sm" onClick={handleCreateList}>
              ➕ Новый список
            </Button>
          )}
        </div>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
          {lists.map((list) => (
            <Card
              key={list.id}
              onClick={() => navigate(`/list/${list.id}`)}
              className="cursor-pointer"
            >
              <CardContent className="p-4">
                <div className="font-medium">{list.name}</div>
                <div className="text-sm text-muted-foreground">
                  Новелл: {list.count}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      <div className="space-y-4">
        <h2 className="text-lg font-bold">Мои новеллы</h2>
        {novels.length === 0 ? (
          <p>У вас пока нет новелл.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {novels.map((novel) => (
              <Card key={novel.id}>
                <CardContent className="space-y-2">
                  <h3 className="text-lg font-semibold">{novel.title}</h3>
                  {novel.originalTitle && (
                    <p className="text-sm text-muted-foreground">
                      Оригинальное название: {novel.originalTitle}
                    </p>
                  )}
                  <p className="text-sm">Год выпуска: {novel.year ?? "неизвестно"}</p>
                  <p className="text-sm">Количество слов: {novel.wordCount ?? "не указано"}</p>
                  <div className="flex flex-wrap gap-1">
                    {novel.tags?.map((tag) => (
                      <Badge key={tag}>{tag}</Badge>
                    ))}
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {novel.orientation && (
                      <Badge variant="outline">Ориентация: {novel.orientation}</Badge>
                    )}
                    {novel.perspective && (
                      <Badge variant="outline">Перспектива: {novel.perspective}</Badge>
                    )}
                    {novel.era && (
                      <Badge variant="outline">Эра: {novel.era}</Badge>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      <Button className="w-full">➕ Добавить новеллу</Button>
    </div>
  );
}
