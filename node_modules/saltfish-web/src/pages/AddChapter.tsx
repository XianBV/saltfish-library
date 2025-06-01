import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { createChapter } from "../utils/api";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function AddChapterPage() {
  const { id } = useParams(); // novel ID
  const navigate = useNavigate();

  const [form, setForm] = useState({
    arc: "",
    title: "",
    content: "",
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (e: any) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    if (!id) return;
    setLoading(true);
    const chapter = await createChapter({ novelId: id, ...form });
    navigate(`/chapter/${chapter.id}`);
  };

  return (
    <div className="max-w-2xl mx-auto p-4 space-y-4">
      <h1 className="text-xl font-bold">Добавить главу</h1>
      <Card>
        <CardContent className="space-y-4 p-4">
          <Input
            name="arc"
            value={form.arc}
            onChange={handleChange}
            placeholder="Том / Арка (необязательно)"
          />
          <Input
            name="title"
            value={form.title}
            onChange={handleChange}
            placeholder="Название главы *"
          />
          <Textarea
            name="content"
            value={form.content}
            onChange={handleChange}
            placeholder="Текст главы *"
            rows={16}
          />
          <Button onClick={handleSubmit} disabled={loading} className="w-full">
            {loading ? "Сохранение..." : "Сохранить главу"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
