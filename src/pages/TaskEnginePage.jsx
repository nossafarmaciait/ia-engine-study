import { useState, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import "./ApiStudyPage.css";

// ═══════════════════════════════════════
// DATA
// ═══════════════════════════════════════
const SECTIONS = [
  {
    id: "intro",
    title: "O que é o Task Engine?",
    theory: [
      {
        heading: "Definição",
        body: `<p>O <strong>task_engine</strong> é a app Django responsável pela <strong>execução agendada de scripts Python</strong> no IA Engine. Funciona como um scheduler inteligente que combina:</p>
<ul>
<li><strong>Scripts</strong> — código Python guardado na base de dados</li>
<li><strong>Schedules</strong> — agendamentos com expressões cron</li>
<li><strong>Actions</strong> — passos de execução encadeáveis em pipelines</li>
<li><strong>Tickets</strong> — unidades de trabalho geradas por cada execução</li>
</ul>
<p>Toda a execução é gerida por <strong>Celery workers</strong> em background, com filas dedicadas por tipo de operação.</p>`
      },
      {
        heading: "Arquitectura geral",
        body: `<p>O fluxo de alto nível:</p>
<ul>
<li><strong>Celery Beat</strong> — a cada 10 segundos, verifica quais Schedules precisam de executar</li>
<li><strong>Fila execute-schedule</strong> — executa o script principal do Schedule</li>
<li><strong>Fila process-ticket</strong> — processa cada Ticket gerado através do pipeline de Actions</li>
<li><strong>Fila notify-execution</strong> — envia notificações (email) conforme configuração</li>
</ul>`,
        callout: { label: "Importante", text: "Os scripts são executados via <code>exec()</code> — o código Python é lido da base de dados e executado dinamicamente. Não existem ficheiros .py no servidor para cada script." }
      },
      {
        heading: "Modelos principais",
        body: `<p>Os quatro modelos core e as suas relações:</p>`,
        code: {
          filename: "relacoes.txt",
          content: `<span class="cm">Script</span>
  <span class="cm">│</span>
  <span class="cm">├──→ Schedule (1 script → N schedules)</span>
  <span class="cm">│      │</span>
  <span class="cm">│      ├──→ ScheduleEnvironmentVariable (ENV)</span>
  <span class="cm">│      ├──→ StepSchedule (pipeline de Actions)</span>
  <span class="cm">│      └──→ ScheduleExecution (execuções)</span>
  <span class="cm">│             └──→ Ticket (unidades de trabalho)</span>
  <span class="cm">│                    ├──→ TicketParameter (dados)</span>
  <span class="cm">│                    └──→ TicketActionLog (logs de acções)</span>
  <span class="cm">│                           └──→ TicketActionLogError (erros)</span>
  <span class="cm">│</span>
  <span class="cm">└──→ Action (1 script → N actions)</span>`
        }
      }
    ],
    quiz: [
      {
        q: "O que é o task_engine no IA Engine?",
        opts: ["Uma API REST", "A app Django responsável pela execução agendada de scripts Python", "Um servidor web", "Um motor de base de dados"],
        correct: 1,
        expl: "O task_engine é a app Django que gere a execução agendada de scripts Python via Celery, com Schedules, Actions, Tickets e notificações."
      },
      {
        q: "Com que frequência o Celery Beat verifica quais Schedules precisam de executar?",
        opts: ["A cada 1 segundo", "A cada 10 segundos", "A cada 1 minuto", "A cada 5 minutos"],
        correct: 1,
        expl: "O Celery Beat executa a task <code>search_new_schedule</code> a cada 10 segundos para verificar quais Schedules estão pendentes."
      },
      {
        q: "Onde é guardado o código Python dos scripts no task_engine?",
        opts: ["Em ficheiros .py no servidor", "Na base de dados, no campo <code>code</code> do modelo Script", "No GitHub", "Em variáveis de ambiente"],
        correct: 1,
        expl: "O código Python é guardado na base de dados como texto e executado dinamicamente via <code>exec()</code>."
      },
      {
        q: "Qual destes NÃO é um modelo do task_engine?",
        opts: ["Script", "Schedule", "FunctionService", "Ticket"],
        correct: 2,
        expl: "<code>FunctionService</code> pertence ao <code>api_engine</code>, não ao <code>task_engine</code>. Os modelos do task_engine são Script, Schedule, Action, Ticket, etc."
      }
    ]
  },
  {
    id: "script",
    title: "O Modelo Script",
    theory: [
      {
        heading: "Campos do Script",
        body: `<ul>
<li><strong>name</strong> — nome identificador do script</li>
<li><strong>code</strong> — o código Python completo (guardado como texto na BD)</li>
<li><strong>script_type</strong> — tipo do script (por defeito <code>'schedule'</code>)</li>
<li><strong>created_date / updated_date</strong> — timestamps automáticos</li>
<li><strong>history</strong> — registo histórico de todas as alterações (via django-simple-history)</li>
</ul>`
      },
      {
        heading: "A função main(**kwargs)",
        body: `<p>Todo script do task_engine <strong>deve</strong> definir uma função <code>main(**kwargs)</code>. Os kwargs contêm:</p>
<ul>
<li><strong><code>kwargs["ENV"]</code></strong> — dicionário com variáveis de ambiente (credenciais, URLs, etc.)</li>
<li><strong><code>kwargs["control_value"]</code></strong> — último valor de controlo (para paginação/estado entre execuções)</li>
<li><strong><code>kwargs["ticket_id"]</code></strong> — ID do ticket (quando executado dentro de um pipeline de Actions)</li>
</ul>`,
        code: {
          filename: "script_basico.py",
          content: `<span class="kw">def</span> <span class="fn">main</span>(**kwargs):
    env = kwargs[<span class="st">"ENV"</span>]
    control_value = kwargs.get(<span class="st">"control_value"</span>, <span class="st">""</span>)

    <span class="cm"># Lógica de negócio...</span>
    resultado = processar_dados(env)

    <span class="cm"># Retorno: (dados, control_value)</span>
    <span class="kw">return</span> resultado, <span class="st">"ultimo_id_processado"</span>`
        }
      },
      {
        heading: "Retorno da main()",
        body: `<p>A <code>main()</code> pode retornar de duas formas:</p>
<ul>
<li><strong>Tuplo <code>(dados, control_value)</code></strong> — o <code>control_value</code> é guardado no Schedule para a próxima execução (útil para paginação)</li>
<li><strong>Apenas <code>dados</code></strong> — sem control_value (o campo fica vazio)</li>
</ul>
<p>Se os <code>dados</code> forem uma <strong>lista de dicionários</strong> e o Schedule tiver <strong>StepSchedules (Actions)</strong> configurados, cada elemento da lista gera um <strong>Ticket</strong> que será processado pelo pipeline de Actions.</p>`,
        callout: { label: "Chave", text: "O retorno é o que define o comportamento: um dicionário simples é apenas um resultado. Uma lista de dicionários + Actions configuradas = pipeline de Tickets." }
      },
      {
        heading: "Como o exec() funciona",
        body: `<p>O método <code>Script.execute()</code> faz o seguinte internamente:</p>`,
        code: {
          filename: "script_execute.py",
          content: `<span class="cm"># Simplificação do que o Script.execute() faz:</span>

<span class="cm"># 1. Captura stdout/stderr</span>
<span class="cm"># 2. Executa o código do script no scope global</span>
<span class="fn">exec</span>(self.code, <span class="fn">globals</span>())

<span class="cm"># 3. Chama a main() definida no código</span>
result = main(**parameters)

<span class="cm"># 4. Retorna tuplo:</span>
<span class="cm"># (status, return_data, execution_log, control_value, error_info)</span>
<span class="cm">#</span>
<span class="cm"># status       → True se não houve erros</span>
<span class="cm"># return_data  → o que a main() retornou</span>
<span class="cm"># execution_log → stdout + stderr combinados</span>
<span class="cm"># control_value → para paginação entre execuções</span>
<span class="cm"># error_info   → detalhes da excepção (se houver)</span>`
        }
      }
    ],
    quiz: [
      {
        q: "Qual a função obrigatória num script do task_engine?",
        opts: ["<code>run(**kwargs)</code>", "<code>main(**kwargs)</code>", "<code>execute(**kwargs)</code>", "<code>handler(**kwargs)</code>"],
        correct: 1,
        expl: "A função obrigatória é <code>main(**kwargs)</code>. O método <code>Script.execute()</code> chama-a automaticamente após executar o código via <code>exec()</code>."
      },
      {
        q: "O que é o <code>control_value</code> no retorno da main()?",
        opts: ["O status de erro", "Um valor guardado para a próxima execução (paginação/estado)", "O nome do script", "A data de execução"],
        correct: 1,
        expl: "O <code>control_value</code> é guardado no Schedule e passado como <code>kwargs['control_value']</code> na próxima execução, permitindo paginação ou tracking de estado."
      },
      {
        q: "Se a <code>main()</code> retornar uma lista de dicionários e houver Actions configuradas, o que acontece?",
        opts: ["Nada, o resultado é ignorado", "Cada dicionário da lista gera um Ticket processado pelo pipeline de Actions", "A lista é guardada na BD como JSON", "É enviada por email"],
        correct: 1,
        expl: "Cada elemento da lista gera um Ticket com TicketParameters, e cada Ticket é processado sequencialmente pelo pipeline de Actions (StepSchedules)."
      },
      {
        q: "Como é que o código Python dos scripts é executado?",
        opts: ["<code>import</code> dinâmico", "<code>subprocess.run()</code>", "<code>exec(self.code, globals())</code>", "<code>eval()</code>"],
        correct: 2,
        expl: "O código é executado via <code>exec(self.code, globals())</code>, o que torna as funções definidas no script disponíveis no scope global para serem chamadas."
      },
      {
        q: "As alterações ao código de um Script são rastreadas?",
        opts: ["Não, são sobrescritas", "Sim, via django-simple-history (HistoricalRecords)", "Apenas via git", "Apenas manualmente"],
        correct: 1,
        expl: "O modelo Script usa <code>HistoricalRecords</code> do django-simple-history, que regista cada alteração ao código com timestamp e utilizador."
      }
    ]
  },
  {
    id: "schedule",
    title: "Schedule & Cron",
    theory: [
      {
        heading: "O modelo Schedule",
        body: `<p>O <strong>Schedule</strong> é o agendamento que define <em>quando</em> e <em>como</em> um script é executado:</p>
<ul>
<li><strong>name / description</strong> — identificação e documentação</li>
<li><strong>script</strong> — FK para o Script a executar</li>
<li><strong>cron</strong> — expressão cron (ex: <code>*/5 * * * *</code>)</li>
<li><strong>active</strong> — se o agendamento está activo</li>
<li><strong>last_execution</strong> — timestamp da última execução</li>
<li><strong>last_value</strong> — último control_value retornado</li>
<li><strong>team</strong> — isolamento multi-tenant</li>
<li><strong>notification_type</strong> — quando notificar (NE=nunca, ER=erro, SC=sucesso, AL=sempre)</li>
<li><strong>emails_to_notification</strong> — destinatários das notificações</li>
<li><strong>fallback_execution</strong> — se activa a Action de fallback em caso de erro</li>
<li><strong>fallback_action</strong> — FK para a Action executada em caso de falha</li>
<li><strong>skip_duplicate_external_id</strong> — evita criar Tickets duplicados</li>
</ul>`
      },
      {
        heading: "Expressões Cron",
        body: `<p>As expressões cron definem a periodicidade. Formato: <code>minuto hora dia_mes mês dia_semana</code></p>`,
        code: {
          filename: "exemplos_cron.txt",
          content: `<span class="cm"># A cada 5 minutos</span>
<span class="st">*/5 * * * *</span>

<span class="cm"># A cada hora, ao minuto 0</span>
<span class="st">0 * * * *</span>

<span class="cm"># Todos os dias às 8h00</span>
<span class="st">0 8 * * *</span>

<span class="cm"># De segunda a sexta às 9h30</span>
<span class="st">30 9 * * 1-5</span>

<span class="cm"># Primeiro dia de cada mês às 6h00</span>
<span class="st">0 6 1 * *</span>

<span class="cm"># A cada 15 minutos, das 8h às 20h</span>
<span class="st">*/15 8-20 * * *</span>

<span class="cm"># Todos os dias às 3h00 e 15h00</span>
<span class="st">0 3,15 * * *</span>`
        }
      },
      {
        heading: "Variáveis de ambiente (ScheduleEnvironmentVariable)",
        body: `<p>Cada Schedule pode ter <strong>variáveis de ambiente</strong> associadas. São guardadas <strong>encriptadas</strong> na BD via <code>django.core.signing</code> e desencriptadas apenas no momento da execução.</p>`,
        code: {
          filename: "env_vars.py",
          content: `<span class="cm"># As ENV vars são passadas ao script nos kwargs:</span>
<span class="kw">def</span> <span class="fn">main</span>(**kwargs):
    env = kwargs[<span class="st">"ENV"</span>]

    <span class="cm"># Variáveis típicas configuradas no Schedule:</span>
    db_host = env[<span class="st">"DATABASE_IP"</span>]
    db_user = env[<span class="st">"DATABASE_USER"</span>]
    db_pass = env[<span class="st">"DATABASE_PASSWORD"</span>]
    db_name = env[<span class="st">"DATABASE_NAME"</span>]
    api_key = env[<span class="st">"API_KEY"</span>]
    webhook = env[<span class="st">"TEAMS_WEBHOOK_URL"</span>]`
        },
        callout: { label: "Segurança", text: "Os valores das variáveis de ambiente são encriptados na BD com <code>django.core.signing.dumps()</code>. Nunca são guardados em texto limpo. São desencriptados apenas no momento da execução do script." }
      },
      {
        heading: "Tipos de notificação",
        body: `<p>O campo <code>notification_type</code> controla quando o Schedule envia notificações por email:</p>
<ul>
<li><strong>NE (Never)</strong> — nunca notifica</li>
<li><strong>ER (Error)</strong> — notifica apenas quando a execução falha</li>
<li><strong>SC (Success)</strong> — notifica apenas quando a execução tem sucesso</li>
<li><strong>AL (Always)</strong> — notifica sempre, independentemente do resultado</li>
</ul>`
      }
    ],
    quiz: [
      {
        q: "O que significa a expressão cron <code>*/5 * * * *</code>?",
        opts: ["A cada 5 horas", "A cada 5 minutos", "Às 5h de cada dia", "5 vezes por hora"],
        correct: 1,
        expl: "<code>*/5</code> no campo de minutos significa 'a cada 5 minutos'. Os asteriscos nos restantes campos significam 'qualquer valor'."
      },
      {
        q: "Como são guardadas as variáveis de ambiente de um Schedule?",
        opts: ["Em texto limpo na BD", "Num ficheiro .env no servidor", "Encriptadas na BD via django.core.signing", "Em variáveis de ambiente do sistema operativo"],
        correct: 2,
        expl: "Os valores são encriptados com <code>django.core.signing.dumps()</code> ao guardar e desencriptados com <code>loads()</code> apenas no momento da execução."
      },
      {
        q: "O que faz o campo <code>last_value</code> de um Schedule?",
        opts: ["Guarda o último resultado completo", "Guarda o control_value retornado pelo script para a próxima execução", "Guarda a data da última execução", "Guarda o estado do script"],
        correct: 1,
        expl: "O <code>last_value</code> guarda o <code>control_value</code> retornado pela <code>main()</code>, permitindo que a próxima execução continue de onde parou."
      },
      {
        q: "Qual notification_type se deve usar para ser notificado apenas quando o script falha?",
        opts: ["NE (Never)", "ER (Error)", "SC (Success)", "AL (Always)"],
        correct: 1,
        expl: "<code>ER</code> (Error) envia notificação apenas quando a execução termina com erro, ideal para monitorização de falhas."
      },
      {
        q: "O que faz o campo <code>skip_duplicate_external_id</code>?",
        opts: ["Ignora scripts duplicados", "Evita criar Tickets com external_id já existente", "Remove Schedules duplicados", "Desactiva o Schedule"],
        correct: 1,
        expl: "Quando activo, verifica se já existe um Ticket com o mesmo <code>external_id</code> e, se existir, não cria um duplicado."
      }
    ]
  },
  {
    id: "ciclo-vida",
    title: "Ciclo de Vida da Execução",
    theory: [
      {
        heading: "Estados de execução",
        body: `<p>Cada ScheduleExecution e Ticket passa por estes estados:</p>
<ul>
<li><strong>PE (Pending)</strong> — estado inicial, aguarda processamento</li>
<li><strong>QU (Queue)</strong> — na fila do Celery, aguarda worker disponível</li>
<li><strong>RT (Queue Retry)</strong> — na fila para nova tentativa após falha</li>
<li><strong>PR (Processing)</strong> — em execução por um worker</li>
<li><strong>CT (Creating Tickets)</strong> — a criar Tickets a partir do resultado</li>
<li><strong>SC (Success)</strong> — execução concluída com sucesso</li>
<li><strong>ER (Error)</strong> — execução falhou</li>
<li><strong>CA (Canceled)</strong> — cancelada manualmente</li>
</ul>`
      },
      {
        heading: "Fase 1: Descoberta (Celery Beat)",
        body: `<p>A cada <strong>10 segundos</strong>, o Celery Beat executa a task <code>search_new_schedule</code>:</p>`,
        code: {
          filename: "fase1_descoberta.py",
          content: `<span class="cm"># Pseudo-código do search_new_schedule (a cada 10 seg):</span>

<span class="kw">for</span> schedule <span class="kw">in</span> Schedule.objects.filter(active=<span class="kw">True</span>):
    <span class="kw">if</span> cron_matches_now(schedule.cron) \
       <span class="kw">and</span> schedule.last_execution != current_minute:

        <span class="cm"># Envia para a fila execute-schedule</span>
        execute_schedule.apply_async(
            args=[schedule.id],
            queue=<span class="st">"execute-schedule"</span>  <span class="cm"># ou fila da team</span>
        )
        schedule.last_execution = now()
        schedule.save()`
        }
      },
      {
        heading: "Fase 2: Execução do Schedule",
        body: `<p>Um worker da fila <code>execute-schedule</code> processa o agendamento (timeout: <strong>29 minutos</strong>):</p>`,
        code: {
          filename: "fase2_execucao.py",
          content: `<span class="cm"># Pseudo-código do execute_schedule:</span>

<span class="cm"># 1. Criar ScheduleExecution (status=PENDING)</span>
execution = ScheduleExecution.create(schedule, status=<span class="st">"PE"</span>)

<span class="cm"># 2. Carregar variáveis de ambiente</span>
params = {<span class="st">"ENV"</span>: {}}
<span class="kw">for</span> env_var <span class="kw">in</span> schedule.environment_variables.all():
    params[<span class="st">"ENV"</span>][env_var.name] = env_var.load_value  <span class="cm"># desencripta</span>
params[<span class="st">"control_value"</span>] = schedule.last_value

<span class="cm"># 3. Executar script</span>
status, data, log, control_value, error_info = \
    schedule.script.execute(params)

<span class="cm"># 4. Actualizar execução</span>
execution.execution_status = <span class="st">"SC"</span> <span class="kw">if</span> status <span class="kw">else</span> <span class="st">"ER"</span>
execution.execution_log = log

<span class="cm"># 5. Se data é lista e há Actions → criar Tickets</span>
<span class="kw">if</span> <span class="fn">isinstance</span>(data, <span class="fn">list</span>) <span class="kw">and</span> step_schedules_exist:
    execution.execution_status = <span class="st">"CT"</span>  <span class="cm"># Creating Tickets</span>
    <span class="kw">for</span> item <span class="kw">in</span> data:
        ticket = Ticket.create(schedule, execution)
        <span class="kw">for</span> key, value <span class="kw">in</span> item.items():
            TicketParameter.create(ticket, key, value)
        process_ticket.apply_async(args=[ticket.id])

<span class="cm"># 6. Guardar control_value para próxima execução</span>
schedule.last_value = control_value`
        }
      },
      {
        heading: "Fase 3: Processamento de Tickets",
        body: `<p>Cada Ticket é processado pelo pipeline de Actions, na ordem definida pelos <code>StepSchedules</code>:</p>`,
        code: {
          filename: "fase3_tickets.py",
          content: `<span class="cm"># Pseudo-código do process_ticket:</span>

<span class="cm"># 1. Carregar parâmetros do ticket</span>
params = {<span class="st">"ENV"</span>: {}, <span class="st">"ticket_id"</span>: ticket.id}
<span class="kw">for</span> env_var <span class="kw">in</span> schedule.environment_variables.all():
    params[<span class="st">"ENV"</span>][env_var.name] = env_var.load_value
<span class="kw">for</span> tp <span class="kw">in</span> ticket.parameters.all():
    params[tp.name] = tp.value

<span class="cm"># 2. Executar cada Action por ordem</span>
<span class="kw">for</span> step <span class="kw">in</span> StepSchedule.objects.order_by(<span class="st">"execution_order"</span>):
    status, data, log, _, error = step.action.script.execute(params)

    <span class="cm"># Logar resultado</span>
    TicketActionLog.create(ticket, step.action, log, status)

    <span class="kw">if</span> status <span class="kw">and</span> <span class="fn">isinstance</span>(data, <span class="fn">dict</span>):
        <span class="cm"># Actualizar parâmetros para a próxima Action</span>
        <span class="kw">for</span> key, value <span class="kw">in</span> data.items():
            params[key] = value
            TicketParameter.update_or_create(ticket, key, value)

    <span class="kw">elif not</span> status <span class="kw">and</span> step.stoppable:
        ticket.execution_status = <span class="st">"ER"</span>
        <span class="cm"># Executar fallback_action se configurado</span>
        <span class="kw">break</span>

<span class="cm"># 3. Se todas as Actions passaram</span>
ticket.execution_status = <span class="st">"SC"</span>`
        },
        callout: { label: "Pipeline", text: "Os dados retornados por cada Action são adicionados aos parâmetros do Ticket e ficam disponíveis para a Action seguinte. Isto permite que Actions comuniquem entre si através de TicketParameters." }
      }
    ],
    quiz: [
      {
        q: "Qual o estado inicial de uma ScheduleExecution?",
        opts: ["QU (Queue)", "PR (Processing)", "PE (Pending)", "SC (Success)"],
        correct: 2,
        expl: "Toda ScheduleExecution começa no estado <code>PE</code> (Pending) antes de ser processada pelo worker."
      },
      {
        q: "O que significa o estado CT (Creating Tickets)?",
        opts: ["A execução foi cancelada", "O sistema está a criar Tickets a partir da lista retornada pelo script", "Houve um erro de timeout", "A execução está em fila"],
        correct: 1,
        expl: "O estado <code>CT</code> indica que o script retornou uma lista e o sistema está a criar Tickets para cada elemento, antes de os enviar para processamento."
      },
      {
        q: "Qual o timeout de execução de um Schedule?",
        opts: ["5 minutos", "15 minutos", "29 minutos", "1 hora"],
        correct: 2,
        expl: "O hard time limit é de 1740 segundos (29 minutos). O soft time limit é de 1620 segundos (27 minutos), que lança <code>SoftTimeLimitExceeded</code>."
      },
      {
        q: "Como é que os dados fluem entre Actions num pipeline de Tickets?",
        opts: ["Via ficheiros temporários", "Cada Action retorna um dict que actualiza os TicketParameters para a Action seguinte", "Via variáveis globais", "Via base de dados directa"],
        correct: 1,
        expl: "Cada Action retorna um dicionário. Os pares chave-valor são adicionados aos TicketParameters e ficam disponíveis nos kwargs da Action seguinte."
      },
      {
        q: "O que acontece se uma Action falhar e o StepSchedule tiver <code>stoppable=True</code>?",
        opts: ["Continua para a próxima Action", "O Ticket fica com estado Error e o pipeline pára", "O Ticket é eliminado", "É feito retry automaticamente"],
        correct: 1,
        expl: "Se <code>stoppable=True</code> e a Action falhar, o pipeline pára, o Ticket fica com estado <code>ER</code> e, se configurado, executa a fallback_action."
      }
    ]
  },
  {
    id: "actions-pipeline",
    title: "Actions & Pipelines",
    theory: [
      {
        heading: "O modelo Action",
        body: `<p>Uma <strong>Action</strong> é um passo de execução que pode ser reutilizado em múltiplos Schedules:</p>
<ul>
<li><strong>name / description</strong> — identificação</li>
<li><strong>script</strong> — FK para o Script com o código</li>
<li><strong>action_type</strong> — <code>main</code> (normal) ou <code>fallback</code> (executada em caso de erro)</li>
<li><strong>team</strong> — isolamento multi-tenant</li>
<li><strong>active / hidden</strong> — controlo de visibilidade</li>
</ul>`
      },
      {
        heading: "StepSchedule — Pipeline de execução",
        body: `<p>O <strong>StepSchedule</strong> é o modelo que associa Actions a um Schedule, definindo a <strong>ordem de execução</strong>:</p>
<ul>
<li><strong>schedule</strong> — FK para o Schedule</li>
<li><strong>action</strong> — FK para a Action</li>
<li><strong>execution_order</strong> — número que define a posição no pipeline (0, 1, 2...)</li>
<li><strong>stoppable</strong> — se um erro neste passo deve parar o pipeline</li>
</ul>`,
        code: {
          filename: "pipeline_exemplo.txt",
          content: `<span class="cm">Schedule: "Sync Encomendas VTEX"</span>
<span class="cm">├── Script principal: busca encomendas novas → retorna lista</span>
<span class="cm">│</span>
<span class="cm">StepSchedules (pipeline para cada Ticket):</span>
<span class="cm">│</span>
<span class="cm">├── Ordem 0: Action "Validar Encomenda"   (stoppable: true)</span>
<span class="cm">│   └── Verifica dados, valida cliente</span>
<span class="cm">│</span>
<span class="cm">├── Ordem 1: Action "Criar no Odoo"       (stoppable: true)</span>
<span class="cm">│   └── Cria encomenda no ERP</span>
<span class="cm">│</span>
<span class="cm">├── Ordem 2: Action "Gerar Factura"       (stoppable: true)</span>
<span class="cm">│   └── Emite factura via Moloni</span>
<span class="cm">│</span>
<span class="cm">└── Ordem 3: Action "Notificar"           (stoppable: false)</span>
<span class="cm">    └── Envia confirmação ao cliente</span>`
        }
      },
      {
        heading: "Script de Action vs Script de Schedule",
        body: `<p>A estrutura é a mesma (<code>main(**kwargs)</code>), mas os <strong>kwargs são mais ricos</strong> numa Action:</p>`,
        code: {
          filename: "action_script.py",
          content: `<span class="kw">def</span> <span class="fn">main</span>(**kwargs):
    env = kwargs[<span class="st">"ENV"</span>]
    ticket_id = kwargs[<span class="st">"ticket_id"</span>]

    <span class="cm"># Parâmetros vindos do Schedule ou de Actions anteriores</span>
    order_id = kwargs.get(<span class="st">"order_id"</span>)
    cliente = kwargs.get(<span class="st">"nome_cliente"</span>)

    <span class="cm"># Lógica do passo...</span>
    odoo_id = criar_no_odoo(env, order_id, cliente)

    <span class="cm"># Retornar dados para a próxima Action</span>
    <span class="kw">return</span> {
        <span class="st">"odoo_id"</span>: odoo_id,
        <span class="st">"estado"</span>: <span class="st">"criado_no_erp"</span>,
    }`
        },
        callout: { label: "Nota", text: 'O dicionário retornado por cada Action é "acumulado" nos TicketParameters. A Action seguinte recebe os seus kwargs + todos os dados de Actions anteriores.' }
      },
      {
        heading: "Retry de Tickets",
        body: `<p>Uma Action pode pedir para o Ticket ser <strong>re-processado</strong> com atraso, retornando a chave especial <code>retry_ticket</code>:</p>`,
        code: {
          filename: "retry_ticket.py",
          content: `<span class="kw">def</span> <span class="fn">main</span>(**kwargs):
    env = kwargs[<span class="st">"ENV"</span>]
    status = verificar_estado_externo(env)

    <span class="kw">if</span> status == <span class="st">"pendente"</span>:
        <span class="cm"># Re-agendar este ticket para daqui a 300 segundos</span>
        <span class="kw">return</span> {
            <span class="st">"retry_ticket"</span>: <span class="nr">300</span>,
            <span class="cm"># Opcionalmente: quais Actions re-executar</span>
            <span class="st">"step_actions_to_process"</span>: [<span class="nr">2</span>, <span class="nr">3</span>],
        }

    <span class="cm"># Processamento normal</span>
    <span class="kw">return</span> {<span class="st">"status"</span>: <span class="st">"concluido"</span>}`
        }
      },
      {
        heading: "Fallback Actions",
        body: `<p>Quando um Schedule tem <code>fallback_execution=True</code> e uma <code>fallback_action</code> configurada, esta Action é executada <strong>automaticamente quando um Ticket falha</strong>.</p>
<p>Uso típico: enviar alerta ao Teams, limpar dados parciais, ou reverter uma operação.</p>`
      }
    ],
    quiz: [
      {
        q: "O que define a ordem de execução das Actions num pipeline?",
        opts: ["A data de criação da Action", "O campo <code>execution_order</code> do StepSchedule", "O nome da Action", "O ID do Script"],
        correct: 1,
        expl: "O campo <code>execution_order</code> do StepSchedule define a posição de cada Action no pipeline (0, 1, 2...)."
      },
      {
        q: "Pode-se reutilizar uma Action em múltiplos Schedules?",
        opts: ["Não, cada Action pertence a um único Schedule", "Sim, via StepSchedule", "Apenas se forem da mesma Team", "Não, é necessário duplicar"],
        correct: 1,
        expl: "Uma Action pode ser associada a vários Schedules via StepSchedules diferentes, permitindo reutilização."
      },
      {
        q: "O que faz <code>retry_ticket: 300</code> no retorno de uma Action?",
        opts: ["Espera 300 milissegundos", "Re-agenda o Ticket para processamento daqui a 300 segundos", "Tenta 300 vezes", "Cancela o Ticket após 300 segundos"],
        correct: 1,
        expl: "A chave <code>retry_ticket</code> com um valor em segundos faz com que o Ticket seja re-adicionado à fila para processamento após o delay indicado."
      },
      {
        q: "Qual a diferença entre <code>stoppable=True</code> e <code>stoppable=False</code>?",
        opts: ["stoppable=True é mais rápido", "stoppable=True pára o pipeline em caso de erro, stoppable=False continua", "Não há diferença", "stoppable=False nunca falha"],
        correct: 1,
        expl: "Com <code>stoppable=True</code>, se a Action falhar, o pipeline pára e o Ticket fica com erro. Com <code>stoppable=False</code>, o pipeline continua para a Action seguinte."
      },
      {
        q: "Quando é executada uma fallback_action?",
        opts: ["Sempre, após cada execução", "Apenas quando um Ticket falha num passo stoppable", "Antes da primeira Action", "Manualmente pelo utilizador"],
        correct: 1,
        expl: "A fallback_action é executada automaticamente quando um Ticket falha num passo com <code>stoppable=True</code>, desde que o Schedule tenha <code>fallback_execution=True</code>."
      }
    ]
  },
  {
    id: "exemplos",
    title: "Exemplos Práticos",
    theory: [
      {
        heading: "Exemplo 1: Script simples de consulta",
        body: `<p>Script de Schedule que consulta dados e retorna resultado sem gerar Tickets:</p>`,
        code: {
          filename: "consulta_simples.py",
          content: `<span class="kw">import</span> pymssql


<span class="kw">class</span> <span class="cl">DatabaseWrapper</span>:
    <span class="kw">def</span> <span class="fn">__init__</span>(self, host, db, user, pwd):
        self.conn = pymssql.connect(host, user, pwd, db)
    <span class="kw">def</span> <span class="fn">query</span>(self, sql, params=<span class="kw">None</span>):
        c = self.conn.cursor(as_dict=<span class="kw">True</span>)
        c.execute(sql, params <span class="kw">or</span> ())
        <span class="kw">return</span> c.fetchall()
    <span class="kw">def</span> <span class="fn">close</span>(self): self.conn.close()


<span class="kw">def</span> <span class="fn">main</span>(**kwargs):
    env = kwargs[<span class="st">"ENV"</span>]

    db = DatabaseWrapper(env[<span class="st">"DATABASE_IP"</span>], env[<span class="st">"DATABASE_NAME"</span>],
                         env[<span class="st">"DATABASE_USER"</span>], env[<span class="st">"DATABASE_PASSWORD"</span>])
    <span class="kw">try</span>:
        rows = db.query(<span class="st">"""
            SELECT COUNT(*) as total
            FROM Encomendas
            WHERE Estado = 'pendente'
              AND DataCriacao >= DATEADD(hour, -1, GETDATE())
        """</span>)
        total = rows[<span class="nr">0</span>][<span class="st">"total"</span>]
        <span class="fn">print</span>(<span class="st">f"Encontradas </span>{total}<span class="st"> encomendas pendentes"</span>)
        <span class="kw">return</span> {<span class="st">"total_pendentes"</span>: total}, <span class="st">""</span>
    <span class="kw">finally</span>:
        db.close()`
        }
      },
      {
        heading: "Exemplo 2: Script com geração de Tickets",
        body: `<p>Script que busca encomendas e retorna uma lista — cada elemento gera um Ticket processado pelo pipeline de Actions:</p>`,
        code: {
          filename: "gerar_tickets.py",
          content: `<span class="kw">import</span> pymssql


<span class="kw">def</span> <span class="fn">main</span>(**kwargs):
    env = kwargs[<span class="st">"ENV"</span>]
    control_value = kwargs.get(<span class="st">"control_value"</span>, <span class="st">"0"</span>)

    db = DatabaseWrapper(env[<span class="st">"DATABASE_IP"</span>], env[<span class="st">"DATABASE_NAME"</span>],
                         env[<span class="st">"DATABASE_USER"</span>], env[<span class="st">"DATABASE_PASSWORD"</span>])
    <span class="kw">try</span>:
        encomendas = db.query(<span class="st">"""
            SELECT EncomendaID, NomeCliente, ValorTotal, Email
            FROM Encomendas
            WHERE EncomendaID > %s AND Estado = 'nova'
            ORDER BY EncomendaID
        """</span>, (control_value,))

        <span class="kw">if not</span> encomendas:
            <span class="fn">print</span>(<span class="st">"Sem encomendas novas"</span>)
            <span class="kw">return</span> [], control_value

        <span class="cm"># Cada dict da lista = 1 Ticket</span>
        tickets = []
        <span class="kw">for</span> enc <span class="kw">in</span> encomendas:
            tickets.append({
                <span class="st">"external_id"</span>: <span class="fn">str</span>(enc[<span class="st">"EncomendaID"</span>]),
                <span class="st">"order_id"</span>: enc[<span class="st">"EncomendaID"</span>],
                <span class="st">"nome_cliente"</span>: enc[<span class="st">"NomeCliente"</span>],
                <span class="st">"valor"</span>: enc[<span class="st">"ValorTotal"</span>],
                <span class="st">"email"</span>: enc[<span class="st">"Email"</span>],
            })

        <span class="cm"># control_value = último ID processado</span>
        ultimo_id = <span class="fn">str</span>(encomendas[-<span class="nr">1</span>][<span class="st">"EncomendaID"</span>])
        <span class="fn">print</span>(<span class="st">f"Gerados </span>{<span class="fn">len</span>(tickets)}<span class="st"> tickets até ID </span>{ultimo_id}<span class="st">"</span>)

        <span class="kw">return</span> tickets, ultimo_id
    <span class="kw">finally</span>:
        db.close()`
        },
        callout: { label: "Dica", text: 'O campo <code>external_id</code> nos dados do ticket é especial — permite usar <code>skip_duplicate_external_id</code> no Schedule para evitar tickets duplicados.' }
      },
      {
        heading: "Exemplo 3: Action de um pipeline",
        body: `<p>Action que recebe dados de um Ticket e cria uma encomenda no Odoo:</p>`,
        code: {
          filename: "action_criar_odoo.py",
          content: `<span class="kw">from</span> odoo <span class="kw">import</span> Odoo


<span class="kw">def</span> <span class="fn">main</span>(**kwargs):
    env = kwargs[<span class="st">"ENV"</span>]
    ticket_id = kwargs[<span class="st">"ticket_id"</span>]

    <span class="cm"># Dados vindos do Schedule ou de Actions anteriores</span>
    order_id = kwargs[<span class="st">"order_id"</span>]
    nome_cliente = kwargs[<span class="st">"nome_cliente"</span>]
    valor = kwargs[<span class="st">"valor"</span>]

    <span class="cm"># Criar no Odoo</span>
    odoo_client = Odoo(
        url=env[<span class="st">"ODOO_URL"</span>], db=env[<span class="st">"ODOO_DB"</span>],
        username=env[<span class="st">"ODOO_USERNAME"</span>], password=env[<span class="st">"ODOO_PASSWORD"</span>]
    )

    partner_id = odoo_client.search(<span class="st">"res.partner"</span>,
        [[<span class="st">"name"</span>, <span class="st">"="</span>, nome_cliente]])

    sale_id = odoo_client.create(<span class="st">"sale.order"</span>, {
        <span class="st">"partner_id"</span>: partner_id[<span class="nr">0</span>],
        <span class="st">"origin"</span>: <span class="st">f"WEB-</span>{order_id}<span class="st">"</span>,
    })

    <span class="fn">print</span>(<span class="st">f"Ticket </span>{ticket_id}<span class="st">: Encomenda Odoo </span>{sale_id}<span class="st"> criada"</span>)

    <span class="cm"># Retornar dados para a próxima Action</span>
    <span class="kw">return</span> {
        <span class="st">"odoo_sale_id"</span>: sale_id,
        <span class="st">"estado_odoo"</span>: <span class="st">"criado"</span>,
    }`
        }
      }
    ],
    quiz: [
      {
        q: "Num script de Schedule, como se indica ao sistema para criar Tickets?",
        opts: ["Chamando <code>create_ticket()</code>", "Retornando uma lista de dicionários na main() (com Actions configuradas)", "Escrevendo na base de dados", "Via uma API REST"],
        correct: 1,
        expl: "Se a <code>main()</code> retornar uma lista de dicionários e o Schedule tiver StepSchedules, cada dicionário gera automaticamente um Ticket."
      },
      {
        q: "Para que serve o campo <code>external_id</code> nos dados de um Ticket?",
        opts: ["É obrigatório", "Permite identificar o ticket externamente e evitar duplicados com skip_duplicate_external_id", "É o ID do Odoo", "Serve para logging"],
        correct: 1,
        expl: "O <code>external_id</code> identifica o ticket com um ID do sistema externo. Com <code>skip_duplicate_external_id</code> activo, evita criar tickets duplicados."
      },
      {
        q: "Como uma Action acede aos dados retornados pela Action anterior?",
        opts: ["Via variáveis globais", "Via <code>kwargs</code> — os dados são adicionados como TicketParameters", "Via ficheiros", "Não pode aceder"],
        correct: 1,
        expl: "Os dados retornados por cada Action são guardados como TicketParameters e passados nos <code>kwargs</code> da Action seguinte."
      },
      {
        q: "Qual a utilidade do <code>control_value</code> no exemplo de geração de Tickets?",
        opts: ["Guardar a data", "Guardar o último ID processado para a próxima execução continuar de onde parou", "Contar os tickets", "Validar os dados"],
        correct: 1,
        expl: "O <code>control_value</code> guarda o último ID processado. Na próxima execução, o script lê-o dos kwargs e continua a partir desse ponto."
      },
      {
        q: "Porque é que <code>print()</code> é útil num script do task_engine?",
        opts: ["Não é útil, é ignorado", "O stdout é capturado e guardado no execution_log da ScheduleExecution", "Imprime no terminal do servidor", "Envia para o Teams"],
        correct: 1,
        expl: "O <code>stdout</code> (e stderr) é capturado durante a execução e guardado no campo <code>execution_log</code>, visível na interface do IA Engine para debugging."
      }
    ]
  },
  {
    id: "quiz-final",
    title: "Quiz Final",
    theory: [
      {
        heading: "Revisão Geral",
        body: `<p>Esta secção testa o conhecimento completo sobre o task_engine. As perguntas cobrem todos os tópicos anteriores e incluem cenários práticos.</p>
<p>Tenta responder sem consultar as secções anteriores!</p>`
      }
    ],
    quiz: [
      {
        q: "Tens um requisito para processar encomendas novas a cada 15 minutos, com 3 passos (validar, criar no ERP, facturar). O que configuras no task_engine?",
        opts: [
          "3 Schedules independentes",
          "1 Schedule (cron */15) com Script que retorna lista + 3 Actions com StepSchedules",
          "1 Action com 3 scripts",
          "3 FunctionServices"
        ],
        correct: 1,
        expl: "Configura-se 1 Schedule com cron <code>*/15 * * * *</code>, cujo Script busca encomendas e retorna uma lista. Os 3 passos são Actions ligadas via StepSchedules."
      },
      {
        q: "Um Schedule com <code>skip_duplicate_external_id=True</code> recebe uma lista com um <code>external_id</code> que já existe. O que acontece?",
        opts: ["Cria o Ticket na mesma", "Ignora esse elemento da lista e não cria Ticket duplicado", "Lança um erro", "Apaga o Ticket antigo e cria novo"],
        correct: 1,
        expl: "Com <code>skip_duplicate_external_id=True</code>, o sistema verifica se já existe um Ticket com o mesmo <code>external_id</code> e, se existir, simplesmente ignora."
      },
      {
        q: "Qual a expressão cron para executar um script de segunda a sexta às 9h30?",
        opts: ["<code>30 9 * * 1-5</code>", "<code>9 30 * * 1-5</code>", "<code>30 9 * * *</code>", "<code>*/30 9 * * 1-5</code>"],
        correct: 0,
        expl: "O formato é <code>minuto hora dia_mes mês dia_semana</code>. <code>30 9 * * 1-5</code> = minuto 30, hora 9, qualquer dia/mês, segunda(1) a sexta(5)."
      },
      {
        q: "Um script demora mais de 29 minutos. O que acontece?",
        opts: ["Continua a executar sem limite", "Lança SoftTimeLimitExceeded e a execução fica com estado Error", "O servidor reinicia", "É cancelado silenciosamente"],
        correct: 1,
        expl: "Ao atingir 27 minutos (soft limit), lança <code>SoftTimeLimitExceeded</code>. Aos 29 minutos (hard limit), a task é terminada forçosamente."
      },
      {
        q: "Onde ficam guardados os logs de execução de um script?",
        opts: ["Num ficheiro .log no servidor", "No campo execution_log da ScheduleExecution (stdout + stderr)", "No Django admin apenas", "Não são guardados"],
        correct: 1,
        expl: "O stdout e stderr são capturados durante a execução e guardados no campo <code>execution_log</code> da ScheduleExecution."
      },
      {
        q: "Como se pode forçar a execução manual de um Schedule?",
        opts: ["Alterar a expressão cron", "Usar a opção 'Forçar Execução' na interface do IA Engine", "Reiniciar o Celery", "Não é possível"],
        correct: 1,
        expl: "A interface do IA Engine tem uma opção 'Forçar Execução' (ForceExecutionScheduleView) que coloca o Schedule na fila imediatamente."
      },
      {
        q: "Qual a diferença entre uma Action de tipo <code>main</code> e <code>fallback</code>?",
        opts: ["Não há diferença", "main é executada no pipeline normal, fallback é executada automaticamente quando um Ticket falha", "fallback é executada primeiro", "main é mais rápida"],
        correct: 1,
        expl: "Actions <code>main</code> executam no pipeline normal. A <code>fallback</code> é executada automaticamente quando um Ticket falha num passo stoppable."
      },
      {
        q: "Um Ticket está no estado <code>QU</code>. O que significa?",
        opts: ["O Ticket foi cancelado", "O Ticket está na fila do Celery, aguardando um worker disponível", "O Ticket foi processado com sucesso", "O Ticket tem um erro"],
        correct: 1,
        expl: "<code>QU</code> (Queue) significa que o Ticket foi adicionado à fila do Celery e está a aguardar que um worker fique disponível para o processar."
      },
      {
        q: "Porque é que as variáveis de ambiente do Schedule são encriptadas na BD?",
        opts: ["Para melhorar performance", "Porque contêm credenciais sensíveis (passwords, API keys, IPs)", "O Django obriga", "Para comprimir os dados"],
        correct: 1,
        expl: "As ENV vars contêm credenciais sensíveis. A encriptação via <code>django.core.signing</code> garante que mesmo com acesso à BD, os valores não ficam expostos em texto limpo."
      },
      {
        q: "Qual destes componentes é responsável por verificar periodicamente quais Schedules precisam de executar?",
        opts: ["O Django admin", "O Celery Beat com a task search_new_schedule", "O Nginx", "O PostgreSQL"],
        correct: 1,
        expl: "O Celery Beat executa a task <code>search_new_schedule</code> a cada 10 segundos, verificando quais Schedules activos têm cron correspondente ao minuto actual."
      }
    ]
  }
];

// ═══════════════════════════════════════
// COMPONENT
// ═══════════════════════════════════════

function CodeBlock({ filename, content }) {
  const preRef = useRef(null);

  const handleCopy = useCallback(() => {
    if (!preRef.current) return;
    const text = preRef.current.textContent;
    navigator.clipboard.writeText(text).then(() => {
      const btn = preRef.current.closest(".code-block").querySelector(".code-copy");
      btn.textContent = "Copiado!";
      setTimeout(() => { btn.textContent = "Copiar"; }, 1500);
    });
  }, []);

  return (
    <div className="code-block">
      <div className="code-header">
        <span className="code-filename">{filename}</span>
        <button className="code-copy" onClick={handleCopy}>Copiar</button>
      </div>
      <div className="code-body">
        <pre ref={preRef} dangerouslySetInnerHTML={{ __html: content }} />
      </div>
    </div>
  );
}

export default function TaskEnginePage() {
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
    const sectionAnswers = newAnswers[section.id];
    if (Object.keys(sectionAnswers).length === section.quiz.length) {
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

  return (
    <div className="api-study-page">
      <div className="back-btn-bar">
        <button className="back-btn" onClick={() => navigate("/")}>← Voltar à Home</button>
      </div>

      <header className="hero">
        <img src="https://nossafarmacia.vtexassets.com/assets/vtex.file-manager-graphql/images/f432f301-b5fa-4453-aa24-22ea02396e16___13e59f7056915bc23b198375758778f6.png" alt="Nossa Farmácia" className="hero-logo" />
        <div className="hero-badge">task_engine · Guia de Estudo</div>
        <h1>Como criar uma <em>Automação</em> no IA Engine</h1>
        <p>Scripts, Schedules, Actions, Tickets e o ciclo de vida completo das automações agendadas.</p>
      </header>

      <div className="progress-bar-container">
        <span className="progress-label">Progresso</span>
        <div className="progress-track">
          <div className="progress-fill" style={{ width: `${progressPct}%` }} />
        </div>
        <span className="progress-pct">{progressPct}%</span>
      </div>

      <nav className="nav">
        {SECTIONS.map((s, i) => (
          <button key={s.id} className={`nav-btn ${i === currentSection ? "active" : ""}`} onClick={() => goToSection(i)}>
            {i + 1}. {s.title}
            {completedSections.has(s.id) && <span className="nav-check">✓</span>}
          </button>
        ))}
      </nav>

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

          {tab === "theory" && (
            <div>
              {section.theory.map((t, i) => (
                <div key={i} className="theory-block">
                  <h3>{t.heading}</h3>
                  <div dangerouslySetInnerHTML={{ __html: t.body }} />
                  {t.callout && (
                    <div className="callout">
                      <div className="callout-label">{t.callout.label}</div>
                      <div dangerouslySetInnerHTML={{ __html: t.callout.text }} />
                    </div>
                  )}
                  {t.code && <CodeBlock filename={t.code.filename} content={t.code.content} />}
                </div>
              ))}
            </div>
          )}

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
