import { useState } from 'react';
import { useRouter } from 'next/router';
import { createNovel } from '@/lib/api';
import { TAG_OPTIONS, ORIENTATION_OPTIONS, PERSPECTIVE_OPTIONS, ERA_OPTIONS } from '@/lib/constants';

export default function CreateNovel() {
  const router = useRouter();
  const [form, setForm] = useState({
    title: '',
    originalTitle: '',
    description: '',
    coverUrl: '',
    year: '',
    chaptersInOriginal: '',
    wordCount: '',
    originalStatus: 'ongoing',
    translationStatus: 'ongoing',
    tags: [],
    orientation: '',
    perspective: '',
    era: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleCheckboxChange = (e) => {
    const { value, checked } = e.target;
    setForm(prev => ({
      ...prev,
      tags: checked ? [...prev.tags, value] : prev.tags.filter(tag => tag !== value)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    await createNovel({
      ...form,
      year: parseInt(form.year),
      chaptersInOriginal: parseInt(form.chaptersInOriginal),
      wordCount: parseInt(form.wordCount)
    });
    router.push('/');
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 p-4">
      <input type="text" name="title" placeholder="Название" value={form.title} onChange={handleChange} required />
      <input type="text" name="originalTitle" placeholder="Оригинальное название" value={form.originalTitle} onChange={handleChange} required />
      <textarea name="description" placeholder="Описание" value={form.description} onChange={handleChange} />
      <input type="text" name="coverUrl" placeholder="Ссылка на обложку" value={form.coverUrl} onChange={handleChange} />
      <input type="number" name="year" placeholder="Год публикации" value={form.year} onChange={handleChange} />
      <input type="number" name="chaptersInOriginal" placeholder="Глав в оригинале" value={form.chaptersInOriginal} onChange={handleChange} />
      <input type="number" name="wordCount" placeholder="Количество слов в оригинале" value={form.wordCount} onChange={handleChange} />
      <select name="originalStatus" value={form.originalStatus} onChange={handleChange}>
        <option value="ongoing">Онгоинг</option>
        <option value="completed">Завершено</option>
      </select>
      <select name="translationStatus" value={form.translationStatus} onChange={handleChange}>
        <option value="ongoing">Онгоинг</option>
        <option value="completed">Завершено</option>
      </select>

      <fieldset>
        <legend>Теги</legend>
        {TAG_OPTIONS.map(tag => (
          <label key={tag}>
            <input type="checkbox" value={tag} checked={form.tags.includes(tag)} onChange={handleCheckboxChange} /> {tag}
          </label>
        ))}
      </fieldset>

      <select name="orientation" value={form.orientation} onChange={handleChange}>
        <option value="">Ориентация</option>
        {ORIENTATION_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
      </select>

      <select name="perspective" value={form.perspective} onChange={handleChange}>
        <option value="">Перспектива</option>
        {PERSPECTIVE_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
      </select>

      <select name="era" value={form.era} onChange={handleChange}>
        <option value="">Эра</option>
        {ERA_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
      </select>

      <button type="submit">Создать новеллу</button>
    </form>
  );
}
