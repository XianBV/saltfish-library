import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getChapterById } from "../utils/api";
import { Button } from "@/components/ui/button";

export default function ChapterViewPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [chapter, setChapter] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      getChapterById(id).then((res) => {
        setChapter(res);
        setLoading(false);
      });
    }
  }, [id]);

  if (loading) return <p className="p-4">Загрузка...</p>;
  if (!chapter) return <p className="p-4 text-red-500">Глава не найдена.</p>;

  return (
    <div className="max-w-2xl mx-auto p-4 space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-lg font-semibold">{chapter.title}</h1>
        <Button size="sm" onClick={() => navigate(`/novel/${chapter.novelId}`)}>
          ← Назад к новелле
        </Button>
      </div>

      <div className="text-sm text-muted-foreground">
        {chapter.arc && <div className="mb-1">Том: {chapter.arc}</div>}
        <div className="whitespace-pre-line leading-relaxed">
          {chapter.content}
        </div>
      </div>

      <div className="flex justify-between pt-4">
        {chapter.prevId ? (
          <Button variant="outline" onClick={() => navigate(`/chapter/${chapter.prevId}`)}>
            ← Предыдущая
          </Button>
        ) : <div />}

        {chapter.nextId ? (
          <Button variant="outline" onClick={() => navigate(`/chapter/${chapter.nextId}`)}>
            Следующая →
          </Button>
        ) : <div />}
      </div>
    </div>
  );
}