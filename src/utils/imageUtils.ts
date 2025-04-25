
export const convertIbbLinkToDirectImageUrl = (ibbUrl: string): string => {
  // Extrait l'ID de l'image du lien ibb.co
  const imageId = ibbUrl.split('/').pop();
  // Retourne le lien direct vers l'image
  return `https://i.ibb.co/${imageId}/image.jpg`;
};
