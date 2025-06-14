
import React from 'react';
import { Layout } from '@/components/layout';
import MetaTags from '@/components/seo/MetaTags';

const TermsOfService = () => {
  return (
    <Layout>
      <MetaTags
        title="Conditions d'Utilisation"
        description="Conditions d'utilisation de Perfect Models Management - Modalités et règles d'utilisation"
      />
      
      <div className="container mx-auto px-6 py-16">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-playfair text-model-black mb-8">
            Conditions d'Utilisation
          </h1>
          
          <div className="prose prose-lg max-w-none text-gray-700">
            <p className="text-xl mb-8">
              Dernière mise à jour : {new Date().toLocaleDateString('fr-FR')}
            </p>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-model-black mb-4">
                1. Acceptation des conditions
              </h2>
              <p className="mb-4">
                En utilisant les services de Perfect Models Management, vous acceptez d'être lié par ces 
                conditions d'utilisation. Si vous n'acceptez pas ces conditions, veuillez ne pas utiliser nos services.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-model-black mb-4">
                2. Services proposés
              </h2>
              <p className="mb-4">
                Perfect Models Management propose des services de :
              </p>
              <ul className="list-disc ml-6 mb-4">
                <li>Représentation de mannequins professionnels</li>
                <li>Organisation de castings</li>
                <li>Formation en mannequinat</li>
                <li>Services pour événements et défilés</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-model-black mb-4">
                3. Obligations des utilisateurs
              </h2>
              <p className="mb-4">
                En tant qu'utilisateur, vous vous engagez à :
              </p>
              <ul className="list-disc ml-6 mb-4">
                <li>Fournir des informations exactes et à jour</li>
                <li>Respecter les autres utilisateurs et notre équipe</li>
                <li>Ne pas utiliser nos services à des fins illégales</li>
                <li>Respecter les droits de propriété intellectuelle</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-model-black mb-4">
                4. Candidatures et castings
              </h2>
              <p className="mb-4">
                Pour les candidatures de casting :
              </p>
              <ul className="list-disc ml-6 mb-4">
                <li>Vous devez être âgé d'au moins 16 ans ou avoir l'autorisation parentale</li>
                <li>Les photos soumises doivent être récentes et vous représenter fidèlement</li>
                <li>Vous autorisez l'utilisation de vos photos à des fins de casting</li>
                <li>Nous nous réservons le droit de refuser toute candidature</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-model-black mb-4">
                5. Tarifs et paiements
              </h2>
              <p className="mb-4">
                Les tarifs de nos services sont disponibles sur notre site. Les paiements doivent être 
                effectués selon les modalités convenues. Nous nous réservons le droit de modifier nos 
                tarifs avec un préavis de 30 jours.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-model-black mb-4">
                6. Propriété intellectuelle
              </h2>
              <p className="mb-4">
                Tout le contenu de ce site, incluant les textes, images, logos, et design, 
                est la propriété de Perfect Models Management et est protégé par les lois sur 
                la propriété intellectuelle.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-model-black mb-4">
                7. Limitation de responsabilité
              </h2>
              <p className="mb-4">
                Perfect Models Management ne peut être tenu responsable des dommages indirects, 
                incidents ou consécutifs résultant de l'utilisation de nos services.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-model-black mb-4">
                8. Modification des conditions
              </h2>
              <p className="mb-4">
                Nous nous réservons le droit de modifier ces conditions à tout moment. 
                Les modifications seront publiées sur cette page avec la date de mise à jour.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-model-black mb-4">
                9. Droit applicable
              </h2>
              <p className="mb-4">
                Ces conditions sont régies par le droit gabonais. Tout litige sera soumis 
                à la juridiction des tribunaux de Libreville, Gabon.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-model-black mb-4">
                10. Contact
              </h2>
              <p className="mb-4">
                Pour toute question concernant ces conditions d'utilisation, 
                contactez-nous à : Contact@perfectmodels.ga ou +241 77 50 79 50
              </p>
            </section>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default TermsOfService;
