import React from 'react';
import ImgBBUploader from './ImgBBUploader';

interface ImageInputProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
}

/**
 * Compatibilité des anciens écrans : toute image passe désormais par le proxy
 * serveur ImgBB au lieu d'un champ URL libre.
 */
const ImageInput: React.FC<ImageInputProps> = ({ label, value, onChange }) => (
  <ImgBBUploader
    label={label}
    value={value}
    onChange={onChange}
    scope="admin/images"
  />
);

export default ImageInput;
