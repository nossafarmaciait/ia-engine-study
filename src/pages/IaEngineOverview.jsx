import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./ApiStudyPage.css";

// ═══════════════════════════════════════
// MARKDOWN-LIKE → HTML CONVERTER
// ═══════════════════════════════════════
function convertTheoryToHtml(content) {
  const lines = content.split("\n");
  let html = "";
  let i = 0;
  let inCode = false;
  let codeLines = [];
  let codeLang = "";

  while (i < lines.length) {
    const trimmed = lines[i].trim();

    // Code blocks
    if (trimmed.startsWith("```")) {
      if (!inCode) {
        inCode = true;
        codeLang = trimmed.slice(3).trim() || "python";
        codeLines = [];
      } else {
        inCode = false;
        html += `</div><div class="code-block"><div class="code-header"><span class="code-filename">${codeLang}</span></div><div class="code-body"><pre>${codeLines.join("\n")}</pre></div></div><div>`;
      }
      i++;
      continue;
    }

    if (inCode) {
      codeLines.push(lines[i].replace(/</g, "&lt;").replace(/>/g, "&gt;"));
      i++;
      continue;
    }

    if (!trimmed) {
      i++;
      continue;
    }

    // Convert inline formatting
    let line = trimmed
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/`([^`]+)`/g, '<code>$1</code>')
      .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');

    // Heading (standalone bold line)
    if (trimmed.startsWith("**") && trimmed.endsWith("**") && !trimmed.slice(2, -2).includes("**")) {
      const headingText = trimmed.slice(2, -2);
      html += `</div></div><div class="theory-block"><h3>${headingText}</h3><div>`;
      i++;
      continue;
    }

    // Bullet
    if (trimmed.startsWith("•")) {
      // Collect consecutive bullets
      let bullets = "";
      while (i < lines.length) {
        const t = lines[i].trim();
        if (!t.startsWith("•")) break;
        const bulletText = t.slice(1).trim()
          .replace(/</g, "&lt;")
          .replace(/>/g, "&gt;")
          .replace(/`([^`]+)`/g, '<code>$1</code>')
          .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
        bullets += `<li>${bulletText}</li>`;
        i++;
      }
      html += `<ul>${bullets}</ul>`;
      continue;
    }

    // Regular paragraph
    html += `<p>${line}</p>`;
    i++;
  }

  // Wrap in initial theory-block and clean up
  html = `<div class="theory-block"><div>${html}</div></div>`;
  // Remove empty wrappers
  html = html.replace(/<div><\/div>/g, "");
  html = html.replace(/<div class="theory-block"><\/div>/g, "");

  return html;
}

// ═══════════════════════════════════════
// DATA
// ═══════════════════════════════════════
const SECTIONS = [
  {
    id: "what-is",
    title: "O Que É o IA Engine?",
    theory: `Imagina que trabalhas numa empresa com dezenas de farmácias e precisas de, todos os dias, fazer coisas como: enviar encomendas para fornecedores, sincronizar dados entre sistemas, gerar relatórios, ou notificar a equipa quando algo corre mal. Fazer tudo isto manualmente seria impossível. É aqui que entra o **IA Engine**.

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
    quiz: [
      { q: "Qual é o principal objectivo do IA Engine?", opts: ["Gerir farmácias online", "Automatizar tarefas repetitivas", "Criar websites", "Fazer contabilidade"], correct: 1, expl: "O IA Engine existe para automatizar tarefas repetitivas como envio de encomendas, sincronização de dados e alertas." },
      { q: "Em que linguagem/framework é construído o IA Engine?", opts: ["Node.js / Express", "Python / Django", "Java / Spring", "PHP / Laravel"], correct: 1, expl: "O IA Engine é construído em Python com o framework Django." },
      { q: "Qual a diferença entre o ambiente de dev e o de produção?", opts: ["Dev é mais rápido", "Dev é para testes, produção afecta o negócio real", "São iguais", "Produção não tem interface web"], correct: 1, expl: "O ambiente de desenvolvimento é para testar coisas novas sem risco. O de produção corre as automações reais." },
      { q: "Em qual das partes do IA Engine vais criar automações?", opts: ["api_engine", "task_engine", "dashboard", "core"], correct: 1, expl: "O task_engine é onde crias e geres todas as automações do IA Engine." },
      { q: "Qual destes é um exemplo real de automação no IA Engine?", opts: ["Editar um documento Word", "Enviar encomendas automaticamente para fornecedores", "Navegar na internet", "Fazer backup do telemóvel"], correct: 1, expl: "Um exemplo real é o envio automático de encomendas tipo para a Alliance Healthcare, que corre sem intervenção humana." },
      { q: "Qual é a URL do ambiente de produção?", opts: ["https://apidev.nossafarmacia.pt", "https://api.nossafarmacia.pt:4443", "https://ia-engine.pt", "http://localhost:8001"], correct: 1, expl: "O ambiente de produção está em https://api.nossafarmacia.pt:4443." },
      { q: "Se quiseres testar uma automação nova, em que ambiente deves fazê-lo?", opts: ["Produção, porque é mais rápido", "Desenvolvimento (apidev.nossafarmacia.pt)", "Directamente no SQL Server", "No teu computador local apenas"], correct: 1, expl: "O ambiente de desenvolvimento existe exactamente para testar coisas novas sem afectar o negócio real." },
      { q: "Para que serve o api_engine?", opts: ["Criar automações com cron", "Criar serviços API reutilizáveis", "Enviar emails automáticos", "Gerir utilizadores"], correct: 1, expl: "O api_engine permite criar Function Services — endpoints API reutilizáveis que encapsulam lógica de negócio." },
      { q: "O IA Engine foi comprado a uma empresa externa ou desenvolvido internamente?", opts: ["Comprado à Microsoft", "É open-source", "Desenvolvido internamente pela equipa", "É um plugin do Django"], correct: 2, expl: "O IA Engine é uma plataforma proprietária, desenvolvida internamente pela equipa de desenvolvimento do grupo." },
      { q: "Qual destas tarefas NÃO seria feita pelo IA Engine?", opts: ["Enviar encomendas para fornecedores", "Editar o design do website", "Verificar erros e enviar alertas no Teams", "Actualizar catálogos de produtos"], correct: 1, expl: "O IA Engine automatiza tarefas de dados e integrações. Design de websites é um trabalho manual/frontend, não uma automação." },
    ],
  },
  {
    id: "business-context",
    title: "O Negócio Farmacêutico",
    theory: `Antes de mexer no IA Engine, é fundamental perceber o negócio que estás a automatizar. Sem este contexto, o código não faz sentido.

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
    quiz: [
      { q: "Para que serve o Odoo no contexto do grupo?", opts: ["Motor de busca", "ERP — gestão de encomendas, facturas e produtos", "Base de dados SQL", "Chat interno"], correct: 1, expl: "O Odoo é o ERP que gere encomendas de venda, facturas e produtos da empresa." },
      { q: "Qual o schema de staging na base de dados SQL Server?", opts: ["dbo", "BIADDO", "staging", "ETL_DATA"], correct: 1, expl: "O schema BIADDO é a staging area no SQL Server onde ficam os dados para as automações." },
      { q: "Para que serve o Meilisearch?", opts: ["Enviar emails", "Pesquisar produtos e folhetos rapidamente", "Gerir utilizadores", "Fazer backups"], correct: 1, expl: "O Meilisearch é um motor de busca rápido usado para pesquisar catálogos de produtos e folhetos de medicamentos." },
      { q: "Onde é que a equipa recebe alertas automáticos de erros?", opts: ["Email", "SMS", "Microsoft Teams", "Slack"], correct: 2, expl: "O IA Engine envia notificações de erros e alertas para o Microsoft Teams." },
      { q: "A view vw_API_EncomendaTipo contém dados de quê?", opts: ["Utilizadores do sistema", "Encomendas tipo — produtos, quantidades e farmácias", "Logs de erro", "Configurações do servidor"], correct: 1, expl: "Esta view expõe os dados das encomendas tipo: produtos, quantidades sugeridas e farmácias associadas." },
      { q: "Qual o papel do SQL Server no ecossistema?", opts: ["Motor de busca", "Base de dados principal com dados de negócio", "Servidor de email", "Ferramenta de dashboards"], correct: 1, expl: "O SQL Server é a base de dados principal onde ficam os dados operacionais e o schema BIADDO." },
      { q: "O que é o schema BIADDO?", opts: ["Um módulo do Odoo", "A staging area no SQL Server para ETL e views", "Um serviço de API", "Uma tabela de utilizadores"], correct: 1, expl: "O BIADDO é o schema de staging no SQL Server que contém views e tabelas usadas pelas automações." },
      { q: "Que tipo de mensagens o IA Engine envia para o Teams?", opts: ["Mensagens de marketing", "Alertas de erros e notificações operacionais", "Convites para reuniões", "Relatórios financeiros"], correct: 1, expl: "O Teams recebe notificações automáticas de erros consolidados, alertas de transporte e qualidade de dados." },
      { q: "Se precisares de pesquisar rapidamente um produto no catálogo, que sistema usarias?", opts: ["SQL Server directamente", "Meilisearch", "Odoo", "Microsoft Teams"], correct: 1, expl: "O Meilisearch é o motor de busca full-text optimizado para pesquisas rápidas em catálogos e folhetos." },
    ],
  },
  {
    id: "core-concepts",
    title: "Conceitos Fundamentais",
    theory: `Agora que sabes para que serve o IA Engine e o negócio por trás, vamos perceber as peças que compõem uma automação. São apenas 4 conceitos principais — depois de os perceberes, tudo encaixa.

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
    quiz: [
      { q: "O que é um Schedule no IA Engine?", opts: ["Um calendário do Google", "A automação completa — com código, horário e configurações", "Um tipo de base de dados", "Um ficheiro Excel"], correct: 1, expl: "O Schedule é a entidade principal — contém o código Python, o cron, as variáveis de ambiente e o control_value." },
      { q: "Se o script de load retornar uma lista com 5 dicionários, quantos Tickets são criados?", opts: ["1", "5", "10", "Depende das Actions"], correct: 1, expl: "Cada dicionário na lista retornada pelo load torna-se um Ticket. 5 dicionários = 5 Tickets." },
      { q: "As Actions de um Schedule são executadas em que ordem?", opts: ["Em paralelo", "Aleatória", "Sequencialmente (uma após outra)", "Por prioridade"], correct: 2, expl: "As Actions são executadas sequencialmente para cada Ticket — Action 1, depois Action 2, depois Action 3, etc." },
      { q: "O que acontece se a Action 2 de 3 falhar?", opts: ["A Action 3 corre na mesma", "O Ticket é marcado como erro e a fallback Action pode correr", "O Schedule inteiro é desactivado", "Todas as Actions são revertidas"], correct: 1, expl: "Se uma Action falha, as seguintes não correm. O Ticket fica com erro e a Action de fallback (se existir) é activada." },
      { q: "Para que serve o control_value?", opts: ["Controlar o acesso de utilizadores", "Guardar onde a automação parou para não repetir trabalho", "Definir a prioridade do Schedule", "Contar o número de Tickets"], correct: 1, expl: "O control_value guarda um ponto de referência (ex: última data processada) para que a próxima execução retome de onde parou." },
      { q: "O que contém as variáveis de ambiente (ENV) de um Schedule?", opts: ["O código Python das Actions", "Configurações como credenciais de BD, URLs e tokens", "A lista de Tickets", "Os logs de erro"], correct: 1, expl: "O ENV guarda configurações externas como credenciais de base de dados, URLs de APIs, tokens, etc." },
      { q: "O que é uma ScheduleExecution?", opts: ["O código que executa as Actions", "Um Ticket especial", "O registo histórico de uma execução do Schedule", "Uma variável de ambiente"], correct: 2, expl: "Cada vez que um Schedule corre, é criada uma ScheduleExecution que regista a data e o resultado (sucesso/erro)." },
      { q: "Se o script de load retornar uma lista vazia [], o que acontece?", opts: ["Cria um Ticket vazio", "Nenhum Ticket é criado e as Actions não correm", "Dá erro", "Cria um Ticket com dados nulos"], correct: 1, expl: "Lista vazia = zero Tickets. As Actions simplesmente não são executadas nessa execução." },
      { q: "Um dicionário retornado pelo load tem uma lista como valor: {'dados': [1, 2, 3]}. Quantos Tickets são criados?", opts: ["3 (um por item da lista)", "1 (o dicionário inteiro é um Ticket)", "Dá erro", "Depende da Action"], correct: 1, expl: "O dicionário inteiro vira um único Ticket. O que conta são os itens da lista de topo retornada pelo load, não as listas internas." },
      { q: "Um Schedule está inactivo. O que acontece quando chega a hora do cron?", opts: ["Corre na mesma", "Nada — Schedules inactivos são ignorados", "Corre mas não cria Tickets", "Envia um alerta"], correct: 1, expl: "Schedules inactivos são ignorados pelo agendador. Só Schedules com estado activo são disparados." },
      { q: "Qual a diferença entre uma Action normal e uma Action de fallback?", opts: ["A fallback é mais rápida", "A fallback só corre quando uma Action normal falha", "A fallback corre antes das outras", "Não há diferença"], correct: 1, expl: "A Action de fallback é activada automaticamente quando uma Action normal falha — serve para gestão de erros (ex: enviar alerta)." },
      { q: "Se o load retornar [{'id': 1}, {'id': 2}] e houver 2 Actions, quantas vezes são executadas Actions no total?", opts: ["2 (uma por Ticket)", "4 (2 Tickets × 2 Actions cada)", "1", "Depende do cron"], correct: 1, expl: "Cada Ticket passa pelas 2 Actions: Ticket 1 → Action 1, Action 2; Ticket 2 → Action 1, Action 2. Total: 4 execuções." },
      { q: "Onde defines a que horas uma automação deve correr?", opts: ["Num ficheiro de configuração", "Na expressão cron do Schedule", "No código Python do load", "Nas variáveis de ambiente"], correct: 1, expl: "O horário é definido pela expressão cron no Schedule. Exemplo: '0 8 * * *' = todos os dias às 8h." },
    ],
  },
  {
    id: "execution-flow",
    title: "Fluxo Passo a Passo",
    theory: `Agora que conheces as peças, vamos ver como tudo encaixa numa execução completa. Segue o fluxo como se estivesses a acompanhar uma automação real.

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
    quiz: [
      { q: "Qual é a primeira coisa que acontece quando um Schedule dispara?", opts: ["Cria Tickets", "Executa as Actions", "Cria uma ScheduleExecution", "Envia um email"], correct: 2, expl: "O primeiro passo é criar uma ScheduleExecution — o registo de que aquela automação começou." },
      { q: "A função principal de qualquer script no IA Engine é sempre:", opts: ["run(**kwargs)", "execute(**kwargs)", "main(**kwargs)", "start(**kwargs)"], correct: 2, expl: "Tanto o script de load como as Actions usam sempre main(**kwargs) como ponto de entrada." },
      { q: "Como acedes às credenciais da base de dados dentro de um script?", opts: ['os.environ["DB_HOST"]', 'kwargs["ENV"]["DB_HOST"]', "settings.DB_HOST", 'config.get("DB_HOST")'], correct: 1, expl: 'As variáveis de ambiente do Schedule estão em kwargs["ENV"]. Ex: kwargs["ENV"]["DB_HOST"].' },
      { q: "O script de load retorna o quê?", opts: ["Apenas uma lista de dicionários", "Uma tupla: (lista_de_dicionários, novo_control_value)", "Um objecto JSON", "Um ficheiro CSV"], correct: 1, expl: "O load retorna uma tupla com dois elementos: a lista de dicts (que viram Tickets) e o novo control_value." },
      { q: "Qual código de estado significa que um Ticket foi processado com sucesso?", opts: ["OK", "SC", "SUCCESS", "COMPLETE"], correct: 1, expl: "SC é o código de sucesso definido em task_engine.choices." },
      { q: "Onde são registados os detalhes de erro quando uma Action falha?", opts: ["No Schedule", "No TicketActionLogError", "Num ficheiro de log", "No control_value"], correct: 1, expl: "O TicketActionLogError regista exception_type e exception_message para diagnóstico." },
      { q: "Para que serve actualizar o control_value no final?", opts: ["Para limpar a memória", "Para que a próxima execução processe apenas dados novos", "Para desactivar o Schedule", "Para enviar um alerta"], correct: 1, expl: "O control_value actualizado (ex: nova timestamp) garante que a próxima execução retoma de onde parou." },
      { q: "Podes disparar um Schedule manualmente?", opts: ["Não, só via cron", "Sim, pela interface web", "Sim, mas apenas por API REST", "Não, é preciso editar o cron"], correct: 1, expl: "A interface web permite trigger manual — muito útil para testar automações sem esperar pelo cron." },
      { q: "Se um Schedule tem 3 Actions e a Action 2 falha no Ticket #5, o que acontece ao Ticket #6?", opts: ["Não é processado", "É processado normalmente desde a Action 1", "Começa na Action 3", "Fica em espera"], correct: 1, expl: "Cada Ticket é independente. Se o Ticket #5 falha, o Ticket #6 começa o seu processamento normalmente." },
      { q: "O que regista o TicketActionLog?", opts: ["Apenas erros", "Cada execução de Action por Ticket (sucesso ou erro)", "As variáveis de ambiente", "O código fonte das Actions"], correct: 1, expl: "O TicketActionLog regista cada execução de Action por Ticket — é o histórico completo do que aconteceu." },
      { q: "Um Schedule corre às 8h e o load demora 5 minutos. Às 8h05, o control_value é actualizado. Na próxima execução às 9h, o que recebe o kwargs['control_value']?", opts: ["O valor original de antes das 8h", "O valor actualizado às 8h05", "Nenhum — é sempre vazio", "A hora actual (9h)"], correct: 1, expl: "O control_value é actualizado no final de cada execução bem-sucedida. Na próxima execução, o load recebe o valor mais recente." },
      { q: "O que contém o TicketActionLogError que ajuda no diagnóstico?", opts: ["Apenas a data do erro", "O exception_type e exception_message", "O código da Action", "O nome do utilizador"], correct: 1, expl: "O TicketActionLogError guarda o tipo de excepção e a mensagem de erro, fundamentais para perceber o que correu mal." },
      { q: "Se queres que uma automação processe apenas dados novos a cada execução, que mecanismo usas?", opts: ["Desactivar e reactivar o Schedule", "O control_value para filtrar por data", "Apagar os Tickets antigos", "Mudar a expressão cron"], correct: 1, expl: "O control_value (tipicamente uma timestamp) permite ao load filtrar apenas dados criados desde a última execução." },
    ],
  },
  {
    id: "practical",
    title: "Mãos no Código",
    theory: `Agora vamos ver código real. Cada exemplo é um padrão que vais encontrar (e escrever) frequentemente no IA Engine.

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
      'Load: main(**kwargs) → usa kwargs["ENV"] e kwargs["control_value"]',
      "pymssql: cursor(as_dict=True) para retornar dicionários",
      "Retorno do load: (lista_de_dicts, novo_control_value)",
      "Action: main(**kwargs) → kwargs contém os dados do Ticket + ENV",
      "Django ORM: F() para relações, annotate() para agregações",
      "EXECUTION_STATUS_ERROR em task_engine.choices para filtrar erros",
    ],
    quiz: [
      { q: "No script de load, como acedes à variável DB_HOST?", opts: ['os.environ["DB_HOST"]', 'kwargs["ENV"]["DB_HOST"]', "settings.DB_HOST", "self.env.DB_HOST"], correct: 1, expl: 'Todas as variáveis de ambiente ficam em kwargs["ENV"]. Acedes com kwargs["ENV"]["DB_HOST"].' },
      { q: "Para que serve cursor(as_dict=True) no pymssql?", opts: ["Para executar queries mais rápido", "Para retornar cada row como dicionário em vez de tuplo", "Para encriptar a conexão", "Para activar o modo de debug"], correct: 1, expl: "Com as_dict=True, cada row vem como dicionário (ex: {'produto': 'Aspirina'}), que é o formato que o IA Engine usa para criar Tickets." },
      { q: "Qual o formato de retorno correcto de um script de load?", opts: ["return rows", "return (rows, new_control_value)", "return json.dumps(rows)", "return Ticket(rows)"], correct: 1, expl: "O load retorna uma tupla com dois elementos: a lista de dicionários e o novo control_value." },
      { q: "Numa Action, se o load retornou {'external_id': '123', 'nome': 'Teste'}, como acedes ao 'nome'?", opts: ['kwargs["ticket"]["nome"]', 'kwargs["nome"]', "self.nome", 'kwargs["data"]["nome"]'], correct: 1, expl: "Os dados do Ticket chegam directamente nos kwargs. Acedes com kwargs['nome']." },
      { q: "Uma Action pode aceder às variáveis de ambiente (ENV)?", opts: ["Não, apenas o load tem acesso", "Sim, via kwargs['ENV']", "Sim, via os.environ", "Apenas se for a primeira Action"], correct: 1, expl: "As Actions também recebem o ENV nos kwargs, exactamente como o load." },
      { q: "Para que serve F() no Django ORM?", opts: ["Formatar texto", "Aceder a campos de relações entre modelos", "Filtrar por data", "Fazer debug"], correct: 1, expl: "F() permite referenciar campos de modelos relacionados, como schedule_name=F('schedule__name')." },
      { q: "Qual constante usas para filtrar tickets com erro?", opts: ["STATUS_ERROR", "EXECUTION_STATUS_ERROR", "TICKET_FAILED", "ERROR"], correct: 1, expl: "A constante EXECUTION_STATUS_ERROR de task_engine.choices identifica tickets com erro." },
      { q: "Se response.raise_for_status() detecta um erro HTTP, o que acontece?", opts: ["Retorna None", "Lança uma excepção", "Ignora o erro", "Retorna um código de erro"], correct: 1, expl: "raise_for_status() lança uma excepção HTTPError se o status code não for 2xx, o que marca o Ticket como erro no IA Engine." },
      { q: "Qual o formato típico do control_value quando é uma data?", opts: ["DD/MM/YYYY", "%Y-%m-%d %H:%M:%S (ex: 2025-08-05 13:00:00)", "Unix timestamp", "ISO 8601 com timezone"], correct: 1, expl: "O formato padrão é '%Y-%m-%d %H:%M:%S', por exemplo '2025-08-05 13:00:00'." },
      { q: "No load, para que serve a linha conn.close()?", opts: ["Para apagar os dados", "Para fechar a conexão à BD e libertar recursos", "Para fazer commit", "Para encriptar a conexão"], correct: 1, expl: "conn.close() fecha a conexão ao SQL Server e liberta recursos. Sem isto, conexões ficam abertas e podem esgotar o pool." },
      { q: "Se o load retorna (rows, new_control_value) e rows é uma lista vazia, o control_value é actualizado?", opts: ["Sim, é sempre actualizado", "Depende da implementação", "Não, nunca", "Apenas se houver fallback"], correct: 1, expl: "O comportamento depende da implementação do IA Engine — mas tipicamente o control_value é retornado pelo script e pode ser actualizado mesmo sem Tickets." },
      { q: "No Django ORM, para que serve .annotate()?", opts: ["Para adicionar comentários ao código", "Para adicionar campos calculados (como contagens) ao resultado", "Para filtrar resultados", "Para ordenar resultados"], correct: 1, expl: "annotate() adiciona campos calculados ao queryset, como Count(), Sum(), Avg(), etc." },
      { q: "Qual a diferença entre .filter() e .values() no Django ORM?", opts: [".filter() ordena, .values() filtra", ".filter() selecciona rows, .values() selecciona colunas", "São iguais", ".filter() é para leitura, .values() para escrita"], correct: 1, expl: ".filter() aplica condições WHERE (selecciona quais rows). .values() define quais campos/colunas retornar (como SELECT no SQL)." },
    ],
  },
  {
    id: "infra",
    title: "Infraestrutura",
    theory: `Não precisas de ser especialista em infra para usar o IA Engine, mas ajuda saber como as peças se ligam por baixo. Isto é especialmente útil quando precisas de resolver problemas.

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
    quiz: [
      { q: "Quem executa realmente o código das automações?", opts: ["O Django directamente", "Os Celery workers", "O Redis", "O Nginx"], correct: 1, expl: "Os Celery workers são os processos que pegam nas tarefas da fila e executam o código Python." },
      { q: "Para que serve o Redis no IA Engine?", opts: ["Base de dados principal", "Broker/correio entre o IA Engine e os Celery workers", "Servidor web", "Motor de busca"], correct: 1, expl: "O Redis funciona como broker — transporta as mensagens de tarefas entre o IA Engine e os workers." },
      { q: "Porque é que cada Team pode ter workers separados?", opts: ["Para gastar menos memória", "Para que automações pesadas de uma equipa não bloqueiem outra", "Porque o Redis exige", "Para separar bases de dados"], correct: 1, expl: "Workers separados por Team garantem isolamento — uma equipa com automações pesadas não afecta as outras." },
      { q: "Qual comando levanta todos os serviços do IA Engine?", opts: ["python manage.py runserver", "docker-compose up", "celery worker start", "npm start"], correct: 1, expl: "O docker-compose up inicia todos os serviços: Django, Redis, Celery, BD, etc." },
      { q: "Qual biblioteca Python conecta ao SQL Server?", opts: ["pyodbc", "pymssql", "psycopg2", "sqlalchemy"], correct: 1, expl: "O pymssql é a biblioteca usada para conectar ao SQL Server no IA Engine." },
      { q: "Em que porta corre o backend Django em desenvolvimento?", opts: ["3000", "8001", "8080", "5000"], correct: 1, expl: "O backend Django corre na porta 8001. O frontend React usa a 3000." },
      { q: "Qual o tipo de autenticação usado entre o frontend e o backend?", opts: ["Cookies de sessão", "JWT (JSON Web Token)", "API Key", "Basic Auth"], correct: 1, expl: "A comunicação frontend-backend usa JWT para autenticação." },
      { q: "Para monitorizar os Celery workers, usas que ferramenta?", opts: ["Grafana", "Flower", "Metabase", "Kibana"], correct: 1, expl: "O Flower corre na porta 5555 e permite monitorizar os Celery workers em tempo real." },
      { q: "Se os Celery workers pararem, o que acontece às automações?", opts: ["Continuam a correr normalmente", "As tarefas ficam na fila (Redis) à espera que os workers reiniciem", "Os dados são perdidos", "O Django executa as tarefas directamente"], correct: 1, expl: "Com os workers parados, as tarefas acumulam na fila do Redis. Quando os workers voltam, processam as tarefas pendentes." },
      { q: "Para que serve o PostgreSQL no IA Engine?", opts: ["Base de dados principal", "Apenas como backend do Metabase (dashboards)", "Cache de sessões", "Fila do Celery"], correct: 1, expl: "O PostgreSQL é usado exclusivamente como backend do Metabase para analytics e dashboards. A BD principal é SQL Server." },
      { q: "Qual o papel do Nginx na infraestrutura?", opts: ["Base de dados", "Reverse proxy em produção", "Motor de busca", "Broker de mensagens"], correct: 1, expl: "O Nginx funciona como reverse proxy em produção — recebe os pedidos HTTP e encaminha-os para o Django." },
      { q: "Qual comando usas para aplicar migrações de base de dados no Django?", opts: ["python manage.py makemigrations", "python manage.py migrate", "python manage.py syncdb", "python manage.py dbupdate"], correct: 1, expl: "python manage.py migrate aplica as migrações pendentes à base de dados. makemigrations cria os ficheiros de migração." },
    ],
  },
];

// ═══════════════════════════════════════
// COMPONENT
// ═══════════════════════════════════════

export default function IaEngineOverview() {
  const navigate = useNavigate();
  const [currentSection, setCurrentSection] = useState(0);
  const [currentTab, setCurrentTab] = useState(() => {
    const tabs = {};
    SECTIONS.forEach(s => { tabs[s.id] = "theory"; });
    return tabs;
  });
  const [quizAnswers, setQuizAnswers] = useState({});
  const [completedSections, setCompletedSections] = useState(new Set());

  const section = SECTIONS[currentSection];
  const tab = currentTab[section.id] || "theory";
  const answers = quizAnswers[section.id] || {};

  const progressPct = Math.round((completedSections.size / SECTIONS.length) * 100);

  const goToSection = (idx) => {
    setCurrentSection(idx);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const switchTab = (newTab) => {
    setCurrentTab(prev => ({ ...prev, [section.id]: newTab }));
  };

  const answerQuiz = (qi, oi) => {
    if (answers[qi] !== undefined) return;
    const newAnswers = { ...quizAnswers, [section.id]: { ...answers, [qi]: oi } };
    setQuizAnswers(newAnswers);
    if (Object.keys(newAnswers[section.id]).length === section.quiz.length) {
      setCompletedSections(prev => new Set([...prev, section.id]));
    }
  };

  const retryQuiz = () => {
    setQuizAnswers(prev => { const next = { ...prev }; delete next[section.id]; return next; });
    setCompletedSections(prev => { const next = new Set(prev); next.delete(section.id); return next; });
  };

  const letters = ["A", "B", "C", "D"];
  const totalAnswered = Object.keys(answers).length;
  const totalQuestions = section.quiz.length;
  const allAnswered = totalAnswered === totalQuestions && totalQuestions > 0;
  const correctCount = allAnswered
    ? Object.entries(answers).filter(([qi, ai]) => ai === section.quiz[Number(qi)].correct).length
    : 0;

  // Convert theory to HTML
  const theoryHtml = convertTheoryToHtml(section.theory);

  return (
    <div className="api-study-page">
      {/* Back Button */}
      <div className="back-btn-bar">
        <button className="back-btn" onClick={() => navigate("/")}>
          ← Voltar à Home
        </button>
      </div>

      {/* Hero */}
      <header className="hero">
        <img src="https://nossafarmacia.vtexassets.com/assets/vtex.file-manager-graphql/images/f432f301-b5fa-4453-aa24-22ea02396e16___13e59f7056915bc23b198375758778f6.png" alt="Nossa Farmácia" className="hero-logo" />
        <div className="hero-badge">task_engine · Guia de Estudo</div>
        <h1>IA Engine — <em>Visão Geral</em></h1>
        <p>Arquitectura, modelos core, fluxo de execução e integrações da plataforma.</p>
      </header>

      {/* Progress Bar */}
      <div className="progress-bar-container">
        <span className="progress-label">Progresso</span>
        <div className="progress-track">
          <div className="progress-fill" style={{ width: `${progressPct}%` }} />
        </div>
        <span className="progress-pct">{progressPct}%</span>
      </div>

      {/* Nav */}
      <nav className="nav">
        {SECTIONS.map((s, i) => (
          <button
            key={s.id}
            className={`nav-btn ${i === currentSection ? "active" : ""}`}
            onClick={() => goToSection(i)}
          >
            {i + 1}. {s.title}
            {completedSections.has(s.id) && <span className="nav-check">✓</span>}
          </button>
        ))}
      </nav>

      {/* Main Content */}
      <main className="api-main">
        <div className="section">
          <div className="section-header">
            <span className="section-num">{currentSection + 1} / {SECTIONS.length}</span>
            <h2 className="section-title">{section.title}</h2>
          </div>

          <div className="tabs">
            <button className={`tab-btn ${tab === "theory" ? "active" : ""}`} onClick={() => switchTab("theory")}>Teoria</button>
            <button className={`tab-btn ${tab === "quiz" ? "active" : ""}`} onClick={() => switchTab("quiz")}>Quiz ({section.quiz.length})</button>
          </div>

          {/* Theory */}
          {tab === "theory" && (
            <div>
              <div dangerouslySetInnerHTML={{ __html: theoryHtml }} />
              {/* Key Points */}
              {section.keyPoints && (
                <div className="callout" style={{ marginTop: "1.5rem" }}>
                  <div className="callout-label">Pontos-Chave</div>
                  <ul>
                    {section.keyPoints.map((p, i) => (
                      <li key={i} dangerouslySetInnerHTML={{ __html: p.replace(/`([^`]+)`/g, '<code>$1</code>') }} />
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {/* Quiz */}
          {tab === "quiz" && (
            <div>
              {section.quiz.map((q, qi) => {
                const answered = answers[qi] !== undefined;
                const isCorrect = answered && answers[qi] === q.correct;
                const cardClass = answered ? (isCorrect ? "correct" : "wrong") : "";

                return (
                  <div key={qi} className={`quiz-card ${cardClass}`}>
                    <div className="quiz-num">Pergunta {qi + 1} de {section.quiz.length}</div>
                    <div className="quiz-question" dangerouslySetInnerHTML={{ __html: q.q }} />
                    <div className="quiz-options">
                      {q.opts.map((opt, oi) => {
                        let optClass = answered ? "disabled" : "";
                        if (answered && oi === answers[qi] && isCorrect) optClass += " selected-correct";
                        if (answered && oi === answers[qi] && !isCorrect) optClass += " selected-wrong";
                        if (answered && oi === q.correct && !isCorrect) optClass += " show-correct";

                        return (
                          <button key={oi} className={`quiz-opt ${optClass}`} onClick={() => !answered && answerQuiz(qi, oi)}>
                            <span className="opt-letter">{letters[oi]}</span>
                            <span dangerouslySetInnerHTML={{ __html: opt }} />
                          </button>
                        );
                      })}
                    </div>
                    {answered && (
                      <div className={`quiz-explanation ${isCorrect ? "correct-expl" : "wrong-expl"}`}>
                        <strong>{isCorrect ? "✓ Correcto!" : "✗ Incorrecto."}</strong>{" "}
                        <span dangerouslySetInnerHTML={{ __html: q.expl }} />
                      </div>
                    )}
                  </div>
                );
              })}

              {allAnswered && (
                <div className="quiz-results">
                  <div className="quiz-score">{correctCount}/{totalQuestions}</div>
                  <div className="quiz-score-label">{Math.round((correctCount / totalQuestions) * 100)}% correcto</div>
                  <button className="quiz-retry" onClick={retryQuiz}>Repetir Quiz</button>
                </div>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
