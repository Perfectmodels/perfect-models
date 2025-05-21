
import { Button } from '@/components/ui/button';
import { MessageSquare } from 'lucide-react';

interface SubmitButtonProps {
  isLoading: boolean;
}

const SubmitButton = ({ isLoading }: SubmitButtonProps) => {
  return (
    <Button 
      type="submit" 
      className="w-full bg-green-600 hover:bg-green-700 text-white flex items-center justify-center gap-2"
      disabled={isLoading}
    >
      <MessageSquare className="h-5 w-5" />
      {isLoading ? "Envoi en cours..." : "Envoyer ma candidature via WhatsApp"}
    </Button>
  );
};

export default SubmitButton;
