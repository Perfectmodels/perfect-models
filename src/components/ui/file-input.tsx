
import * as React from "react";
import { cn } from "@/lib/utils";
import { Button } from "./button";
import { Upload, X, Image as ImageIcon } from "lucide-react";

export interface FileInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  onFileChange?: (files: File[]) => void;
  maxFiles?: number;
  acceptedTypes?: string;
  preview?: boolean;
  existingFiles?: File[] | string[];
  onRemove?: (index: number) => void;
  label?: string;
}

const FileInput = React.forwardRef<HTMLInputElement, FileInputProps>(
  ({ className, onFileChange, maxFiles = 1, acceptedTypes = "image/*", preview = true, existingFiles = [], onRemove, label, ...props }, ref) => {
    const [files, setFiles] = React.useState<File[]>([]);
    const [previews, setPreviews] = React.useState<string[]>([]);
    const fileInputRef = React.useRef<HTMLInputElement>(null);

    React.useEffect(() => {
      if (existingFiles.length > 0) {
        const initialPreviews = existingFiles.map((file) => {
          if (typeof file === "string") {
            return file;
          } else {
            return URL.createObjectURL(file);
          }
        });
        setPreviews(initialPreviews);
      }
    }, [existingFiles]);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const selectedFiles = e.target.files;
      if (!selectedFiles) return;

      const newFiles: File[] = [];
      const newPreviews: string[] = [];
      
      const totalFiles = files.length + selectedFiles.length;
      const filesToProcess = totalFiles > maxFiles 
        ? Array.from(selectedFiles).slice(0, maxFiles - files.length) 
        : Array.from(selectedFiles);

      filesToProcess.forEach((file) => {
        newFiles.push(file);
        if (preview) {
          newPreviews.push(URL.createObjectURL(file));
        }
      });

      const updatedFiles = [...files, ...newFiles];
      const updatedPreviews = [...previews, ...newPreviews];
      
      setFiles(updatedFiles);
      setPreviews(updatedPreviews);
      
      if (onFileChange) {
        onFileChange(updatedFiles);
      }

      // Reset input value to allow selecting the same file again
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    };

    const handleRemove = (index: number) => {
      const updatedFiles = [...files];
      const updatedPreviews = [...previews];
      
      // Revoke object URL to avoid memory leaks
      if (preview && updatedPreviews[index] && !updatedPreviews[index].startsWith("http")) {
        URL.revokeObjectURL(updatedPreviews[index]);
      }
      
      updatedFiles.splice(index, 1);
      updatedPreviews.splice(index, 1);
      
      setFiles(updatedFiles);
      setPreviews(updatedPreviews);
      
      if (onRemove) {
        onRemove(index);
      }
      
      if (onFileChange) {
        onFileChange(updatedFiles);
      }
    };

    const handleButtonClick = () => {
      fileInputRef.current?.click();
    };

    return (
      <div className={cn("space-y-2", className)}>
        {label && <div className="text-sm font-medium mb-2">{label}</div>}
        <Button
          type="button"
          variant="outline"
          className="w-full flex items-center justify-center gap-2"
          onClick={handleButtonClick}
        >
          <Upload size={16} /> Sélectionner {maxFiles > 1 ? `(${files.length}/${maxFiles})` : ""}
        </Button>
        
        <input
          type="file"
          className="hidden"
          accept={acceptedTypes}
          onChange={handleFileChange}
          ref={(e) => {
            if (ref) {
              if (typeof ref === 'function') {
                ref(e);
              } else {
                ref.current = e;
              }
            }
            fileInputRef.current = e;
          }}
          multiple={maxFiles > 1}
          disabled={files.length >= maxFiles}
          {...props}
        />
        
        {preview && previews.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mt-4">
            {previews.map((src, index) => (
              <div key={index} className="relative group">
                <div className="aspect-square relative rounded-md overflow-hidden border">
                  <img src={src} alt={`Preview ${index + 1}`} className="w-full h-full object-cover" />
                </div>
                <button
                  type="button"
                  onClick={() => handleRemove(index)}
                  className="absolute top-1 right-1 bg-black/50 hover:bg-black/70 text-white rounded-full p-1 transition-opacity"
                >
                  <X size={14} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }
);

FileInput.displayName = "FileInput";

export { FileInput };
