
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';

interface SuccessDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const SuccessDialog = ({ open, onOpenChange }: SuccessDialogProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Candidature envoyée !</DialogTitle>
          <DialogDescription>
            Merci pour votre candidature. Notre équipe l'examinera et vous contactera dans les plus brefs délais.
          </DialogDescription>
        </DialogHeader>
        <Button 
          onClick={() => onOpenChange(false)}
          className="bg-model-gold hover:bg-model-gold/90 text-white"
        >
          Fermer
        </Button>
      </DialogContent>
    </Dialog>
  );
};

export default SuccessDialog;
