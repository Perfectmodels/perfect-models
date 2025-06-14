
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { DetailedModel } from '@/types/modelTypes';

type ModelFromDB = Omit<DetailedModel, 'measurements' | 'images' | 'id'> & {
  id: string; // This is the UUID from DB
  slug: string; // This is the '1', '2', etc.
  measurements: string | Record<string, any>;
  images: string[] | null;
};

const transformModel = (model: ModelFromDB): DetailedModel => {
    let measurements = model.measurements;
    if (typeof measurements === 'string') {
        try {
            measurements = JSON.parse(measurements);
        } catch (e) {
            console.error("Failed to parse measurements for model " + model.id, e);
            measurements = {};
        }
    }

    return {
        ...model,
        id: model.slug, // Use slug for navigation ID
        uuid: model.id, // Keep original UUID
        images: model.images || [],
        measurements: measurements as DetailedModel['measurements'],
    };
};

const fetchModels = async (): Promise<DetailedModel[]> => {
  const { data, error } = await supabase
    .from('models')
    .select('*')
    .eq('is_active', true)
    .order('created_at', { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return data.map(model => transformModel(model as unknown as ModelFromDB));
};

export const useModels = () => {
  return useQuery<DetailedModel[], Error>({
    queryKey: ['models'],
    queryFn: fetchModels,
  });
};

const fetchModelById = async (id: string): Promise<DetailedModel | null> => {
  if (!id) return null;

  const { data, error } = await supabase
    .from('models')
    .select('*')
    .eq('slug', id)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      return null;
    }
    throw new Error(error.message);
  }

  if (!data) return null;

  return transformModel(data as unknown as ModelFromDB);
};

export const useModelById = (id: string) => {
  return useQuery<DetailedModel | null, Error>({
    queryKey: ['model', id],
    queryFn: () => fetchModelById(id),
    enabled: !!id,
  });
};
