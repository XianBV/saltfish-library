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
  const [novels, setNovels] = useState<Novel[]>([]);
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("title");

  const [tags, setTags] = useState<string[]>([]);
  const [orientation, setOrientation] = useState<string[]>([]);
  const [perspective, setPerspective] = useState<string[]>([]);
  const [era, setEra] = useState<string[]>([]);
  const [strict, setStrict] = useState(false);

  useEffect(() => {
    const fetchNovels = async () => {
      const filters = {
        search,
        sortBy,
        tags,
        orientation,
        perspective,
        era,
        strict
      };
      const data = await getNovels(filters);
      setNovels(data);
    };
    fetchNovels();
  }, [search, sortBy, tags, orientation, perspective, era, strict]);

  const handleCheckboxChange = (setFn: (val: string[]) => void, values: string[], value: string) => {
    setFn(values.includes(value) ? values.filter(v => v !== value) : [...values, value]);
  };

  return (
    <div className="p-4 space-y-6">
      <h1 className="text-xl font-bold">Поиск новелл</h1>

      <Input
        placeholder="Название или описание"
        value={search}
        onChange={e => setSearch(e.target.value)}
      />

      <Select value={sortBy} onValueChange={setSortBy}>
        <SelectTrigger className="w-[200px]">
          <SelectValue placeholder="Сортировка" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="title">По названию</SelectItem>
          <SelectItem value="year">По году</SelectItem>
        </SelectContent>
      </Select>

      <div>
        <Label>Теги</Label>
        <div className="flex flex-wrap gap-2">
          {allTags.map(tag => (
            <Checkbox
              key={tag}
              checked={tags.includes(tag)}
              onCheckedChange={() => handleCheckboxChange(setTags, tags, tag)}
              label={tag}
            />
          ))}
        </div>
      </div>

      <div>
        <Label>Ориентация</Label>
        <div className="flex flex-wrap gap-2">
          {orientations.map(val => (
            <Checkbox
              key={val}
              checked={orientation.includes(val)}
              onCheckedChange={() => handleCheckboxChange(setOrientation, orientation, val)}
              label={val}
            />
          ))}
        </div>
      </div>

      <div>
        <Label>Перспектива</Label>
        <div className="flex flex-wrap gap-2">
          {perspectives.map(val => (
            <Checkbox
              key={val}
              checked={perspective.includes(val)}
              onCheckedChange={() => handleCheckboxChange(setPerspective, perspective, val)}
              label={val}
            />
          ))}
        </div>
      </div>

      <div>
        <Label>Эра</Label>
        <div className="flex flex-wrap gap-2">
          {eras.map(val => (
            <Checkbox
              key={val}
              checked={era.includes(val)}
              onCheckedChange={() => handleCheckboxChange(setEra, era, val)}
              label={val}
            />
          ))}
        </div>
      </div>

      <div>
        <Label>
          <input
            type="checkbox"
            checked={strict}
            onChange={e => setStrict(e.target.checked)}
            className="mr-2"
          />
          Строгая фильтрация
        </Label>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {novels.map(novel => (
          <NovelCard key={novel.id} novel={novel} />
        ))}
      </div>
    </div>
  );
}
