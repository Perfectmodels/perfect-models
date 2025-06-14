
import React from 'react';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Users } from 'lucide-react';
import { DetailedModel } from '@/types/modelTypes';

interface ModelSelectionProps {
  models: DetailedModel[];
  selectedModels: string[];
  onModelSelection: (modelId: string, checked: boolean) => void;
}

const ModelSelection = ({ models, selectedModels, onModelSelection }: ModelSelectionProps) => {
  return (
    <div>
      <Label className="text-base font-semibold flex items-center gap-2 mb-3">
        <Users className="w-4 h-4" />
        Sélectionner les mannequins *
      </Label>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-60 overflow-y-auto border rounded-lg p-3">
        {models.length === 0 ? (
           <p className="text-sm text-gray-500 col-span-2 text-center py-4">Aucun mannequin ne correspond à vos critères.</p>
        ) : (
          models.map((model) => (
            <div key={model.id} className="flex items-center space-x-3 p-2 border rounded-lg hover:bg-gray-50">
              {model.image && (
                <img 
                  src={model.image} 
                  alt={model.name}
                  className="w-12 h-12 rounded-full object-cover"
                />
              )}
              <div className="flex-1">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id={`model-${model.id}`}
                    checked={selectedModels.includes(model.id)}
                    onCheckedChange={(checked) => onModelSelection(model.id, checked as boolean)}
                  />
                  <label 
                    htmlFor={`model-${model.id}`}
                    className="text-sm font-medium cursor-pointer"
                  >
                    {model.name}
                  </label>
                </div>
                <p className="text-xs text-gray-500">
                  {model.category} • {model.experience || 'Non spécifiée'}
                </p>
              </div>
            </div>
          ))
        )}
      </div>
      {selectedModels.length > 0 && (
        <p className="text-sm text-green-600 mt-2">
          {selectedModels.length} mannequin(s) sélectionné(s)
        </p>
      )}
    </div>
  );
};

export default ModelSelection;
