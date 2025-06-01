import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getNovelById } from "../utils/api";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function NovelViewPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [novel, setNovel] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      getNovelById(id).then((res) => {
        setNovel(res);
        setLoading(false);
      });
    }
  }, [id]);

  if (loading) return <p className="p-4">Загрузка...</p>;
  if (!novel) return <p className="p-4 text-red-500">Новелла не найдена.</p>;

  return (
    <div className="max-w-3xl mx-auto p-4 space-y-6">
      <div className="flex gap-4">
        <img
          src={novel.coverUrl}
          alt={novel.titleTranslated}
          className="w-40 h-auto rounded shadow object-cover aspect-[3/4]"
        />
        <div className="flex-1 space-y-1">
          <h1 className="text-xl font-bold">{novel.titleTranslated}</h1>
          <div className="text-sm text-muted-foreground">
            {novel.titleOriginal} · {novel.year || "Год неизвестен"}
          </div>
          <div className="text-sm">Автор: {novel.author}</div>
          <div className="text-sm">Глав: {novel.chapters.length}</div>
          <div className="text-sm">Статус: {novel.statusOriginal} / {novel.statusTranslation}</div>
          <div className="flex flex-wrap gap-1 text-xs mt-1">
            {novel.tags?.map((tag: string) => (
              <span
                key={tag}
                className="bg-muted text-muted-foreground px-2 py-0.5 rounded"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
      </div>

      <Card>
        <CardContent className="p-4 space-y-2">
          <h2 className="text-lg font-semibold">Описание</h2>
          <p className="whitespace-pre-line text-sm text-muted-foreground">
            {novel.description || "Описание отсутствует."}
          </p>
        </CardContent>
      </Card>

      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-semibold">Главы</h2>
          <Button size="sm" onClick={() => navigate(`/novel/${novel.id}/add-chapter`)}>
            ➕ Добавить главу
          </Button>
        </div>

        {novel.chapters.length === 0 ? (
          <p className="text-sm text-muted-foreground">Глав пока нет.</p>
        ) : (
          <ul className="space-y-1">
            {novel.chapters.map((ch: any) => (
              <li
                key={ch.id}
                className="border px-3 py-2 rounded cursor-pointer hover:bg-muted"
                onClick={() => navigate(`/chapter/${ch.id}`)}
              >
                {ch.title || `Глава ${ch.number}`}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
