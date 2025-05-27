
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Play, FileText, Download, Settings, Upload } from 'lucide-react';
import { Link } from 'react-router-dom';
import Footer from '@/components/layout/Footer';
import Navbar from '@/components/layout/Navbar';
import MetaTags from '@/components/seo/MetaTags';

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

const Classroom = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedType, setSelectedType] = useState<string>('all');

  const { data: contents, isLoading } = useQuery({
    queryKey: ['classroom-content'],
    queryFn: async (): Promise<ClassroomContent[]> => {
      const response = await fetch('/functions/v1/classroom-content');
      if (!response.ok) throw new Error('Failed to fetch content');
      return response.json();
    }
  });

  const filteredContents = contents?.filter(content => {
    const categoryMatch = selectedCategory === 'all' || content.model_category === selectedCategory;
    const typeMatch = selectedType === 'all' || content.course_type === selectedType;
    return categoryMatch && typeMatch && content.is_published;
  });

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const formatFileSize = (bytes: number) => {
    const mb = bytes / (1024 * 1024);
    return `${mb.toFixed(1)} MB`;
  };

  const getContentIcon = (contentType: string) => {
    switch (contentType) {
      case 'video':
        return <Play className="w-5 h-5" />;
      case 'pdf':
        return <FileText className="w-5 h-5" />;
      default:
        return <FileText className="w-5 h-5" />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <MetaTags 
        title="Classroom - Formation Mannequins | Perfect Models Management" 
        description="Accédez aux formations spécialisées pour mannequins : cours théoriques et pratiques, vidéos et documents pédagogiques"
      />
      <Navbar />
      
      <div className="container mx-auto px-6 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-model-black mb-4">
            Formation Professionnelle
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Développez vos compétences avec nos formations spécialisées pour mannequins professionnels
          </p>
        </div>

        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-4 mb-8">
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
        </div>

        {/* Content Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <div className="h-48 bg-gray-200 rounded-t-lg"></div>
                <CardContent className="p-6">
                  <div className="h-4 bg-gray-200 rounded mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded mb-4 w-3/4"></div>
                  <div className="flex gap-2">
                    <div className="h-6 bg-gray-200 rounded w-16"></div>
                    <div className="h-6 bg-gray-200 rounded w-20"></div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : filteredContents && filteredContents.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredContents.map((content) => (
              <Card key={content.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                {content.thumbnail_url ? (
                  <div className="h-48 bg-gray-200 relative">
                    <img 
                      src={content.thumbnail_url} 
                      alt={content.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                      {getContentIcon(content.content_type)}
                    </div>
                  </div>
                ) : (
                  <div className="h-48 bg-gradient-to-br from-model-gold to-amber-500 flex items-center justify-center">
                    {getContentIcon(content.content_type)}
                  </div>
                )}
                
                <CardContent className="p-6">
                  <h3 className="font-semibold text-lg mb-2">{content.title}</h3>
                  <p className="text-gray-600 text-sm mb-4 line-clamp-2">{content.description}</p>
                  
                  <div className="flex flex-wrap gap-2 mb-4">
                    <Badge variant="outline">{content.content_type}</Badge>
                    <Badge variant="outline">{content.model_category}</Badge>
                    <Badge variant="outline">{content.course_type}</Badge>
                  </div>

                  <div className="flex justify-between items-center text-sm text-gray-500 mb-4">
                    {content.duration && (
                      <span>Durée: {formatDuration(content.duration)}</span>
                    )}
                    {content.file_size && (
                      <span>{formatFileSize(content.file_size)}</span>
                    )}
                  </div>

                  <Button 
                    className="w-full"
                    onClick={() => window.open(content.file_url, '_blank')}
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Accéder au contenu
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <Upload className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-600 mb-2">
              Aucun contenu disponible
            </h3>
            <p className="text-gray-500 mb-6">
              {selectedCategory !== 'all' || selectedType !== 'all' 
                ? 'Aucun contenu ne correspond aux filtres sélectionnés.' 
                : 'Les premiers cours seront bientôt disponibles.'}
            </p>
            <Button variant="outline" onClick={() => {
              setSelectedCategory('all');
              setSelectedType('all');
            }}>
              Réinitialiser les filtres
            </Button>
          </div>
        )}

        {/* Admin Access Button */}
        <div className="mt-16 text-center">
          <div className="bg-white rounded-lg p-8 shadow-sm border border-gray-200">
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
      </div>

      <Footer />
    </div>
  );
};

export default Classroom;
