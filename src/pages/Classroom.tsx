
import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import Layout from '@/components/layout';
import MetaTags from '@/components/seo/MetaTags';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Play, FileText, Clock, Download } from 'lucide-react';

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
  created_at: string;
}

const Classroom = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedCourseType, setSelectedCourseType] = useState<string>('all');

  const { data: contents, isLoading } = useQuery({
    queryKey: ['classroom-content'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('classroom_content')
        .select('*')
        .eq('is_published', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as ClassroomContent[];
    }
  });

  const filteredContents = contents?.filter(content => {
    const categoryMatch = selectedCategory === 'all' || content.model_category === selectedCategory;
    const courseTypeMatch = selectedCourseType === 'all' || content.course_type === selectedCourseType;
    return categoryMatch && courseTypeMatch;
  });

  const formatDuration = (seconds: number) => {
    if (!seconds) return '';
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const formatFileSize = (bytes: number) => {
    if (!bytes) return '';
    const mb = bytes / (1024 * 1024);
    return `${mb.toFixed(1)} MB`;
  };

  const getContentIcon = (type: string) => {
    switch (type) {
      case 'video':
        return <Play className="w-5 h-5" />;
      case 'pdf':
      case 'document':
        return <FileText className="w-5 h-5" />;
      default:
        return <FileText className="w-5 h-5" />;
    }
  };

  return (
    <Layout>
      <MetaTags 
        title="Classroom - Formation Mannequins | Perfect Models Management"
        description="Accédez à nos contenus de formation pour mannequins : cours théoriques et pratiques, vidéos et documents PDF."
      />
      
      <div className="container mx-auto px-6 py-12">
        <div className="text-center mb-12">
          <h1 className="font-playfair text-4xl md:text-5xl mb-6">CLASSROOM</h1>
          <div className="w-16 h-0.5 bg-model-gold mx-auto mb-6"></div>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Découvrez nos contenus de formation pour mannequins : cours théoriques et pratiques, 
            vidéos tutoriels et documents PDF pour perfectionner vos compétences.
          </p>
        </div>

        <div className="mb-8">
          <Tabs defaultValue="all" onValueChange={setSelectedCategory}>
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="all">Tous</TabsTrigger>
              <TabsTrigger value="femme">Femmes</TabsTrigger>
              <TabsTrigger value="homme">Hommes</TabsTrigger>
              <TabsTrigger value="enfant">Enfants</TabsTrigger>
              <TabsTrigger value="senior">Seniors</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        <div className="mb-8">
          <Tabs defaultValue="all" onValueChange={setSelectedCourseType}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="all">Tous les cours</TabsTrigger>
              <TabsTrigger value="theorique">Théorique</TabsTrigger>
              <TabsTrigger value="pratique">Pratique</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <div className="h-48 bg-gray-200"></div>
                <CardHeader>
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </CardHeader>
              </Card>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredContents?.map((content) => (
              <Card key={content.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                <div className="relative">
                  {content.thumbnail_url ? (
                    <img 
                      src={content.thumbnail_url} 
                      alt={content.title}
                      className="w-full h-48 object-cover"
                    />
                  ) : (
                    <div className="w-full h-48 bg-gray-200 flex items-center justify-center">
                      {getContentIcon(content.content_type)}
                    </div>
                  )}
                  <div className="absolute top-3 left-3">
                    <Badge variant={content.content_type === 'video' ? 'default' : 'secondary'}>
                      {content.content_type.toUpperCase()}
                    </Badge>
                  </div>
                  {content.duration && (
                    <div className="absolute bottom-3 right-3 bg-black/70 text-white px-2 py-1 rounded text-sm flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {formatDuration(content.duration)}
                    </div>
                  )}
                </div>
                
                <CardHeader>
                  <CardTitle className="text-lg">{content.title}</CardTitle>
                  <CardDescription>{content.description}</CardDescription>
                  <div className="flex gap-2 flex-wrap">
                    <Badge variant="outline">{content.model_category}</Badge>
                    <Badge variant="outline">{content.course_type}</Badge>
                    {content.file_size && (
                      <Badge variant="outline">{formatFileSize(content.file_size)}</Badge>
                    )}
                  </div>
                </CardHeader>
                
                <CardContent>
                  <a 
                    href={content.file_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 bg-model-black text-white px-4 py-2 hover:bg-model-gold transition-colors w-full justify-center"
                  >
                    {content.content_type === 'video' ? (
                      <>
                        <Play className="w-4 h-4" />
                        Regarder
                      </>
                    ) : (
                      <>
                        <Download className="w-4 h-4" />
                        Télécharger
                      </>
                    )}
                  </a>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {filteredContents?.length === 0 && !isLoading && (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">Aucun contenu disponible pour cette sélection.</p>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Classroom;
