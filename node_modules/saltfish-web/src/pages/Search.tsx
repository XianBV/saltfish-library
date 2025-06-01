import { useState, useEffect } from "react";
import { searchNovels } from "../utils/api";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { MultiSelect } from "@/components/ui/multiselect";
import { Card, CardContent } from "@/components/ui/card";

const TAG_OPTIONS = [
  "фэнтези", "система", "сянься", "возрождение", "богатая семья", "сладкая статья",
  "альтернативная история", "будущее", "романтика", "чистая любовь", "без CP",
  "ABO", "прямая трансляция", "QT", "конец света", "онлайн-игры", "варьете",
  "контратака", "любовный контракт", "переносное пространство", "цундэрэ"
];

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
