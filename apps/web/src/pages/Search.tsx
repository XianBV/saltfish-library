import { useEffect, useState } from "react";
import { getNovels } from "@/lib/api";
import { Novel } from "@/types";
import NovelCard from "@/components/NovelCard";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";

const TAG_OPTIONS = [
  "система", "сянься", "в будущем", "конец света", "фэнтези", "богатая семья", "без CP", "чистая любовь", "романтика", "ABO", "кампус", "межзвёздное",
  "QT", "прямой эфир", "любовный контракт", "переносное пространство", "онлайн-игры", "варьете", "прошлая и настоящая жизни", "цундэрэ", "злоупотребление",
  "множественные личности", "еда"];

const orientations = ["Романтика", "Чистая любовь", "Лили", "Без CP"];
const perspectives = ["Главный герой", "Главная героиня", "Гг-шоу", "Гг-гун", "Неизвестно"];
const eras = ["Альтернативная история", "Современность", "Будущее"];

export default function SearchPage() {
  const [query, setQuery] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleSearch = async () => {
    setLoading(true);
    const novels = await searchNovels({ query, tags: selectedTags });
    setResults(novels);
    setLoading(false);
  };

  useEffect(() => {
    handleSearch(); // начальный поиск (вся библиотека)
  }, []);

  return (
    <div className="max-w-3xl mx-auto p-4 space-y-4">
      <h1 className="text-xl font-bold">Поиск и фильтрация</h1>
      <div className="flex flex-col gap-3 md:flex-row md:items-center">
        <Input
          className="flex-1"
          placeholder="Название или ключевые слова..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <Button onClick={handleSearch} disabled={loading}>
          {loading ? "Поиск..." : "Поиск"}
        </Button>
      </div>
      <MultiSelect
        label="Жанры и теги"
        options={TAG_OPTIONS}
        selected={selectedTags}
        onChange={setSelectedTags}
      />
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
        {results.map((novel: any) => (
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
    </div>
  );
}
