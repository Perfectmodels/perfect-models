
import React from 'react';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';

interface SubmitButtonProps {
  isLoading: boolean;
  disabled?: boolean;
}

const SubmitButton: React.FC<SubmitButtonProps> = ({ isLoading, disabled = false }) => {
  return (
    <Button 
      type="submit" 
      className="w-full bg-model-gold hover:bg-model-gold/90 text-model-black font-semibold py-3 px-6 rounded-lg transition-colors duration-300"
      disabled={isLoading || disabled}
    >
      {isLoading ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Envoi en cours...
        </>
      ) : (
        'Envoyer ma candidature'
      )}
    </Button>
  );
};

export default SubmitButton;
