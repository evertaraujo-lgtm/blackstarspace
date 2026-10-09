# BLACK STAR — Engenheiro Legaspe
## O professor e o controle do pouso propulsivo

**Status:** perfil de personagem e marco histórico do cânone, com propostas dramáticas identificadas.  
**Marco temporal:** por volta de 2014.  
**Referência principal:** [Bíblia de cânone — Origem e programa Buran](../Black_Star_Canon_Cronologia_Origem_Buran.md).

---

## 1. Fatos estabelecidos — CÂNONE

- **Legaspe** é engenheiro de computação, **doutor em Controle**, com especialização em **sistemas de controle**.
- Trabalhou durante anos como **professor de Engenharia** e foi **orientador de Ever na faculdade**.
- Por volta de **2014**, a Black Star debatia como recuperar o propulsor de maneira controlada; não dominava ainda o pouso propulsivo.
- **Ever**, lembrando das aulas de Legaspe, sugeriu convidá-lo para **debater a recuperação do propulsor**.
- Um dos temas favoritos do professor era o **pêndulo invertido**; esse conceito foi **o ponto de partida intelectual** para abordar a estabilidade do booster.
- Após esse contato inicial, **Legaspe passou a integrar permanentemente a equipe de controles da Black Star**, com responsabilidade pelo **sistema de controle do pouso propulsivo**.
- A entrada dele **não substitui Boca**. Boca continua essencial na concepção dos Operários e na decisão de viabilidade do programa. Ever é a ponte entre a experiência acadêmica de Legaspe e o desafio concreto da equipe.

O sobrenome é registrado como **Legaspe**, sem inventar prenome, universidade, títulos acadêmicos adicionais ou uma função administrativa mais específica.

---

## 2. Como o convite aconteceu — proposta de desenvolvimento narrativo

Em 2014, a Black Star tinha motivos para acreditar que conseguiria colocar o propulsor no ar, mas ainda não possuía solução suficientemente convincente para trazê-lo de volta sem destruí-lo. O risco não era só financeiro: cada teste consumiria recursos que a equipe dificilmente conseguiria repor.

Numa discussão técnica sobre recuperação, Ever recordou as aulas do antigo orientador. Legaspe usava o pêndulo invertido para mostrar como um sistema naturalmente instável podia ser mantido numa condição desejada por meio de observação, realimentação e atuação contínua.

Ever propôs trazer o professor à mesa. A ideia inicial era **uma conversa técnica**, não a contratação de um responsável por pousos espaciais. O convite, porém, terminou abrindo uma frente permanente de desenvolvimento.

**Interpretação dramática sugerida:** Legaspe não chegou dizendo que sabia pousar foguetes. Chegou perguntando quais grandezas poderiam ser medidas, quais poderiam ser controladas, com que velocidade os motores responderiam e qual seria a margem de estabilidade ao longo da queima. Seu papel seria transformar um objetivo intuitivo ("fazer o booster descer em pé") em condições testáveis e verificáveis.

### Cena sugerida (falas não canonizadas)

> **Ever:** Lembrei de uma aula sua. O pêndulo invertido.
>
> **Legaspe:** Um pêndulo invertido com combustível, motores e massa variável. Vocês escolheram um problema generoso.
>
> **Boca:** Dá para controlar?
>
> **Legaspe:** Antes disso, precisamos descobrir em que condições o sistema é controlável.
>
> **Augusto:** E quanto custa descobrir?
>
> **Legaspe:** Menos do que construir outro propulsor depois de perder o primeiro.

Essas falas ilustram as relações, mas **não são diálogos históricos fixados pelo autor**.

---

## 3. O pêndulo invertido como ponto de partida técnico

O paralelo com o pêndulo invertido é útil porque ambos envolvem **equilíbrio instável** e a necessidade de corrigir continuamente desvios. O booster, contudo, **não é literalmente um pêndulo com pivô fixo**: é um corpo rígido em movimento livre, sujeito à gravidade, ao empuxo, aos torques dos motores, ao vento e à redução de massa durante o voo.

Por isso, o pêndulo invertido é a **inspiração pedagógica e matemática inicial**, não uma descrição suficiente do sistema final.

**Linha plausível de trabalho da equipe de Legaspe (DETALHAMENTO TÉCNICO SUGERIDO, não tecnologias de implementação canonizadas):**

1. **Modelagem:** construir um modelo dinâmico com atitude, velocidade angular, posição, velocidade, massa variável, centro de gravidade e limites de empuxo.
2. **Controlabilidade:** verificar se há autoridade de atuação suficiente para corrigir inclinações e desvios laterais durante a queima de pouso.
3. **Simulação:** começar com modelos simplificados e ampliar progressivamente para condições não lineares, incertezas de sensores, rajadas, atrasos e respostas dos motores.
4. **Controle por realimentação:** usar leis de controle coerentes com o modelo e a fase do voo; abordagens em espaço de estados podem ser exploradas, sem fixar uma técnica única como LQR ou MPC antes de definição do autor.
5. **Estimação de estado:** correlacionar sensores de navegação e atitude, tratando erros de medição e latência.
6. **Margens de segurança:** definir envelopes em que é seguro prosseguir, abortar a aproximação ou executar contingências.

A passagem crucial é perceber que **equilibrar a atitude** não basta. Para pousar, é necessário comandar **posição lateral, velocidade lateral, altitude e velocidade vertical**, usando um sistema propulsivo sujeito a limitações físicas e atrasos.

---

## 4. Como Legaspe se conecta aos voos — leitura de continuidade

Esta seção **não adiciona eventos novos** às missões já fixadas. Explica por que a presença de Legaspe é coerente com os resultados conhecidos.

- **Voo 01:** primeira demonstração de descida e amerissagem controlada, ligeiramente rápida demais.
- **Voo 02:** precisão lateral diante dos três drones e sincronização virtual com os braços da torre. A diferença entre "descer em pé" e "chegar ao ponto certo, na velocidade certa" passa a ser central.
- **Voo 03:** uma reignição tardia causa excesso de velocidade e acionamento dos paraquedas a cerca de 500 m; o sistema de recuperação preserva o veículo, apesar do dano em uma perna. A causa física do atraso do motor não foi estabelecida.
- **Voo 04:** solução de reignição em pares primário/reserva, agora com seis motores, resulta em pouso perfeito e utilização real de um reserva. O sistema de controle deve lidar com transientes, sem que se atribua a Legaspe a invenção individual da solução de propulsão.
- **Voo 05 (~2019):** o stack completo de 33 motores chega à órbita com Buran não tripulado; o booster é fisicamente capturado pela torre. A validação acumulada de controle e geometria foi decisiva para tornar a tentativa concebível.

**Nota de autoria:** é coerente que Legaspe tenha participação central no desenvolvimento do software de orientação e controle do pouso; isso não implica autoria exclusiva de cada componente, sensor, algoritmo ou resultado. O sistema é obra da equipe.

---

## 5. Relações entre personagens

- **Legaspe e Ever:** vínculo de orientação acadêmica que evolui para colaboração entre engenheiros. Ever não é figurante: foi quem lembrou da ferramenta conceitual e aproximou o professor da Black Star.
- **Legaspe e Boca:** duas formas complementares de enfrentar o impossível aparente. Boca identifica soluções de engenharia e sua viabilidade; Legaspe exige um modelo, dados e margens demonstráveis para que o controle seja confiável.
- **Legaspe e Augusto:** a disciplina técnica do professor encontra a pressão financeira de Augusto. Evitar a perda de um protótipo não é apenas um desejo acadêmico: pode decidir a sobrevivência da empresa.

**Traços de personalidade sugeridos (não fechados):** rigoroso, paciente com quem quer compreender e impaciente com conclusões sem evidência; gosta de transformar intuições em modelos, experiências reproduzíveis e ensaios que possam refutar a hipótese inicial.

---

## 6. Pontos ainda em aberto

- Prenome, idade, universidade e detalhes da carreira de Legaspe.
- Quando deixou o ensino e se a entrada permanente foi imediata ou gradual.
- Ferramentas concretas, hardware e algoritmos efetivamente adotados.
- Quais decisões de controle e critérios de aborto foram concebidos por ele versus por outros engenheiros.
- Se esteve presencialmente na sala de controle dos cinco voos, e que conflitos técnicos enfrentou.
- Como evoluiu sua relação de professor e orientando para a colaboração com Ever.

---

**Resumo de continuidade:** em torno de **2014**, diante do desafio de recuperar o propulsor da Black Star, **Ever convidou seu antigo orientador, Engenheiro Legaspe**, especialista e doutor em Controle. O **pêndulo invertido** forneceu o ponto de partida conceitual para estudar estabilidade e pouso propulsivo. O professor integrou-se **permanentemente ao time de controles**, tornando-se figura essencial à arquitetura de recuperação que culminaria na captura do booster em 2019.
