import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getNovelById, shareNovel, getChaptersByNovel } from "@/api/novels";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogTrigger, DialogContent } from "@/components/ui/dialog";
import { ChapterEditor } from "@/components/ChapterEditor";
import { ChapterCard } from "@/components/ChapterCard";
import { cn } from "@/lib/utils";

export default function NovelView() {
  const { id } = useParams();
  const [novel, setNovel] = useState(null);
  const [chapters, setChapters] = useState([]);
  const [expandedVolumes, setExpandedVolumes] = useState({});
  const [isSharing, setIsSharing] = useState(false);

  useEffect(() => {
    if (id) {
      getNovelById(id).then(setNovel);
      getChaptersByNovel(id).then(setChapters);
    }
  }, [id]);

  const handleShare = async () => {
    if (!novel) return;
    setIsSharing(true);
    const updated = await shareNovel(novel.id);
    setNovel(updated);
    setIsSharing(false);
  };

  const toggleVolume = (volume) => {
    setExpandedVolumes((prev) => ({
      ...prev,
      [volume]: !prev[volume],
    }));
  };

  const volumes = chapters.reduce((acc, chapter) => {
    const volume = chapter.volumeArk || "Без тома/арки";
    if (!acc[volume]) acc[volume] = [];
    acc[volume].push(chapter);
    return acc;
  }, {});

  if (!novel) return <p>Загрузка...</p>;

  return (
    <div className="p-4 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-2">{novel.title}</h1>
      <p className="text-muted-foreground mb-4">{novel.originalTitle}</p>
      <img src={novel.coverUrl || "https://via.placeholder.com/300x400"} alt="cover" className="w-48 rounded mb-4" />
      <p className="mb-2 whitespace-pre-line">{novel.description}</p>

      <div className="flex gap-2 flex-wrap mb-4">
        {novel.tags?.map((tag) => (
          <Badge key={tag}>{tag}</Badge>
        ))}
      </div>

      <div className="mb-4">
        <p><strong>Ориентация:</strong> {novel.orientation || "-"}</p>
        <p><strong>Перспектива:</strong> {novel.perspective || "-"}</p>
        <p><strong>Эра:</strong> {novel.era || "-"}</p>
        <p><strong>Год:</strong> {novel.year || "-"}</p>
        <p><strong>Слов:</strong> {novel.wordCount || "-"}</p>
      </div>

      {!novel.isPublic && (
        <Button onClick={handleShare} disabled={isSharing} className="mb-4">
          {isSharing ? "Поделитесь..." : "Поделиться новеллой"}
        </Button>
      )}

      <Separator className="my-6" />

      <h2 className="text-xl font-semibold mb-4">Главы</h2>

      {Object.entries(volumes).map(([volume, chaps]) => (
        <div key={volume} className="mb-4">
          <Button variant="ghost" onClick={() => toggleVolume(volume)} className="font-bold text-left">
            {expandedVolumes[volume] ? "▼" : "►"} {volume}
          </Button>
          {expandedVolumes[volume] && (
            <div className="ml-4 mt-2 space-y-2">
              {chaps.map((chapter) => (
                <Dialog key={chapter.id}>
                  <DialogTrigger asChild>
                    <ChapterCard chapter={chapter} />
                  </DialogTrigger>
                  <DialogContent>
                    <ChapterEditor chapter={chapter} novelId={novel.id} />
                  </DialogContent>
                </Dialog>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}