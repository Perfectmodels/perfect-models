
import React from 'react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DetailedModel } from '@/types/modelTypes';
import { Search } from 'lucide-react';

interface ModelFiltersProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  genderFilter: string;
  onGenderChange: (value: string) => void;
  experienceFilter: string;
  onExperienceChange: (value: string) => void;
  models: DetailedModel[];
}

const ModelFilters: React.FC<ModelFiltersProps> = ({
  searchQuery,
  onSearchChange,
  genderFilter,
  onGenderChange,
  experienceFilter,
  onExperienceChange,
  models,
}) => {
  const uniqueExperiences = [...new Set(models.map(m => m.experience).filter(Boolean))] as string[];

  return (
    <div className="container mx-auto px-6 mb-8">
      <div className="flex flex-col md:flex-row gap-4 p-4 rounded-lg bg-card shadow-md border">
        <div className="relative flex-grow">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Rechercher par nom..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10 text-base"
          />
        </div>
        
        <Select value={genderFilter} onValueChange={onGenderChange}>
          <SelectTrigger className="w-full md:w-[180px] text-base">
            <SelectValue placeholder="Filtrer par genre" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous les genres</SelectItem>
            <SelectItem value="men">Hommes</SelectItem>
            <SelectItem value="women">Femmes</SelectItem>
          </SelectContent>
        </Select>

        <Select value={experienceFilter} onValueChange={onExperienceChange}>
          <SelectTrigger className="w-full md:w-[220px] text-base">
            <SelectValue placeholder="Filtrer par expérience" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Toutes expériences</SelectItem>
            {uniqueExperiences.map(exp => (
              <SelectItem key={exp} value={exp}>{exp}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};

export default ModelFilters;
