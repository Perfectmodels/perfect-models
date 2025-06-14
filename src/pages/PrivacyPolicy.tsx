
import React from 'react';
import { Layout } from '@/components/layout';
import MetaTags from '@/components/seo/MetaTags';

const PrivacyPolicy = () => {
  return (
    <Layout>
      <MetaTags
        title="Politique de Confidentialité"
        description="Politique de confidentialité de Perfect Models Management - Protection de vos données personnelles"
      />
      
      <div className="container mx-auto px-6 py-16">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-playfair text-model-black mb-8">
            Politique de Confidentialité
          </h1>
          
          <div className="prose prose-lg max-w-none text-gray-700">
            <p className="text-xl mb-8">
              Dernière mise à jour : {new Date().toLocaleDateString('fr-FR')}
            </p>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-model-black mb-4">
                1. Collecte des informations
              </h2>
              <p className="mb-4">
                Perfect Models Management collecte des informations lorsque vous vous inscrivez pour un casting, 
                commandez nos services, ou interagissez avec notre site web. Les informations collectées incluent 
                votre nom, adresse e-mail, numéro de téléphone, mensurations, et photos professionnelles.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-model-black mb-4">
                2. Utilisation des informations
              </h2>
              <p className="mb-4">
                Nous utilisons vos informations pour :
              </p>
              <ul className="list-disc ml-6 mb-4">
                <li>Traiter vos candidatures de casting</li>
                <li>Vous contacter concernant des opportunités de mannequinat</li>
                <li>Améliorer notre service client</li>
                <li>Envoyer des newsletters et communications marketing</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-model-black mb-4">
                3. Protection des informations
              </h2>
              <p className="mb-4">
                Nous mettons en place diverses mesures de sécurité pour protéger vos informations personnelles. 
                Vos données sont stockées dans des environnements sécurisés et ne sont accessibles qu'au personnel autorisé.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-model-black mb-4">
                4. Partage des informations
              </h2>
              <p className="mb-4">
                Nous ne vendons, n'échangeons, ni ne transférons vos informations personnelles à des tiers, 
                sauf dans les cas suivants :
              </p>
              <ul className="list-disc ml-6 mb-4">
                <li>Avec votre consentement explicite</li>
                <li>Pour des services directement liés à votre activité de mannequin</li>
                <li>Lorsque requis par la loi</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-model-black mb-4">
                5. Vos droits
              </h2>
              <p className="mb-4">
                Vous avez le droit de :
              </p>
              <ul className="list-disc ml-6 mb-4">
                <li>Accéder à vos données personnelles</li>
                <li>Corriger des informations inexactes</li>
                <li>Demander la suppression de vos données</li>
                <li>Vous opposer au traitement de vos données</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-model-black mb-4">
                6. Cookies
              </h2>
              <p className="mb-4">
                Notre site utilise des cookies pour améliorer votre expérience de navigation. 
                Vous pouvez configurer votre navigateur pour refuser les cookies, mais cela pourrait 
                affecter certaines fonctionnalités du site.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-model-black mb-4">
                7. Contact
              </h2>
              <p className="mb-4">
                Pour toute question concernant cette politique de confidentialité, 
                contactez-nous à : Contact@perfectmodels.ga ou +241 77 50 79 50
              </p>
            </section>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default PrivacyPolicy;
