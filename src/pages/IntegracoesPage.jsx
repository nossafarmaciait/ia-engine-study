import { useState, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import "./ApiStudyPage.css";

// ═══════════════════════════════════════
// DATA
// ═══════════════════════════════════════
const SECTIONS = [
  {
    id: "intro",
    title: "Integrações no IA Engine",
    theory: [
      {
        heading: "Visão geral",
        body: `<p>O IA Engine é o hub central de automação da Nossa Farmácia / Addo Pharma. Os scripts de automação integram-se com <strong>múltiplos sistemas externos</strong>:</p>
<ul>
<li><strong>Odoo</strong> — ERP (gestão de produtos, stock, encomendas, facturação)</li>
<li><strong>Meilisearch</strong> — motor de pesquisa rápida para catálogos</li>
<li><strong>Microsoft Teams</strong> — notificações e alertas de erros</li>
<li><strong>VTEX</strong> — plataforma de e-commerce</li>
<li><strong>APIs de logística</strong> — CTT, OCP, Torres Pharma, Glovo, Uber Eats</li>
<li><strong>Pagamentos</strong> — Easypay, Paygate</li>
<li><strong>Facturação</strong> — Moloni</li>
</ul>`
      },
      {
        heading: "Padrão de integração",
        body: `<p>Todos os scripts seguem o mesmo padrão arquitectural:</p>
<ul>
<li><strong>Classe wrapper</strong> — encapsula a lógica de autenticação e chamadas à API externa</li>
<li><strong>Variáveis de ambiente</strong> — credenciais e URLs sempre via <code>kwargs["ENV"]</code></li>
<li><strong>Função main(**kwargs)</strong> — orquestra o fluxo, delega lógica para a wrapper</li>
<li><strong>Tratamento de erros</strong> — exceptions customizadas por integração</li>
</ul>`,
        code: {
          filename: "padrao_integracao.py",
          content: `<span class="kw">import</span> requests


<span class="kw">class</span> <span class="cl">ServicoExternoError</span>(Exception):
    <span class="cm">"""Erro específico desta integração."""</span>
    <span class="kw">pass</span>


<span class="kw">class</span> <span class="cl">ServicoExternoWrapper</span>:
    <span class="kw">def</span> <span class="fn">__init__</span>(self, base_url, api_key):
        self.base_url = base_url
        self.headers = {<span class="st">"Authorization"</span>: <span class="st">f"Bearer </span>{api_key}<span class="st">"</span>}

    <span class="kw">def</span> <span class="fn">get</span>(self, endpoint, params=<span class="kw">None</span>):
        resp = requests.get(
            <span class="st">f"</span>{self.base_url}<span class="st">/</span>{endpoint}<span class="st">"</span>,
            headers=self.headers, params=params
        )
        resp.raise_for_status()
        <span class="kw">return</span> resp.json()


<span class="kw">def</span> <span class="fn">main</span>(**kwargs):
    env = kwargs[<span class="st">"ENV"</span>]
    client = ServicoExternoWrapper(env[<span class="st">"API_URL"</span>], env[<span class="st">"API_KEY"</span>])
    dados = client.get(<span class="st">"recurso"</span>)
    <span class="kw">return</span> {<span class="st">"total"</span>: <span class="fn">len</span>(dados), <span class="st">"dados"</span>: dados}`
        }
      },
      {
        heading: "Convenções de nomes dos scripts",
        body: `<p>Os scripts de automação seguem convenções de nomenclatura que indicam o seu propósito:</p>
<ul>
<li><strong><code>load_</code></strong> — ingestão de dados (ex: <code>load_produtos_vtex.py</code>)</li>
<li><strong><code>action_</code></strong> — acções de negócio (ex: <code>action_enviar_encomenda.py</code>)</li>
<li><strong><code>api_</code></strong> — integrações com APIs externas (ex: <code>api_odoo_stock.py</code>)</li>
<li><strong><code>automation_</code></strong> — workflows automáticos (ex: <code>automation_sync_precos.py</code>)</li>
</ul>`
      }
    ],
    quiz: [
      {
        q: "Qual o padrão arquitectural usado nas integrações do IA Engine?",
        opts: ["Funções soltas sem estrutura", "Classe wrapper + ENV + main() orquestradora", "Herança de classes Django", "Ficheiros de configuração YAML"],
        correct: 1,
        expl: "O padrão standard é: classe wrapper para encapsular a integração, variáveis de ambiente para credenciais e <code>main()</code> como orquestradora."
      },
      {
        q: "Qual o prefixo de um script que ingere dados de uma fonte externa?",
        opts: ["<code>action_</code>", "<code>automation_</code>", "<code>load_</code>", "<code>sync_</code>"],
        correct: 2,
        expl: "Scripts com prefixo <code>load_</code> são responsáveis pela ingestão de dados de fontes externas para o sistema."
      },
      {
        q: "Porque se criam exceptions customizadas por integração?",
        opts: ["O Python obriga", "Para distinguir a origem do erro e facilitar debug", "Para melhorar performance", "Para logging automático"],
        correct: 1,
        expl: "Exceptions customizadas permitem distinguir rapidamente de que integração veio o erro, facilitando o diagnóstico e tratamento diferenciado."
      },
      {
        q: "Qual destes sistemas NÃO é integrado com o IA Engine?",
        opts: ["Odoo", "Meilisearch", "Kubernetes", "VTEX"],
        correct: 2,
        expl: "O IA Engine integra-se com Odoo (ERP), Meilisearch (pesquisa), VTEX (e-commerce), Teams, CTT, etc. Kubernetes não faz parte das integrações de negócio."
      }
    ]
  },
  {
    id: "odoo",
    title: "Odoo XML-RPC",
    theory: [
      {
        heading: "O que é o Odoo?",
        body: `<p>O <strong>Odoo</strong> é o ERP usado pela Nossa Farmácia / Addo Pharma para gestão de produtos, stock, encomendas, clientes e facturação.</p>
<p>A integração é feita via <strong>XML-RPC</strong>, um protocolo que permite chamar funções remotas no servidor Odoo como se fossem locais. A biblioteca <strong>odoo-py</strong> (desenvolvida internamente e publicada no PyPI) abstrai toda esta comunicação.</p>`
      },
      {
        heading: "Configuração do odoo-py",
        body: `<p>A biblioteca <code>odoo-py</code> é configurada via variáveis de ambiente:</p>`,
        code: {
          filename: "odoo_config.py",
          content: `<span class="cm"># Variáveis de ambiente necessárias:</span>
<span class="cm"># ODOO_URL      → URL do servidor Odoo</span>
<span class="cm"># ODOO_DB       → Nome da base de dados Odoo</span>
<span class="cm"># ODOO_USERNAME  → Username de autenticação</span>
<span class="cm"># ODOO_PASSWORD  → Password ou API key</span>

<span class="kw">from</span> odoo <span class="kw">import</span> Odoo

<span class="cm"># Inicializar cliente (lê env vars automaticamente)</span>
odoo = Odoo()

<span class="cm"># Ou passar explicitamente via kwargs["ENV"]</span>
odoo = Odoo(
    url=env[<span class="st">"ODOO_URL"</span>],
    db=env[<span class="st">"ODOO_DB"</span>],
    username=env[<span class="st">"ODOO_USERNAME"</span>],
    password=env[<span class="st">"ODOO_PASSWORD"</span>],
)`
        }
      },
      {
        heading: "Operações CRUD com odoo-py",
        body: `<p>O odoo-py expõe métodos que mapeiam directamente para as operações do Odoo ORM:</p>`,
        code: {
          filename: "odoo_crud.py",
          content: `<span class="kw">from</span> odoo <span class="kw">import</span> Odoo

odoo = Odoo()

<span class="cm"># ── SEARCH: encontrar IDs por critérios ──</span>
product_ids = odoo.search(<span class="st">"product.product"</span>, [
    [<span class="st">"active"</span>, <span class="st">"="</span>, <span class="kw">True</span>],
    [<span class="st">"type"</span>, <span class="st">"="</span>, <span class="st">"product"</span>],
])

<span class="cm"># ── READ: obter campos de registos ──</span>
products = odoo.read(<span class="st">"product.product"</span>, product_ids, [
    <span class="st">"name"</span>, <span class="st">"default_code"</span>, <span class="st">"list_price"</span>, <span class="st">"qty_available"</span>
])

<span class="cm"># ── SEARCH_READ: search + read numa só chamada ──</span>
products = odoo.search_read(<span class="st">"product.product"</span>,
    [[<span class="st">"active"</span>, <span class="st">"="</span>, <span class="kw">True</span>]],
    [<span class="st">"name"</span>, <span class="st">"default_code"</span>, <span class="st">"list_price"</span>],
    limit=<span class="nr">100</span>
)

<span class="cm"># ── WRITE: actualizar registos ──</span>
odoo.write(<span class="st">"product.product"</span>, [product_id], {
    <span class="st">"list_price"</span>: <span class="nr">19.99</span>,
    <span class="st">"name"</span>: <span class="st">"Produto Actualizado"</span>,
})

<span class="cm"># ── CREATE: criar novo registo ──</span>
new_id = odoo.create(<span class="st">"product.product"</span>, {
    <span class="st">"name"</span>: <span class="st">"Novo Produto"</span>,
    <span class="st">"default_code"</span>: <span class="st">"PROD-001"</span>,
    <span class="st">"list_price"</span>: <span class="nr">9.99</span>,
})`
        }
      },
      {
        heading: "Domínios de pesquisa (filtros)",
        body: `<p>Os domínios do Odoo usam uma sintaxe especial com listas de tuplos. Cada condição é <code>[campo, operador, valor]</code>:</p>
<ul>
<li><code>["name", "=", "Paracetamol"]</code> — igualdade exacta</li>
<li><code>["name", "ilike", "para"]</code> — contém (case-insensitive)</li>
<li><code>["qty_available", ">", 0]</code> — maior que</li>
<li><code>["create_date", ">=", "2024-01-01"]</code> — data maior ou igual</li>
<li><code>["state", "in", ["sale", "done"]]</code> — valor numa lista</li>
<li><code>["active", "=", True]</code> — booleano</li>
</ul>`,
        callout: { label: "Atenção", text: 'Por defeito, múltiplas condições são combinadas com AND. Para usar OR, usa o operador <code>"|"</code> como prefixo: <code>["|", ["estado", "=", "a"], ["estado", "=", "b"]]</code>.' }
      },
      {
        heading: "Exemplo completo num script IA Engine",
        body: `<p>Script que sincroniza preços de produtos do Odoo para a base de dados local:</p>`,
        code: {
          filename: "sync_precos_odoo.py",
          content: `<span class="kw">from</span> odoo <span class="kw">import</span> Odoo
<span class="kw">import</span> pymssql


<span class="kw">class</span> <span class="cl">DatabaseWrapper</span>:
    <span class="kw">def</span> <span class="fn">__init__</span>(self, host, db, user, pwd):
        self.conn = pymssql.connect(host, user, pwd, db)
    <span class="kw">def</span> <span class="fn">execute</span>(self, sql, params=<span class="kw">None</span>):
        c = self.conn.cursor()
        c.execute(sql, params <span class="kw">or</span> ())
    <span class="kw">def</span> <span class="fn">commit</span>(self): self.conn.commit()
    <span class="kw">def</span> <span class="fn">close</span>(self): self.conn.close()


<span class="kw">def</span> <span class="fn">main</span>(**kwargs):
    env = kwargs[<span class="st">"ENV"</span>]

    <span class="cm"># Odoo: extrair produtos activos</span>
    odoo = Odoo(
        url=env[<span class="st">"ODOO_URL"</span>], db=env[<span class="st">"ODOO_DB"</span>],
        username=env[<span class="st">"ODOO_USERNAME"</span>], password=env[<span class="st">"ODOO_PASSWORD"</span>]
    )
    produtos = odoo.search_read(<span class="st">"product.product"</span>,
        [[<span class="st">"active"</span>, <span class="st">"="</span>, <span class="kw">True</span>]],
        [<span class="st">"default_code"</span>, <span class="st">"name"</span>, <span class="st">"list_price"</span>]
    )

    <span class="cm"># SQL Server: actualizar preços</span>
    db = DatabaseWrapper(env[<span class="st">"DATABASE_IP"</span>], env[<span class="st">"DATABASE_NAME"</span>],
                         env[<span class="st">"DATABASE_USER"</span>], env[<span class="st">"DATABASE_PASSWORD"</span>])
    <span class="kw">try</span>:
        <span class="kw">for</span> p <span class="kw">in</span> produtos:
            db.execute(
                <span class="st">"UPDATE Produtos SET Preco = %s WHERE CodigoOdoo = %s"</span>,
                (p[<span class="st">"list_price"</span>], p[<span class="st">"default_code"</span>])
            )
        db.commit()
        <span class="kw">return</span> (<span class="st">"ok"</span>, <span class="st">f"Actualizados </span>{<span class="fn">len</span>(produtos)}<span class="st"> preços"</span>)
    <span class="kw">finally</span>:
        db.close()`
        }
      }
    ],
    quiz: [
      {
        q: "Qual protocolo de comunicação é usado para integrar com o Odoo?",
        opts: ["REST API", "GraphQL", "XML-RPC", "WebSocket"],
        correct: 2,
        expl: "O Odoo disponibiliza uma interface XML-RPC que permite chamar funções remotas. A biblioteca odoo-py abstrai toda esta comunicação."
      },
      {
        q: "Qual a diferença entre <code>search()</code> e <code>search_read()</code> no odoo-py?",
        opts: ["Não há diferença", "<code>search()</code> retorna apenas IDs, <code>search_read()</code> retorna IDs e campos", "<code>search_read()</code> é mais lento", "<code>search()</code> retorna todos os campos"],
        correct: 1,
        expl: "<code>search()</code> retorna apenas uma lista de IDs. <code>search_read()</code> combina search + read, retornando directamente os campos pedidos."
      },
      {
        q: 'O que significa o domínio <code>["name", "ilike", "para"]</code>?',
        opts: ["Nome exactamente igual a 'para'", "Nome contém 'para' (case-insensitive)", "Nome começa com 'para'", "Nome não contém 'para'"],
        correct: 1,
        expl: "O operador <code>ilike</code> faz uma pesquisa case-insensitive que verifica se o campo contém a string indicada."
      },
      {
        q: "Quais variáveis de ambiente são necessárias para configurar o odoo-py?",
        opts: ["Apenas ODOO_URL", "ODOO_URL, ODOO_DB, ODOO_USERNAME, ODOO_PASSWORD", "ODOO_HOST e ODOO_PORT", "Apenas ODOO_API_KEY"],
        correct: 1,
        expl: "O odoo-py precisa de quatro variáveis: URL do servidor, nome da base de dados, username e password."
      },
      {
        q: "Como se actualiza um registo no Odoo via odoo-py?",
        opts: ["<code>odoo.update(modelo, id, dados)</code>", "<code>odoo.write(modelo, [ids], dados)</code>", "<code>odoo.save(modelo, dados)</code>", "<code>odoo.put(modelo, id, dados)</code>"],
        correct: 1,
        expl: "<code>odoo.write(modelo, [ids], {campo: valor})</code> actualiza os campos indicados nos registos com os IDs fornecidos."
      }
    ]
  },
  {
    id: "meilisearch",
    title: "Meilisearch",
    theory: [
      {
        heading: "O que é o Meilisearch?",
        body: `<p>O <strong>Meilisearch</strong> é um motor de pesquisa open-source ultra-rápido, usado na Nossa Farmácia para pesquisa de produtos, catálogos e outros dados que precisam de busca instantânea.</p>
<p>Características principais:</p>
<ul>
<li><strong>Pesquisa tolerante a erros</strong> — encontra resultados mesmo com typos</li>
<li><strong>Indexação rápida</strong> — milhões de documentos em segundos</li>
<li><strong>Filtros e facetas</strong> — pesquisa refinada por categorias, preços, etc.</li>
<li><strong>API REST simples</strong> — todas as operações via HTTP</li>
</ul>`
      },
      {
        heading: "Classe MeiliSearchWrapper",
        body: `<p>A wrapper encapsula autenticação e operações comuns:</p>`,
        code: {
          filename: "meilisearch_wrapper.py",
          content: `<span class="kw">import</span> requests


<span class="kw">class</span> <span class="cl">MeiliSearchError</span>(Exception):
    <span class="kw">pass</span>


<span class="kw">class</span> <span class="cl">MeiliSearchWrapper</span>:
    <span class="kw">def</span> <span class="fn">__init__</span>(self, host, api_key):
        self.host = host.rstrip(<span class="st">"/"</span>)
        self.headers = {
            <span class="st">"Authorization"</span>: <span class="st">f"Bearer </span>{api_key}<span class="st">"</span>,
            <span class="st">"Content-Type"</span>: <span class="st">"application/json"</span>,
        }

    <span class="kw">def</span> <span class="fn">_request</span>(self, method, path, json=<span class="kw">None</span>, params=<span class="kw">None</span>):
        resp = requests.request(
            method, <span class="st">f"</span>{self.host}{path}<span class="st">"</span>,
            headers=self.headers, json=json, params=params
        )
        <span class="kw">if not</span> resp.ok:
            <span class="kw">raise</span> MeiliSearchError(
                <span class="st">f"</span>{method} {path}<span class="st">: </span>{resp.status_code}<span class="st"> - </span>{resp.text}<span class="st">"</span>
            )
        <span class="kw">return</span> resp.json()

    <span class="kw">def</span> <span class="fn">search</span>(self, index, query, limit=<span class="nr">20</span>, filters=<span class="kw">None</span>):
        body = {<span class="st">"q"</span>: query, <span class="st">"limit"</span>: limit}
        <span class="kw">if</span> filters:
            body[<span class="st">"filter"</span>] = filters
        <span class="kw">return</span> self._request(<span class="st">"POST"</span>, <span class="st">f"/indexes/</span>{index}<span class="st">/search"</span>, json=body)

    <span class="kw">def</span> <span class="fn">index_documents</span>(self, index, docs, primary_key=<span class="kw">None</span>):
        path = <span class="st">f"/indexes/</span>{index}<span class="st">/documents"</span>
        params = {<span class="st">"primaryKey"</span>: primary_key} <span class="kw">if</span> primary_key <span class="kw">else</span> <span class="kw">None</span>
        <span class="kw">return</span> self._request(<span class="st">"POST"</span>, path, json=docs, params=params)

    <span class="kw">def</span> <span class="fn">delete_index</span>(self, index):
        <span class="kw">return</span> self._request(<span class="st">"DELETE"</span>, <span class="st">f"/indexes/</span>{index}<span class="st">"</span>)

    <span class="kw">def</span> <span class="fn">get_task</span>(self, task_uid):
        <span class="kw">return</span> self._request(<span class="st">"GET"</span>, <span class="st">f"/tasks/</span>{task_uid}<span class="st">"</span>)`
        }
      },
      {
        heading: "Indexar documentos",
        body: `<p>A indexação é a operação de carregar dados para o Meilisearch. Cada documento precisa de um campo que sirva como <strong>primary key</strong>.</p>`,
        code: {
          filename: "indexar_produtos.py",
          content: `<span class="kw">def</span> <span class="fn">main</span>(**kwargs):
    env = kwargs[<span class="st">"ENV"</span>]

    <span class="cm"># 1. Buscar dados do SQL Server</span>
    db = DatabaseWrapper(env[<span class="st">"DATABASE_IP"</span>], env[<span class="st">"DATABASE_NAME"</span>],
                         env[<span class="st">"DATABASE_USER"</span>], env[<span class="st">"DATABASE_PASSWORD"</span>])
    <span class="kw">try</span>:
        produtos = db.query(<span class="st">"""
            SELECT CodigoProduto, Nome, Categoria, Preco, Ativo
            FROM BIADDO.dbo.vw_ProdutosCatalogo
            WHERE Ativo = 1
        """</span>)
    <span class="kw">finally</span>:
        db.close()

    <span class="cm"># 2. Indexar no Meilisearch</span>
    meili = MeiliSearchWrapper(env[<span class="st">"MEILI_HOST"</span>], env[<span class="st">"MEILI_API_KEY"</span>])
    task = meili.index_documents(
        <span class="st">"produtos"</span>, produtos, primary_key=<span class="st">"CodigoProduto"</span>
    )

    <span class="kw">return</span> {
        <span class="st">"indexados"</span>: <span class="fn">len</span>(produtos),
        <span class="st">"task_uid"</span>: task[<span class="st">"taskUid"</span>],
    }`
        }
      },
      {
        heading: "Pesquisar documentos",
        body: `<p>A pesquisa no Meilisearch é tolerante a typos e suporta filtros:</p>`,
        code: {
          filename: "pesquisar_meili.py",
          content: `<span class="kw">def</span> <span class="fn">main</span>(**kwargs):
    env = kwargs[<span class="st">"ENV"</span>]
    query = kwargs.get(<span class="st">"query"</span>, <span class="st">""</span>)
    categoria = kwargs.get(<span class="st">"categoria"</span>)

    meili = MeiliSearchWrapper(env[<span class="st">"MEILI_HOST"</span>], env[<span class="st">"MEILI_API_KEY"</span>])

    <span class="cm"># Pesquisa simples</span>
    resultados = meili.search(<span class="st">"produtos"</span>, query, limit=<span class="nr">50</span>)

    <span class="cm"># Pesquisa com filtro de categoria</span>
    <span class="kw">if</span> categoria:
        resultados = meili.search(
            <span class="st">"produtos"</span>, query, limit=<span class="nr">50</span>,
            filters=<span class="st">f'Categoria = "</span>{categoria}<span class="st">"'</span>
        )

    <span class="kw">return</span> {
        <span class="st">"hits"</span>: resultados[<span class="st">"hits"</span>],
        <span class="st">"total"</span>: resultados[<span class="st">"estimatedTotalHits"</span>],
        <span class="st">"query"</span>: query,
    }`
        },
        callout: { label: "Dica", text: 'O Meilisearch retorna resultados em milissegundos, mesmo com milhões de documentos. Ideal para pesquisa em tempo real em catálogos de farmácia.' }
      }
    ],
    quiz: [
      {
        q: "Para que é usado o Meilisearch na Nossa Farmácia?",
        opts: ["Base de dados relacional", "Motor de pesquisa rápida para catálogos e produtos", "Servidor de ficheiros", "Sistema de pagamentos"],
        correct: 1,
        expl: "O Meilisearch é usado como motor de pesquisa ultra-rápido para catálogos de produtos, com tolerância a typos e filtros."
      },
      {
        q: "O que é necessário para indexar documentos no Meilisearch?",
        opts: ["Apenas o nome do índice", "Um índice, os documentos e uma primary key", "Uma tabela SQL", "Um ficheiro CSV"],
        correct: 1,
        expl: "Para indexar documentos, é necessário especificar o índice, fornecer os documentos como lista de dicionários e indicar o campo que serve de primary key."
      },
      {
        q: "Qual a vantagem principal do Meilisearch face a um <code>SELECT LIKE</code> no SQL Server?",
        opts: ["É gratuito", "Pesquisa tolerante a typos, ultra-rápida e com facetas", "Armazena mais dados", "Suporta transacções"],
        correct: 1,
        expl: "O Meilisearch oferece pesquisa tolerante a erros de escrita, resultados em milissegundos e facetas/filtros — funcionalidades que um <code>LIKE</code> simples não fornece."
      },
      {
        q: "No Meilisearch, a indexação é síncrona ou assíncrona?",
        opts: ["Síncrona — bloqueia até terminar", "Assíncrona — retorna um task_uid para acompanhar", "Depende do tamanho dos dados", "Síncrona apenas para poucos documentos"],
        correct: 1,
        expl: "A indexação no Meilisearch é assíncrona. Retorna um <code>taskUid</code> que pode ser consultado para verificar o estado da operação."
      },
      {
        q: "Porque se usa <code>raise MeiliSearchError()</code> em vez de deixar o erro genérico?",
        opts: ["O Meilisearch obriga", "Para identificar claramente a origem do erro nesta integração", "Para performance", "Para logging automático"],
        correct: 1,
        expl: "Uma exception customizada identifica claramente que o erro veio da integração com o Meilisearch, facilitando debug quando há múltiplas integrações no mesmo script."
      }
    ]
  },
  {
    id: "teams",
    title: "Microsoft Teams",
    theory: [
      {
        heading: "Notificações no Teams",
        body: `<p>O <strong>Microsoft Teams</strong> é usado para enviar <strong>notificações automáticas</strong> quando os scripts de automação falham ou completam tarefas importantes.</p>
<p>A integração usa <strong>Incoming Webhooks</strong> — URLs especiais que aceitam mensagens via HTTP POST e publicam-nas num canal do Teams.</p>`
      },
      {
        heading: "Como funciona o Webhook",
        body: `<p>Um Incoming Webhook é um URL único gerado pelo Teams para um canal específico. Basta enviar um POST com JSON para publicar uma mensagem:</p>`,
        code: {
          filename: "teams_basico.py",
          content: `<span class="kw">import</span> requests


<span class="kw">def</span> <span class="fn">enviar_teams</span>(webhook_url, mensagem):
    <span class="cm">"""Envia mensagem simples para o Teams."""</span>
    payload = {
        <span class="st">"text"</span>: mensagem
    }
    resp = requests.post(webhook_url, json=payload)
    resp.raise_for_status()


<span class="cm"># Uso:</span>
enviar_teams(
    env[<span class="st">"TEAMS_WEBHOOK_URL"</span>],
    <span class="st">"✅ Sync de produtos concluído: 1.532 produtos actualizados."</span>
)`
        }
      },
      {
        heading: "Notificação de erros (padrão interno)",
        body: `<p>O módulo <code>internal/teams_ticket_error_notification.py</code> é o padrão usado internamente para reportar falhas de scripts ao Teams. Formata mensagens com detalhes do erro:</p>`,
        code: {
          filename: "error_notification.py",
          content: `<span class="kw">import</span> requests
<span class="kw">import</span> traceback
<span class="kw">from</span> datetime <span class="kw">import</span> datetime


<span class="kw">def</span> <span class="fn">notificar_erro</span>(webhook_url, script_name, error):
    <span class="cm">"""Envia notificação de erro formatada para o Teams."""</span>
    payload = {
        <span class="st">"@type"</span>: <span class="st">"MessageCard"</span>,
        <span class="st">"themeColor"</span>: <span class="st">"FF0000"</span>,
        <span class="st">"title"</span>: <span class="st">f"❌ Erro: </span>{script_name}<span class="st">"</span>,
        <span class="st">"text"</span>: <span class="st">f"**Script:** </span>{script_name}<span class="st">\\n\\n"</span>
                <span class="st">f"**Data:** </span>{datetime.now().strftime(<span class="st">'%Y-%m-%d %H:%M'</span>)}<span class="st">\\n\\n"</span>
                <span class="st">f"**Erro:** </span>{<span class="fn">str</span>(error)}<span class="st">\\n\\n"</span>
                <span class="st">f"**Traceback:**\\n\\n\`\`\`\\n</span>{traceback.format_exc()}<span class="st">\\n\`\`\`"</span>,
    }
    <span class="kw">try</span>:
        requests.post(webhook_url, json=payload, timeout=<span class="nr">10</span>)
    <span class="kw">except</span> Exception:
        <span class="kw">pass</span>  <span class="cm"># Falha silenciosa — não bloquear por erro de notificação</span>`
        }
      },
      {
        heading: "Integração no fluxo do script",
        body: `<p>O padrão é notificar o Teams no <code>except</code> do script principal, antes de re-lançar o erro:</p>`,
        code: {
          filename: "script_com_teams.py",
          content: `<span class="kw">def</span> <span class="fn">main</span>(**kwargs):
    env = kwargs[<span class="st">"ENV"</span>]

    <span class="kw">try</span>:
        <span class="cm"># Lógica de negócio...</span>
        resultado = processar_dados(env)
        <span class="kw">return</span> (<span class="st">"ok"</span>, <span class="st">f"Processados </span>{resultado}<span class="st"> registos"</span>)

    <span class="kw">except</span> Exception <span class="kw">as</span> e:
        <span class="cm"># Notificar Teams antes de propagar o erro</span>
        notificar_erro(
            env[<span class="st">"TEAMS_WEBHOOK_URL"</span>],
            <span class="st">"sync_produtos"</span>,
            e
        )
        <span class="kw">raise</span>  <span class="cm"># Re-lançar para o task_engine registar a falha</span>`
        },
        callout: { label: "Importante", text: 'A notificação de erro usa <code>try/except</code> com <code>pass</code> internamente. Se o envio para o Teams falhar, não queremos que essa falha mascare o erro original do script.' }
      }
    ],
    quiz: [
      {
        q: "Qual mecanismo é usado para enviar mensagens ao Microsoft Teams?",
        opts: ["API Graph do Microsoft 365", "Incoming Webhooks (HTTP POST)", "Email SMTP", "Bot Framework"],
        correct: 1,
        expl: "A integração usa Incoming Webhooks — URLs que aceitam mensagens via HTTP POST e publicam-nas num canal do Teams."
      },
      {
        q: "Porque é que a função <code>notificar_erro()</code> tem um <code>try/except</code> com <code>pass</code>?",
        opts: ["Para melhorar performance", "Para evitar que uma falha no envio ao Teams mascare o erro original", "Porque o Teams exige", "Para retry automático"],
        correct: 1,
        expl: "Se o envio ao Teams falhar, não queremos que essa falha secundária mascare ou substitua o erro original do script. Por isso falha silenciosamente."
      },
      {
        q: "Qual o formato de mensagem usado para notificações ricas no Teams?",
        opts: ["HTML simples", "MessageCard com themeColor, title e text", "Plain text apenas", "XML"],
        correct: 1,
        expl: "O formato MessageCard permite mensagens formatadas com cor do tema, título e texto com Markdown, incluindo code blocks para tracebacks."
      },
      {
        q: "Em que momento do script se deve notificar o Teams sobre um erro?",
        opts: ["No início do script", "No bloco except, antes de re-lançar o erro", "No finally", "Nunca, é automático"],
        correct: 1,
        expl: "A notificação é feita no <code>except</code>, depois de capturar o erro mas antes do <code>raise</code> para que o task_engine também registe a falha."
      }
    ]
  },
  {
    id: "vtex",
    title: "VTEX E-Commerce",
    theory: [
      {
        heading: "O que é o VTEX?",
        body: `<p>O <strong>VTEX</strong> é a plataforma de e-commerce usada pela Nossa Farmácia para a loja online. A integração com o IA Engine permite:</p>
<ul>
<li><strong>Sincronizar catálogo</strong> — produtos, preços, stock e categorias</li>
<li><strong>Gerir encomendas</strong> — consultar, actualizar estado e processar</li>
<li><strong>Actualizar preços em massa</strong> — propagação de alterações de preço do ERP para a loja</li>
<li><strong>Gestão de promoções</strong> — criar e desactivar promoções programaticamente</li>
</ul>`
      },
      {
        heading: "Autenticação VTEX",
        body: `<p>A API VTEX usa dois headers de autenticação: <code>X-VTEX-API-AppKey</code> e <code>X-VTEX-API-AppToken</code>.</p>`,
        code: {
          filename: "vtex_wrapper.py",
          content: `<span class="kw">import</span> requests


<span class="kw">class</span> <span class="cl">VTEXError</span>(Exception):
    <span class="kw">pass</span>


<span class="kw">class</span> <span class="cl">VTEXWrapper</span>:
    <span class="kw">def</span> <span class="fn">__init__</span>(self, account_name, app_key, app_token):
        self.base_url = <span class="st">f"https://</span>{account_name}<span class="st">.vtexcommercestable.com.br"</span>
        self.headers = {
            <span class="st">"X-VTEX-API-AppKey"</span>: app_key,
            <span class="st">"X-VTEX-API-AppToken"</span>: app_token,
            <span class="st">"Content-Type"</span>: <span class="st">"application/json"</span>,
            <span class="st">"Accept"</span>: <span class="st">"application/json"</span>,
        }

    <span class="kw">def</span> <span class="fn">_get</span>(self, path, params=<span class="kw">None</span>):
        resp = requests.get(
            <span class="st">f"</span>{self.base_url}{path}<span class="st">"</span>,
            headers=self.headers, params=params
        )
        <span class="kw">if not</span> resp.ok:
            <span class="kw">raise</span> VTEXError(<span class="st">f"GET </span>{path}<span class="st">: </span>{resp.status_code}<span class="st">"</span>)
        <span class="kw">return</span> resp.json()

    <span class="kw">def</span> <span class="fn">_put</span>(self, path, data):
        resp = requests.put(
            <span class="st">f"</span>{self.base_url}{path}<span class="st">"</span>,
            headers=self.headers, json=data
        )
        <span class="kw">if not</span> resp.ok:
            <span class="kw">raise</span> VTEXError(<span class="st">f"PUT </span>{path}<span class="st">: </span>{resp.status_code}<span class="st">"</span>)
        <span class="kw">return</span> resp.json() <span class="kw">if</span> resp.text <span class="kw">else</span> <span class="kw">None</span>`
        }
      },
      {
        heading: "Consultar e gerir encomendas",
        body: `<p>A API de Orders do VTEX permite listar e consultar encomendas:</p>`,
        code: {
          filename: "vtex_orders.py",
          content: `<span class="kw">class</span> <span class="cl">VTEXWrapper</span>:
    <span class="cm"># ... __init__, _get, _put ...</span>

    <span class="kw">def</span> <span class="fn">list_orders</span>(self, status=<span class="kw">None</span>, page=<span class="nr">1</span>, per_page=<span class="nr">50</span>):
        <span class="cm">"""Lista encomendas com paginação."""</span>
        params = {
            <span class="st">"page"</span>: page,
            <span class="st">"per_page"</span>: per_page,
        }
        <span class="kw">if</span> status:
            params[<span class="st">"f_status"</span>] = status
        <span class="kw">return</span> self._get(<span class="st">"/api/oms/pvt/orders"</span>, params)

    <span class="kw">def</span> <span class="fn">get_order</span>(self, order_id):
        <span class="cm">"""Detalhes de uma encomenda específica."""</span>
        <span class="kw">return</span> self._get(<span class="st">f"/api/oms/pvt/orders/</span>{order_id}<span class="st">"</span>)

    <span class="kw">def</span> <span class="fn">start_handling</span>(self, order_id):
        <span class="cm">"""Marca encomenda como 'em preparação'."""</span>
        resp = requests.post(
            <span class="st">f"</span>{self.base_url}<span class="st">/api/oms/pvt/orders/</span>{order_id}<span class="st">/start-handling"</span>,
            headers=self.headers
        )
        <span class="kw">if not</span> resp.ok:
            <span class="kw">raise</span> VTEXError(<span class="st">f"start-handling </span>{order_id}<span class="st">: </span>{resp.status_code}<span class="st">"</span>)


<span class="cm"># Uso no main():</span>
<span class="kw">def</span> <span class="fn">main</span>(**kwargs):
    env = kwargs[<span class="st">"ENV"</span>]
    vtex = VTEXWrapper(env[<span class="st">"VTEX_ACCOUNT"</span>],
                       env[<span class="st">"VTEX_APP_KEY"</span>], env[<span class="st">"VTEX_APP_TOKEN"</span>])

    orders = vtex.list_orders(status=<span class="st">"ready-for-handling"</span>)
    <span class="kw">return</span> {<span class="st">"total"</span>: <span class="fn">len</span>(orders[<span class="st">"list"</span>]), <span class="st">"orders"</span>: orders[<span class="st">"list"</span>]}`
        }
      },
      {
        heading: "Actualizar preços",
        body: `<p>A actualização de preços no VTEX é uma das automações mais importantes — propaga preços do ERP para a loja online:</p>`,
        code: {
          filename: "vtex_precos.py",
          content: `<span class="kw">class</span> <span class="cl">VTEXWrapper</span>:
    <span class="cm"># ... __init__ ...</span>

    <span class="kw">def</span> <span class="fn">update_price</span>(self, sku_id, price, list_price=<span class="kw">None</span>):
        <span class="cm">"""Actualiza o preço de um SKU."""</span>
        data = {
            <span class="st">"markup"</span>: <span class="nr">0</span>,
            <span class="st">"basePrice"</span>: price,
        }
        <span class="kw">if</span> list_price:
            data[<span class="st">"listPrice"</span>] = list_price
        self._put(<span class="st">f"/api/pricing/prices/</span>{sku_id}<span class="st">"</span>, data)


<span class="cm"># Pipeline completo: Odoo → VTEX</span>
<span class="kw">def</span> <span class="fn">main</span>(**kwargs):
    env = kwargs[<span class="st">"ENV"</span>]

    <span class="cm"># 1. Buscar preços no Odoo</span>
    odoo = Odoo(url=env[<span class="st">"ODOO_URL"</span>], db=env[<span class="st">"ODOO_DB"</span>],
                username=env[<span class="st">"ODOO_USERNAME"</span>], password=env[<span class="st">"ODOO_PASSWORD"</span>])
    produtos = odoo.search_read(<span class="st">"product.product"</span>,
        [[<span class="st">"sale_ok"</span>, <span class="st">"="</span>, <span class="kw">True</span>]],
        [<span class="st">"default_code"</span>, <span class="st">"list_price"</span>]
    )

    <span class="cm"># 2. Actualizar no VTEX</span>
    vtex = VTEXWrapper(env[<span class="st">"VTEX_ACCOUNT"</span>],
                       env[<span class="st">"VTEX_APP_KEY"</span>], env[<span class="st">"VTEX_APP_TOKEN"</span>])
    actualizados = <span class="nr">0</span>
    <span class="kw">for</span> p <span class="kw">in</span> produtos:
        <span class="kw">try</span>:
            vtex.update_price(p[<span class="st">"default_code"</span>], p[<span class="st">"list_price"</span>])
            actualizados += <span class="nr">1</span>
        <span class="kw">except</span> VTEXError <span class="kw">as</span> e:
            <span class="fn">print</span>(<span class="st">f"Erro SKU </span>{p[<span class="st">'default_code'</span>]}<span class="st">: </span>{e}<span class="st">"</span>)

    <span class="kw">return</span> (<span class="st">"ok"</span>, <span class="st">f"</span>{actualizados}<span class="st">/</span>{<span class="fn">len</span>(produtos)}<span class="st"> preços actualizados"</span>)`
        },
        callout: { label: "Padrão", text: "Na actualização de preços em massa, erros individuais são capturados e logados, mas não interrompem o processamento dos restantes produtos. O resultado final reporta quantos foram actualizados com sucesso." }
      }
    ],
    quiz: [
      {
        q: "Quais headers são usados para autenticar na API VTEX?",
        opts: ["<code>Authorization: Bearer token</code>", "<code>X-VTEX-API-AppKey</code> e <code>X-VTEX-API-AppToken</code>", "<code>X-API-Key</code>", "Basic Auth com username e password"],
        correct: 1,
        expl: "A API VTEX usa dois headers específicos: <code>X-VTEX-API-AppKey</code> e <code>X-VTEX-API-AppToken</code> para autenticação."
      },
      {
        q: "Qual o URL base da API VTEX?",
        opts: ["<code>api.vtex.com</code>", "<code>{account}.vtexcommercestable.com.br</code>", "<code>vtex.io/{account}</code>", "<code>{account}.vtex.com</code>"],
        correct: 1,
        expl: "O URL base segue o padrão <code>https://{accountName}.vtexcommercestable.com.br</code> para a API REST estável."
      },
      {
        q: "Na actualização de preços em massa, porque se usa <code>try/except</code> dentro do loop?",
        opts: ["Para melhorar performance", "Para que um erro num SKU não interrompa a actualização dos restantes", "Porque a VTEX obriga", "Para logging apenas"],
        correct: 1,
        expl: "Capturar erros individualmente permite continuar a processar os restantes produtos. Um SKU com problema não deve bloquear a actualização dos outros."
      },
      {
        q: "Qual a API VTEX para gerir encomendas?",
        opts: ["<code>/api/catalog/</code>", "<code>/api/oms/pvt/orders</code>", "<code>/api/checkout/</code>", "<code>/api/orders/</code>"],
        correct: 1,
        expl: "A API de Order Management System (OMS) da VTEX está em <code>/api/oms/pvt/orders</code> e permite listar, consultar e gerir encomendas."
      },
      {
        q: "Qual é um exemplo real de pipeline que combina múltiplas integrações?",
        opts: ["Odoo → VTEX: buscar preços no ERP e actualizar na loja online", "Teams → SQL Server: enviar mensagens para a base de dados", "Meilisearch → Odoo: indexar pesquisas no ERP", "VTEX → Teams: enviar encomendas por chat"],
        correct: 0,
        expl: "O pipeline Odoo → VTEX é um exemplo real: extrai preços do ERP (Odoo) e actualiza-os na loja online (VTEX), combinando duas integrações num único script."
      }
    ]
  },
  {
    id: "logistica",
    title: "APIs de Logística",
    theory: [
      {
        heading: "Integrações logísticas",
        body: `<p>A Nossa Farmácia integra-se com múltiplos parceiros de logística para gestão de envios e entregas:</p>
<ul>
<li><strong>CTT</strong> — Correios de Portugal (envios postais nacionais)</li>
<li><strong>OCP</strong> — Distribuição farmacêutica</li>
<li><strong>Torres Pharma</strong> — Logística farmacêutica especializada</li>
<li><strong>Glovo</strong> — Entregas rápidas (last-mile delivery)</li>
<li><strong>Uber Eats</strong> — Entregas rápidas (marketplace)</li>
</ul>
<p>Cada integração tem a sua própria classe wrapper, mas todas seguem o mesmo padrão arquitectural.</p>`
      },
      {
        heading: "Padrão de API logística",
        body: `<p>As integrações logísticas seguem tipicamente este fluxo:</p>
<ul>
<li><strong>1. Autenticar</strong> — obter token de acesso (tipicamente JWT ou API key)</li>
<li><strong>2. Criar envio</strong> — registar a encomenda no sistema do parceiro</li>
<li><strong>3. Obter etiqueta</strong> — gerar o PDF da etiqueta de envio</li>
<li><strong>4. Tracking</strong> — consultar o estado do envio</li>
</ul>`,
        code: {
          filename: "logistica_wrapper.py",
          content: `<span class="kw">import</span> requests


<span class="kw">class</span> <span class="cl">LogisticaError</span>(Exception):
    <span class="kw">pass</span>


<span class="kw">class</span> <span class="cl">LogisticaWrapper</span>:
    <span class="cm">"""Classe base para integrações logísticas."""</span>

    <span class="kw">def</span> <span class="fn">__init__</span>(self, base_url, username, password):
        self.base_url = base_url.rstrip(<span class="st">"/"</span>)
        self.token = self._authenticate(username, password)

    <span class="kw">def</span> <span class="fn">_authenticate</span>(self, user, pwd):
        resp = requests.post(
            <span class="st">f"</span>{self.base_url}<span class="st">/auth/token"</span>,
            json={<span class="st">"username"</span>: user, <span class="st">"password"</span>: pwd}
        )
        resp.raise_for_status()
        <span class="kw">return</span> resp.json()[<span class="st">"access_token"</span>]

    <span class="kw">def</span> <span class="fn">_headers</span>(self):
        <span class="kw">return</span> {<span class="st">"Authorization"</span>: <span class="st">f"Bearer </span>{self.token}<span class="st">"</span>}

    <span class="kw">def</span> <span class="fn">criar_envio</span>(self, encomenda):
        resp = requests.post(
            <span class="st">f"</span>{self.base_url}<span class="st">/shipments"</span>,
            headers=self._headers(), json=encomenda
        )
        <span class="kw">if not</span> resp.ok:
            <span class="kw">raise</span> LogisticaError(<span class="st">f"Erro ao criar envio: </span>{resp.text}<span class="st">"</span>)
        <span class="kw">return</span> resp.json()

    <span class="kw">def</span> <span class="fn">tracking</span>(self, tracking_number):
        resp = requests.get(
            <span class="st">f"</span>{self.base_url}<span class="st">/tracking/</span>{tracking_number}<span class="st">"</span>,
            headers=self._headers()
        )
        resp.raise_for_status()
        <span class="kw">return</span> resp.json()`
        }
      },
      {
        heading: "Exemplo: processar envios pendentes",
        body: `<p>Script que consulta encomendas prontas no BIADDO e cria envios no parceiro logístico:</p>`,
        code: {
          filename: "processar_envios.py",
          content: `<span class="kw">def</span> <span class="fn">main</span>(**kwargs):
    env = kwargs[<span class="st">"ENV"</span>]

    <span class="cm"># 1. Buscar encomendas pendentes</span>
    db = DatabaseWrapper(env[<span class="st">"DATABASE_IP"</span>], env[<span class="st">"DATABASE_NAME"</span>],
                         env[<span class="st">"DATABASE_USER"</span>], env[<span class="st">"DATABASE_PASSWORD"</span>])
    <span class="kw">try</span>:
        pendentes = db.query(<span class="st">"""
            SELECT EncomendaID, Morada, CodigoPostal, Peso
            FROM Encomendas
            WHERE Estado = 'pendente_envio'
        """</span>)

        <span class="kw">if not</span> pendentes:
            <span class="kw">return</span> (<span class="st">"ok"</span>, <span class="st">"Sem encomendas pendentes"</span>)

        <span class="cm"># 2. Criar envios</span>
        logistica = LogisticaWrapper(
            env[<span class="st">"LOGISTICA_URL"</span>], env[<span class="st">"LOGISTICA_USER"</span>],
            env[<span class="st">"LOGISTICA_PASS"</span>]
        )
        enviados = <span class="nr">0</span>
        <span class="kw">for</span> enc <span class="kw">in</span> pendentes:
            <span class="kw">try</span>:
                resultado = logistica.criar_envio(enc)
                db.execute(
                    <span class="st">"UPDATE Encomendas SET Estado=%s, Tracking=%s WHERE EncomendaID=%s"</span>,
                    (<span class="st">"enviado"</span>, resultado[<span class="st">"tracking"</span>], enc[<span class="st">"EncomendaID"</span>])
                )
                enviados += <span class="nr">1</span>
            <span class="kw">except</span> LogisticaError <span class="kw">as</span> e:
                <span class="fn">print</span>(<span class="st">f"Erro encomenda </span>{enc[<span class="st">'EncomendaID'</span>]}<span class="st">: </span>{e}<span class="st">"</span>)

        db.commit()
        <span class="kw">return</span> (<span class="st">"ok"</span>, <span class="st">f"</span>{enviados}<span class="st">/</span>{<span class="fn">len</span>(pendentes)}<span class="st"> encomendas enviadas"</span>)
    <span class="kw">finally</span>:
        db.close()`
        }
      },
      {
        heading: "Pagamentos e facturação",
        body: `<p>Além da logística, o IA Engine integra com serviços de <strong>pagamentos</strong> e <strong>facturação</strong>:</p>
<ul>
<li><strong>Easypay / Paygate</strong> — processamento de pagamentos (gerar referências MB, MB Way, cartão)</li>
<li><strong>Moloni</strong> — emissão automática de facturas e notas de crédito</li>
</ul>
<p>Estas integrações seguem exactamente o mesmo padrão: classe wrapper com autenticação, métodos para cada operação e exceptions customizadas.</p>`,
        callout: { label: "Nota", text: "Integrações de pagamentos e facturação têm requisitos extra de segurança — todas as credenciais são sensíveis e nunca devem aparecer em logs ou mensagens de erro enviadas ao Teams." }
      }
    ],
    quiz: [
      {
        q: "Qual o fluxo típico de uma integração logística?",
        opts: ["Apenas criar o envio", "Autenticar → Criar envio → Obter etiqueta → Tracking", "Enviar email ao cliente", "Actualizar a base de dados apenas"],
        correct: 1,
        expl: "O fluxo standard é: autenticar na API do parceiro, criar o envio, obter a etiqueta e depois consultar o tracking para acompanhar o estado."
      },
      {
        q: "Porque se usa <code>try/except</code> dentro do loop de envios?",
        opts: ["Para melhorar performance", "Para que o erro numa encomenda não bloqueie as restantes", "Porque o Python obriga", "Para retry automático"],
        correct: 1,
        expl: "Capturar erros individualmente garante que uma falha numa encomenda não impede o processamento das restantes."
      },
      {
        q: "Quais serviços de pagamento são integrados com o IA Engine?",
        opts: ["Stripe e PayPal", "Easypay e Paygate", "Square e Adyen", "MB Way directamente"],
        correct: 1,
        expl: "O IA Engine integra-se com Easypay e Paygate para processamento de pagamentos (referências MB, MB Way, cartão)."
      },
      {
        q: "Qual o cuidado extra com integrações de pagamentos e facturação?",
        opts: ["Usar HTTP em vez de HTTPS", "As credenciais são sensíveis e nunca devem aparecer em logs ou notificações", "Não precisam de autenticação", "Podem usar credenciais hardcoded"],
        correct: 1,
        expl: "Credenciais de pagamento e facturação são especialmente sensíveis. Nunca devem aparecer em logs, mensagens de erro ou notificações do Teams."
      }
    ]
  },
  {
    id: "quiz-final",
    title: "Quiz Final",
    theory: [
      {
        heading: "Revisão Geral",
        body: `<p>Esta secção testa o conhecimento completo sobre integrações externas no IA Engine. As perguntas cobrem todos os tópicos anteriores e incluem cenários práticos.</p>
<p>Tenta responder sem consultar as secções anteriores!</p>`
      }
    ],
    quiz: [
      {
        q: "Tens um requisito para sincronizar preços do Odoo para a loja VTEX. Que integrações usas e em que ordem?",
        opts: ["VTEX → Odoo", "Odoo (search_read) → VTEX (update_price)", "SQL Server → Meilisearch", "Teams → Odoo"],
        correct: 1,
        expl: "O fluxo é: extrair preços do Odoo com <code>search_read()</code>, depois actualizar cada SKU no VTEX com <code>update_price()</code>."
      },
      {
        q: "Um script de automação falha às 3h da manhã. Como é que a equipa é notificada?",
        opts: ["Email automático do Django", "Notificação no Microsoft Teams via webhook", "SMS", "Ninguém é notificado"],
        correct: 1,
        expl: "O padrão interno é enviar notificações de erro ao Microsoft Teams via Incoming Webhooks, incluindo o nome do script, data e traceback."
      },
      {
        q: "Qual a diferença entre <code>search()</code> e <code>search_read()</code> no Odoo?",
        opts: ["<code>search()</code> é mais rápido", "<code>search()</code> retorna IDs, <code>search_read()</code> retorna IDs + campos", "<code>search_read()</code> é deprecated", "Não há diferença"],
        correct: 1,
        expl: "<code>search()</code> retorna apenas IDs. <code>search_read()</code> é uma conveniência que combina search + read, retornando directamente os dados dos campos pedidos."
      },
      {
        q: "A indexação no Meilisearch é síncrona ou assíncrona? Qual a implicação?",
        opts: ["Síncrona — bloqueia o script", "Assíncrona — retorna task_uid, dados podem não estar disponíveis imediatamente", "Depende do tamanho", "É síncrona mas com timeout"],
        correct: 1,
        expl: "A indexação é assíncrona. O Meilisearch retorna um <code>taskUid</code> e os dados podem levar um momento até estarem pesquisáveis."
      },
      {
        q: "Qual o padrão para tratar erros em processamento em massa (ex: actualizar 1000 preços no VTEX)?",
        opts: ["Parar ao primeiro erro", "try/except dentro do loop — logar erros individuais sem parar o processamento", "Ignorar todos os erros", "Retry infinito por item"],
        correct: 1,
        expl: "Em processamento em massa, erros individuais são capturados e logados dentro do loop, sem interromper os restantes itens. O resultado final reporta o rácio de sucesso."
      },
      {
        q: "Quais são os headers de autenticação da API VTEX?",
        opts: ["<code>Authorization: Bearer token</code>", "<code>X-VTEX-API-AppKey</code> e <code>X-VTEX-API-AppToken</code>", "<code>X-API-Key</code>", "Cookie de sessão"],
        correct: 1,
        expl: "A VTEX usa dois headers específicos: <code>X-VTEX-API-AppKey</code> e <code>X-VTEX-API-AppToken</code>."
      },
      {
        q: "Porque é que todas as integrações usam classes wrapper em vez de chamar <code>requests</code> directamente na <code>main()</code>?",
        opts: ["É obrigatório pelo IA Engine", "Para separar lógica de integração, facilitar reutilização e manter a main() limpa", "Para performance", "Para compatibilidade com Django"],
        correct: 1,
        expl: "Classes wrapper separam a lógica de integração (autenticação, URLs, headers) da lógica de negócio na <code>main()</code>, facilitando reutilização, testes e manutenção."
      },
      {
        q: 'Tens este código. Qual o problema?<br><br><code>def main(**kwargs):<br>&nbsp;&nbsp;odoo = Odoo(url="https://odoo.empresa.pt",<br>&nbsp;&nbsp;&nbsp;&nbsp;db="prod", username="admin", password="Pass123")</code>',
        opts: ["O Odoo não funciona assim", "As credenciais estão hardcoded — deviam estar no ENV", "Falta o return", "Não há problema"],
        correct: 1,
        expl: 'URL, base de dados, username e password estão hardcoded. Deviam ser acedidos via <code>kwargs["ENV"]</code>.'
      },
      {
        q: "Na notificação de erro ao Teams, porque se usa <code>pass</code> no except interno?",
        opts: ["Para ignorar o erro do script", "Para que uma falha no envio ao Teams não mascare o erro original", "Porque o webhook é opcional", "Para retry"],
        correct: 1,
        expl: "Se o envio ao Teams falhar, não queremos que essa falha substitua ou mascare o erro original do script. O <code>pass</code> garante falha silenciosa da notificação."
      },
      {
        q: "Qual destes é o fluxo correcto para processar envios pendentes?",
        opts: [
          "Criar envio → Buscar encomendas → Actualizar BD",
          "Buscar encomendas pendentes → Criar envio no parceiro → Actualizar estado na BD → Commit",
          "Actualizar BD → Criar envio → Buscar encomendas",
          "Enviar email → Criar envio → Buscar encomendas"
        ],
        correct: 1,
        expl: "O fluxo correcto é: consultar encomendas pendentes na BD, criar envio na API logística, actualizar o estado e tracking na BD, e fazer commit."
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

export default function IntegracoesPage() {
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
        <img src="https://nossafarmacia.vtexassets.com/assets/vtex.file-manager-graphql/images/f432f301-b5fa-4453-aa24-22ea02396e16___13e59f7056915bc23b198375758778f6.png" alt="Nossa Farmácia" className="hero-logo" />
        <div className="hero-badge">Integrações · Guia de Estudo</div>
        <h1>Integrações <em>Externas</em></h1>
        <p>Odoo XML-RPC, Meilisearch, Teams, VTEX e outras integrações da plataforma.</p>
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
