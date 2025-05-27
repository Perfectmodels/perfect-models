import React, { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, Badge } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Play, FileText, Download, Settings, Upload } from 'lucide-react';
import { Link } from 'react-router-dom';
import Footer from '@/components/layout/Footer';
import Navbar from '@/components/layout/Navbar';
import MetaTags from '@/components/seo/MetaTags';

// Types
interface ClassroomContent {
  id: string;
  title: string;
  description: string;
  content_type: 'video' | 'pdf' | 'document';
  model_category: 'femme' | 'homme' | 'enfant' | 'senior';
  course_type: 'theorique' | 'pratique';
  file_url: string;
  file_size: number;
  duration: number;
  thumbnail_url: string;
  is_published: boolean;
  created_at: string;
}

// Utils
const formatDuration = (seconds: number) => {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
};
const formatFileSize = (bytes: number) => bytes ? `${(bytes / (1024 * 1024)).toFixed(1)} MB` : '';
const getContentIcon = (type: string) => {
  switch (type) {
    case 'video': return <Play className="w-5 h-5" />;
    case 'pdf': return <FileText className="w-5 h-5" />;
    default: return <FileText className="w-5 h-5" />;
  }
};
const badgeColor = (type: string) => {
  switch (type) {
    case 'video': return 'bg-blue-100 text-blue-700 border-blue-200';
    case 'pdf': return 'bg-red-100 text-red-700 border-red-200';
    default: return 'bg-gray-100 text-gray-700 border-gray-200';
  }
};

// Composant Carte de contenu
const ContentCard = React.memo(({ content }: { content: ClassroomContent }) => (
  <Card className="overflow-hidden hover:shadow-lg transition-shadow" tabIndex={0} aria-label={content.title}>
    <div className="h-48 relative">
      <img
        src={content.thumbnail_url || '/default-thumb.jpg'}
        alt={content.title}
        className="w-full h-full object-cover"
        onError={e => { (e.currentTarget as HTMLImageElement).src = '/default-thumb.jpg'; }}
      />
      <div className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity bg-black/40">
        {getContentIcon(content.content_type)}
      </div>
    </div>
    <CardContent className="p-6">
      <h3 className="font-semibold text-lg mb-2">{content.title}</h3>
      <p className="text-gray-600 text-sm mb-4 line-clamp-2">{content.description}</p>
      <div className="flex flex-wrap gap-2 mb-4">
        <Badge className={badgeColor(content.content_type)}>{content.content_type}</Badge>
        <Badge variant="outline">{content.model_category}</Badge>
        <Badge variant="outline">{content.course_type}</Badge>
      </div>
      <div className="flex justify-between items-center text-sm text-gray-500 mb-4">
        {content.duration ? <span>Durée : {formatDuration(content.duration)}</span> : <span />}
        {content.file_size ? <span>{formatFileSize(content.file_size)}</span> : <span />}
      </div>
      <Button
        className="w-full"
        onClick={() => window.open(content.file_url, '_blank')}
        aria-label={`Accéder à ${content.title}`}
      >
        <Download className="w-4 h-4 mr-2" />
        Accéder au contenu
      </Button>
    </CardContent>
  </Card>
));

// Composant Filtres
const Filters = ({
  selectedCategory,
  setSelectedCategory,
  selectedType,
  setSelectedType,
  search,
  setSearch,
}: {
  selectedCategory: string;
  setSelectedCategory: (v: string) => void;
  selectedType: string;
  setSelectedType: (v: string) => void;
  search: string;
  setSearch: (v: string) => void;
}) => (
  <div className="flex flex-col md:flex-row gap-4 mb-8 items-center">
    <Select value={selectedCategory} onValueChange={setSelectedCategory}>
      <SelectTrigger className="w-full md:w-48">
        <SelectValue placeholder="Catégorie" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="all">Toutes les catégories</SelectItem>
        <SelectItem value="femme">Femme</SelectItem>
        <SelectItem value="homme">Homme</SelectItem>
        <SelectItem value="enfant">Enfant</SelectItem>
        <SelectItem value="senior">Senior</SelectItem>
      </SelectContent>
    </Select>
    <Select value={selectedType} onValueChange={setSelectedType}>
      <SelectTrigger className="w-full md:w-48">
        <SelectValue placeholder="Type de cours" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="all">Tous les types</SelectItem>
        <SelectItem value="theorique">Théorique</SelectItem>
        <SelectItem value="pratique">Pratique</SelectItem>
      </SelectContent>
    </Select>
    <input
      type="search"
      className="input w-full md:w-60 border rounded px-3 py-2"
      placeholder="Rechercher un cours..."
      value={search}
      onChange={e => setSearch(e.target.value)}
      aria-label="Recherche de contenu"
    />
  </div>
);

// Composant Spinner
const Spinner = () => (
  <div className="flex justify-center items-center h-32">
    <svg className="animate-spin h-8 w-8 text-model-gold" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.37 0 0 5.37 0 12h4z" />
    </svg>
  </div>
);

// Composant État vide
const EmptyState = ({
  hasFilters,
  onReset,
}: {
  hasFilters: boolean;
  onReset: () => void;
}) => (
  <div className="text-center py-12">
    <Upload className="w-16 h-16 text-gray-400 mx-auto mb-4" />
    <h3 className="text-xl font-semibold text-gray-600 mb-2">
      Aucun contenu disponible
    </h3>
    <p className="text-gray-500 mb-6">
      {hasFilters
        ? 'Aucun contenu ne correspond aux filtres ou à la recherche.'
        : 'Les premiers cours seront bientôt disponibles.'}
    </p>
    {hasFilters && (
      <Button variant="outline" onClick={onReset}>
        Réinitialiser les filtres
      </Button>
    )}
  </div>
);

// Composant Accès Admin
const AdminPanel = () => (
  <div className="mt-16 text-center">
    <div className="bg-white rounded-lg p-8 shadow-sm border border-gray-200 inline-block">
      <Settings className="w-12 h-12 text-model-gold mx-auto mb-4" />
      <h3 className="text-xl font-semibold mb-2">Accès Administrateur</h3>
      <p className="text-gray-600 mb-6">
        Connectez-vous pour gérer et téléverser du nouveau contenu de formation
      </p>
      <Link to="/admin">
        <Button className="bg-model-gold hover:bg-amber-600 text-white">
          <Settings className="w-4 h-4 mr-2" />
          Panneau d'Administration
        </Button>
      </Link>
    </div>
  </div>
);

// Composant Principal
const Classroom = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [search, setSearch] = useState<string>('');

  const { data: contents, isLoading, isError, refetch } = useQuery({
    queryKey: ['classroom-content'],
    queryFn: async (): Promise<ClassroomContent[]> => {
      const response = await fetch('/functions/v1/classroom-content');
      if (!response.ok) throw new Error('Failed to fetch content');
      return response.json();
    },
  });

  const filteredContents = useMemo(() => {
    if (!contents) return [];
    return contents.filter(content => {
      const categoryMatch = selectedCategory === 'all' || content.model_category === selectedCategory;
      const typeMatch = selectedType === 'all' || content.course_type === selectedType;
      const textMatch =
        content.title.toLowerCase().includes(search.toLowerCase()) ||
        content.description.toLowerCase().includes(search.toLowerCase());
      return categoryMatch && typeMatch && content.is_published && textMatch;
    });
  }, [contents, selectedCategory, selectedType, search]);

  const hasFilters = selectedCategory !== 'all' || selectedType !== 'all' || search.trim() !== '';

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <MetaTags
        title="Classroom - Formation Mannequins | Perfect Models Management"
        description="Accédez aux formations spécialisées pour mannequins : cours théoriques et pratiques, vidéos et documents pédagogiques"
      />
      <Navbar />

      <div className="container mx-auto px-6 py-12 flex-1 w-full">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-model-black mb-4">
            Formation Professionnelle
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Développez vos compétences avec nos formations spécialisées pour mannequins professionnels
          </p>
        </div>

        <Filters
          selectedCategory={selectedCategory}
          setSelectedCategory={setSelectedCategory}
          selectedType={selectedType}
          setSelectedType={setSelectedType}
          search={search}
          setSearch={setSearch}
        />

        <div className="mb-4 text-sm text-gray-500">
          {filteredContents?.length !== undefined && (
            <span>
              {filteredContents.length} résultat{filteredContents.length > 1 ? 's' : ''}
            </span>
          )}
        </div>

        {isError && (
          <div className="text-center text-red-600 mb-8">
            Erreur lors du chargement du contenu. 
            <Button variant="link" onClick={() => refetch()}>Réessayer</Button>
          </div>
        )}

        {isLoading ? (
          <Spinner />
        ) : filteredContents && filteredContents.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredContents.map(content => (
              <ContentCard key={content.id} content={content} />
            ))}
          </div>
        ) : (
          <EmptyState
            hasFilters={hasFilters}
            onReset={() => {
              setSelectedCategory('all');
              setSelectedType('all');
              setSearch('');
            }}
          />
        )}

        <AdminPanel />
      </div>
      <Footer />
    </div>
  );
};

export default Classroom;
