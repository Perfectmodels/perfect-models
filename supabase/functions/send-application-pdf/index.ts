import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { PDFDocument, rgb, StandardFonts } from 'https://cdn.skypack.dev/pdf-lib@^1.17.1';
import { corsHeaders } from '../_shared/cors.ts';

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { application, categoryName } = await req.json();

    // Créer un nouveau document PDF
    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage([595.28, 841.89]); // A4

    // Charger le logo
    const logoUrl = 'https://i.ibb.co/your-logo-url.png'; // Remplacez par l'URL de votre logo
    const logoBytes = await fetch(logoUrl).then(res => res.arrayBuffer());
    const logoImage = await pdfDoc.embedPng(logoBytes);
    
    // Définir les marges et les dimensions
    const margin = 50;
    const pageWidth = page.getWidth();
    const pageHeight = page.getHeight();

    // Ajouter le logo
    const logoDims = logoImage.scale(0.2);
    page.drawImage(logoImage, {
      x: pageWidth / 2 - logoDims.width / 2,
      y: pageHeight - margin - logoDims.height,
      width: logoDims.width,
      height: logoDims.height,
    });

    // Charger la police
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

    // Titre
    page.drawText('CANDIDATURE MANNEQUIN', {
      x: margin,
      y: pageHeight - margin - 100,
      size: 24,
      font: boldFont,
      color: rgb(0, 0, 0),
    });

    // Informations personnelles
    let y = pageHeight - margin - 150;
    const lineHeight = 20;

    const drawSection = (title: string, content: string) => {
      page.drawText(title, {
        x: margin,
        y,
        size: 12,
        font: boldFont,
        color: rgb(0, 0, 0),
      });
      y -= lineHeight;
      page.drawText(content, {
        x: margin + 20,
        y,
        size: 12,
        font: font,
        color: rgb(0, 0, 0),
      });
      y -= lineHeight * 1.5;
    };

    // Informations personnelles
    drawSection('Informations personnelles:', '');
    drawSection('Nom:', `${application.first_name} ${application.last_name}`);
    drawSection('Email:', application.email);
    drawSection('Téléphone:', application.phone);
    drawSection('Genre:', application.gender === 'male' ? 'Homme' : application.gender === 'female' ? 'Femme' : 'Autre');
    drawSection('Catégorie:', categoryName || 'Non spécifiée');

    // Mensurations
    y -= lineHeight;
    drawSection('Mensurations:', '');
    drawSection('Âge:', application.age ? `${application.age} ans` : 'Non spécifié');
    drawSection('Taille:', `${application.height} cm`);
    if (application.weight) drawSection('Poids:', `${application.weight} kg`);
    if (application.bust) drawSection('Tour de poitrine:', `${application.bust} cm`);
    if (application.waist) drawSection('Tour de taille:', `${application.waist} cm`);
    if (application.hips) drawSection('Tour de hanches:', `${application.hips} cm`);

    // Informations supplémentaires
    if (application.experience || application.instagram_url) {
      y -= lineHeight;
      drawSection('Informations supplémentaires:', '');
      if (application.experience) drawSection('Expérience:', application.experience);
      if (application.instagram_url) drawSection('Instagram:', application.instagram_url);
    }

    // Pied de page
    const footerText = 'Perfect Models Management - www.perfectmodels.ga';
    const footerWidth = font.widthOfTextAtSize(footerText, 10);
    page.drawText(footerText, {
      x: pageWidth / 2 - footerWidth / 2,
      y: margin,
      size: 10,
      font: font,
      color: rgb(0.5, 0.5, 0.5),
    });

    // Sauvegarder le PDF
    const pdfBytes = await pdfDoc.save();

    return new Response(pdfBytes, {
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'attachment; filename="candidature.pdf"',
      },
    });
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
}); 