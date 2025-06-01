import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createNovel } from "../utils/api";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { MultiSelect } from "@/components/ui/multiselect";

const TAG_OPTIONS = [
  "система",
  "сянься",
  "в будущем",
  "конец света",
  "фэнтези",
  "богатая семья",
  "без CP",
  "чистая любовь",
  "романтика",
  "ABO",
  "кампус",
  "межзвёздное",
  "QT",
  "прямой эфир",
  "любовный контракт",
  "переносное пространство",
  "онлайн-игры",
  "варьете",
  "прошлая и настоящая жизни",
  "цундэрэ",
  "злоупотребление",
  "множественные личности",
  "еда"
];

export default function CreateNovelPage() {
  const [form, setForm] = useState({
    coverUrl: "",
    titleOriginal: "",
    titleTranslated: "",
    altTitles: ["", "", ""],
    author: "",
    year: "",
    chaptersCount: "",
    wordCount: "",
    statusOriginal: "завершено",
    statusTranslation: "сериализация",
    description: "",
    tags: [] as string[],
  });

  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const handleChange = (e: any) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleAltTitleChange = (i: number, value: string) => {
    const alt = [...form.altTitles];
    alt[i] = value;
    setForm((prev) => ({ ...prev, altTitles: alt }));
  };

  const handleSubmit = async () => {
    setLoading(true);
    const novel = await createNovel(form);
    navigate(`/novel/${novel.id}`);
  };

  return (
    <div className="max-w-2xl mx-auto p-4 space-y-4">
      <h1 className="text-xl font-bold">Добавить новеллу</h1>
      <Card>
        <CardContent className="space-y-4 p-4">
          <Input name="coverUrl" value={form.coverUrl} onChange={handleChange} placeholder="URL обложки *" />
          <Input name="titleOriginal" value={form.titleOriginal} onChange={handleChange} placeholder="Название оригинала *" />
          <Input name="titleTranslated" value={form.titleTranslated} onChange={handleChange} placeholder="Название перевода *" />

          {form.altTitles.map((title, i) => (
            <Input
              key={i}
              value={title}
              onChange={(e) => handleAltTitleChange(i, e.target.value)}
              placeholder={`Альтернативное название ${i + 1}`}
            />
          ))}

          <Input name="author" value={form.author} onChange={handleChange} placeholder="Автор *" />
          <Input name="year" value={form.year} onChange={handleChange} placeholder="Год выпуска" />
          <Input name="chaptersCount" value={form.chaptersCount} onChange={handleChange} placeholder="Глав в оригинале *" />
          <Input name="wordCount" value={form.wordCount} onChange={handleChange} placeholder="Объём (слов)" />

          <Input name="statusOriginal" value={form.statusOriginal} onChange={handleChange} placeholder="Статус оригинала *" />
          <Input name="statusTranslation" value={form.statusTranslation} onChange={handleChange} placeholder="Статус перевода *" />

          <Textarea name="description" value={form.description} onChange={handleChange} placeholder="Описание" />

          <MultiSelect
            label="Жанры и теги"
            options={TAG_OPTIONS}
            selected={form.tags}
            onChange={(tags) => setForm((prev) => ({ ...prev, tags }))}
          />

          <Button className="w-full" onClick={handleSubmit} disabled={loading}>
            {loading ? "Сохранение..." : "Создать новеллу"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
