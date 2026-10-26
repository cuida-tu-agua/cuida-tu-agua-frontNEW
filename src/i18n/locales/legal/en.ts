import { LegalTexts } from '../../../domain/legal/LegalDocument';

/** Translation of legal/es.ts (the Spanish text is the one that prevails). */
export const legalEn: LegalTexts = {
  and: 'and',
  emailPending: '(e-mail to be published)',
  country: 'Colombia',
  documents: {
    terms: {
      title: 'Terms and Conditions',
      summary: 'The rules for using the app and the meter: what the service does, what it does not do and what each party is responsible for.',
      sections: [
        {
          title: '1. Who we are',
          blocks: [
            'Cuida Tu Agua is a project of {{responsible}}, domiciled in {{city}}, e-mail {{email}} ("we"). These Terms govern the use of the mobile app, the web app and the Cuida Tu Agua meter device (the "Service").',
            'By creating your account and ticking the acceptance box, you state that you have read and accept them. If you do not agree, do not use the Service.',
            'The processing of your data is governed by the Data Processing Policy, and the device by the Warranty and safe use. Both are part of these Terms.',
            'Nothing written here limits the rights that consumer protection laws give you: in Colombia, Law 1480 of 2011; in Ecuador, the Organic Consumer Protection Law. If a clause contradicts them, the law applies.',
          ],
        },
        {
          title: '2. What the Service does',
          blocks: [
            {
              items: [
                'Register your places and link each one to a meter with a flow sensor and a solenoid valve.',
                'See your water consumption by hour, day and month, and its estimated cost according to the rate you enter.',
                'Open and close the valve remotely, with confirmation.',
                'Receive alerts in the app, by e-mail, SMS or WhatsApp.',
                'Set goals, read saving tips and share a place with collaborators or with a guest link.',
              ],
            },
          ],
        },
        {
          title: '3. What the Service is NOT',
          blocks: [
            {
              items: [
                '**It is not an official meter.** Readings are for reference: they help you know and reduce your consumption, but they do not replace the meter or the bill of your water utility, and they cannot be used to file claims with it.',
                '**It is not an emergency service or a security system.** Alerts depend on your internet, power, the device and third-party services, and may arrive late or not at all. In an emergency, close the main shut-off valve and call a plumber or the authorities.',
                '**It does not detect every leak and it is not insurance** against water damage.',
              ],
            },
          ],
        },
        {
          title: '4. Your account',
          blocks: [
            {
              items: [
                'You must be **over 18 years old**.',
                'Register true data and keep it up to date.',
                'Look after your password: you are responsible for what is done with your account. If you think someone got in without permission, change it and write to us.',
                'To receive SMS or WhatsApp you must verify a number that is yours or that you are allowed to use. A number can only belong to one account.',
                'You can delete your account at any time from My profile → Delete account, or as explained in "Delete your account".',
              ],
            },
          ],
        },
        {
          title: '5. The device and its installation',
          blocks: [
            'By linking a device you state that:',
            {
              items: [
                'you are the **owner** of the property or have the **owner\'s authorization** (for example, if you rent);',
                'you will install it **after the water utility\'s meter**, without touching that meter or the service connection. Tampering with them can lead to fines and to the utility suspending the service;',
                'in a building or residential complex, you will install it only on your unit\'s pipe, never on shared pipes;',
                'you will tell the people who live or work in the place that there is a connected meter.',
              ],
            },
            'Follow the installation guide, use only the original adapter and only cold drinking water. Do not open or modify the device. We recommend having a plumber install it and using a surge protector.',
          ],
        },
        {
          title: '6. The remote valve',
          blocks: [
            'Closing the valve cuts off the water of the place: before doing it, make sure nobody is using it. Orders given by you, or by a collaborator you gave that permission to, are considered yours. Without internet or power the order may not reach the device: do not use it as the only measure in an emergency.',
          ],
        },
        {
          title: '7. Sharing your place',
          blocks: [
            {
              items: [
                '**Collaborators** see and do only what you allow them. You can change their permissions or remove them at any time.',
                '**Anyone who has your guest link** can see the consumption of the place while it is active. Share it carefully and turn it off when you no longer need it.',
                'Sharing is your decision. Tell the people who live in the place first.',
              ],
            },
          ],
        },
        {
          title: '8. Acceptable use',
          blocks: [
            'It is not allowed to:',
            {
              items: [
                'use the Service for illegal purposes or to watch or harass other people;',
                'try to get into other people\'s accounts, devices or data, or attack the Service;',
                'use invitations or messages to send advertising or unwanted content;',
                'impersonate another person.',
              ],
            },
            'If you break these rules we may suspend or close your account, and we will tell you why unless the law or security prevents it.',
          ],
        },
        {
          title: '9. Liability',
          blocks: [
            'We are liable under the law for the quality of the Service and the device (legal warranty), for damage caused by a defect of the device and for the security of your data. **We do not exclude these responsibilities.**',
            'We are not liable for damage whose cause is, and is proven to be:',
            {
              items: [
                '**force majeure or acts of God:** natural disasters, lightning, water supply cuts or orders from authorities;',
                '**failures of the power grid:** overloads, voltage variations or surges that come from the grid and not from a defect of the device or its adapter;',
                '**acts of third parties:** outages of your internet, your WiFi or the providers notifications depend on, or damage caused by other people;',
                '**an installation that did not follow the guide:** before the utility\'s meter, on shared pipes or on pipes in poor condition;',
                '**misuse of the device:** opening it, modifying it, using another adapter, non-drinking water or conditions outside its specification;',
                '**decisions of the user or their collaborators:** opening or closing the valve, or sharing the password or the guest link;',
                '**differences between our readings and the water bill**, because our readings are for reference.',
              ],
            },
            'The Service may have interruptions due to maintenance or failures; when they are scheduled, we will give notice in advance. Nothing in these Terms makes you waive your rights or shifts the burden of proof onto you.',
          ],
        },
        {
          title: '10. Price',
          blocks: [
            'Using the app is free today. If in the future we sell the device or a plan, we will state the price before the purchase, and for distance purchases you will have the right of withdrawal the law gives you. Your operator\'s charges for data or messages are your own.',
          ],
        },
        {
          title: '11. Intellectual property',
          blocks: [
            'The app, the firmware, the brand and the content are ours or licensed to us. We give you a personal, non-transferable permission to use them while you have your account. **Your consumption data is yours.**',
          ],
        },
        {
          title: '12. Changes and contact',
          blocks: [
            'If we change these Terms in an important way, we will let you know beforehand in the app or by e-mail and ask you to accept them again when the law requires it.',
            'For requests, complaints or claims write to {{email}}: we answer within 15 business days at most. If you are not satisfied, you can go to the Superintendence of Industry and Commerce (Colombia) or the Ombudsman\'s Office (Ecuador).',
            'The laws of the country where you use the Service apply, and disputes are settled before the authorities of your domicile.',
          ],
        },
      ],
    },

    privacy: {
      title: 'Personal Data Processing Policy',
      summary: 'What data we collect, what we use it for, who we share it with, how long we keep it and how you exercise your rights.',
      sections: [
        {
          title: '1. Data controller',
          blocks: [
            '{{responsible}}, members of the Cuida Tu Agua project, domiciled in {{city}}. E-mail for personal data matters: {{email}}.',
            'This Policy complies with Law 1581 of 2012 and Decree 1377 of 2013 (Colombia), and with the Organic Law on Personal Data Protection and its Regulation (Ecuador).',
          ],
        },
        {
          title: '2. What data we collect',
          blocks: [
            {
              items: [
                '**Identification and contact:** first name, last name, e-mail, profile photo and mobile number (optional). If you sign in with Google, we receive your name, e-mail and photo from Google.',
                '**Access:** your password, stored encrypted so that nobody can read it, your sessions and the date you accepted this Policy.',
                '**Places:** name, address, city, type of property and the rate you enter.',
                '**Consumption:** meter readings by hour, day and month, state and history of the valve, device connection and your goals.',
                '**Sharing:** e-mails of the people you invite, their permissions and your guest links.',
                '**Notifications:** your preferences, the phone identifier for push notifications and the history of alerts.',
                '**Security:** IP address, type of device and logs of access and important actions.',
              ],
            },
            '**Your water consumption is personal data:** it can reveal schedules, whether the house is empty or how many people live in it. We protect it like your contact data.',
            '**We do not collect** your GPS location, your contacts, the microphone or the camera (only the gallery, if you choose a profile photo), sensitive data or data of minors.',
            'Your WiFi password is typed into the device\'s setup portal and **is stored only on the device**. We do not use advertising, tracking cookies or third-party analytics: we only keep your session and your preferences on your device.',
          ],
        },
        {
          title: '3. What we use it for',
          blocks: [
            {
              numbered: true,
              items: [
                'Creating and managing your account: sign-up, sign-in, password recovery and verifications.',
                'Providing the Service: consumption, estimated cost, valve, goals and tips.',
                'Sending you the alerts and notifications of the Service through the channels you choose.',
                'Sharing your place with whoever you invite, with the permissions you choose.',
                'Protecting the Service: preventing fraud, improper access and incidents.',
                'Handling your inquiries, claims and requests.',
                'Improving the Service with anonymous statistics.',
                'Complying with the law and with requests from competent authorities.',
              ],
            },
            '**We do not sell your data or use it for advertising.** For any other purpose we would ask you for a new authorization.',
          ],
        },
        {
          title: '4. Legal basis',
          blocks: [
            {
              items: [
                '**In Colombia,** your prior, express and informed authorization, which you give by ticking the box when you sign up.',
                '**In Ecuador,** your consent, the performance of the service contract, our legitimate interest in security and compliance with the law.',
              ],
            },
            'You can revoke your authorization at any time. Since some data is essential for the Service, revoking it means closing the account.',
          ],
        },
        {
          title: '5. Who we share it with',
          blocks: [
            {
              items: [
                '**People you authorize:** your collaborators, who see only what you allow them, and whoever has your guest link, who sees the consumption of the place.',
                '**Authorities,** when the law requires it.',
              ],
            },
            '**Providers that help us provide the Service**, which use the data only for that:',
            {
              items: [
                'Google, for sign-in;',
                'Expo and the Google and Apple notification services, for push notifications;',
                'Twilio and Meta (WhatsApp), for SMS and WhatsApp;',
                'our e-mail and server providers.',
              ],
            },
            'Some providers are in the United States, a country the Colombian Superintendence of Industry and Commerce considers to have an adequate level of protection. We require them to apply security measures equivalent to those of this Policy.',
          ],
        },
        {
          title: '6. How long we keep it',
          blocks: [
            {
              items: [
                '**While your account is active:** your account, your places, your consumption and your notifications.',
                '**When you delete the account:** your identification data is deleted or anonymized immediately, and your consumption data within 30 days at most.',
                '**Security logs:** 12 months.',
                '**Proof of your authorization and of your requests:** up to 5 years after the account is closed, to handle claims.',
                '**Anonymous statistics:** with no limit, because they do not identify you.',
              ],
            },
          ],
        },
        {
          title: '7. Your rights',
          blocks: [
            {
              items: [
                'Know, update and correct your data.',
                'Ask for proof of the authorization you gave us.',
                'Know how we use your data.',
                'Revoke the authorization or ask us to delete your data, unless the law requires us to keep it.',
                'In Ecuador, also: object, ask for the portability of your data and the suspension of the processing. We do not make automated decisions about you.',
                'Access your data free of charge.',
                'File complaints with the Superintendence of Industry and Commerce (Colombia) or the Superintendence of Personal Data Protection (Ecuador).',
              ],
            },
            'You can exercise many of these rights yourself in My profile: edit your data, change the password, choose your notifications and delete the account.',
          ],
        },
        {
          title: '8. How to make an inquiry or a claim',
          blocks: [
            'Write to {{email}} with your name, your account e-mail and what you are asking for. Before handing over or changing data we check that you are the data subject.',
            {
              items: [
                '**Inquiries:** we answer within 10 business days, extendable by 5.',
                '**Claims:** we answer within 15 business days, extendable by 8.',
                '**In Ecuador:** we answer within 15 days.',
              ],
            },
            'If the claim is incomplete, we will ask you to complete it within 5 days. While we resolve it, we mark it as "claim in progress".',
          ],
        },
        {
          title: '9. Security',
          blocks: [
            'We use encrypted connections, encrypted passwords, sessions that expire, confirmation to close the valve, permissions per collaborator and activity logs.',
            'No system is 100% secure. If an incident puts your data at risk, we will report it to the authority within the legal deadlines (15 business days in Colombia and 5 days in Ecuador) and let you know without delay, with what you can do to protect yourself.',
          ],
        },
        {
          title: '10. Data of other people',
          blocks: [
            {
              items: [
                'Consumption reflects the habits of everyone who lives in the place: you commit to telling them that there is a connected meter and who sees the information.',
                'When you invite someone you give us their e-mail: we only use it to send them the invitation.',
              ],
            },
          ],
        },
        {
          title: '11. Minors',
          blocks: ['The Service is only for people over 18. If we detect an account of a minor, we will delete it.'],
        },
        {
          title: '12. Changes and validity',
          blocks: [
            'We will let you know about important changes before applying them and ask you for a new authorization when the law requires it.',
            'This Policy is in force from {{date}}. The databases will remain in force while the Service is provided and for the periods in section 6.',
          ],
        },
      ],
    },

    notice: {
      title: 'Privacy Notice',
      summary: 'The short version of how we use your data.',
      sections: [
        {
          title: 'Data controller',
          blocks: ['{{responsible}}, members of the Cuida Tu Agua project, domiciled in {{city}}, are responsible for processing your personal data.'],
        },
        {
          title: 'What data and what for',
          blocks: [
            'We use:',
            {
              items: [
                'your name and e-mail;',
                'your mobile number, if you register it;',
                'the address of your places;',
                'the water consumption your device measures and the state of the valve;',
                'technical security data.',
              ],
            },
            'We use them to:',
            {
              items: [
                'provide the service: show your consumption, operate the valve and send you alerts;',
                'share your place with whoever you decide;',
                'protect your account;',
                'handle your requests.',
              ],
            },
            'We do not sell your data or use it for advertising. Some providers that help us (Google, Twilio and Meta, Expo and our servers) process it in the United States, with adequate protection measures.',
          ],
        },
        {
          title: 'Your rights',
          blocks: [
            'You can:',
            {
              items: [
                'know, update, correct and delete your data;',
                'ask for proof of your authorization and revoke it;',
                'file complaints with the Superintendence of Industry and Commerce (Colombia) or the Superintendence of Personal Data Protection (Ecuador).',
              ],
            },
            'To exercise them, write to {{email}}. The full Data Processing Policy is in this same section of the app.',
          ],
        },
      ],
    },

    deletion: {
      title: 'Delete your account',
      summary: 'How to delete your account and your data, with or without the app, and what we keep.',
      sections: [
        {
          title: 'From the app',
          blocks: [
            {
              numbered: true,
              items: ['Sign in.', 'Go to My profile → Delete account.', 'Confirm with your password or with your Google account.'],
            },
            'The deletion is immediate.',
          ],
        },
        {
          title: 'Without the app',
          blocks: [
            'Sign in to the web version and follow the same steps.',
            'If you cannot sign in, write to {{email}} from your account e-mail, with the subject "Delete my account". We check that you are the account holder and delete it within 15 business days at most.',
          ],
        },
        {
          title: 'What is deleted',
          blocks: [
            {
              items: [
                '**Name, e-mail, mobile number and photo:** deleted or anonymized immediately.',
                '**Sessions:** closed on all your devices.',
                '**Meters:** unlinked; they can be linked to another account.',
                '**Places, consumption, goals and notifications:** deleted or anonymized within 30 days at most.',
                '**Shared access:** the access you gave to collaborators and guests is cancelled, and you lose access to the places others shared with you.',
              ],
            },
          ],
        },
        {
          title: 'What we keep',
          blocks: [
            {
              items: [
                '**Security logs:** 12 months.',
                '**Proof of your authorization and of your request:** up to 5 years.',
                '**Anonymous statistics:** they do not identify you.',
              ],
            },
            'The deletion cannot be undone.',
          ],
        },
      ],
    },

    device: {
      title: 'Device warranty and safe use',
      summary: 'What the meter warranty covers, when it does not apply and how to install it safely.',
      sections: [
        {
          title: 'Warranty',
          blocks: [
            'The Cuida Tu Agua meter (electronic module, flow sensor, solenoid valve and adapter) has a 12-month warranty from delivery against manufacturing, operating or quality defects.',
            {
              items: [
                'First we repair it free of charge.',
                'If the failure happens again or cannot be repaired, we replace it or refund your money, as you choose.',
                'While it is being repaired, the warranty period is suspended.',
              ],
            },
            'To use it, write to {{email}} with the device code (SW-…, on the label and in the app) and the failure.',
          ],
        },
        {
          title: 'When it does not apply',
          blocks: [
            'The warranty does not apply when the failure is due, and is proven to be due, to:',
            {
              items: [
                'force majeure or acts of God: lightning, floods or fires;',
                'overloads or voltage variations coming from the power grid;',
                'damage caused by other people;',
                'misuse: opening or modifying the device, changing its firmware, using another adapter, non-drinking water, hot water or conditions outside its specification;',
                'an installation that did not follow this guide.',
              ],
            },
            'The warranty **always** applies if the failure comes from a defect of the device itself.',
          ],
        },
        {
          title: 'Safe installation',
          blocks: [
            {
              items: [
                'Install it **always after the water utility\'s meter**, on the internal pipe. Never open, move or connect anything to the utility\'s meter or to the service connection.',
                'In buildings or residential complexes, only on your unit\'s pipe.',
                'Get the owner\'s authorization if you are not the owner.',
                'We recommend having a plumber install it.',
                'Follow the flow direction arrow.',
                'Leave a manual shut-off valve before the device and, if you can, a sediment filter.',
                'Use only cold drinking water and the original adapter, in a socket protected from moisture.',
                'We recommend a surge protector or voltage regulator.',
                'If your pipes are old, ask the plumber whether a water hammer arrester is advisable.',
              ],
            },
          ],
        },
        {
          title: 'Remember',
          blocks: [
            {
              items: [
                'Readings are for reference and alerts are not an emergency service: in an emergency, close the manual shut-off valve.',
                'Tell the people who live in the place that there is a connected meter.',
                'At the end of its life, take the device to an electronic waste collection point or return it to us.',
              ],
            },
          ],
        },
      ],
    },
  },
};
