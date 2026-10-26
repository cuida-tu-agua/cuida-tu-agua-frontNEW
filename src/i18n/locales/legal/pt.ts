import { LegalTexts } from '../../../domain/legal/LegalDocument';

/** Tradução de legal/es.ts (prevalece o texto em espanhol). */
export const legalPt: LegalTexts = {
  and: 'e',
  country: 'Colômbia',
  documents: {
    terms: {
      title: 'Termos e Condições',
      summary: 'As regras para usar o app e o medidor: o que o serviço faz, o que não faz e pelo que cada um responde.',
      sections: [
        {
          title: '1. Quem somos',
          blocks: [
            'Cuida Tu Agua é um projeto de {{responsible}}, com domicílio em {{city}} e e-mail {{email}} ("nós"). Estes Termos regulam o uso do app móvel, do app web e do medidor Cuida Tu Agua (o "Serviço").',
            'Ao criar sua conta e marcar a caixa de aceitação, você declara que os leu e os aceita. Se não concordar, não use o Serviço.',
            'O tratamento dos seus dados é regido pela Política de Tratamento de Dados, e o dispositivo, pela Garantia e uso seguro. Ambos fazem parte destes Termos.',
            'Nada do que está escrito aqui limita os direitos que as leis de defesa do consumidor lhe dão: na Colômbia, a Lei 1480 de 2011; no Equador, a Lei Orgânica de Defesa do Consumidor. Se uma cláusula as contradisser, aplica-se a lei.',
          ],
        },
        {
          title: '2. O que o Serviço faz',
          blocks: [
            {
              items: [
                'Cadastrar seus locais e vincular a cada um um medidor com sensor de vazão e válvula solenoide.',
                'Ver seu consumo de água por hora, dia e mês, e o custo estimado segundo a tarifa que você cadastrar.',
                'Abrir e fechar a válvula a distância, com confirmação.',
                'Receber alertas no app, por e-mail, SMS ou WhatsApp.',
                'Definir metas, ver dicas de economia e compartilhar um local com colaboradores ou com um link de convidado.',
              ],
            },
          ],
        },
        {
          title: '3. O que o Serviço NÃO é',
          blocks: [
            {
              items: [
                '**Não é um medidor oficial.** As leituras são de referência: servem para conhecer e reduzir seu consumo, mas não substituem o medidor nem a conta da sua empresa de água, nem servem para reclamar com ela.',
                '**Não é um serviço de emergência nem um sistema de segurança.** Os alertas dependem da sua internet, da energia, do dispositivo e de serviços de terceiros, e podem chegar atrasados ou não chegar. Em uma emergência, feche o registro geral e chame um encanador ou as autoridades.',
                '**Não detecta todos os vazamentos e não é um seguro** contra danos causados por água.',
              ],
            },
          ],
        },
        {
          title: '4. Sua conta',
          blocks: [
            {
              items: [
                'Você deve ser **maior de 18 anos**.',
                'Cadastre dados verdadeiros e mantenha-os atualizados.',
                'Cuide da sua senha: você é responsável pelo que for feito com sua conta. Se achar que alguém entrou sem permissão, troque-a e escreva para nós.',
                'Para receber SMS ou WhatsApp você deve verificar um número que seja seu ou que tenha permissão para usar. Um número só pode estar em uma conta.',
                'Você pode excluir sua conta quando quiser em Meu perfil → Excluir conta, ou como explicado em "Excluir sua conta".',
              ],
            },
          ],
        },
        {
          title: '5. O dispositivo e sua instalação',
          blocks: [
            'Ao vincular um dispositivo você declara que:',
            {
              items: [
                'é o **proprietário** do imóvel ou tem **autorização do proprietário** (por exemplo, se mora de aluguel);',
                'vai instalá-lo **depois do medidor da empresa de água**, sem mexer nesse medidor nem no ramal. Manipulá-los pode gerar multas e a suspensão do serviço pela empresa;',
                'em um prédio ou condomínio, vai instalá-lo somente na tubulação da sua unidade, nunca em tubulações comuns;',
                'vai informar às pessoas que moram ou trabalham no local que há um medidor conectado.',
              ],
            },
            'Siga o guia de instalação, use somente o adaptador original e somente água fria potável. Não abra nem modifique o dispositivo. Recomendamos que um encanador o instale e o uso de um protetor contra surtos.',
          ],
        },
        {
          title: '6. A válvula a distância',
          blocks: [
            'Fechar a válvula corta a água do local: antes de fazê-lo, verifique se ninguém a está usando. As ordens dadas por você, ou por um colaborador a quem você deu essa permissão, são consideradas suas. Sem internet ou energia a ordem pode não chegar ao dispositivo: não a use como única medida em uma emergência.',
          ],
        },
        {
          title: '7. Compartilhar seu local',
          blocks: [
            {
              items: [
                'Os **colaboradores** veem e fazem somente o que você permitir. Você pode mudar as permissões deles ou removê-los quando quiser.',
                '**Qualquer pessoa que tenha seu link de convidado** pode ver o consumo do local enquanto ele estiver ativo. Compartilhe-o com cuidado e desative-o quando não precisar mais.',
                'Compartilhar é decisão sua. Informe antes as pessoas que moram no local.',
              ],
            },
          ],
        },
        {
          title: '8. Uso aceitável',
          blocks: [
            'Não é permitido:',
            {
              items: [
                'usar o Serviço para fins ilegais ou para vigiar ou assediar outras pessoas;',
                'tentar entrar em contas, dispositivos ou dados alheios, ou atacar o Serviço;',
                'usar os convites ou as mensagens para enviar publicidade ou conteúdo indesejado;',
                'se passar por outra pessoa.',
              ],
            },
            'Se você descumprir estas regras, podemos suspender ou encerrar sua conta e lhe diremos o motivo, salvo se a lei ou a segurança o impedirem.',
          ],
        },
        {
          title: '9. Responsabilidade',
          blocks: [
            'Respondemos, conforme a lei, pela qualidade do Serviço e do dispositivo (garantia legal), pelos danos causados por um defeito do dispositivo e pela segurança dos seus dados. **Não excluímos essas responsabilidades.**',
            'Não respondemos por danos cuja causa seja, e assim se comprove:',
            {
              items: [
                '**força maior ou caso fortuito:** desastres naturais, raios, cortes de água ou ordens de autoridades;',
                '**falhas da rede elétrica:** sobrecargas, variações de tensão ou surtos que venham da rede e não de um defeito do dispositivo ou do seu adaptador;',
                '**fatos de terceiros:** quedas da sua internet, do seu WiFi ou dos provedores dos quais dependem as notificações, ou danos causados por outras pessoas;',
                '**uma instalação que não seguiu o guia:** antes do medidor da empresa, em tubulações comuns ou em mau estado;',
                '**o uso indevido do dispositivo:** abri-lo, modificá-lo, usar outro adaptador, água não potável ou condições fora da especificação;',
                '**decisões do usuário ou dos seus colaboradores:** abrir ou fechar a válvula, ou compartilhar a senha ou o link de convidado;',
                '**diferenças entre nossas leituras e a conta de água**, porque nossas leituras são de referência.',
              ],
            },
            'O Serviço pode ter interrupções por manutenção ou falhas; quando forem programadas, avisaremos com antecedência. Nada nestes Termos obriga você a renunciar aos seus direitos nem inverte o ônus da prova contra você.',
          ],
        },
        {
          title: '10. Preço',
          blocks: [
            'Hoje o uso do app é gratuito. Se no futuro vendermos o dispositivo ou um plano, informaremos o preço antes da compra, e nas compras a distância você terá o direito de arrependimento que a lei lhe dá. As cobranças da sua operadora por dados ou mensagens ficam por sua conta.',
          ],
        },
        {
          title: '11. Propriedade intelectual',
          blocks: [
            'O app, o firmware, a marca e os conteúdos são nossos ou temos licença para usá-los. Damos a você uma permissão pessoal e intransferível para usá-los enquanto tiver sua conta. **Seus dados de consumo são seus.**',
          ],
        },
        {
          title: '12. Alterações e contato',
          blocks: [
            'Se alterarmos estes Termos de forma importante, avisaremos antes pelo app ou por e-mail e pediremos que você os aceite novamente quando a lei exigir.',
            'Para pedidos, queixas ou reclamações escreva para {{email}}: respondemos em no máximo 15 dias úteis. Se não ficar satisfeito, você pode recorrer à Superintendência de Indústria e Comércio (Colômbia) ou à Defensoria do Povo (Equador).',
            'Aplicam-se as leis do país onde você usa o Serviço, e os conflitos são resolvidos perante as autoridades do seu domicílio.',
          ],
        },
      ],
    },

    privacy: {
      title: 'Política de Tratamento de Dados Pessoais',
      summary: 'Quais dados coletamos, para que os usamos, com quem os compartilhamos, por quanto tempo os guardamos e como você exerce seus direitos.',
      sections: [
        {
          title: '1. Responsável',
          blocks: [
            '{{responsible}}, integrantes do projeto Cuida Tu Agua, com domicílio em {{city}}. E-mail para assuntos de dados pessoais: {{email}}.',
            'Esta Política cumpre a Lei 1581 de 2012 e o Decreto 1377 de 2013 (Colômbia), e a Lei Orgânica de Proteção de Dados Pessoais e seu Regulamento (Equador).',
          ],
        },
        {
          title: '2. Quais dados coletamos',
          blocks: [
            {
              items: [
                '**Identificação e contato:** nome, sobrenome, e-mail, foto de perfil e celular (opcionais). Se você entrar com o Google, recebemos do Google seu nome, e-mail e foto.',
                '**Acesso:** sua senha, guardada criptografada de forma que ninguém possa lê-la, suas sessões e a data em que você aceitou esta Política.',
                '**Locais:** nome, endereço, cidade, tipo de imóvel e a tarifa que você cadastrar.',
                '**Consumo:** leituras do medidor por hora, dia e mês, estado e histórico da válvula, conexão do dispositivo e suas metas.',
                '**Compartilhamento:** e-mails das pessoas que você convida, suas permissões e seus links de convidado.',
                '**Notificações:** suas preferências, o identificador do celular para notificações push e o histórico de alertas.',
                '**Segurança:** endereço IP, tipo de dispositivo e registros de acesso e de ações importantes.',
              ],
            },
            '**Seu consumo de água é um dado pessoal:** pode revelar horários, se a casa está vazia ou quantas pessoas moram nela. Nós o protegemos como seus dados de contato.',
            '**Não coletamos** sua localização GPS, seus contatos, o microfone nem a câmera (só a galeria, se você escolher uma foto de perfil), dados sensíveis nem dados de menores de idade.',
            'A senha do seu WiFi é digitada no portal de configuração do dispositivo e **fica guardada somente nele**. Não usamos publicidade, cookies de rastreamento nem análises de terceiros: só guardamos no seu aparelho sua sessão e suas preferências.',
          ],
        },
        {
          title: '3. Para que os usamos',
          blocks: [
            {
              numbered: true,
              items: [
                'Criar e administrar sua conta: cadastro, login, recuperação de senha e verificações.',
                'Prestar o Serviço: consumo, custo estimado, válvula, metas e dicas.',
                'Enviar os alertas e notificações do Serviço pelos meios que você escolher.',
                'Compartilhar seu local com quem você convidar, com as permissões que escolher.',
                'Proteger o Serviço: prevenir fraudes, acessos indevidos e incidentes.',
                'Atender suas consultas, reclamações e solicitações.',
                'Melhorar o Serviço com estatísticas anônimas.',
                'Cumprir a lei e as solicitações de autoridades competentes.',
              ],
            },
            '**Não vendemos seus dados nem os usamos para publicidade.** Para outra finalidade pediríamos uma nova autorização.',
          ],
        },
        {
          title: '4. Base para tratá-los',
          blocks: [
            {
              items: [
                '**Na Colômbia,** sua autorização prévia, expressa e informada, que você dá ao marcar a caixa do cadastro.',
                '**No Equador,** seu consentimento, a execução do contrato de serviço, nosso interesse legítimo na segurança e o cumprimento da lei.',
              ],
            },
            'Você pode revogar sua autorização quando quiser. Como alguns dados são indispensáveis para o Serviço, revogá-la implica encerrar a conta.',
          ],
        },
        {
          title: '5. Com quem os compartilhamos',
          blocks: [
            {
              items: [
                '**Pessoas que você autoriza:** seus colaboradores, que veem só o que você permitir, e quem tiver seu link de convidado, que vê o consumo do local.',
                '**Autoridades,** quando a lei exigir.',
              ],
            },
            '**Provedores que nos ajudam a prestar o Serviço**, que só usam os dados para isso:',
            {
              items: [
                'Google, para o login;',
                'Expo e os serviços de notificações do Google e da Apple, para as notificações push;',
                'Twilio e Meta (WhatsApp), para SMS e WhatsApp;',
                'nossos provedores de e-mail e de servidores.',
              ],
            },
            'Alguns provedores estão nos Estados Unidos, país que a Superintendência de Indústria e Comércio da Colômbia considera com nível adequado de proteção. Exigimos deles medidas de segurança equivalentes às desta Política.',
          ],
        },
        {
          title: '6. Por quanto tempo os guardamos',
          blocks: [
            {
              items: [
                '**Enquanto sua conta estiver ativa:** sua conta, seus locais, seu consumo e suas notificações.',
                '**Ao excluir a conta:** seus dados de identificação são apagados ou anonimizados imediatamente, e os de consumo em no máximo 30 dias.',
                '**Registros de segurança:** 12 meses.',
                '**Prova da sua autorização e das suas solicitações:** até 5 anos depois de encerrar a conta, para atender reclamações.',
                '**Estatísticas anônimas:** sem limite, porque não identificam você.',
              ],
            },
          ],
        },
        {
          title: '7. Seus direitos',
          blocks: [
            {
              items: [
                'Conhecer, atualizar e corrigir seus dados.',
                'Pedir prova da autorização que nos deu.',
                'Saber como usamos seus dados.',
                'Revogar a autorização ou pedir que os apaguemos, salvo se a lei nos obrigar a conservá-los.',
                'No Equador, além disso: opor-se, pedir a portabilidade dos seus dados e a suspensão do tratamento. Não tomamos decisões automatizadas sobre você.',
                'Acessar seus dados gratuitamente.',
                'Apresentar queixas à Superintendência de Indústria e Comércio (Colômbia) ou à Superintendência de Proteção de Dados Pessoais (Equador).',
              ],
            },
            'Muitos desses direitos você mesmo exerce em Meu perfil: editar seus dados, trocar a senha, escolher suas notificações e excluir a conta.',
          ],
        },
        {
          title: '8. Como fazer uma consulta ou uma reclamação',
          blocks: [
            'Escreva para {{email}} com seu nome, o e-mail da sua conta e o que está pedindo. Antes de entregar ou alterar dados verificamos que você é o titular.',
            {
              items: [
                '**Consultas:** respondemos em 10 dias úteis, prorrogáveis por 5.',
                '**Reclamações:** respondemos em 15 dias úteis, prorrogáveis por 8.',
                '**No Equador:** respondemos em 15 dias.',
              ],
            },
            'Se a reclamação estiver incompleta, pediremos que você a complete em 5 dias. Enquanto a resolvemos, ela fica marcada como "reclamação em andamento".',
          ],
        },
        {
          title: '9. Segurança',
          blocks: [
            'Usamos conexão criptografada, senhas criptografadas, sessões que expiram, confirmação para fechar a válvula, permissões por colaborador e registros de atividade.',
            'Nenhum sistema é 100% seguro. Se um incidente puser seus dados em risco, vamos informá-lo à autoridade nos prazos legais (15 dias úteis na Colômbia e 5 dias no Equador) e avisaremos você sem demora, com o que pode fazer para se proteger.',
          ],
        },
        {
          title: '10. Dados de outras pessoas',
          blocks: [
            {
              items: [
                'O consumo reflete os hábitos de todos que moram no local: você se compromete a informar a eles que há um medidor conectado e quem vê as informações.',
                'Ao convidar alguém você nos dá o e-mail dessa pessoa: só o usamos para enviar o convite.',
              ],
            },
          ],
        },
        {
          title: '11. Menores de idade',
          blocks: ['O Serviço é somente para maiores de 18 anos. Se detectarmos a conta de um menor, vamos excluí-la.'],
        },
        {
          title: '12. Alterações e vigência',
          blocks: [
            'Avisaremos sobre as alterações importantes antes de aplicá-las e pediremos uma nova autorização quando a lei exigir.',
            'Esta Política vigora desde {{date}}. As bases de dados ficarão vigentes enquanto o Serviço for prestado e durante os prazos da seção 6.',
          ],
        },
      ],
    },

    notice: {
      title: 'Aviso de Privacidade',
      summary: 'A versão curta de como usamos seus dados.',
      sections: [
        {
          title: 'Responsável',
          blocks: ['{{responsible}}, integrantes do projeto Cuida Tu Agua, com domicílio em {{city}}, são responsáveis pelo tratamento dos seus dados pessoais.'],
        },
        {
          title: 'Quais dados e para quê',
          blocks: [
            'Usamos:',
            {
              items: [
                'seu nome e e-mail;',
                'seu celular, se você o cadastrar;',
                'o endereço dos seus locais;',
                'o consumo de água que seu dispositivo mede e o estado da válvula;',
                'dados técnicos de segurança.',
              ],
            },
            'Nós os usamos para:',
            {
              items: [
                'prestar o serviço: mostrar seu consumo, operar a válvula e enviar alertas;',
                'compartilhar seu local com quem você decidir;',
                'proteger sua conta;',
                'atender suas solicitações.',
              ],
            },
            'Não vendemos seus dados nem os usamos para publicidade. Alguns provedores que nos ajudam (Google, Twilio e Meta, Expo e nossos servidores) os processam nos Estados Unidos, com medidas de proteção adequadas.',
          ],
        },
        {
          title: 'Seus direitos',
          blocks: [
            'Você pode:',
            {
              items: [
                'conhecer, atualizar, corrigir e apagar seus dados;',
                'pedir prova da sua autorização e revogá-la;',
                'apresentar queixas à Superintendência de Indústria e Comércio (Colômbia) ou à Superintendência de Proteção de Dados Pessoais (Equador).',
              ],
            },
            'Para exercê-los, escreva para {{email}}. A Política de Tratamento de Dados completa está nesta mesma seção do app.',
          ],
        },
      ],
    },

    deletion: {
      title: 'Excluir sua conta',
      summary: 'Como apagar sua conta e seus dados, com ou sem o app, e o que guardamos.',
      sections: [
        {
          title: 'Pelo app',
          blocks: [
            {
              numbered: true,
              items: ['Faça login.', 'Vá em Meu perfil → Excluir conta.', 'Confirme com sua senha ou com sua conta do Google.'],
            },
            'A exclusão é imediata.',
          ],
        },
        {
          title: 'Sem o app',
          blocks: [
            'Faça login na versão web e siga os mesmos passos.',
            'Se não conseguir entrar, escreva para {{email}} a partir do e-mail da sua conta, com o assunto "Excluir minha conta". Verificamos que você é o titular e a excluímos em no máximo 15 dias úteis.',
          ],
        },
        {
          title: 'O que é apagado',
          blocks: [
            {
              items: [
                '**Nome, e-mail, celular e foto:** apagados ou anonimizados imediatamente.',
                '**Sessões:** encerradas em todos os seus aparelhos.',
                '**Medidores:** desvinculados; podem ser vinculados a outra conta.',
                '**Locais, consumo, metas e notificações:** apagados ou anonimizados em no máximo 30 dias.',
                '**Acessos compartilhados:** os acessos que você deu a colaboradores e convidados são cancelados, e você perde o acesso aos locais que outros compartilharam com você.',
              ],
            },
          ],
        },
        {
          title: 'O que guardamos',
          blocks: [
            {
              items: [
                '**Registros de segurança:** 12 meses.',
                '**Prova da sua autorização e da sua solicitação:** até 5 anos.',
                '**Estatísticas anônimas:** não identificam você.',
              ],
            },
            'A exclusão não pode ser desfeita.',
          ],
        },
      ],
    },

    device: {
      title: 'Garantia e uso seguro do dispositivo',
      summary: 'O que a garantia do medidor cobre, quando não se aplica e como instalá-lo com segurança.',
      sections: [
        {
          title: 'Garantia',
          blocks: [
            'O medidor Cuida Tu Agua (módulo eletrônico, sensor de vazão, válvula solenoide e adaptador) tem garantia de 12 meses a partir da entrega contra defeitos de fabricação, de funcionamento ou de qualidade.',
            {
              items: [
                'Primeiro nós o consertamos gratuitamente.',
                'Se a falha se repetir ou não puder ser consertada, nós o trocamos ou devolvemos seu dinheiro, como você preferir.',
                'Enquanto estiver em conserto, o prazo da garantia fica suspenso.',
              ],
            },
            'Para usá-la, escreva para {{email}} com o código do dispositivo (SW-…, na etiqueta e no app) e a falha.',
          ],
        },
        {
          title: 'Quando não se aplica',
          blocks: [
            'A garantia não se aplica quando a falha se deve, e assim se comprovar, a:',
            {
              items: [
                'força maior ou caso fortuito: raios, inundações ou incêndios;',
                'sobrecargas ou variações de tensão que venham da rede elétrica;',
                'danos causados por outras pessoas;',
                'uso indevido: abrir ou modificar o dispositivo, trocar seu firmware, usar outro adaptador, água não potável, água quente ou condições fora da especificação;',
                'uma instalação que não seguiu este guia.',
              ],
            },
            'A garantia **sempre** se aplica se a falha vier de um defeito do próprio dispositivo.',
          ],
        },
        {
          title: 'Instalação segura',
          blocks: [
            {
              items: [
                'Instale-o **sempre depois do medidor da empresa de água**, na tubulação interna. Nunca abra, mova nem conecte nada ao medidor da empresa nem ao ramal.',
                'Em prédios ou condomínios, somente na tubulação da sua unidade.',
                'Tenha a autorização do proprietário se você não for o dono.',
                'Recomendamos que um encanador o instale.',
                'Respeite a seta do sentido do fluxo.',
                'Deixe um registro manual antes do dispositivo e, se puder, um filtro de sedimentos.',
                'Use somente água fria potável e o adaptador original, em uma tomada protegida da umidade.',
                'Recomendamos um protetor contra surtos ou um estabilizador de tensão.',
                'Se seus canos forem antigos, peça ao encanador que avalie se convém um amortecedor de golpe de aríete.',
              ],
            },
          ],
        },
        {
          title: 'Lembre-se',
          blocks: [
            {
              items: [
                'As leituras são de referência e os alertas não são um serviço de emergência: em uma emergência, feche o registro manual.',
                'Informe a quem mora no local que há um medidor conectado.',
                'No fim da vida útil, leve o dispositivo a um ponto de coleta de lixo eletrônico ou devolva-o para nós.',
              ],
            },
          ],
        },
      ],
    },
  },
};
