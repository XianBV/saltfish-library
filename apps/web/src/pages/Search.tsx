import { useEffect, useState } from 'react';
import { NovelCard } from '@/components/NovelCard';
import { useFiltersStore } from '@/stores/filters';
import { FiltersPanel } from '@/components/FiltersPanel';
import { useUserStore } from '@/stores/user';
import { Novel } from '@/types';

export default function SearchPage() {
  const filters = useFiltersStore((state) => state.filters);
  const [novels, setNovels] = useState<Novel[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const user = useUserStore((state) => state.user);

  useEffect(() => {
    const fetchNovels = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const query = new URLSearchParams();

        if (filters.search) query.append('search', filters.search);
        if (filters.tags?.length) filters.tags.forEach(tag => query.append('tags', tag));
        if (filters.originalStatus?.length) filters.originalStatus.forEach(status => query.append('originalStatus', status));
        if (filters.translationStatus?.length) filters.translationStatus.forEach(status => query.append('translationStatus', status));
        if (filters.year?.length === 2) {
          query.append('yearFrom', filters.year[0].toString());
          query.append('yearTo', filters.year[1].toString());
        }
        if (filters.wordCount?.length === 2) {
          query.append('wordCountFrom', filters.wordCount[0].toString());
          query.append('wordCountTo', filters.wordCount[1].toString());
        }

        // Новые поля
        if (filters.orientation?.length) filters.orientation.forEach(value => query.append('orientation', value));
        if (filters.perspective?.length) filters.perspective.forEach(value => query.append('perspective', value));
        if (filters.era?.length) filters.era.forEach(value => query.append('era', value));

        if (filters.sortBy) query.append('sortBy', filters.sortBy);
        if (filters.strict) query.append('strict', 'true');

        query.append('page', page.toString());

        const res = await fetch(`/api/novels?${query.toString()}`);
        if (!res.ok) throw new Error('Ошибка при загрузке новелл');
        const data = await res.json();
        setNovels(data);
      } catch (err) {
        console.error(err);
        setError('Не удалось загрузить новеллы');
      } finally {
        setIsLoading(false);
      }
    };

    fetchNovels();
  }, [filters, page]);

  return (
    <div className="p-4 space-y-4">
      <FiltersPanel />
      {isLoading && <p>Загрузка...</p>}
      {error && <p className="text-red-500">{error}</p>}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {novels.map(novel => (
          <NovelCard key={novel.id} novel={novel} />
        ))}
      </div>
    </div>
  );
}
