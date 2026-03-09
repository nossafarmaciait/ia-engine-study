import { useState, useRef } from "react";

const SECTIONS = [
  {
    id: "what-is",
    title: "O Que É o IA Engine?",
    icon: "◈",
    theory: {
      content: `Imagina que trabalhas numa empresa com dezenas de farmácias e precisas de, todos os dias, fazer coisas como: enviar encomendas para fornecedores, sincronizar dados entre sistemas, gerar relatórios, ou notificar a equipa quando algo corre mal. Fazer tudo isto manualmente seria impossível. É aqui que entra o **IA Engine**.

**O IA Engine é a plataforma de automação interna da Nossa Farmácia / Addo Pharma.** É uma ferramenta feita à medida que permite criar "automações" — tarefas que correm sozinhas, com horário definido, sem intervenção humana.

**Na prática, o que faz?**
Pensa no IA Engine como um "assistente" que corre no servidor e executa tarefas repetitivas por ti. Por exemplo:
• Todas as manhãs, consulta a base de dados e envia as encomendas do dia para o fornecedor Alliance Healthcare
• A cada hora, verifica se houve erros nalguma automação e envia um alerta no Microsoft Teams
• Uma vez por dia, actualiza o catálogo de produtos no motor de busca

**Como é construído?**
O IA Engine é uma aplicação web feita em **Django** (um framework Python). Tem duas partes principais:
• **task_engine** — Onde vives e respiras dentro do IA Engine. É aqui que crias automações, vês execuções, e resolves problemas.
• **api_engine** — Permite criar serviços API reutilizáveis. Menos usado no dia-a-dia, mas importante para integrações.

**Como acedo?**
• Ambiente de desenvolvimento: **https://apidev.nossafarmacia.pt**
• Ambiente de produção: **https://api.nossafarmacia.pt:4443**
O ambiente de desenvolvimento é onde testas coisas novas. O de produção é onde correm as automações reais que afectam o negócio.`,
      keyPoints: [
        "O IA Engine automatiza tarefas repetitivas do grupo farmacêutico",
        "Construído em Django (Python) — feito à medida para a Nossa Farmácia",
        "task_engine = onde crias e geres automações",
        "api_engine = serviços API reutilizáveis",
        "Dev: apidev.nossafarmacia.pt | Prod: api.nossafarmacia.pt:4443",
      ],
    },
    quiz: [
      {
        question: "Qual é o principal objectivo do IA Engine?",
        options: ["Gerir farmácias online", "Automatizar tarefas repetitivas", "Criar websites", "Fazer contabilidade"],
        correct: 1,
        explanation: "O IA Engine existe para automatizar tarefas repetitivas como envio de encomendas, sincronização de dados e alertas.",
      },
      {
        question: "Em que linguagem/framework é construído o IA Engine?",
        options: ["Node.js / Express", "Python / Django", "Java / Spring", "PHP / Laravel"],
        correct: 1,
        explanation: "O IA Engine é construído em Python com o framework Django.",
      },
      {
        question: "Qual a diferença entre o ambiente de dev e o de produção?",
        options: ["Dev é mais rápido", "Dev é para testes, produção afecta o negócio real", "São iguais", "Produção não tem interface web"],
        correct: 1,
        explanation: "O ambiente de desenvolvimento é para testar coisas novas sem risco. O de produção corre as automações reais.",
      },
      {
        question: "Em qual das partes do IA Engine vais criar automações?",
        options: ["api_engine", "task_engine", "dashboard", "core"],
        correct: 1,
        explanation: "O task_engine é onde crias e geres todas as automações do IA Engine.",
      },
      {
        question: "Qual destes é um exemplo real de automação no IA Engine?",
        options: ["Editar um documento Word", "Enviar encomendas automaticamente para fornecedores", "Navegar na internet", "Fazer backup do telemóvel"],
        correct: 1,
        explanation: "Um exemplo real é o envio automático de encomendas tipo para a Alliance Healthcare, que corre sem intervenção humana.",
      },
      {
        question: "Qual é a URL do ambiente de produção?",
        options: ["https://apidev.nossafarmacia.pt", "https://api.nossafarmacia.pt:4443", "https://ia-engine.pt", "http://localhost:8001"],
        correct: 1,
        explanation: "O ambiente de produção está em https://api.nossafarmacia.pt:4443.",
      },
      {
        question: "Se quiseres testar uma automação nova, em que ambiente deves fazê-lo?",
        options: ["Produção, porque é mais rápido", "Desenvolvimento (apidev.nossafarmacia.pt)", "Directamente no SQL Server", "No teu computador local apenas"],
        correct: 1,
        explanation: "O ambiente de desenvolvimento existe exactamente para testar coisas novas sem afectar o negócio real.",
      },
      {
        question: "Para que serve o api_engine?",
        options: ["Criar automações com cron", "Criar serviços API reutilizáveis", "Enviar emails automáticos", "Gerir utilizadores"],
        correct: 1,
        explanation: "O api_engine permite criar Function Services — endpoints API reutilizáveis que encapsulam lógica de negócio.",
      },
      {
        question: "O IA Engine foi comprado a uma empresa externa ou desenvolvido internamente?",
        options: ["Comprado à Microsoft", "É open-source", "Desenvolvido internamente pela equipa", "É um plugin do Django"],
        correct: 2,
        explanation: "O IA Engine é uma plataforma proprietária, desenvolvida internamente pela equipa de desenvolvimento do grupo.",
      },
      {
        question: "Qual destas tarefas NÃO seria feita pelo IA Engine?",
        options: ["Enviar encomendas para fornecedores", "Editar o design do website", "Verificar erros e enviar alertas no Teams", "Actualizar catálogos de produtos"],
        correct: 1,
        explanation: "O IA Engine automatiza tarefas de dados e integrações. Design de websites é um trabalho manual/frontend, não uma automação.",
      },
    ],
  },
  {
    id: "business-context",
    title: "O Negócio Farmacêutico",
    icon: "⚕",
    theory: {
      content: `Antes de mexer no IA Engine, é fundamental perceber o negócio que estás a automatizar. Sem este contexto, o código não faz sentido.

**O Grupo Nossa Farmácia / Addo Pharma**
É um grupo de farmácias em Portugal. Não é uma farmácia única — é uma rede. O grupo negoceia condições com fornecedores (grossistas) em nome de todas as farmácias aderentes e ganha **comissões** sobre essas negociações. Este é o modelo de receita: fee-based (baseado em taxas/comissões).

**Porque isto importa para ti?**
Muitas automações no IA Engine fazem coisas como: consultar dados de campanhas na base de dados, gerar ficheiros Excel com encomendas tipo, e enviá-los por email aos fornecedores. Se não souberes o que é uma "Encomenda Tipo", o código vai parecer confuso.

**Sistemas que vais encontrar**
• **Odoo** — O ERP (sistema de gestão empresarial). Gere encomendas, facturas, produtos.
• **SQL Server** — A base de dados principal. Os dados estão no schema **BIADDO** (staging area para ETL).
• **Meilisearch** — Motor de busca rápido. Usado para pesquisar produtos e folhetos de medicamentos.
• **Microsoft Teams** — Onde a equipa recebe notificações automáticas de erros e alertas.

**Views importantes na base de dados**
Vais ver frequentemente estas views SQL nos scripts:
• \`vw_API_EncomendaTipo\` — Dados de encomendas tipo (produtos, quantidades, farmácias)
• \`vw_API_CampaignParticipation\` — Quais farmácias participam em cada campanha`,
      keyPoints: [
        "Modelo de receita: comissões de grossistas (fee-based)",
        "Sistemas-chave: Odoo (ERP), SQL Server (BD), Meilisearch (busca), Teams (alertas)",
        "Views SQL frequentes: vw_API_EncomendaTipo, vw_API_CampaignParticipation",
      ],
    },
    quiz: [
      {
        question: "Para que serve o Odoo no contexto do grupo?",
        options: ["Motor de busca", "ERP — gestão de encomendas, facturas e produtos", "Base de dados SQL", "Chat interno"],
        correct: 1,
        explanation: "O Odoo é o ERP que gere encomendas de venda, facturas e produtos da empresa.",
      },
      {
        question: "Qual o schema de staging na base de dados SQL Server?",
        options: ["dbo", "BIADDO", "staging", "ETL_DATA"],
        correct: 1,
        explanation: "O schema BIADDO é a staging area no SQL Server onde ficam os dados para as automações.",
      },
      {
        question: "Para que serve o Meilisearch?",
        options: ["Enviar emails", "Pesquisar produtos e folhetos rapidamente", "Gerir utilizadores", "Fazer backups"],
        correct: 1,
        explanation: "O Meilisearch é um motor de busca rápido usado para pesquisar catálogos de produtos e folhetos de medicamentos.",
      },
      {
        question: "Onde é que a equipa recebe alertas automáticos de erros?",
        options: ["Email", "SMS", "Microsoft Teams", "Slack"],
        correct: 2,
        explanation: "O IA Engine envia notificações de erros e alertas para o Microsoft Teams.",
      },
      {
        question: "A view vw_API_EncomendaTipo contém dados de quê?",
        options: ["Utilizadores do sistema", "Encomendas tipo — produtos, quantidades e farmácias", "Logs de erro", "Configurações do servidor"],
        correct: 1,
        explanation: "Esta view expõe os dados das encomendas tipo: produtos, quantidades sugeridas e farmácias associadas.",
      },
      {
        question: "Qual o papel do SQL Server no ecossistema?",
        options: ["Motor de busca", "Base de dados principal com dados de negócio", "Servidor de email", "Ferramenta de dashboards"],
        correct: 1,
        explanation: "O SQL Server é a base de dados principal onde ficam os dados operacionais e o schema BIADDO.",
      },
      {
        question: "O que é o schema BIADDO?",
        options: ["Um módulo do Odoo", "A staging area no SQL Server para ETL e views", "Um serviço de API", "Uma tabela de utilizadores"],
        correct: 1,
        explanation: "O BIADDO é o schema de staging no SQL Server que contém views e tabelas usadas pelas automações.",
      },
      {
        question: "Que tipo de mensagens o IA Engine envia para o Teams?",
        options: ["Mensagens de marketing", "Alertas de erros e notificações operacionais", "Convites para reuniões", "Relatórios financeiros"],
        correct: 1,
        explanation: "O Teams recebe notificações automáticas de erros consolidados, alertas de transporte e qualidade de dados.",
      },
      {
        question: "Se precisares de pesquisar rapidamente um produto no catálogo, que sistema usarias?",
        options: ["SQL Server directamente", "Meilisearch", "Odoo", "Microsoft Teams"],
        correct: 1,
        explanation: "O Meilisearch é o motor de busca full-text optimizado para pesquisas rápidas em catálogos e folhetos.",
      },
    ],
  },
  {
    id: "core-concepts",
    title: "Conceitos Fundamentais",
    icon: "◇",
    theory: {
      content: `Agora que sabes para que serve o IA Engine e o negócio por trás, vamos perceber as peças que compõem uma automação. São apenas 4 conceitos principais — depois de os perceberes, tudo encaixa.

**Schedule (A Automação)**
É a "receita" da automação. Pensa nele como uma ficha que diz: "faz isto, a esta hora". Um Schedule contém:
• O **código Python** que vai buscar os dados (chamado "script de load")
• A **expressão cron** que define quando corre (ex: "todos os dias às 8h")
• As **variáveis de ambiente (ENV)** — configurações como credenciais de BD, URLs de APIs
• O **control_value** — um valor que guarda "onde parámos" para não repetir trabalho
• O **estado** — activo ou inactivo

Exemplo real: o Schedule "ALLIANCE HEALTHCARE - Enviar encomenda tipo" corre diariamente, consulta a BD, e gera as encomendas.

**Ticket (A Unidade de Trabalho)**
Quando o script de load do Schedule corre, retorna uma **lista de dicionários Python**. Cada dicionário torna-se um Ticket. Se o script retorna 10 dicionários, são criados 10 Tickets.

Analogia: Pensa num Schedule como uma fila do supermercado. Cada Ticket é um cliente na fila. Cada cliente (Ticket) vai ser atendido (processado) pela mesma sequência de passos (Actions).

**Action (O Passo de Processamento)**
Cada Schedule tem uma ou mais Actions associadas. São os "passos" que cada Ticket percorre, um a um, em ordem. Cada Action tem o seu próprio código Python.

Exemplo com 3 Actions:
• Action 1: Gerar ficheiro Excel com os dados da encomenda
• Action 2: Enviar o ficheiro por email ao fornecedor
• Action 3: Registar na BD que o envio foi feito com sucesso

Se a Action 2 falha, a Action 3 não corre. Em vez disso, pode correr uma **Action de fallback** — por exemplo, enviar uma notificação de erro para o Teams.

**ScheduleExecution (O Registo)**
Cada vez que um Schedule é disparado, cria-se uma ScheduleExecution. É apenas o registo histórico: "esta automação correu nesta data e o resultado foi sucesso/erro". Útil para diagnóstico.`,
      keyPoints: [
        "Schedule = a automação completa (código + cron + ENV + control_value)",
        "Ticket = unidade de trabalho (cada dict retornado pelo load = 1 ticket)",
        "Action = passo de processamento (executadas em sequência por ticket)",
        "ScheduleExecution = registo histórico de cada execução",
        "Fallback Action = corre quando uma Action falha",
      ],
    },
    quiz: [
      {
        question: "O que é um Schedule no IA Engine?",
        options: ["Um calendário do Google", "A automação completa — com código, horário e configurações", "Um tipo de base de dados", "Um ficheiro Excel"],
        correct: 1,
        explanation: "O Schedule é a entidade principal — contém o código Python, o cron, as variáveis de ambiente e o control_value.",
      },
      {
        question: "Se o script de load retornar uma lista com 5 dicionários, quantos Tickets são criados?",
        options: ["1", "5", "10", "Depende das Actions"],
        correct: 1,
        explanation: "Cada dicionário na lista retornada pelo load torna-se um Ticket. 5 dicionários = 5 Tickets.",
      },
      {
        question: "As Actions de um Schedule são executadas em que ordem?",
        options: ["Em paralelo", "Aleatória", "Sequencialmente (uma após outra)", "Por prioridade"],
        correct: 2,
        explanation: "As Actions são executadas sequencialmente para cada Ticket — Action 1, depois Action 2, depois Action 3, etc.",
      },
      {
        question: "O que acontece se a Action 2 de 3 falhar?",
        options: ["A Action 3 corre na mesma", "O Ticket é marcado como erro e a fallback Action pode correr", "O Schedule inteiro é desactivado", "Todas as Actions são revertidas"],
        correct: 1,
        explanation: "Se uma Action falha, as seguintes não correm. O Ticket fica com erro e a Action de fallback (se existir) é activada.",
      },
      {
        question: "Para que serve o control_value?",
        options: ["Controlar o acesso de utilizadores", "Guardar onde a automação parou para não repetir trabalho", "Definir a prioridade do Schedule", "Contar o número de Tickets"],
        correct: 1,
        explanation: "O control_value guarda um ponto de referência (ex: última data processada) para que a próxima execução retome de onde parou.",
      },
      {
        question: "O que contém as variáveis de ambiente (ENV) de um Schedule?",
        options: ["O código Python das Actions", "Configurações como credenciais de BD, URLs e tokens", "A lista de Tickets", "Os logs de erro"],
        correct: 1,
        explanation: "O ENV guarda configurações externas como credenciais de base de dados, URLs de APIs, tokens, etc.",
      },
      {
        question: "O que é uma ScheduleExecution?",
        options: ["O código que executa as Actions", "Um Ticket especial", "O registo histórico de uma execução do Schedule", "Uma variável de ambiente"],
        correct: 2,
        explanation: "Cada vez que um Schedule corre, é criada uma ScheduleExecution que regista a data e o resultado (sucesso/erro).",
      },
      {
        question: "Se o script de load retornar uma lista vazia [], o que acontece?",
        options: ["Cria um Ticket vazio", "Nenhum Ticket é criado e as Actions não correm", "Dá erro", "Cria um Ticket com dados nulos"],
        correct: 1,
        explanation: "Lista vazia = zero Tickets. As Actions simplesmente não são executadas nessa execução.",
      },
      {
        question: "Um dicionário retornado pelo load tem uma lista como valor: {'dados': [1, 2, 3]}. Quantos Tickets são criados?",
        options: ["3 (um por item da lista)", "1 (o dicionário inteiro é um Ticket)", "Dá erro", "Depende da Action"],
        correct: 1,
        explanation: "O dicionário inteiro vira um único Ticket. O que conta são os itens da lista de topo retornada pelo load, não as listas internas.",
      },
      {
        question: "Um Schedule está inactivo. O que acontece quando chega a hora do cron?",
        options: ["Corre na mesma", "Nada — Schedules inactivos são ignorados", "Corre mas não cria Tickets", "Envia um alerta"],
        correct: 1,
        explanation: "Schedules inactivos são ignorados pelo agendador. Só Schedules com estado activo são disparados.",
      },
      {
        question: "Qual a diferença entre uma Action normal e uma Action de fallback?",
        options: ["A fallback é mais rápida", "A fallback só corre quando uma Action normal falha", "A fallback corre antes das outras", "Não há diferença"],
        correct: 1,
        explanation: "A Action de fallback é activada automaticamente quando uma Action normal falha — serve para gestão de erros (ex: enviar alerta).",
      },
      {
        question: "Se o load retornar [{'id': 1}, {'id': 2}] e houver 2 Actions, quantas vezes são executadas Actions no total?",
        options: ["2 (uma por Ticket)", "4 (2 Tickets × 2 Actions cada)", "1", "Depende do cron"],
        correct: 1,
        explanation: "Cada Ticket passa pelas 2 Actions: Ticket 1 → Action 1, Action 2; Ticket 2 → Action 1, Action 2. Total: 4 execuções.",
      },
      {
        question: "Onde defines a que horas uma automação deve correr?",
        options: ["Num ficheiro de configuração", "Na expressão cron do Schedule", "No código Python do load", "Nas variáveis de ambiente"],
        correct: 1,
        explanation: "O horário é definido pela expressão cron no Schedule. Exemplo: '0 8 * * *' = todos os dias às 8h.",
      },
    ],
  },
  {
    id: "execution-flow",
    title: "Fluxo Passo a Passo",
    icon: "▹",
    theory: {
      content: `Agora que conheces as peças, vamos ver como tudo encaixa numa execução completa. Segue o fluxo como se estivesses a acompanhar uma automação real.

**Passo 1 — Trigger (Disparo)**
O IA Engine verifica constantemente os Schedules activos. Quando a expressão cron de um Schedule bate certo com a hora actual, o processo arranca. Também é possível disparar manualmente pela interface web (útil para testes).

Resultado: É criada uma **ScheduleExecution** — o registo de que "esta automação começou agora".

**Passo 2 — Load (Carregar dados)**
O script Python do Schedule é executado. A função principal é sempre \`main(**kwargs)\`. Dentro dos kwargs tens:
• \`kwargs["ENV"]\` — As variáveis de ambiente (credenciais, URLs, etc.)
• \`kwargs["control_value"]\` — O valor de controlo da última execução

O script tipicamente faz: conectar à BD → executar uma query → retornar os resultados.

Resultado: O script retorna **(lista_de_dicionarios, novo_control_value)**

**Passo 3 — Criação de Tickets**
O IA Engine pega na lista de dicionários e cria um Ticket por cada dicionário. Os dados de cada dicionário ficam disponíveis como kwargs para as Actions.

Resultado: N Tickets criados, todos no estado "pendente".

**Passo 4 — Processamento de Actions**
Para cada Ticket, as Actions do Schedule correm em sequência. Cada Action recebe os dados do seu Ticket via \`main(**kwargs)\`.

Resultado: Cada Ticket vai sendo processado. O progresso de cada Action é registado no **TicketActionLog**.

**Passo 5 — Sucesso ou Erro**
Se todas as Actions correm bem → Ticket marcado como **SC** (sucesso).
Se alguma Action falha → Ticket marcado como **erro**. O erro é registado no **TicketActionLogError** com o tipo e a mensagem da excepção. Se existir uma Action de fallback, ela corre (ex: enviar alerta no Teams).

**Passo 6 — Actualizar control_value**
O novo control_value retornado no Passo 2 é guardado no Schedule. Na próxima execução, o script de load recebe este novo valor, permitindo processar apenas dados novos.`,
      keyPoints: [
        "1. Trigger (cron ou manual) → cria ScheduleExecution",
        "2. Load: main(**kwargs) → retorna (lista_dicts, new_control_value)",
        "3. Cada dict da lista → 1 Ticket",
        "4. Actions correm sequencialmente por Ticket",
        "5. Sucesso = SC | Erro → TicketActionLogError + fallback",
        "6. control_value actualizado para próxima execução",
      ],
    },
    quiz: [
      {
        question: "Qual é a primeira coisa que acontece quando um Schedule dispara?",
        options: ["Cria Tickets", "Executa as Actions", "Cria uma ScheduleExecution", "Envia um email"],
        correct: 2,
        explanation: "O primeiro passo é criar uma ScheduleExecution — o registo de que aquela automação começou.",
      },
      {
        question: "A função principal de qualquer script no IA Engine é sempre:",
        options: ["run(**kwargs)", "execute(**kwargs)", "main(**kwargs)", "start(**kwargs)"],
        correct: 2,
        explanation: "Tanto o script de load como as Actions usam sempre main(**kwargs) como ponto de entrada.",
      },
      {
        question: "Como acedes às credenciais da base de dados dentro de um script?",
        options: ['os.environ["DB_HOST"]', 'kwargs["ENV"]["DB_HOST"]', 'settings.DB_HOST', 'config.get("DB_HOST")'],
        correct: 1,
        explanation: 'As variáveis de ambiente do Schedule estão em kwargs["ENV"]. Ex: kwargs["ENV"]["DB_HOST"].',
      },
      {
        question: "O script de load retorna o quê?",
        options: ["Apenas uma lista de dicionários", "Uma tupla: (lista_de_dicionários, novo_control_value)", "Um objecto JSON", "Um ficheiro CSV"],
        correct: 1,
        explanation: "O load retorna uma tupla com dois elementos: a lista de dicts (que viram Tickets) e o novo control_value.",
      },
      {
        question: "Qual código de estado significa que um Ticket foi processado com sucesso?",
        options: ["OK", "SC", "SUCCESS", "COMPLETE"],
        correct: 1,
        explanation: "SC é o código de sucesso definido em task_engine.choices.",
      },
      {
        question: "Onde são registados os detalhes de erro quando uma Action falha?",
        options: ["No Schedule", "No TicketActionLogError", "Num ficheiro de log", "No control_value"],
        correct: 1,
        explanation: "O TicketActionLogError regista exception_type e exception_message para diagnóstico.",
      },
      {
        question: "Para que serve actualizar o control_value no final?",
        options: ["Para limpar a memória", "Para que a próxima execução processe apenas dados novos", "Para desactivar o Schedule", "Para enviar um alerta"],
        correct: 1,
        explanation: "O control_value actualizado (ex: nova timestamp) garante que a próxima execução retoma de onde parou.",
      },
      {
        question: "Podes disparar um Schedule manualmente?",
        options: ["Não, só via cron", "Sim, pela interface web", "Sim, mas apenas por API REST", "Não, é preciso editar o cron"],
        correct: 1,
        explanation: "A interface web permite trigger manual — muito útil para testar automações sem esperar pelo cron.",
      },
      {
        question: "Se um Schedule tem 3 Actions e a Action 2 falha no Ticket #5, o que acontece ao Ticket #6?",
        options: ["Não é processado", "É processado normalmente desde a Action 1", "Começa na Action 3", "Fica em espera"],
        correct: 1,
        explanation: "Cada Ticket é independente. Se o Ticket #5 falha, o Ticket #6 começa o seu processamento normalmente.",
      },
      {
        question: "O que regista o TicketActionLog?",
        options: ["Apenas erros", "Cada execução de Action por Ticket (sucesso ou erro)", "As variáveis de ambiente", "O código fonte das Actions"],
        correct: 1,
        explanation: "O TicketActionLog regista cada execução de Action por Ticket — é o histórico completo do que aconteceu.",
      },
      {
        question: "Um Schedule corre às 8h e o load demora 5 minutos. Às 8h05, o control_value é actualizado. Na próxima execução às 9h, o que recebe o kwargs['control_value']?",
        options: ["O valor original de antes das 8h", "O valor actualizado às 8h05", "Nenhum — é sempre vazio", "A hora actual (9h)"],
        correct: 1,
        explanation: "O control_value é actualizado no final de cada execução bem-sucedida. Na próxima execução, o load recebe o valor mais recente.",
      },
      {
        question: "O que contém o TicketActionLogError que ajuda no diagnóstico?",
        options: ["Apenas a data do erro", "O exception_type e exception_message", "O código da Action", "O nome do utilizador"],
        correct: 1,
        explanation: "O TicketActionLogError guarda o tipo de excepção e a mensagem de erro, fundamentais para perceber o que correu mal.",
      },
      {
        question: "Se queres que uma automação processe apenas dados novos a cada execução, que mecanismo usas?",
        options: ["Desactivar e reactivar o Schedule", "O control_value para filtrar por data", "Apagar os Tickets antigos", "Mudar a expressão cron"],
        correct: 1,
        explanation: "O control_value (tipicamente uma timestamp) permite ao load filtrar apenas dados criados desde a última execução.",
      },
    ],
  },
  {
    id: "practical",
    title: "Mãos no Código",
    icon: "⌘",
    theory: {
      content: `Agora vamos ver código real. Cada exemplo é um padrão que vais encontrar (e escrever) frequentemente no IA Engine.

**Exemplo 1: Script de Load — Consultar a BD e criar Tickets**
Este é o padrão mais comum. O load conecta ao SQL Server, executa uma query, e retorna os resultados como Tickets.

\`\`\`python
from datetime import datetime
import pymssql

def main(**kwargs):
    # 1. Obter configurações do ENV
    env = kwargs["ENV"]
    control_value = kwargs["control_value"]
    
    # 2. Conectar ao SQL Server
    conn = pymssql.connect(
        server=env["DB_HOST"],
        database=env["DB_NAME"],
        user=env["DB_USER"],
        password=env["DB_PASS"]
    )
    
    # 3. Executar query (as_dict=True retorna dicionários!)
    cursor = conn.cursor(as_dict=True)
    cursor.execute("""
        SELECT * FROM BIADDO.vw_API_EncomendaTipo
        WHERE DataCriacao > %s
    """, (control_value,))
    rows = cursor.fetchall()
    conn.close()
    
    # 4. Retornar tickets + novo control_value
    new_control_value = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    return rows, new_control_value
\`\`\`

Pontos importantes: \`cursor(as_dict=True)\` faz com que cada row seja um dicionário (o formato que o IA Engine espera). O \`control_value\` filtra dados já processados.

**Exemplo 2: Action — Processar cada Ticket**
A Action recebe os dados do Ticket directamente como kwargs. Se o load retornou \`{"external_id": "123", "produto": "Aspirina"}\`, a Action recebe exactamente isso.

\`\`\`python
import requests

def main(**kwargs):
    # Os dados do Ticket chegam directamente nos kwargs
    external_id = kwargs["external_id"]
    produto = kwargs["produto"]
    
    # Processar — neste caso, enviar para uma API externa
    response = requests.post(
        kwargs["ENV"]["API_URL"],
        json={"id": external_id, "product": produto}
    )
    response.raise_for_status()  # Lança erro se status != 200
    
    return {"status": "enviado", "id": external_id}
\`\`\`

Nota: A Action também tem acesso ao ENV via \`kwargs["ENV"]\`.

**Exemplo 3: Consultar erros com Django ORM**
Dentro do IA Engine, também podes usar o ORM do Django para consultar dados internos como tickets com erro:

\`\`\`python
from task_engine.models import Ticket
from task_engine.choices import EXECUTION_STATUS_ERROR
from django.db.models import Count, F

# Agrupar tickets com erro por Schedule
tickets_error = (
    Ticket.objects.values(
        "schedule_id",
        schedule_name=F("schedule__name")  # F() para relações
    )
    .filter(
        execution_status=EXECUTION_STATUS_ERROR,
        created_date_ticket__gte=start_date,
    )
    .annotate(total=Count("schedule__name"))
)
\`\`\`

Aqui usamos \`F("schedule__name")\` para aceder ao nome do Schedule via relação, e \`annotate(total=Count(...))\` para contar totais por grupo.`,
      keyPoints: [
        "Load: main(**kwargs) → usa kwargs['ENV'] e kwargs['control_value']",
        "pymssql: cursor(as_dict=True) para retornar dicionários",
        "Retorno do load: (lista_de_dicts, novo_control_value)",
        "Action: main(**kwargs) → kwargs contém os dados do Ticket + ENV",
        "Django ORM: F() para relações, annotate() para agregações",
        "EXECUTION_STATUS_ERROR em task_engine.choices para filtrar erros",
      ],
    },
    quiz: [
      {
        question: "No script de load, como acedes à variável DB_HOST?",
        options: ['os.environ["DB_HOST"]', 'kwargs["ENV"]["DB_HOST"]', "settings.DB_HOST", "self.env.DB_HOST"],
        correct: 1,
        explanation: 'Todas as variáveis de ambiente ficam em kwargs["ENV"]. Acedes com kwargs["ENV"]["DB_HOST"].',
      },
      {
        question: "Para que serve cursor(as_dict=True) no pymssql?",
        options: ["Para executar queries mais rápido", "Para retornar cada row como dicionário em vez de tuplo", "Para encriptar a conexão", "Para activar o modo de debug"],
        correct: 1,
        explanation: "Com as_dict=True, cada row vem como dicionário (ex: {'produto': 'Aspirina'}), que é o formato que o IA Engine usa para criar Tickets.",
      },
      {
        question: "Qual o formato de retorno correcto de um script de load?",
        options: ["return rows", "return (rows, new_control_value)", "return json.dumps(rows)", "return Ticket(rows)"],
        correct: 1,
        explanation: "O load retorna uma tupla com dois elementos: a lista de dicionários e o novo control_value.",
      },
      {
        question: "Numa Action, se o load retornou {'external_id': '123', 'nome': 'Teste'}, como acedes ao 'nome'?",
        options: ['kwargs["ticket"]["nome"]', 'kwargs["nome"]', "self.nome", 'kwargs["data"]["nome"]'],
        correct: 1,
        explanation: "Os dados do Ticket chegam directamente nos kwargs. Acedes com kwargs['nome'].",
      },
      {
        question: "Uma Action pode aceder às variáveis de ambiente (ENV)?",
        options: ["Não, apenas o load tem acesso", "Sim, via kwargs['ENV']", "Sim, via os.environ", "Apenas se for a primeira Action"],
        correct: 1,
        explanation: "As Actions também recebem o ENV nos kwargs, exactamente como o load.",
      },
      {
        question: "Para que serve F() no Django ORM?",
        options: ["Formatar texto", "Aceder a campos de relações entre modelos", "Filtrar por data", "Fazer debug"],
        correct: 1,
        explanation: "F() permite referenciar campos de modelos relacionados, como schedule_name=F('schedule__name').",
      },
      {
        question: "Qual constante usas para filtrar tickets com erro?",
        options: ["STATUS_ERROR", "EXECUTION_STATUS_ERROR", "TICKET_FAILED", "ERROR"],
        correct: 1,
        explanation: "A constante EXECUTION_STATUS_ERROR de task_engine.choices identifica tickets com erro.",
      },
      {
        question: "Se response.raise_for_status() detecta um erro HTTP, o que acontece?",
        options: ["Retorna None", "Lança uma excepção", "Ignora o erro", "Retorna um código de erro"],
        correct: 1,
        explanation: "raise_for_status() lança uma excepção HTTPError se o status code não for 2xx, o que marca o Ticket como erro no IA Engine.",
      },
      {
        question: "Qual o formato típico do control_value quando é uma data?",
        options: ["DD/MM/YYYY", "%Y-%m-%d %H:%M:%S (ex: 2025-08-05 13:00:00)", "Unix timestamp", "ISO 8601 com timezone"],
        correct: 1,
        explanation: "O formato padrão é '%Y-%m-%d %H:%M:%S', por exemplo '2025-08-05 13:00:00'.",
      },
      {
        question: "No load, para que serve a linha conn.close()?",
        options: ["Para apagar os dados", "Para fechar a conexão à BD e libertar recursos", "Para fazer commit", "Para encriptar a conexão"],
        correct: 1,
        explanation: "conn.close() fecha a conexão ao SQL Server e liberta recursos. Sem isto, conexões ficam abertas e podem esgotar o pool.",
      },
      {
        question: "Se o load retorna (rows, new_control_value) e rows é uma lista vazia, o control_value é actualizado?",
        options: ["Sim, é sempre actualizado", "Depende da implementação", "Não, nunca", "Apenas se houver fallback"],
        correct: 1,
        explanation: "O comportamento depende da implementação do IA Engine — mas tipicamente o control_value é retornado pelo script e pode ser actualizado mesmo sem Tickets.",
      },
      {
        question: "No Django ORM, para que serve .annotate()?",
        options: ["Para adicionar comentários ao código", "Para adicionar campos calculados (como contagens) ao resultado", "Para filtrar resultados", "Para ordenar resultados"],
        correct: 1,
        explanation: "annotate() adiciona campos calculados ao queryset, como Count(), Sum(), Avg(), etc.",
      },
      {
        question: "Qual a diferença entre .filter() e .values() no Django ORM?",
        options: [".filter() ordena, .values() filtra", ".filter() selecciona rows, .values() selecciona colunas", "São iguais", ".filter() é para leitura, .values() para escrita"],
        correct: 1,
        explanation: ".filter() aplica condições WHERE (selecciona quais rows). .values() define quais campos/colunas retornar (como SELECT no SQL).",
      },
    ],
  },
  {
    id: "infra",
    title: "Infraestrutura",
    icon: "⬡",
    theory: {
      content: `Não precisas de ser especialista em infra para usar o IA Engine, mas ajuda saber como as peças se ligam por baixo. Isto é especialmente útil quando precisas de resolver problemas.

**Celery — O Motor de Execução**
Quando um Schedule dispara, quem realmente executa o código são os **Celery workers**. O Celery é um sistema de filas de tarefas: o IA Engine coloca tarefas na fila, e os workers pegam nelas e executam. O **Redis** serve como "correio" (broker) entre o IA Engine e os workers.

Cada **Team** (equipa) pode ter workers dedicados. Isto garante que uma automação pesada de uma equipa não bloqueia as automações de outra.

**Docker Compose — Tudo Junto**
O IA Engine corre em Docker. Um único \`docker-compose up\` levanta todos os serviços: Django (backend), Redis, Celery workers, SQL Server (ou Azure SQL Edge em dev), PostgreSQL (para Metabase), e Nginx (reverse proxy em produção).

**Bases de Dados**
• **SQL Server** — BD principal com dados de negócio. Schema BIADDO para staging/ETL. Conexão via **pymssql**.
• **PostgreSQL** — Apenas para o Metabase (dashboards/analytics).

**Frontend (em migração)**
A interface está a migrar de Django Templates para **React + Vite + Shadcn/ui**. O backend Django serve apenas como API REST com autenticação **JWT**. O frontend React corre na porta 3000, o backend na porta 8001.

**Comandos úteis**
• Iniciar tudo: \`docker-compose up\`
• Iniciar workers por team: \`python manage.py start_celery_workers_by_team\`
• Migrações de BD: \`python manage.py migrate\`
• Monitorizar Celery: Flower (porta 5555)`,
      keyPoints: [
        "Celery workers executam as tarefas, Redis é o broker",
        "Workers separados por Team para isolamento",
        "Docker Compose orquestra todos os serviços",
        "SQL Server (dados) + PostgreSQL (Metabase) + pymssql",
        "Frontend React (:3000) → Backend Django API (:8001) via JWT",
        "docker-compose up para levantar tudo",
      ],
    },
    quiz: [
      {
        question: "Quem executa realmente o código das automações?",
        options: ["O Django directamente", "Os Celery workers", "O Redis", "O Nginx"],
        correct: 1,
        explanation: "Os Celery workers são os processos que pegam nas tarefas da fila e executam o código Python.",
      },
      {
        question: "Para que serve o Redis no IA Engine?",
        options: ["Base de dados principal", "Broker/correio entre o IA Engine e os Celery workers", "Servidor web", "Motor de busca"],
        correct: 1,
        explanation: "O Redis funciona como broker — transporta as mensagens de tarefas entre o IA Engine e os workers.",
      },
      {
        question: "Porque é que cada Team pode ter workers separados?",
        options: ["Para gastar menos memória", "Para que automações pesadas de uma equipa não bloqueiem outra", "Porque o Redis exige", "Para separar bases de dados"],
        correct: 1,
        explanation: "Workers separados por Team garantem isolamento — uma equipa com automações pesadas não afecta as outras.",
      },
      {
        question: "Qual comando levanta todos os serviços do IA Engine?",
        options: ["python manage.py runserver", "docker-compose up", "celery worker start", "npm start"],
        correct: 1,
        explanation: "O docker-compose up inicia todos os serviços: Django, Redis, Celery, BD, etc.",
      },
      {
        question: "Qual biblioteca Python conecta ao SQL Server?",
        options: ["pyodbc", "pymssql", "psycopg2", "sqlalchemy"],
        correct: 1,
        explanation: "O pymssql é a biblioteca usada para conectar ao SQL Server no IA Engine.",
      },
      {
        question: "Em que porta corre o backend Django em desenvolvimento?",
        options: ["3000", "8001", "8080", "5000"],
        correct: 1,
        explanation: "O backend Django corre na porta 8001. O frontend React usa a 3000.",
      },
      {
        question: "Qual o tipo de autenticação usado entre o frontend e o backend?",
        options: ["Cookies de sessão", "JWT (JSON Web Token)", "API Key", "Basic Auth"],
        correct: 1,
        explanation: "A comunicação frontend-backend usa JWT para autenticação.",
      },
      {
        question: "Para monitorizar os Celery workers, usas que ferramenta?",
        options: ["Grafana", "Flower", "Metabase", "Kibana"],
        correct: 1,
        explanation: "O Flower corre na porta 5555 e permite monitorizar os Celery workers em tempo real.",
      },
      {
        question: "Se os Celery workers pararem, o que acontece às automações?",
        options: ["Continuam a correr normalmente", "As tarefas ficam na fila (Redis) à espera que os workers reiniciem", "Os dados são perdidos", "O Django executa as tarefas directamente"],
        correct: 1,
        explanation: "Com os workers parados, as tarefas acumulam na fila do Redis. Quando os workers voltam, processam as tarefas pendentes.",
      },
      {
        question: "Para que serve o PostgreSQL no IA Engine?",
        options: ["Base de dados principal", "Apenas como backend do Metabase (dashboards)", "Cache de sessões", "Fila do Celery"],
        correct: 1,
        explanation: "O PostgreSQL é usado exclusivamente como backend do Metabase para analytics e dashboards. A BD principal é SQL Server.",
      },
      {
        question: "Qual o papel do Nginx na infraestrutura?",
        options: ["Base de dados", "Reverse proxy em produção", "Motor de busca", "Broker de mensagens"],
        correct: 1,
        explanation: "O Nginx funciona como reverse proxy em produção — recebe os pedidos HTTP e encaminha-os para o Django.",
      },
      {
        question: "Qual comando usas para aplicar migrações de base de dados no Django?",
        options: ["python manage.py makemigrations", "python manage.py migrate", "python manage.py syncdb", "python manage.py dbupdate"],
        correct: 1,
        explanation: "python manage.py migrate aplica as migrações pendentes à base de dados. makemigrations cria os ficheiros de migração.",
      },
    ],
  },
];

// ─── Color palette ───
const COLORS = {
  bg: "#0C0E12", bgCard: "#14171E", bgCardHover: "#1A1E28", bgAccent: "#1E2330",
  border: "#262B38", text: "#E8ECF4", textMuted: "#8892A6", textDim: "#5A6478",
  accent: "#4A9EFF", accentGlow: "rgba(74, 158, 255, 0.15)",
  success: "#34D399", successBg: "rgba(52, 211, 153, 0.1)",
  error: "#F87171", errorBg: "rgba(248, 113, 113, 0.1)",
  warning: "#FBBF24", warningBg: "rgba(251, 191, 36, 0.1)",
  gradient1: "#4A9EFF", gradient2: "#7C5CFC",
};

function ProgressRing({ progress, size = 48, stroke = 3 }) {
  const r = (size - stroke) / 2, c = 2 * Math.PI * r;
  return (
    <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={COLORS.border} strokeWidth={stroke} />
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={COLORS.accent} strokeWidth={stroke} strokeDasharray={c} strokeDashoffset={c - (progress/100)*c} strokeLinecap="round" style={{ transition: "stroke-dashoffset 0.6s ease" }} />
    </svg>
  );
}

function TheoryView({ section }) {
  const { content, keyPoints } = section.theory;
  const renderInline = (text) => {
    return text.split(/(\*\*[^*]+\*\*|\`[^`]+\`|\*[^*]+\*)/).map((part, i) => {
      if (part.startsWith("**") && part.endsWith("**")) return <strong key={i} style={{ color: COLORS.text, fontWeight: 600 }}>{part.slice(2, -2)}</strong>;
      if (part.startsWith("`") && part.endsWith("`")) return <code key={i} style={{ background: COLORS.bgAccent, color: COLORS.accent, padding: "2px 6px", borderRadius: 4, fontSize: 13, fontFamily: "'JetBrains Mono', monospace" }}>{part.slice(1, -1)}</code>;
      if (part.startsWith("*") && part.endsWith("*") && !part.startsWith("**")) return <em key={i} style={{ color: COLORS.text, fontStyle: "italic" }}>{part.slice(1, -1)}</em>;
      return part;
    });
  };
  const renderContent = (text) => {
    const lines = text.split("\n");
    const elements = [];
    let i = 0;
    while (i < lines.length) {
      const trimmed = lines[i].trim();
      if (trimmed.startsWith("```")) {
        const lang = trimmed.slice(3).trim() || "text";
        const codeLines = [];
        i++;
        while (i < lines.length && !lines[i].trim().startsWith("```")) { codeLines.push(lines[i]); i++; }
        i++;
        elements.push(
          <div key={"code-"+i} style={{ background: "#0A0C10", border: `1px solid ${COLORS.border}`, borderRadius: 8, padding: 16, marginBottom: 16, overflow: "auto" }}>
            <div style={{ fontSize: 11, color: COLORS.textDim, marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.08em" }}>{lang}</div>
            <pre style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 13, lineHeight: 1.6, color: COLORS.textMuted, margin: 0, whiteSpace: "pre-wrap" }}>{codeLines.join("\n").trim()}</pre>
          </div>
        );
        continue;
      }
      if (!trimmed) { elements.push(<div key={i} style={{ height: 12 }} />); }
      else if (trimmed.startsWith("•")) { elements.push(<div key={i} style={{ paddingLeft: 16, marginBottom: 6, color: COLORS.textMuted, fontSize: 14, lineHeight: 1.7 }}><span style={{ color: COLORS.accent, marginRight: 8 }}>•</span>{renderInline(trimmed.slice(1).trim())}</div>); }
      else if (trimmed.startsWith("**") && trimmed.endsWith("**")) { elements.push(<h3 key={i} style={{ fontSize: 15, fontWeight: 600, color: COLORS.text, marginTop: 20, marginBottom: 8 }}>{trimmed.slice(2, -2)}</h3>); }
      else { elements.push(<p key={i} style={{ fontSize: 14, lineHeight: 1.8, color: COLORS.textMuted, marginBottom: 8 }}>{renderInline(trimmed)}</p>); }
      i++;
    }
    return elements;
  };
  return (
    <div>
      <div style={{ marginBottom: 24 }}>{renderContent(content)}</div>
      <div style={{ background: COLORS.accentGlow, border: `1px solid ${COLORS.border}`, borderRadius: 8, padding: 16, marginTop: 24 }}>
        <div style={{ fontSize: 12, fontWeight: 600, color: COLORS.accent, marginBottom: 10, textTransform: "uppercase", letterSpacing: "0.06em" }}>Pontos-Chave</div>
        {keyPoints.map((p, i) => (
          <div key={i} style={{ fontSize: 13, color: COLORS.text, marginBottom: 6, paddingLeft: 12, lineHeight: 1.6 }}>
            <span style={{ color: COLORS.accent, marginRight: 8 }}>→</span>{renderInline(p)}
          </div>
        ))}
      </div>
    </div>
  );
}

function QuizView({ section, quizState, onAnswer }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      {section.quiz.map((q, qi) => {
        const answered = quizState[qi] !== undefined;
        const selected = quizState[qi];
        const isCorrect = selected === q.correct;
        return (
          <div key={qi} style={{ background: COLORS.bgCard, border: `1px solid ${answered ? (isCorrect ? COLORS.success : COLORS.error) : COLORS.border}`, borderRadius: 10, padding: 20, transition: "border-color 0.3s" }}>
            <div style={{ display: "flex", alignItems: "flex-start", gap: 12, marginBottom: 14 }}>
              <div style={{ minWidth: 28, height: 28, borderRadius: 6, background: answered ? (isCorrect ? COLORS.successBg : COLORS.errorBg) : COLORS.bgAccent, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 700, color: answered ? (isCorrect ? COLORS.success : COLORS.error) : COLORS.textMuted }}>
                {answered ? (isCorrect ? "✓" : "✗") : qi + 1}
              </div>
              <div style={{ fontSize: 14, fontWeight: 500, color: COLORS.text, lineHeight: 1.5 }}>{q.question}</div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: answered ? 12 : 0 }}>
              {q.options.map((opt, oi) => {
                const isSel = selected === oi, isAns = oi === q.correct;
                let bg = COLORS.bgAccent, brd = COLORS.border, clr = COLORS.textMuted;
                if (answered) { if (isAns) { bg = COLORS.successBg; brd = COLORS.success; clr = COLORS.success; } else if (isSel) { bg = COLORS.errorBg; brd = COLORS.error; clr = COLORS.error; } }
                return (
                  <button key={oi} onClick={() => !answered && onAnswer(qi, oi)} disabled={answered}
                    style={{ background: bg, border: `1px solid ${brd}`, borderRadius: 8, padding: "10px 14px", fontSize: 13, color: clr, cursor: answered ? "default" : "pointer", transition: "all 0.2s", textAlign: "left", lineHeight: 1.4 }}
                    onMouseEnter={e => { if (!answered) { e.currentTarget.style.background = COLORS.bgCardHover; e.currentTarget.style.borderColor = COLORS.accent; }}}
                    onMouseLeave={e => { if (!answered) { e.currentTarget.style.background = bg; e.currentTarget.style.borderColor = brd; }}}
                  ><span style={{ fontWeight: 600, marginRight: 6, opacity: 0.5 }}>{String.fromCharCode(65+oi)}.</span>{opt}</button>
                );
              })}
            </div>
            {answered && <div style={{ background: isCorrect ? COLORS.successBg : COLORS.warningBg, borderRadius: 6, padding: "10px 14px", fontSize: 13, lineHeight: 1.6, color: isCorrect ? COLORS.success : COLORS.warning }}>{q.explanation}</div>}
          </div>
        );
      })}
    </div>
  );
}

export default function IAEngineStudy() {
  const [activeSection, setActiveSection] = useState(0);
  const [activeTab, setActiveTab] = useState("theory");
  const [quizStates, setQuizStates] = useState({});
  const [animateIn, setAnimateIn] = useState(true);
  const contentRef = useRef(null);
  const section = SECTIONS[activeSection];
  const handleAnswer = (qi, oi) => setQuizStates(prev => ({ ...prev, [section.id]: { ...(prev[section.id] || {}), [qi]: oi } }));
  const handleSectionChange = (idx) => { setAnimateIn(false); setTimeout(() => { setActiveSection(idx); setActiveTab("theory"); setAnimateIn(true); if (contentRef.current) contentRef.current.scrollTop = 0; }, 150); };
  const totalQ = SECTIONS.reduce((s, sec) => s + sec.quiz.length, 0);
  const totalCorrect = SECTIONS.reduce((s, sec) => { const st = quizStates[sec.id] || {}; return s + sec.quiz.filter((q, i) => st[i] === q.correct).length; }, 0);
  const totalAns = SECTIONS.reduce((s, sec) => s + Object.keys(quizStates[sec.id] || {}).length, 0);
  const pct = totalQ > 0 ? Math.round((totalAns / totalQ) * 100) : 0;
  const score = totalAns > 0 ? Math.round((totalCorrect / totalAns) * 100) : 0;
  const secState = quizStates[section.id] || {};
  const secAns = Object.keys(secState).length;
  const secCorrect = section.quiz.filter((q, i) => secState[i] === q.correct).length;

  return (
    <div style={{ width: "100%", minHeight: "100vh", background: COLORS.bg, color: COLORS.text, fontFamily: "'DM Sans', -apple-system, sans-serif", display: "flex", flexDirection: "column" }}>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500;600&display=swap" rel="stylesheet" />
      {/* Header */}
      <div style={{ padding: "20px 28px", borderBottom: `1px solid ${COLORS.border}`, display: "flex", alignItems: "center", justifyContent: "space-between", background: "linear-gradient(180deg, #10131A 0%, #0C0E12 100%)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div style={{ width: 38, height: 38, borderRadius: 10, background: `linear-gradient(135deg, ${COLORS.gradient1}, ${COLORS.gradient2})`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, fontWeight: 700, color: "#fff" }}>IA</div>
          <div>
            <div style={{ fontSize: 16, fontWeight: 700, letterSpacing: "-0.02em" }}>IA Engine — Guia de Aprendizagem</div>
            <div style={{ fontSize: 12, color: COLORS.textDim }}>{totalQ} questões · Do zero ao código</div>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div style={{ textAlign: "right" }}>
            <div style={{ fontSize: 11, color: COLORS.textDim, marginBottom: 2 }}>Progresso</div>
            <div style={{ fontSize: 14, fontWeight: 600 }}>
              {totalAns}/{totalQ}
              {totalAns > 0 && <span style={{ marginLeft: 8, fontSize: 12, color: score >= 70 ? COLORS.success : score >= 40 ? COLORS.warning : COLORS.error }}>{score}% acerto</span>}
            </div>
          </div>
          <ProgressRing progress={pct} />
        </div>
      </div>
      <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>
        {/* Sidebar */}
        <div style={{ width: 250, minWidth: 250, borderRight: `1px solid ${COLORS.border}`, padding: "16px 12px", display: "flex", flexDirection: "column", gap: 4, background: "#0E1117", overflowY: "auto" }}>
          <div style={{ fontSize: 10, fontWeight: 600, color: COLORS.textDim, textTransform: "uppercase", letterSpacing: "0.1em", padding: "8px 12px 4px", marginBottom: 4 }}>Percurso de Aprendizagem</div>
          {SECTIONS.map((s, i) => {
            const isActive = i === activeSection;
            const sState = quizStates[s.id] || {};
            const sAns = Object.keys(sState).length;
            const sCor = s.quiz.filter((q, qi) => sState[qi] === q.correct).length;
            return (
              <button key={s.id} onClick={() => handleSectionChange(i)}
                style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 12px", borderRadius: 8, border: "none", background: isActive ? COLORS.accentGlow : "transparent", cursor: "pointer", transition: "all 0.2s", textAlign: "left" }}
                onMouseEnter={e => { if (!isActive) e.currentTarget.style.background = COLORS.bgAccent; }}
                onMouseLeave={e => { if (!isActive) e.currentTarget.style.background = isActive ? COLORS.accentGlow : "transparent"; }}
              >
                <div style={{ minWidth: 24, height: 24, borderRadius: 12, background: sAns === s.quiz.length ? (sCor === s.quiz.length ? COLORS.successBg : COLORS.warningBg) : isActive ? COLORS.accentGlow : COLORS.bgAccent, border: `1px solid ${sAns === s.quiz.length ? (sCor === s.quiz.length ? COLORS.success : COLORS.warning) : isActive ? COLORS.accent : COLORS.border}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700, color: sAns === s.quiz.length ? (sCor === s.quiz.length ? COLORS.success : COLORS.warning) : isActive ? COLORS.accent : COLORS.textDim }}>
                  {sAns === s.quiz.length ? (sCor === s.quiz.length ? "✓" : "~") : i + 1}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: isActive ? 600 : 400, color: isActive ? COLORS.text : COLORS.textMuted }}>{s.title}</div>
                  {sAns > 0 && <div style={{ fontSize: 11, color: COLORS.textDim, marginTop: 1 }}>{sCor}/{s.quiz.length} correctas</div>}
                </div>
              </button>
            );
          })}
          {totalAns > 0 && (
            <button onClick={() => setQuizStates({})}
              style={{ marginTop: "auto", padding: "10px 12px", borderRadius: 8, border: `1px solid ${COLORS.border}`, background: "transparent", color: COLORS.textDim, fontSize: 12, cursor: "pointer", textAlign: "center" }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = COLORS.error; e.currentTarget.style.color = COLORS.error; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = COLORS.border; e.currentTarget.style.color = COLORS.textDim; }}
            >Reiniciar tudo</button>
          )}
        </div>
        {/* Main */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
          <div style={{ padding: "16px 28px", borderBottom: `1px solid ${COLORS.border}`, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <span style={{ fontSize: 20, color: COLORS.accent }}>{section.icon}</span>
              <div>
                <h2 style={{ fontSize: 18, fontWeight: 700, margin: 0 }}>{section.title}</h2>
                <div style={{ fontSize: 12, color: COLORS.textDim, marginTop: 2 }}>Módulo {activeSection + 1} de {SECTIONS.length}</div>
              </div>
            </div>
            <div style={{ display: "flex", background: COLORS.bgAccent, borderRadius: 8, padding: 3, gap: 2 }}>
              {[{ id: "theory", label: "Teoria" }, { id: "quiz", label: `Teste (${section.quiz.length})` }].map(tab => (
                <button key={tab.id} onClick={() => setActiveTab(tab.id)} style={{ padding: "6px 16px", borderRadius: 6, border: "none", fontSize: 13, fontWeight: activeTab === tab.id ? 600 : 400, color: activeTab === tab.id ? COLORS.text : COLORS.textMuted, background: activeTab === tab.id ? COLORS.bgCard : "transparent", cursor: "pointer", transition: "all 0.2s" }}>{tab.label}</button>
              ))}
            </div>
          </div>
          {activeTab === "quiz" && secAns > 0 && (
            <div style={{ padding: "10px 28px", borderBottom: `1px solid ${COLORS.border}`, display: "flex", alignItems: "center", gap: 20, fontSize: 13 }}>
              <span style={{ color: COLORS.textDim }}>Respondidas: {secAns}/{section.quiz.length}</span>
              <span style={{ color: COLORS.success }}>✓ {secCorrect}</span>
              <span style={{ color: COLORS.error }}>✗ {secAns - secCorrect}</span>
              {secAns === section.quiz.length && (
                <button onClick={() => setQuizStates(prev => { const c = { ...prev }; delete c[section.id]; return c; })} style={{ marginLeft: "auto", padding: "4px 12px", borderRadius: 6, border: `1px solid ${COLORS.border}`, background: "transparent", color: COLORS.textMuted, fontSize: 12, cursor: "pointer" }}>Repetir</button>
              )}
            </div>
          )}
          <div ref={contentRef} style={{ flex: 1, overflowY: "auto", padding: "24px 28px 40px", opacity: animateIn ? 1 : 0, transform: animateIn ? "translateY(0)" : "translateY(8px)", transition: "all 0.3s ease" }}>
            {activeTab === "theory" ? <TheoryView section={section} /> : <QuizView section={section} quizState={secState} onAnswer={handleAnswer} />}
          </div>
        </div>
      </div>
    </div>
  );
}
