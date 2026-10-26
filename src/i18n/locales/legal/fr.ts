import { LegalTexts } from '../../../domain/legal/LegalDocument';

/** Traduction de legal/es.ts (le texte espagnol fait foi). */
export const legalFr: LegalTexts = {
  and: 'et',
  country: 'Colombie',
  documents: {
    terms: {
      title: 'Conditions générales d\'utilisation',
      summary: 'Les règles pour utiliser l\'app et le compteur : ce que fait le service, ce qu\'il ne fait pas et de quoi chacun est responsable.',
      sections: [
        {
          title: '1. Qui sommes-nous',
          blocks: [
            'Cuida Tu Agua est un projet de {{responsible}}, domiciliés à {{city}}, e-mail {{email}} (« nous »). Ces Conditions régissent l\'utilisation de l\'app mobile, de l\'app web et du compteur Cuida Tu Agua (le « Service »).',
            'En créant votre compte et en cochant la case d\'acceptation, vous déclarez les avoir lues et les accepter. Si vous n\'êtes pas d\'accord, n\'utilisez pas le Service.',
            'Le traitement de vos données est régi par la Politique de traitement des données, et l\'appareil par la Garantie et utilisation sûre. Les deux font partie de ces Conditions.',
            'Rien de ce qui est écrit ici ne limite les droits que vous donnent les lois de protection des consommateurs : en Colombie, la loi 1480 de 2011 ; en Équateur, la loi organique de défense du consommateur. Si une clause les contredit, la loi s\'applique.',
          ],
        },
        {
          title: '2. Ce que fait le Service',
          blocks: [
            {
              items: [
                'Enregistrer vos lieux et associer à chacun un compteur avec débitmètre et électrovanne.',
                'Voir votre consommation d\'eau par heure, jour et mois, et son coût estimé selon le tarif que vous saisissez.',
                'Ouvrir et fermer la vanne à distance, avec confirmation.',
                'Recevoir des alertes dans l\'app, par e-mail, SMS ou WhatsApp.',
                'Fixer des objectifs, lire des conseils d\'économie et partager un lieu avec des collaborateurs ou avec un lien invité.',
              ],
            },
          ],
        },
        {
          title: '3. Ce que le Service N\'EST PAS',
          blocks: [
            {
              items: [
                '**Ce n\'est pas un compteur officiel.** Les relevés sont indicatifs : ils servent à connaître et réduire votre consommation, mais ne remplacent ni le compteur ni la facture de votre fournisseur d\'eau, et ne servent pas à lui faire une réclamation.',
                '**Ce n\'est ni un service d\'urgence ni un système de sécurité.** Les alertes dépendent de votre internet, de l\'électricité, de l\'appareil et de services tiers, et peuvent arriver en retard ou ne pas arriver. En cas d\'urgence, fermez le robinet d\'arrêt principal et appelez un plombier ou les autorités.',
                '**Il ne détecte pas toutes les fuites et ce n\'est pas une assurance** contre les dégâts des eaux.',
              ],
            },
          ],
        },
        {
          title: '4. Votre compte',
          blocks: [
            {
              items: [
                'Vous devez avoir **plus de 18 ans**.',
                'Enregistrez des données exactes et tenez-les à jour.',
                'Protégez votre mot de passe : vous êtes responsable de ce qui est fait avec votre compte. Si vous pensez que quelqu\'un y est entré sans autorisation, changez-le et écrivez-nous.',
                'Pour recevoir des SMS ou WhatsApp, vous devez vérifier un numéro qui est le vôtre ou que vous êtes autorisé à utiliser. Un numéro ne peut appartenir qu\'à un seul compte.',
                'Vous pouvez supprimer votre compte à tout moment depuis Mon profil → Supprimer le compte, ou comme expliqué dans « Supprimer votre compte ».',
              ],
            },
          ],
        },
        {
          title: '5. L\'appareil et son installation',
          blocks: [
            'En associant un appareil, vous déclarez que :',
            {
              items: [
                'vous êtes le **propriétaire** du bien ou avez **l\'autorisation du propriétaire** (par exemple, si vous êtes locataire) ;',
                'vous l\'installerez **après le compteur du fournisseur d\'eau**, sans toucher à ce compteur ni au branchement. Les manipuler peut entraîner des amendes et la suspension du service par le fournisseur ;',
                'dans un immeuble ou une copropriété, vous l\'installerez uniquement sur la canalisation de votre logement, jamais sur les canalisations communes ;',
                'vous informerez les personnes qui vivent ou travaillent dans le lieu qu\'il y a un compteur connecté.',
              ],
            },
            'Suivez le guide d\'installation, utilisez uniquement l\'adaptateur d\'origine et uniquement de l\'eau froide potable. N\'ouvrez pas et ne modifiez pas l\'appareil. Nous recommandons de le faire installer par un plombier et d\'utiliser un parasurtenseur.',
          ],
        },
        {
          title: '6. La vanne à distance',
          blocks: [
            'Fermer la vanne coupe l\'eau du lieu : avant de le faire, assurez-vous que personne ne l\'utilise. Les ordres que vous donnez, ou qu\'un collaborateur à qui vous avez donné cette autorisation donne, sont considérés comme les vôtres. Sans internet ni électricité, l\'ordre peut ne pas atteindre l\'appareil : ne l\'utilisez pas comme seule mesure en cas d\'urgence.',
          ],
        },
        {
          title: '7. Partager votre lieu',
          blocks: [
            {
              items: [
                'Les **collaborateurs** voient et font uniquement ce que vous leur permettez. Vous pouvez modifier leurs autorisations ou les retirer à tout moment.',
                '**Toute personne qui a votre lien invité** peut voir la consommation du lieu tant qu\'il est actif. Partagez-le avec prudence et désactivez-le quand vous n\'en avez plus besoin.',
                'Partager est votre décision. Informez d\'abord les personnes qui vivent dans le lieu.',
              ],
            },
          ],
        },
        {
          title: '8. Utilisation acceptable',
          blocks: [
            'Il est interdit de :',
            {
              items: [
                'utiliser le Service à des fins illégales ou pour surveiller ou harceler d\'autres personnes ;',
                'tenter d\'accéder aux comptes, appareils ou données d\'autrui, ou attaquer le Service ;',
                'utiliser les invitations ou les messages pour envoyer de la publicité ou des contenus non désirés ;',
                'usurper l\'identité d\'une autre personne.',
              ],
            },
            'Si vous enfreignez ces règles, nous pouvons suspendre ou fermer votre compte, et nous vous en dirons le motif, sauf si la loi ou la sécurité l\'empêche.',
          ],
        },
        {
          title: '9. Responsabilité',
          blocks: [
            'Nous sommes responsables, conformément à la loi, de la qualité du Service et de l\'appareil (garantie légale), des dommages causés par un défaut de l\'appareil et de la sécurité de vos données. **Nous n\'excluons pas ces responsabilités.**',
            'Nous ne sommes pas responsables des dommages dont la cause est, et est prouvée être :',
            {
              items: [
                '**la force majeure ou le cas fortuit :** catastrophes naturelles, foudre, coupures d\'eau ou ordres des autorités ;',
                '**les pannes du réseau électrique :** surcharges, variations de tension ou surtensions venant du réseau et non d\'un défaut de l\'appareil ou de son adaptateur ;',
                '**le fait de tiers :** pannes de votre internet, de votre WiFi ou des fournisseurs dont dépendent les notifications, ou dommages causés par d\'autres personnes ;',
                '**une installation qui n\'a pas suivi le guide :** avant le compteur du fournisseur, sur des canalisations communes ou en mauvais état ;',
                '**une mauvaise utilisation de l\'appareil :** l\'ouvrir, le modifier, utiliser un autre adaptateur, de l\'eau non potable ou des conditions hors spécifications ;',
                '**les décisions de l\'utilisateur ou de ses collaborateurs :** ouvrir ou fermer la vanne, ou partager le mot de passe ou le lien invité ;',
                '**les écarts entre nos relevés et la facture d\'eau**, car nos relevés sont indicatifs.',
              ],
            },
            'Le Service peut connaître des interruptions pour maintenance ou pannes ; lorsqu\'elles sont programmées, nous vous préviendrons à l\'avance. Rien dans ces Conditions ne vous oblige à renoncer à vos droits ni ne renverse la charge de la preuve contre vous.',
          ],
        },
        {
          title: '10. Prix',
          blocks: [
            'Aujourd\'hui, l\'utilisation de l\'app est gratuite. Si, à l\'avenir, nous vendons l\'appareil ou un abonnement, nous indiquerons le prix avant l\'achat, et pour les achats à distance vous aurez le droit de rétractation prévu par la loi. Les frais de votre opérateur pour les données ou les messages sont à votre charge.',
          ],
        },
        {
          title: '11. Propriété intellectuelle',
          blocks: [
            'L\'app, le firmware, la marque et les contenus nous appartiennent ou font l\'objet d\'une licence. Nous vous accordons une autorisation personnelle et incessible de les utiliser tant que vous avez votre compte. **Vos données de consommation vous appartiennent.**',
          ],
        },
        {
          title: '12. Modifications et contact',
          blocks: [
            'Si nous modifions ces Conditions de manière importante, nous vous préviendrons à l\'avance dans l\'app ou par e-mail et vous demanderons de les accepter à nouveau lorsque la loi l\'exige.',
            'Pour toute demande, plainte ou réclamation, écrivez-nous à {{email}} : nous répondons sous 15 jours ouvrables au maximum. Si vous n\'êtes pas satisfait, vous pouvez vous adresser à la Surintendance de l\'industrie et du commerce (Colombie) ou au Défenseur du peuple (Équateur).',
            'Les lois du pays où vous utilisez le Service s\'appliquent, et les litiges sont réglés devant les autorités de votre domicile.',
          ],
        },
      ],
    },

    privacy: {
      title: 'Politique de traitement des données personnelles',
      summary: 'Quelles données nous collectons, à quoi elles servent, avec qui nous les partageons, combien de temps nous les gardons et comment exercer vos droits.',
      sections: [
        {
          title: '1. Responsable du traitement',
          blocks: [
            '{{responsible}}, membres du projet Cuida Tu Agua, domiciliés à {{city}}. E-mail pour les questions de données personnelles : {{email}}.',
            'Cette Politique respecte la loi 1581 de 2012 et le décret 1377 de 2013 (Colombie), ainsi que la loi organique de protection des données personnelles et son règlement (Équateur).',
          ],
        },
        {
          title: '2. Quelles données nous collectons',
          blocks: [
            {
              items: [
                '**Identification et contact :** prénom, nom, e-mail, photo de profil et numéro de mobile (facultatifs). Si vous vous connectez avec Google, nous recevons de Google votre nom, votre e-mail et votre photo.',
                '**Accès :** votre mot de passe, stocké chiffré de sorte que personne ne puisse le lire, vos sessions et la date à laquelle vous avez accepté cette Politique.',
                '**Lieux :** nom, adresse, ville, type de bien et le tarif que vous saisissez.',
                '**Consommation :** relevés du compteur par heure, jour et mois, état et historique de la vanne, connexion de l\'appareil et vos objectifs.',
                '**Partage :** e-mails des personnes que vous invitez, leurs autorisations et vos liens invités.',
                '**Notifications :** vos préférences, l\'identifiant du téléphone pour les notifications push et l\'historique des alertes.',
                '**Sécurité :** adresse IP, type d\'appareil et journaux d\'accès et d\'actions importantes.',
              ],
            },
            '**Votre consommation d\'eau est une donnée personnelle :** elle peut révéler des horaires, si la maison est vide ou combien de personnes y vivent. Nous la protégeons comme vos données de contact.',
            '**Nous ne collectons pas** votre position GPS, vos contacts, le micro ni la caméra (seulement la galerie, si vous choisissez une photo de profil), de données sensibles ni de données de mineurs.',
            'Le mot de passe de votre WiFi est saisi dans le portail de configuration de l\'appareil et **n\'est enregistré que dans celui-ci**. Nous n\'utilisons ni publicité, ni cookies de suivi, ni outils d\'analyse tiers : nous gardons seulement votre session et vos préférences sur votre appareil.',
          ],
        },
        {
          title: '3. À quoi elles servent',
          blocks: [
            {
              numbered: true,
              items: [
                'Créer et gérer votre compte : inscription, connexion, récupération du mot de passe et vérifications.',
                'Fournir le Service : consommation, coût estimé, vanne, objectifs et conseils.',
                'Vous envoyer les alertes et notifications du Service par les canaux que vous choisissez.',
                'Partager votre lieu avec les personnes que vous invitez, avec les autorisations que vous choisissez.',
                'Protéger le Service : prévenir la fraude, les accès abusifs et les incidents.',
                'Traiter vos demandes, réclamations et requêtes.',
                'Améliorer le Service grâce à des statistiques anonymes.',
                'Respecter la loi et les demandes des autorités compétentes.',
              ],
            },
            '**Nous ne vendons pas vos données et ne les utilisons pas pour la publicité.** Pour toute autre finalité, nous vous demanderions une nouvelle autorisation.',
          ],
        },
        {
          title: '4. Base légale',
          blocks: [
            {
              items: [
                '**En Colombie,** votre autorisation préalable, expresse et éclairée, que vous donnez en cochant la case lors de l\'inscription.',
                '**En Équateur,** votre consentement, l\'exécution du contrat de service, notre intérêt légitime pour la sécurité et le respect de la loi.',
              ],
            },
            'Vous pouvez révoquer votre autorisation à tout moment. Certaines données étant indispensables au Service, la révoquer implique de fermer le compte.',
          ],
        },
        {
          title: '5. Avec qui nous les partageons',
          blocks: [
            {
              items: [
                '**Les personnes que vous autorisez :** vos collaborateurs, qui ne voient que ce que vous leur permettez, et toute personne ayant votre lien invité, qui voit la consommation du lieu.',
                '**Les autorités,** lorsque la loi l\'exige.',
              ],
            },
            '**Les prestataires qui nous aident à fournir le Service**, qui n\'utilisent les données que pour cela :',
            {
              items: [
                'Google, pour la connexion ;',
                'Expo et les services de notifications de Google et d\'Apple, pour les notifications push ;',
                'Twilio et Meta (WhatsApp), pour les SMS et WhatsApp ;',
                'nos prestataires d\'e-mail et de serveurs.',
              ],
            },
            'Certains prestataires sont aux États-Unis, pays que la Surintendance de l\'industrie et du commerce de Colombie considère comme offrant un niveau de protection adéquat. Nous exigeons d\'eux des mesures de sécurité équivalentes à celles de cette Politique.',
          ],
        },
        {
          title: '6. Combien de temps nous les gardons',
          blocks: [
            {
              items: [
                '**Tant que votre compte est actif :** votre compte, vos lieux, votre consommation et vos notifications.',
                '**À la suppression du compte :** vos données d\'identification sont supprimées ou anonymisées immédiatement, et celles de consommation sous 30 jours au maximum.',
                '**Journaux de sécurité :** 12 mois.',
                '**Preuve de votre autorisation et de vos demandes :** jusqu\'à 5 ans après la fermeture du compte, pour traiter les réclamations.',
                '**Statistiques anonymes :** sans limite, car elles ne vous identifient pas.',
              ],
            },
          ],
        },
        {
          title: '7. Vos droits',
          blocks: [
            {
              items: [
                'Connaître, mettre à jour et corriger vos données.',
                'Demander la preuve de l\'autorisation que vous nous avez donnée.',
                'Savoir comment nous utilisons vos données.',
                'Révoquer l\'autorisation ou nous demander de supprimer vos données, sauf si la loi nous oblige à les conserver.',
                'En Équateur, en outre : vous opposer, demander la portabilité de vos données et la suspension du traitement. Nous ne prenons pas de décisions automatisées vous concernant.',
                'Accéder gratuitement à vos données.',
                'Déposer une plainte auprès de la Surintendance de l\'industrie et du commerce (Colombie) ou de la Surintendance de protection des données personnelles (Équateur).',
              ],
            },
            'Vous exercez vous-même beaucoup de ces droits dans Mon profil : modifier vos données, changer le mot de passe, choisir vos notifications et supprimer le compte.',
          ],
        },
        {
          title: '8. Comment faire une demande ou une réclamation',
          blocks: [
            'Écrivez-nous à {{email}} avec votre nom, l\'e-mail de votre compte et ce que vous demandez. Avant de communiquer ou de modifier des données, nous vérifions que vous êtes la personne concernée.',
            {
              items: [
                '**Demandes :** nous répondons sous 10 jours ouvrables, prolongeables de 5.',
                '**Réclamations :** nous répondons sous 15 jours ouvrables, prolongeables de 8.',
                '**En Équateur :** nous répondons sous 15 jours.',
              ],
            },
            'Si la réclamation est incomplète, nous vous demanderons de la compléter sous 5 jours. Pendant que nous la traitons, nous la marquons comme « réclamation en cours ».',
          ],
        },
        {
          title: '9. Sécurité',
          blocks: [
            'Nous utilisons une connexion chiffrée, des mots de passe chiffrés, des sessions qui expirent, une confirmation pour fermer la vanne, des autorisations par collaborateur et des journaux d\'activité.',
            'Aucun système n\'est sûr à 100 %. Si un incident met vos données en danger, nous le signalerons à l\'autorité dans les délais légaux (15 jours ouvrables en Colombie et 5 jours en Équateur) et vous préviendrons sans délai, avec ce que vous pouvez faire pour vous protéger.',
          ],
        },
        {
          title: '10. Données d\'autres personnes',
          blocks: [
            {
              items: [
                'La consommation reflète les habitudes de tous ceux qui vivent dans le lieu : vous vous engagez à les informer qu\'il y a un compteur connecté et de qui voit les informations.',
                'Quand vous invitez quelqu\'un, vous nous donnez son e-mail : nous l\'utilisons uniquement pour lui envoyer l\'invitation.',
              ],
            },
          ],
        },
        {
          title: '11. Mineurs',
          blocks: ['Le Service est réservé aux personnes de plus de 18 ans. Si nous détectons le compte d\'un mineur, nous le supprimerons.'],
        },
        {
          title: '12. Modifications et validité',
          blocks: [
            'Nous vous informerons des modifications importantes avant de les appliquer et vous demanderons une nouvelle autorisation lorsque la loi l\'exige.',
            'Cette Politique est en vigueur depuis le {{date}}. Les bases de données resteront en vigueur tant que le Service est fourni et pendant les délais de la section 6.',
          ],
        },
      ],
    },

    notice: {
      title: 'Avis de confidentialité',
      summary: 'La version courte de la façon dont nous utilisons vos données.',
      sections: [
        {
          title: 'Responsable du traitement',
          blocks: ['{{responsible}}, membres du projet Cuida Tu Agua, domiciliés à {{city}}, sont responsables du traitement de vos données personnelles.'],
        },
        {
          title: 'Quelles données et pourquoi',
          blocks: [
            'Nous utilisons :',
            {
              items: [
                'votre nom et votre e-mail ;',
                'votre numéro de mobile, si vous l\'enregistrez ;',
                'l\'adresse de vos lieux ;',
                'la consommation d\'eau que mesure votre appareil et l\'état de la vanne ;',
                'des données techniques de sécurité.',
              ],
            },
            'Nous les utilisons pour :',
            {
              items: [
                'vous fournir le service : afficher votre consommation, actionner la vanne et vous envoyer des alertes ;',
                'partager votre lieu avec qui vous le décidez ;',
                'protéger votre compte ;',
                'traiter vos demandes.',
              ],
            },
            'Nous ne vendons pas vos données et ne les utilisons pas pour la publicité. Certains prestataires qui nous aident (Google, Twilio et Meta, Expo et nos serveurs) les traitent aux États-Unis, avec des mesures de protection adéquates.',
          ],
        },
        {
          title: 'Vos droits',
          blocks: [
            'Vous pouvez :',
            {
              items: [
                'connaître, mettre à jour, corriger et supprimer vos données ;',
                'demander la preuve de votre autorisation et la révoquer ;',
                'déposer une plainte auprès de la Surintendance de l\'industrie et du commerce (Colombie) ou de la Surintendance de protection des données personnelles (Équateur).',
              ],
            },
            'Pour les exercer, écrivez-nous à {{email}}. La Politique de traitement des données complète se trouve dans cette même section de l\'app.',
          ],
        },
      ],
    },

    deletion: {
      title: 'Supprimer votre compte',
      summary: 'Comment supprimer votre compte et vos données, avec ou sans l\'app, et ce que nous conservons.',
      sections: [
        {
          title: 'Depuis l\'app',
          blocks: [
            {
              numbered: true,
              items: ['Connectez-vous.', 'Allez dans Mon profil → Supprimer le compte.', 'Confirmez avec votre mot de passe ou avec votre compte Google.'],
            },
            'La suppression est immédiate.',
          ],
        },
        {
          title: 'Sans l\'app',
          blocks: [
            'Connectez-vous à la version web et suivez les mêmes étapes.',
            'Si vous ne pouvez pas vous connecter, écrivez-nous à {{email}} depuis l\'e-mail de votre compte, avec l\'objet « Supprimer mon compte ». Nous vérifions que vous êtes le titulaire et le supprimons sous 15 jours ouvrables au maximum.',
          ],
        },
        {
          title: 'Ce qui est supprimé',
          blocks: [
            {
              items: [
                '**Nom, e-mail, numéro de mobile et photo :** supprimés ou anonymisés immédiatement.',
                '**Sessions :** fermées sur tous vos appareils.',
                '**Compteurs :** dissociés ; ils peuvent être associés à un autre compte.',
                '**Lieux, consommation, objectifs et notifications :** supprimés ou anonymisés sous 30 jours au maximum.',
                '**Accès partagés :** les accès que vous avez donnés aux collaborateurs et invités sont annulés, et vous perdez l\'accès aux lieux que d\'autres ont partagés avec vous.',
              ],
            },
          ],
        },
        {
          title: 'Ce que nous conservons',
          blocks: [
            {
              items: [
                '**Journaux de sécurité :** 12 mois.',
                '**Preuve de votre autorisation et de votre demande :** jusqu\'à 5 ans.',
                '**Statistiques anonymes :** elles ne vous identifient pas.',
              ],
            },
            'La suppression est irréversible.',
          ],
        },
      ],
    },

    device: {
      title: 'Garantie et utilisation sûre de l\'appareil',
      summary: 'Ce que couvre la garantie du compteur, quand elle ne s\'applique pas et comment l\'installer en toute sécurité.',
      sections: [
        {
          title: 'Garantie',
          blocks: [
            'Le compteur Cuida Tu Agua (module électronique, débitmètre, électrovanne et adaptateur) est garanti 12 mois à compter de la livraison contre les défauts de fabrication, de fonctionnement ou de qualité.',
            {
              items: [
                'D\'abord, nous le réparons gratuitement.',
                'Si la panne se répète ou ne peut pas être réparée, nous le remplaçons ou vous remboursons, à votre choix.',
                'Pendant la réparation, la durée de la garantie est suspendue.',
              ],
            },
            'Pour l\'utiliser, écrivez-nous à {{email}} avec le code de l\'appareil (SW-…, sur l\'étiquette et dans l\'app) et la panne.',
          ],
        },
        {
          title: 'Quand elle ne s\'applique pas',
          blocks: [
            'La garantie ne s\'applique pas lorsque la panne est due, et qu\'il est prouvé qu\'elle est due, à :',
            {
              items: [
                'la force majeure ou le cas fortuit : foudre, inondations ou incendies ;',
                'des surcharges ou variations de tension venant du réseau électrique ;',
                'des dommages causés par d\'autres personnes ;',
                'une mauvaise utilisation : ouvrir ou modifier l\'appareil, changer son firmware, utiliser un autre adaptateur, de l\'eau non potable, de l\'eau chaude ou des conditions hors spécifications ;',
                'une installation qui n\'a pas suivi ce guide.',
              ],
            },
            'La garantie s\'applique **toujours** si la panne vient d\'un défaut de l\'appareil lui-même.',
          ],
        },
        {
          title: 'Installation sûre',
          blocks: [
            {
              items: [
                'Installez-le **toujours après le compteur du fournisseur d\'eau**, sur la canalisation intérieure. N\'ouvrez, ne déplacez et ne branchez jamais rien sur le compteur du fournisseur ni sur le branchement.',
                'Dans les immeubles ou copropriétés, uniquement sur la canalisation de votre logement.',
                'Obtenez l\'autorisation du propriétaire si vous ne l\'êtes pas.',
                'Nous recommandons de le faire installer par un plombier.',
                'Respectez la flèche du sens d\'écoulement.',
                'Prévoyez un robinet d\'arrêt manuel avant l\'appareil et, si possible, un filtre à sédiments.',
                'Utilisez uniquement de l\'eau froide potable et l\'adaptateur d\'origine, sur une prise protégée de l\'humidité.',
                'Nous recommandons un parasurtenseur ou un régulateur de tension.',
                'Si vos canalisations sont anciennes, demandez au plombier s\'il convient d\'installer un anti-bélier.',
              ],
            },
          ],
        },
        {
          title: 'À retenir',
          blocks: [
            {
              items: [
                'Les relevés sont indicatifs et les alertes ne sont pas un service d\'urgence : en cas d\'urgence, fermez le robinet d\'arrêt manuel.',
                'Informez les personnes qui vivent dans le lieu qu\'il y a un compteur connecté.',
                'En fin de vie, déposez l\'appareil dans un point de collecte des déchets électroniques ou renvoyez-le-nous.',
              ],
            },
          ],
        },
      ],
    },
  },
};
