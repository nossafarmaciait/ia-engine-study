import { useState, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import "./ApiStudyPage.css";

// ═══════════════════════════════════════
// DATA
// ═══════════════════════════════════════
const SECTIONS = [
  {
    id: "intro",
    title: "O que é um FunctionService?",
    theory: [
      {
        heading: "Definição",
        body: `<p>Um <strong>FunctionService</strong> é um serviço registado no <strong>api_engine</strong> do IA Engine que expõe lógica de negócio como um endpoint API.</p>
<p>O programador escreve um <strong>script Python</strong> — a plataforma trata do resto: routing, execução, serialização da resposta e gestão de erros.</p>`
      },
      {
        heading: "Quando usar?",
        body: `<ul>
<li>Consultas on-demand a bases de dados (SQL Server, etc.)</li>
<li>Integrações com sistemas externos (APIs REST, Meilisearch, etc.)</li>
<li>Operações que precisam ser expostas como endpoint para consumo por outros sistemas</li>
<li>Lógica de negócio reutilizável que não depende de agendamento</li>
</ul>`
      },
      {
        heading: "Propriedades de um FunctionService",
        body: `<ul>
<li><strong>Nome</strong> — identificador do serviço</li>
<li><strong>Descrição</strong> — documentação em Markdown</li>
<li><strong>Código Python</strong> — o script com a lógica</li>
<li><strong>Variáveis de Ambiente (ENV)</strong> — credenciais e configurações</li>
<li><strong>Team</strong> — isolamento multi-tenant</li>
</ul>`
      }
    ],
    quiz: [
      {
        q: "O que é um FunctionService no contexto do IA Engine?",
        opts: ["Um agendador de tarefas", "Um endpoint API reutilizável gerido pelo api_engine", "Uma base de dados", "Um ficheiro de configuração"],
        correct: 1,
        expl: "O FunctionService é um serviço do api_engine que expõe lógica de negócio como endpoint API. O programador escreve o script e a plataforma gere o resto."
      },
      {
        q: "Quem é responsável pelo routing e serialização da resposta de um FunctionService?",
        opts: ["O programador configura manualmente", "A plataforma IA Engine", "O Django REST Framework", "O Nginx"],
        correct: 1,
        expl: "A plataforma cuida automaticamente do routing, execução do script e serialização do retorno como JSON."
      },
      {
        q: "Qual destas NÃO é uma propriedade de um FunctionService?",
        opts: ["Nome", "Código Python", "Expressão Cron", "Variáveis de Ambiente"],
        correct: 2,
        expl: "A expressão Cron é uma propriedade de automações (Schedules), não de FunctionServices. Um FunctionService é chamado on-demand, não agendado."
      }
    ]
  },
  {
    id: "anatomia",
    title: "Anatomia do Script",
    theory: [
      {
        heading: "A função obrigatória: main(**kwargs)",
        body: `<p>Todo script de FunctionService <strong>deve</strong> ter uma função <code>main(**kwargs)</code>. Esta é o ponto de entrada — a plataforma chama-a automaticamente quando o endpoint recebe um request.</p>`,
        code: {
          filename: "estrutura_base.py",
          content: `<span class="kw">def</span> <span class="fn">main</span>(**kwargs):
    <span class="cm"># kwargs contém os parâmetros do request</span>
    <span class="cm"># e também as variáveis de ambiente em kwargs["ENV"]</span>

    nome = kwargs.get(<span class="st">"nome"</span>)
    env = kwargs[<span class="st">"ENV"</span>]

    <span class="cm"># A lógica de negócio vai aqui</span>
    resultado = {<span class="st">"mensagem"</span>: <span class="st">f"Olá, </span>{nome}<span class="st">"</span>}

    <span class="kw">return</span> resultado  <span class="cm"># devolvido como JSON ao cliente</span>`
        }
      },
      {
        heading: "O que são os kwargs?",
        body: `<ul>
<li><strong>Parâmetros do request</strong> — tudo o que o cliente envia no body/query é recebido como chave nos kwargs</li>
<li><strong><code>kwargs["ENV"]</code></strong> — dicionário com as variáveis de ambiente configuradas no FunctionService (credenciais, URLs, chaves de API)</li>
</ul>`,
        callout: { label: "Importante", text: 'Nunca hardcodes credenciais no script. Usa sempre <code>kwargs["ENV"]</code> para aceder a passwords, API keys e URLs sensíveis.' }
      },
      {
        heading: "Retorno da função main()",
        body: `<p>O que a função <code>main()</code> retorna é <strong>automaticamente serializado como JSON</strong> e devolvido ao cliente como resposta da API.</p>
<ul>
<li>Retornar um <strong>dicionário</strong> → resposta JSON com esse objecto</li>
<li>Retornar uma <strong>lista</strong> → resposta JSON com esse array</li>
<li>Retornar um <strong>string</strong> → resposta JSON com esse valor</li>
</ul>`
      }
    ],
    quiz: [
      {
        q: "Qual função é obrigatória no script de um FunctionService?",
        opts: ["<code>run(**kwargs)</code>", "<code>main(**kwargs)</code>", "<code>execute(**kwargs)</code>", "<code>handler(**kwargs)</code>"],
        correct: 1,
        expl: "A função obrigatória é <code>main(**kwargs)</code>. A plataforma chama-a automaticamente quando o endpoint recebe um request."
      },
      {
        q: "Como se acedem às variáveis de ambiente dentro do script?",
        opts: ['<code>os.environ["VAR"]</code>', "<code>settings.ENV</code>", '<code>kwargs["ENV"]</code>', '<code>ENV.get("VAR")</code>'],
        correct: 2,
        expl: 'As variáveis de ambiente são passadas dentro dos kwargs, acessíveis via <code>kwargs["ENV"]</code>.'
      },
      {
        q: "O que acontece com o valor retornado pela função <code>main()</code>?",
        opts: ["É guardado na base de dados", "É enviado por email", "É serializado como JSON e devolvido ao cliente", "É impresso no terminal"],
        correct: 2,
        expl: "O retorno da <code>main()</code> é automaticamente serializado como JSON e devolvido como resposta HTTP ao cliente que chamou a API."
      },
      {
        q: "Qual destas é uma má prática num script de FunctionService?",
        opts: ['Usar <code>kwargs["ENV"]</code> para credenciais', "Hardcodar a password no código", "Criar classes wrapper", "Usar exceptions customizadas"],
        correct: 1,
        expl: 'Nunca se deve hardcodar credenciais no código. Usa sempre as variáveis de ambiente via <code>kwargs["ENV"]</code>.'
      },
      {
        q: 'Se a função <code>main()</code> retornar <code>{"status": "ok", "count": 42}</code>, o que recebe o cliente?',
        opts: ["Uma string Python", 'Um JSON: {"status": "ok", "count": 42}', "Um ficheiro CSV", "Nada — o retorno é ignorado"],
        correct: 1,
        expl: "O dicionário retornado é serializado como JSON e devolvido na resposta HTTP ao cliente."
      }
    ]
  },
  {
    id: "pydantic",
    title: "Documentação com Pydantic",
    theory: [
      {
        heading: "Porquê usar Pydantic?",
        body: `<p>O <strong>Pydantic BaseModel</strong> permite definir contratos claros para o request e a resposta da API:</p>
<ul>
<li><strong>Validação automática de tipos</strong> — se um campo espera <code>int</code> e recebe <code>string</code>, o Pydantic rejeita com erro claro</li>
<li><strong>Documentação integrada</strong> — cada campo pode ter uma descrição via <code>Field()</code></li>
<li><strong>Serialização</strong> — <code>.model_dump()</code> converte o modelo para dicionário, pronto para retornar como JSON</li>
<li><strong>JSON Schema</strong> — <code>.model_json_schema()</code> gera documentação automática da estrutura</li>
</ul>`
      },
      {
        heading: "Modelo de Request",
        body: `<p>Define os parâmetros de entrada esperados pelo FunctionService. Usa <code>Field(...)</code> para campos obrigatórios e <code>Field(None)</code> ou <code>Optional</code> para opcionais.</p>`,
        code: {
          filename: "request_model.py",
          content: `<span class="kw">from</span> pydantic <span class="kw">import</span> BaseModel, Field
<span class="kw">from</span> typing <span class="kw">import</span> Optional


<span class="kw">class</span> <span class="cl">ConsultaProdutoRequest</span>(BaseModel):
    <span class="cm">"""Parâmetros para consultar produtos."""</span>

    codigo_farmacia: <span class="cl">str</span> = Field(
        ...,
        description=<span class="st">"Código da farmácia"</span>
    )
    nome_produto: Optional[<span class="cl">str</span>] = Field(
        <span class="kw">None</span>,
        description=<span class="st">"Filtro por nome do produto"</span>
    )
    limite: <span class="cl">int</span> = Field(
        <span class="nr">50</span>,
        description=<span class="st">"Número máximo de resultados"</span>,
        ge=<span class="nr">1</span>,
        le=<span class="nr">500</span>
    )`
        }
      },
      {
        heading: "Modelo de Response",
        body: `<p>Define a estrutura exacta da resposta, para que quem consome a API saiba o que esperar.</p>`,
        code: {
          filename: "response_model.py",
          content: `<span class="kw">class</span> <span class="cl">ProdutoResponse</span>(BaseModel):
    <span class="cm">"""Dados de um produto retornado."""</span>

    codigo: <span class="cl">str</span> = Field(description=<span class="st">"Código do produto"</span>)
    nome: <span class="cl">str</span> = Field(description=<span class="st">"Nome do produto"</span>)
    preco: <span class="cl">float</span> = Field(description=<span class="st">"Preço unitário"</span>)
    stock: <span class="cl">int</span> = Field(description=<span class="st">"Quantidade em stock"</span>)


<span class="kw">class</span> <span class="cl">ConsultaProdutoResponse</span>(BaseModel):
    <span class="cm">"""Resposta da consulta de produtos."""</span>

    farmacia: <span class="cl">str</span> = Field(description=<span class="st">"Código da farmácia"</span>)
    total: <span class="cl">int</span> = Field(description=<span class="st">"Total de produtos encontrados"</span>)
    produtos: list[<span class="cl">ProdutoResponse</span>] = Field(
        description=<span class="st">"Lista de produtos"</span>
    )`
        }
      },
      {
        heading: "Integração no main()",
        body: `<p>Instanciar o modelo de request com <code>**kwargs</code> valida automaticamente. Usar <code>.model_dump()</code> para serializar a resposta.</p>`,
        code: {
          filename: "main_completo.py",
          content: `<span class="kw">def</span> <span class="fn">main</span>(**kwargs):
    <span class="cm"># Validação automática dos parâmetros</span>
    request = ConsultaProdutoRequest(**kwargs)

    <span class="cm"># Lógica de negócio...</span>
    produtos = consultar_bd(request.codigo_farmacia, request.nome_produto)

    <span class="cm"># Construir e serializar resposta</span>
    response = ConsultaProdutoResponse(
        farmacia=request.codigo_farmacia,
        total=<span class="fn">len</span>(produtos),
        produtos=produtos
    )

    <span class="kw">return</span> response.model_dump()`
        }
      },
      {
        heading: "Gerar JSON Schema",
        body: `<p>O método <code>model_json_schema()</code> gera automaticamente a documentação da estrutura, útil para integração com Swagger/OpenAPI ou documentação externa.</p>`,
        code: {
          filename: "json_schema.py",
          content: `<span class="cm"># Gerar schema do request</span>
schema = ConsultaProdutoRequest.model_json_schema()
<span class="fn">print</span>(schema)

<span class="cm"># Output:</span>
<span class="cm"># {</span>
<span class="cm">#   "properties": {</span>
<span class="cm">#     "codigo_farmacia": {</span>
<span class="cm">#       "description": "Código da farmácia",</span>
<span class="cm">#       "type": "string"</span>
<span class="cm">#     },</span>
<span class="cm">#     "nome_produto": {</span>
<span class="cm">#       "anyOf": [{"type": "string"}, {"type": "null"}],</span>
<span class="cm">#       "description": "Filtro por nome do produto"</span>
<span class="cm">#     }, ...</span>
<span class="cm">#   },</span>
<span class="cm">#   "required": ["codigo_farmacia"]</span>
<span class="cm"># }</span>`
        }
      }
    ],
    quiz: [
      {
        q: "Para que serve o <code>BaseModel</code> do Pydantic num FunctionService?",
        opts: ["Criar tabelas na base de dados", "Validar e documentar parâmetros de entrada e saída", "Gerar HTML", "Configurar o servidor"],
        correct: 1,
        expl: "O BaseModel permite definir contratos claros: valida tipos, documenta campos com <code>Field()</code> e serializa respostas com <code>.model_dump()</code>."
      },
      {
        q: "Qual a diferença entre <code>Field(...)</code> e <code>Field(None)</code>?",
        opts: ["Não há diferença", "<code>Field(...)</code> é obrigatório, <code>Field(None)</code> é opcional", "<code>Field(...)</code> é opcional, <code>Field(None)</code> é obrigatório", "<code>Field(None)</code> ignora o campo"],
        correct: 1,
        expl: "<code>Field(...)</code> (com reticências) marca o campo como obrigatório. <code>Field(None)</code> define um valor por defeito de <code>None</code>, tornando-o opcional."
      },
      {
        q: "O que faz <code>.model_dump()</code>?",
        opts: ["Apaga o modelo", "Converte o modelo para dicionário Python", "Grava na base de dados", "Imprime no terminal"],
        correct: 1,
        expl: "<code>.model_dump()</code> serializa a instância do modelo para um dicionário Python, ideal para retornar como JSON na resposta da API."
      },
      {
        q: 'Se enviarem <code>limite="abc"</code> num request e o campo espera <code>int</code>, o que acontece?',
        opts: ["O Pydantic converte silenciosamente para 0", "O Pydantic lança um ValidationError com mensagem clara", "O script ignora o campo", "O servidor crashe"],
        correct: 1,
        expl: "O Pydantic lança um <code>ValidationError</code> detalhado indicando que o campo <code>limite</code> esperava <code>int</code> mas recebeu <code>string</code>."
      },
      {
        q: "Para que serve <code>model_json_schema()</code>?",
        opts: ["Criar migrations da base de dados", "Gerar automaticamente o JSON Schema da estrutura do modelo", "Exportar dados para CSV", "Validar um ficheiro JSON"],
        correct: 1,
        expl: "<code>model_json_schema()</code> gera o JSON Schema do modelo, útil para documentação automática ou integração com Swagger/OpenAPI."
      },
      {
        q: "Onde devem ser colocadas as classes BaseModel no script?",
        opts: ["Dentro da função main()", "No final do ficheiro", "No topo do script, antes da main()", "Num ficheiro separado obrigatoriamente"],
        correct: 2,
        expl: "Por boa prática, os modelos Pydantic ficam no topo do script para fácil leitura e para que a <code>main()</code> possa usá-los."
      }
    ]
  },
  {
    id: "exemplos",
    title: "Exemplos Práticos",
    theory: [
      {
        heading: "Exemplo 1: Consulta a SQL Server",
        body: `<p>Script que consulta uma view no SQL Server via <code>pymssql</code> e devolve dados estruturados.</p>`,
        code: {
          filename: "consulta_sql.py",
          content: `<span class="kw">import</span> pymssql
<span class="kw">from</span> pydantic <span class="kw">import</span> BaseModel, Field
<span class="kw">from</span> typing <span class="kw">import</span> Optional


<span class="kw">class</span> <span class="cl">ConsultaRequest</span>(BaseModel):
    data_inicio: <span class="cl">str</span> = Field(..., description=<span class="st">"Data início (YYYY-MM-DD)"</span>)
    data_fim: Optional[<span class="cl">str</span>] = Field(<span class="kw">None</span>, description=<span class="st">"Data fim"</span>)


<span class="kw">class</span> <span class="cl">DatabaseWrapper</span>:
    <span class="kw">def</span> <span class="fn">__init__</span>(self, host, database, user, password):
        self.conn = pymssql.connect(host, user, password, database)

    <span class="kw">def</span> <span class="fn">query</span>(self, sql, params=<span class="kw">None</span>):
        cursor = self.conn.cursor(as_dict=<span class="kw">True</span>)
        cursor.execute(sql, params <span class="kw">or</span> ())
        <span class="kw">return</span> cursor.fetchall()

    <span class="kw">def</span> <span class="fn">close</span>(self):
        self.conn.close()


<span class="kw">def</span> <span class="fn">main</span>(**kwargs):
    request = ConsultaRequest(**kwargs)
    env = kwargs[<span class="st">"ENV"</span>]

    db = DatabaseWrapper(
        host=env[<span class="st">"DB_HOST"</span>],
        database=env[<span class="st">"DB_NAME"</span>],
        user=env[<span class="st">"DB_USER"</span>],
        password=env[<span class="st">"DB_PASS"</span>],
    )
    <span class="kw">try</span>:
        rows = db.query(
            <span class="st">"SELECT * FROM BIADDO.vw_Dados WHERE Data >= %s"</span>,
            (request.data_inicio,)
        )
        <span class="kw">return</span> {<span class="st">"total"</span>: <span class="fn">len</span>(rows), <span class="st">"dados"</span>: rows}
    <span class="kw">finally</span>:
        db.close()`
        }
      },
      {
        heading: "Exemplo 2: Integração com Meilisearch",
        body: `<p>Script com classe wrapper para indexar documentos no Meilisearch.</p>`,
        code: {
          filename: "meilisearch_api.py",
          content: `<span class="kw">import</span> requests
<span class="kw">from</span> pydantic <span class="kw">import</span> BaseModel, Field


<span class="kw">class</span> <span class="cl">IndexRequest</span>(BaseModel):
    index_name: <span class="cl">str</span> = Field(..., description=<span class="st">"Nome do índice"</span>)
    documents: list[<span class="cl">dict</span>] = Field(..., description=<span class="st">"Documentos a indexar"</span>)


<span class="kw">class</span> <span class="cl">MeiliSearchWrapper</span>:
    <span class="kw">def</span> <span class="fn">__init__</span>(self, host: <span class="cl">str</span>, api_key: <span class="cl">str</span>):
        self.host = host
        self.headers = {
            <span class="st">"Authorization"</span>: <span class="st">f"Bearer </span>{api_key}<span class="st">"</span>,
            <span class="st">"Content-Type"</span>: <span class="st">"application/json"</span>,
        }

    <span class="kw">def</span> <span class="fn">index_documents</span>(self, index: <span class="cl">str</span>, docs: list[<span class="cl">dict</span>]):
        url = <span class="st">f"</span>{self.host}<span class="st">/indexes/</span>{index}<span class="st">/documents"</span>
        resp = requests.post(url, headers=self.headers, json=docs)
        resp.raise_for_status()
        <span class="kw">return</span> resp.json()


<span class="kw">def</span> <span class="fn">main</span>(**kwargs):
    request = IndexRequest(**kwargs)
    env = kwargs[<span class="st">"ENV"</span>]

    meili = MeiliSearchWrapper(
        host=env[<span class="st">"MEILI_HOST"</span>],
        api_key=env[<span class="st">"MEILI_API_KEY"</span>],
    )
    result = meili.index_documents(request.index_name, request.documents)
    <span class="kw">return</span> {<span class="st">"status"</span>: <span class="st">"indexed"</span>, <span class="st">"task"</span>: result}`
        }
      },
      {
        heading: "Exemplo 3: Chamada a API REST externa",
        body: `<p>Script que autentica num serviço externo e envia dados.</p>`,
        code: {
          filename: "api_rest_externa.py",
          content: `<span class="kw">import</span> requests
<span class="kw">from</span> pydantic <span class="kw">import</span> BaseModel, Field


<span class="kw">class</span> <span class="cl">SyncRequest</span>(BaseModel):
    referencia: <span class="cl">str</span> = Field(..., description=<span class="st">"Referência a sincronizar"</span>)


<span class="kw">class</span> <span class="cl">ExternalAPIError</span>(Exception):
    <span class="kw">pass</span>


<span class="kw">class</span> <span class="cl">ExternalAPIClient</span>:
    <span class="kw">def</span> <span class="fn">__init__</span>(self, base_url, username, password, tenant):
        self.base_url = base_url
        self.token = self.<span class="fn">_authenticate</span>(username, password, tenant)

    <span class="kw">def</span> <span class="fn">_authenticate</span>(self, user, pwd, tenant):
        resp = requests.post(
            <span class="st">f"</span>{self.base_url}<span class="st">/api/v1/auth/token/"</span>,
            json={<span class="st">"username"</span>: user, <span class="st">"password"</span>: pwd, <span class="st">"tenant"</span>: tenant}
        )
        resp.raise_for_status()
        <span class="kw">return</span> resp.json()[<span class="st">"access"</span>]

    <span class="kw">def</span> <span class="fn">sync</span>(self, referencia):
        resp = requests.post(
            <span class="st">f"</span>{self.base_url}<span class="st">/api/v1/sync/"</span>,
            headers={<span class="st">"Authorization"</span>: <span class="st">f"Bearer </span>{self.token}<span class="st">"</span>},
            json={<span class="st">"ref"</span>: referencia}
        )
        resp.raise_for_status()
        <span class="kw">return</span> resp.json()


<span class="kw">def</span> <span class="fn">main</span>(**kwargs):
    request = SyncRequest(**kwargs)
    env = kwargs[<span class="st">"ENV"</span>]

    client = ExternalAPIClient(
        base_url=env[<span class="st">"API_BASE_URL"</span>],
        username=env[<span class="st">"API_USER"</span>],
        password=env[<span class="st">"API_PASS"</span>],
        tenant=env[<span class="st">"API_TENANT"</span>],
    )
    result = client.sync(request.referencia)
    <span class="kw">return</span> {<span class="st">"synced"</span>: <span class="kw">True</span>, <span class="st">"result"</span>: result}`
        }
      }
    ],
    quiz: [
      {
        q: "No exemplo de SQL Server, porque se usa <code>try/finally</code> com <code>db.close()</code>?",
        opts: ["Para performance", "Para garantir que a conexão é fechada mesmo em caso de erro", "Porque o pymssql obriga", "Para logging"],
        correct: 1,
        expl: "O <code>try/finally</code> garante que <code>db.close()</code> é executado independentemente de a query ter sucesso ou lançar excepção, evitando conexões abertas."
      },
      {
        q: "Porque é que as classes wrapper (ex: <code>MeiliSearchWrapper</code>) são uma boa prática?",
        opts: ["São obrigatórias pelo IA Engine", "Separam a lógica de integração da função main()", "São mais rápidas", "O Python obriga"],
        correct: 1,
        expl: "As classes wrapper isolam a lógica de integração, mantendo a <code>main()</code> limpa e focada no fluxo de negócio. Também facilitam reutilização e testes."
      },
      {
        q: "No exemplo de API REST, para que serve a classe <code>ExternalAPIError</code>?",
        opts: ["É usada para logging", "É uma exception customizada para erros específicos dessa integração", "É obrigatória pelo Pydantic", "Serve para autenticação"],
        correct: 1,
        expl: "Exceptions customizadas permitem distinguir erros de diferentes integrações e tratá-los de forma específica."
      },
      {
        q: "Porque se usa <code>resp.raise_for_status()</code> nas chamadas HTTP?",
        opts: ["Para imprimir o status code", "Para lançar excepção se o status HTTP indicar erro (4xx, 5xx)", "Para fechar a conexão", "Para converter a resposta em JSON"],
        correct: 1,
        expl: "<code>raise_for_status()</code> verifica se a resposta HTTP indica erro e, se sim, lança uma <code>HTTPError</code> com detalhes do problema."
      }
    ]
  },
  {
    id: "boas-praticas",
    title: "Boas Práticas",
    theory: [
      {
        heading: "Estrutura recomendada do script",
        body: `<p>A ordem ideal dos elementos no script:</p>
<ul>
<li><strong>1. Imports</strong> — bibliotecas externas e standard</li>
<li><strong>2. Modelos Pydantic</strong> — Request e Response no topo</li>
<li><strong>3. Exceptions customizadas</strong> — uma por tipo de integração</li>
<li><strong>4. Classes wrapper</strong> — lógica de integração isolada</li>
<li><strong>5. Função <code>main(**kwargs)</code></strong> — no final, limpa e curta</li>
</ul>`
      },
      {
        heading: "Credenciais e ENV",
        body: `<p>Todas as credenciais, URLs de serviços e chaves de API devem estar nas <strong>variáveis de ambiente</strong>, nunca no código.</p>`,
        callout: { label: "Regra de ouro", text: "Se removeres todas as variáveis de ambiente, o script não deve conter nenhuma informação sensível. Nenhuma password, nenhum IP, nenhuma API key." },
        code: {
          filename: "env_correcto.py",
          content: `<span class="cm"># ✅ CORRECTO</span>
<span class="kw">def</span> <span class="fn">main</span>(**kwargs):
    env = kwargs[<span class="st">"ENV"</span>]
    host = env[<span class="st">"DB_HOST"</span>]
    password = env[<span class="st">"DB_PASS"</span>]

<span class="cm"># ❌ ERRADO — nunca fazer isto</span>
<span class="kw">def</span> <span class="fn">main</span>(**kwargs):
    host = <span class="st">"192.168.1.100"</span>
    password = <span class="st">"minhaPassword123"</span>`
        }
      },
      {
        heading: "Tratamento de erros",
        body: `<ul>
<li>Usar <code>requests.raise_for_status()</code> após cada chamada HTTP</li>
<li>Criar <strong>exceptions customizadas</strong> por integração — facilita debug e distingue origem do erro</li>
<li>Usar <code>try/finally</code> para garantir limpeza de recursos (conexões BD, ficheiros)</li>
<li>Mensagens de erro descritivas com contexto do que falhou</li>
</ul>`,
        code: {
          filename: "error_handling.py",
          content: `<span class="kw">class</span> <span class="cl">MeiliSearchError</span>(Exception):
    <span class="cm">"""Erro específico de Meilisearch."""</span>
    <span class="kw">pass</span>

<span class="kw">class</span> <span class="cl">DatabaseError</span>(Exception):
    <span class="cm">"""Erro específico de base de dados."""</span>
    <span class="kw">pass</span>

<span class="cm"># No código da wrapper:</span>
<span class="kw">try</span>:
    resp.raise_for_status()
<span class="kw">except</span> requests.exceptions.HTTPError <span class="kw">as</span> e:
    <span class="kw">raise</span> MeiliSearchError(
        <span class="st">f"Erro ao indexar no índice '</span>{index}<span class="st">': </span>{resp.text}<span class="st">"</span>
    ) <span class="kw">from</span> e`
        }
      },
      {
        heading: "A main() deve ser curta",
        body: `<p>A função <code>main()</code> deve funcionar como <strong>orquestradora</strong> — validar input, chamar classes/métodos e retornar output. Toda a lógica pesada vai nas classes wrapper.</p>`,
        code: {
          filename: "main_limpa.py",
          content: `<span class="cm"># ✅ main() limpa — delega tudo</span>
<span class="kw">def</span> <span class="fn">main</span>(**kwargs):
    request = MeuRequest(**kwargs)
    env = kwargs[<span class="st">"ENV"</span>]

    service = MeuServico(env[<span class="st">"HOST"</span>], env[<span class="st">"KEY"</span>])
    dados = service.buscar(request.parametro)

    <span class="kw">return</span> MeuResponse(dados=dados).model_dump()


<span class="cm"># ❌ main() confusa — faz tudo directamente</span>
<span class="kw">def</span> <span class="fn">main</span>(**kwargs):
    conn = pymssql.connect(kwargs[<span class="st">"ENV"</span>][<span class="st">"H"</span>], ...)
    cursor = conn.cursor(as_dict=<span class="kw">True</span>)
    cursor.execute(<span class="st">"SELECT ..."</span>)
    rows = cursor.fetchall()
    result = []
    <span class="kw">for</span> r <span class="kw">in</span> rows:
        <span class="kw">if</span> r[<span class="st">"x"</span>] > <span class="nr">10</span>:
            result.append({...})
    conn.close()
    <span class="kw">return</span> result`
        }
      }
    ],
    quiz: [
      {
        q: "Qual a ordem recomendada dos elementos num script de FunctionService?",
        opts: [
          "main → imports → classes",
          "imports → Pydantic models → exceptions → classes → main()",
          "classes → main → imports",
          "A ordem não importa"
        ],
        correct: 1,
        expl: "A ordem recomendada é: imports, modelos Pydantic, exceptions customizadas, classes wrapper, e por fim a função <code>main()</code>."
      },
      {
        q: "Qual destes scripts tem um problema de segurança?",
        opts: [
          '<code>host = kwargs["ENV"]["DB_HOST"]</code>',
          '<code>host = "192.168.1.100"</code>',
          '<code>host = env.get("DB_HOST")</code>',
          '<code>host = kwargs.get("host", env["DB_HOST"])</code>'
        ],
        correct: 1,
        expl: "Hardcodar IPs ou qualquer informação de infraestrutura no código é um problema de segurança. Deve usar-se sempre as variáveis de ambiente."
      },
      {
        q: "Para que servem as exceptions customizadas como <code>MeiliSearchError</code>?",
        opts: [
          "São obrigatórias pelo Python",
          "Permitem distinguir a origem do erro e tratá-lo de forma específica",
          "Melhoram a performance",
          "São usadas para logging automático"
        ],
        correct: 1,
        expl: "Exceptions customizadas ajudam a identificar de que integração veio o erro, facilitando debug e permitindo tratamento diferenciado."
      },
      {
        q: "Porque é que a <code>main()</code> deve ser curta?",
        opts: [
          "Limitação do IA Engine",
          "Para ser fácil de ler, testar e manter — a lógica pesada vai nas classes",
          "Porque funções longas são mais lentas",
          "Porque o Python limita o tamanho das funções"
        ],
        correct: 1,
        expl: "Uma <code>main()</code> curta funciona como orquestradora: valida input, delega lógica para classes e retorna output. Isto melhora legibilidade, testabilidade e manutenção."
      },
      {
        q: "Qual o problema neste código: <code>resp = requests.post(url, json=data)</code> sem mais nada?",
        opts: [
          "Falta o <code>raise_for_status()</code> para verificar erros HTTP",
          "Falta fechar a conexão",
          "O método POST não existe",
          "Não tem problema nenhum"
        ],
        correct: 0,
        expl: "Sem <code>raise_for_status()</code>, erros HTTP (4xx, 5xx) passam silenciosamente. Pode-se acabar a processar uma resposta de erro como se fosse sucesso."
      }
    ]
  },
  {
    id: "quiz-final",
    title: "Quiz Final",
    theory: [
      {
        heading: "Revisão Geral",
        body: `<p>Esta secção testa o conhecimento completo sobre criação de APIs no IA Engine. As perguntas cobrem todos os tópicos anteriores e incluem cenários práticos.</p>
<p>Tenta responder sem consultar as secções anteriores!</p>`
      }
    ],
    quiz: [
      {
        q: "Tens um requisito para expor uma consulta de dados que será chamada por outro sistema. O que crias no IA Engine?",
        opts: ["Um FunctionService no api_engine", "Um ficheiro .json", "Uma página HTML", "Um cronjob no servidor"],
        correct: 0,
        expl: "Para expor lógica como endpoint API on-demand, cria-se um FunctionService no api_engine."
      },
      {
        q: 'O cliente envia <code>{"farmacia": "001", "limite": 10}</code>. Onde ficam estes dados no script?',
        opts: ["Em variáveis globais", 'Em <code>kwargs</code> — <code>kwargs["farmacia"]</code> e <code>kwargs["limite"]</code>', "Num ficheiro temporário", "Na base de dados"],
        correct: 1,
        expl: "Os parâmetros do request são recebidos como chaves nos <code>kwargs</code> da função <code>main()</code>."
      },
      {
        q: 'Tens o seguinte modelo. O que acontece ao chamar <code>MeuRequest(nome="Ana")</code>?<br><br><code>class MeuRequest(BaseModel):<br>&nbsp;&nbsp;nome: str = Field(...)<br>&nbsp;&nbsp;idade: int = Field(...)</code>',
        opts: ["Funciona normalmente", "ValidationError — falta o campo obrigatório 'idade'", "Retorna None", "Cria o objecto com idade = 0"],
        correct: 1,
        expl: "O campo <code>idade</code> é obrigatório (<code>Field(...)</code>). Como não foi passado, o Pydantic lança <code>ValidationError</code>."
      },
      {
        q: "Qual a forma correcta de fechar uma conexão à base de dados num FunctionService?",
        opts: ["<code>del conn</code>", "<code>conn = None</code>", "<code>try/finally</code> com <code>conn.close()</code>", "O IA Engine fecha automaticamente"],
        correct: 2,
        expl: "O padrão <code>try/finally</code> garante que <code>conn.close()</code> é sempre executado, mesmo que ocorra uma excepção durante a execução."
      },
      {
        q: 'Tens este código. Qual o problema?<br><br><code>def main(**kwargs):<br>&nbsp;&nbsp;db = pymssql.connect("192.168.1.10", "sa", "Pass123", "MinhaBD")<br>&nbsp;&nbsp;...</code>',
        opts: ["O pymssql não funciona assim", "As credenciais estão hardcoded — deviam estar no ENV", "Falta o return", "Não há problema"],
        correct: 1,
        expl: 'Host, username e password estão hardcoded no script. Deviam ser acedidos via <code>kwargs["ENV"]</code>.'
      },
      {
        q: 'Queres que a API retorne <code>{"status": "ok", "items": [...]}</code>. Qual a abordagem correcta?',
        opts: [
          '<code>print({"status": "ok", ...})</code>',
          '<code>return {"status": "ok", "items": items}</code> na <code>main()</code>',
          "<code>sys.stdout.write(json.dumps(...))</code>",
          "Gravar num ficheiro .json"
        ],
        correct: 1,
        expl: 'Basta retornar o dicionário na <code>main()</code>. A plataforma serializa automaticamente para JSON e devolve ao cliente.'
      },
      {
        q: "Qual destes scripts segue TODAS as boas práticas?",
        opts: [
          "Imports → main() com tudo dentro (200 linhas)",
          "Imports → Pydantic models → Wrapper class → main() curta com ENV",
          "main() no topo → imports no fundo → sem validação",
          "Tudo numa única função sem classes"
        ],
        correct: 1,
        expl: 'A estrutura ideal é: imports, modelos Pydantic, classes wrapper e <code>main()</code> curta no final, usando ENV para credenciais.'
      },
      {
        q: "Qual o método do Pydantic que converte um modelo para dicionário?",
        opts: ["<code>.to_dict()</code>", "<code>.json()</code>", "<code>.model_dump()</code>", "<code>.serialize()</code>"],
        correct: 2,
        expl: "<code>.model_dump()</code> é o método do Pydantic v2 que converte a instância do modelo para um dicionário Python."
      },
      {
        q: "Uma <code>requests.post()</code> retorna status 500. O que acontece se NÃO usares <code>raise_for_status()</code>?",
        opts: [
          "O Python lança uma excepção automaticamente",
          "O código continua normalmente — o erro passa despercebido",
          "O IA Engine detecta e relança o erro",
          "A conexão é fechada automaticamente"
        ],
        correct: 1,
        expl: "Sem <code>raise_for_status()</code>, o código continua a executar mesmo com resposta de erro. Pode-se tentar processar uma resposta de erro como se fosse sucesso."
      },
      {
        q: "Para documentar o teu FunctionService com o schema completo dos parâmetros, que método do Pydantic usas?",
        opts: ["<code>.schema()</code>", "<code>.model_json_schema()</code>", "<code>.describe()</code>", "<code>.to_schema()</code>"],
        correct: 1,
        expl: "<code>.model_json_schema()</code> gera o JSON Schema completo do modelo, incluindo tipos, descrições e campos obrigatórios."
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

export default function ApiStudyPage() {
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

  // Progress
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

    // Check if all questions answered
    const sectionAnswers = newAnswers[section.id];
    if (Object.keys(sectionAnswers).length === section.quiz.length) {
      setCompletedSections(prev => new Set([...prev, section.id]));
    }
  };

  const retryQuiz = () => {
    setQuizAnswers(prev => {
      const next = { ...prev };
      delete next[section.id];
      return next;
    });
    setCompletedSections(prev => {
      const next = new Set(prev);
      next.delete(section.id);
      return next;
    });
  };

  const letters = ["A", "B", "C", "D"];

  // Quiz results for current section
  const totalAnswered = Object.keys(answers).length;
  const totalQuestions = section.quiz.length;
  const allAnswered = totalAnswered === totalQuestions && totalQuestions > 0;
  const correctCount = allAnswered
    ? Object.entries(answers).filter(([qi, ai]) => ai === section.quiz[Number(qi)].correct).length
    : 0;

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
        <div className="hero-badge">api_engine · Guia de Estudo</div>
        <h1>Como criar uma <em>API</em> no IA Engine</h1>
        <p>Aprende a estrutura de um script FunctionService — do <code>main(**kwargs)</code> ao Pydantic BaseModel.</p>
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
          {/* Section Header */}
          <div className="section-header">
            <span className="section-num">{currentSection + 1} / {SECTIONS.length}</span>
            <h2 className="section-title">{section.title}</h2>
          </div>

          {/* Tabs */}
          <div className="tabs">
            <button
              className={`tab-btn ${tab === "theory" ? "active" : ""}`}
              onClick={() => switchTab("theory")}
            >
              Teoria
            </button>
            <button
              className={`tab-btn ${tab === "quiz" ? "active" : ""}`}
              onClick={() => switchTab("quiz")}
            >
              Quiz ({section.quiz.length})
            </button>
          </div>

          {/* Theory Content */}
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

          {/* Quiz Content */}
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
                          <button
                            key={oi}
                            className={`quiz-opt ${optClass}`}
                            onClick={() => !answered && answerQuiz(qi, oi)}
                          >
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

              {/* Quiz Results */}
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
