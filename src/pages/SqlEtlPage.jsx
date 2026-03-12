import { useState, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import "./ApiStudyPage.css";

// ═══════════════════════════════════════
// DATA
// ═══════════════════════════════════════
const SECTIONS = [
  {
    id: "intro",
    title: "SQL Server no IA Engine",
    theory: [
      {
        heading: "Definição",
        body: `<p>O <strong>SQL Server</strong> é o motor de base de dados central usado nos projectos Nossa Farmácia / Addo Pharma. Todos os scripts de automação e APIs do IA Engine acedem ao SQL Server via <strong>pymssql</strong>.</p>
<p>Os dados de negócio — encomendas, stock, facturação, logística — residem em bases SQL Server, e o <strong>BIADDO</strong> é o data warehouse onde vivem as views e tabelas agregadas para análise.</p>`
      },
      {
        heading: "Arquitectura de dados",
        body: `<ul>
<li><strong>Bases operacionais</strong> — dados transaccionais em tempo real (encomendas, movimentos de stock, etc.)</li>
<li><strong>BIADDO</strong> — data warehouse com views agregadas, tabelas dimensionais e tabelas de facto para reporting e análise</li>
<li><strong>pymssql</strong> — biblioteca Python usada em todos os scripts para conectar ao SQL Server</li>
<li><strong>Stored Procedures</strong> — lógica de negócio encapsulada no servidor para operações complexas ou recorrentes</li>
</ul>`
      },
      {
        heading: "Conexão ao SQL Server com pymssql",
        body: `<p>O padrão de conexão usado em todos os scripts do IA Engine segue esta estrutura:</p>`,
        code: {
          filename: "conexao_basica.py",
          content: `<span class="kw">import</span> pymssql

<span class="kw">def</span> <span class="fn">main</span>(**kwargs):
    env = kwargs[<span class="st">"ENV"</span>]

    conn = pymssql.connect(
        server=env[<span class="st">"DATABASE_IP"</span>],
        user=env[<span class="st">"DATABASE_USER"</span>],
        password=env[<span class="st">"DATABASE_PASSWORD"</span>],
        database=env[<span class="st">"DATABASE_NAME"</span>],
    )
    cursor = conn.cursor(as_dict=<span class="kw">True</span>)

    cursor.execute(<span class="st">"SELECT TOP 10 * FROM BIADDO.dbo.vw_Exemplo"</span>)
    rows = cursor.fetchall()

    conn.close()
    <span class="kw">return</span> {<span class="st">"total"</span>: <span class="fn">len</span>(rows), <span class="st">"dados"</span>: rows}`
        }
      }
    ],
    quiz: [
      {
        q: "Qual a biblioteca Python usada nos scripts do IA Engine para conectar ao SQL Server?",
        opts: ["psycopg2", "pymssql", "sqlalchemy", "pyodbc"],
        correct: 1,
        expl: "O <code>pymssql</code> é a biblioteca padrão usada em todos os scripts de automação e APIs do IA Engine para conectar ao SQL Server."
      },
      {
        q: "O que é o BIADDO no contexto da Nossa Farmácia?",
        opts: ["Uma aplicação web", "O data warehouse com views e tabelas agregadas para análise", "Um servidor de ficheiros", "Uma API REST"],
        correct: 1,
        expl: "O BIADDO é o data warehouse que contém views agregadas, tabelas dimensionais e de facto para reporting e análise de dados de negócio."
      },
      {
        q: "Qual o parâmetro do cursor que permite receber resultados como dicionários?",
        opts: ["<code>as_list=True</code>", "<code>dict_cursor=True</code>", "<code>as_dict=True</code>", "<code>row_factory=dict</code>"],
        correct: 2,
        expl: "<code>cursor = conn.cursor(as_dict=True)</code> faz com que cada linha retornada seja um dicionário com os nomes das colunas como chaves."
      },
      {
        q: "Onde devem estar guardadas as credenciais de acesso ao SQL Server num script do IA Engine?",
        opts: ["Hardcoded no script", "Num ficheiro .txt", 'Nas variáveis de ambiente via <code>kwargs["ENV"]</code>', "No código-fonte do Django"],
        correct: 2,
        expl: 'As credenciais devem estar sempre nas variáveis de ambiente, acessíveis via <code>kwargs["ENV"]</code>. Nunca hardcodar passwords ou IPs no código.'
      }
    ]
  },
  {
    id: "views",
    title: "Views no SQL Server",
    theory: [
      {
        heading: "O que é uma View?",
        body: `<p>Uma <strong>View</strong> é uma consulta SQL guardada no servidor como se fosse uma "tabela virtual". Não armazena dados — executa a query subjacente cada vez que é consultada.</p>
<p>No BIADDO, as views são usadas para:</p>
<ul>
<li><strong>Simplificar queries complexas</strong> — encapsulam JOINs, filtros e agregações</li>
<li><strong>Padronizar o acesso a dados</strong> — os scripts Python consultam views em vez de escreverem queries longas</li>
<li><strong>Segurança</strong> — expõem apenas as colunas necessárias sem dar acesso directo às tabelas base</li>
</ul>`
      },
      {
        heading: "Criar uma View",
        body: `<p>Uma view é definida com <code>CREATE VIEW</code> e pode referenciar múltiplas tabelas.</p>`,
        code: {
          filename: "criar_view.sql",
          content: `<span class="kw">CREATE VIEW</span> BIADDO.dbo.vw_EncomendaResumo
<span class="kw">AS</span>
<span class="kw">SELECT</span>
    e.EncomendaID,
    e.DataCriacao,
    e.Estado,
    c.NomeCliente,
    c.Email,
    <span class="fn">SUM</span>(li.Quantidade * li.PrecoUnitario) <span class="kw">AS</span> ValorTotal,
    <span class="fn">COUNT</span>(li.LinhaID) <span class="kw">AS</span> NumLinhas
<span class="kw">FROM</span> Encomendas e
<span class="kw">INNER JOIN</span> Clientes c <span class="kw">ON</span> c.ClienteID = e.ClienteID
<span class="kw">INNER JOIN</span> LinhasEncomenda li <span class="kw">ON</span> li.EncomendaID = e.EncomendaID
<span class="kw">GROUP BY</span>
    e.EncomendaID, e.DataCriacao, e.Estado,
    c.NomeCliente, c.Email;`
        }
      },
      {
        heading: "Alterar e eliminar Views",
        body: `<p>Usa <code>ALTER VIEW</code> para modificar e <code>DROP VIEW</code> para eliminar.</p>`,
        code: {
          filename: "alterar_view.sql",
          content: `<span class="cm">-- Alterar uma view existente</span>
<span class="kw">ALTER VIEW</span> BIADDO.dbo.vw_EncomendaResumo
<span class="kw">AS</span>
<span class="kw">SELECT</span>
    e.EncomendaID,
    e.DataCriacao,
    e.Estado,
    c.NomeCliente,
    <span class="fn">SUM</span>(li.Quantidade * li.PrecoUnitario) <span class="kw">AS</span> ValorTotal
<span class="kw">FROM</span> Encomendas e
<span class="kw">INNER JOIN</span> Clientes c <span class="kw">ON</span> c.ClienteID = e.ClienteID
<span class="kw">INNER JOIN</span> LinhasEncomenda li <span class="kw">ON</span> li.EncomendaID = e.EncomendaID
<span class="kw">GROUP BY</span> e.EncomendaID, e.DataCriacao, e.Estado, c.NomeCliente;

<span class="cm">-- Eliminar uma view</span>
<span class="kw">DROP VIEW IF EXISTS</span> BIADDO.dbo.vw_EncomendaResumo;`
        }
      },
      {
        heading: "Consultar Views em Python",
        body: `<p>No script Python, consultar uma view é exactamente igual a consultar uma tabela:</p>`,
        code: {
          filename: "consultar_view.py",
          content: `<span class="kw">def</span> <span class="fn">main</span>(**kwargs):
    env = kwargs[<span class="st">"ENV"</span>]
    db = DatabaseWrapper(env[<span class="st">"DATABASE_IP"</span>], env[<span class="st">"DATABASE_NAME"</span>],
                         env[<span class="st">"DATABASE_USER"</span>], env[<span class="st">"DATABASE_PASSWORD"</span>])
    <span class="kw">try</span>:
        rows = db.query(<span class="st">"""
            SELECT EncomendaID, NomeCliente, ValorTotal
            FROM BIADDO.dbo.vw_EncomendaResumo
            WHERE Estado = %s AND DataCriacao >= %s
            ORDER BY ValorTotal DESC
        """</span>, (<span class="st">"Concluída"</span>, <span class="st">"2024-01-01"</span>))
        <span class="kw">return</span> {<span class="st">"total"</span>: <span class="fn">len</span>(rows), <span class="st">"encomendas"</span>: rows}
    <span class="kw">finally</span>:
        db.close()`
        }
      }
    ],
    quiz: [
      {
        q: "O que é uma View no SQL Server?",
        opts: ["Uma tabela que armazena dados permanentemente", "Uma consulta SQL guardada que funciona como tabela virtual", "Um índice de performance", "Um trigger automático"],
        correct: 1,
        expl: "Uma View é uma consulta SQL guardada no servidor que funciona como uma tabela virtual. Não armazena dados — executa a query subjacente quando é consultada."
      },
      {
        q: "Qual a vantagem principal de usar Views no BIADDO?",
        opts: ["Ocupam menos espaço em disco", "Simplificam queries complexas e padronizam o acesso a dados", "São mais rápidas que tabelas", "Permitem escrita directa"],
        correct: 1,
        expl: "As views encapsulam JOINs, filtros e agregações, simplificando o acesso a dados e garantindo que todos os scripts usam a mesma lógica."
      },
      {
        q: "Qual o comando para modificar uma View existente?",
        opts: ["<code>MODIFY VIEW</code>", "<code>UPDATE VIEW</code>", "<code>ALTER VIEW</code>", "<code>CHANGE VIEW</code>"],
        correct: 2,
        expl: "<code>ALTER VIEW</code> é o comando T-SQL para modificar a definição de uma view existente."
      },
      {
        q: "No Python, consultar uma View é diferente de consultar uma tabela?",
        opts: ["Sim, precisa de um método especial", "Sim, precisa de permissões extra no pymssql", "Não, a sintaxe SQL é exactamente igual", "Sim, precisa de usar ORM"],
        correct: 2,
        expl: "Consultar uma view em Python é idêntico a consultar uma tabela — usa-se o mesmo <code>SELECT</code> e os mesmos métodos do pymssql."
      },
      {
        q: "Uma View armazena dados fisicamente?",
        opts: ["Sim, é uma cópia dos dados", "Não, executa a query subjacente cada vez que é consultada", "Depende do tipo de View", "Sim, mas só em memória"],
        correct: 1,
        expl: "Uma View standard não armazena dados. Cada vez que é consultada, executa a query subjacente e retorna os resultados actualizados."
      }
    ]
  },
  {
    id: "stored-procedures",
    title: "Stored Procedures",
    theory: [
      {
        heading: "O que é uma Stored Procedure?",
        body: `<p>Uma <strong>Stored Procedure</strong> (SP) é um bloco de código T-SQL guardado no servidor que pode receber parâmetros, executar lógica complexa e retornar resultados.</p>
<p>Diferenças face a Views:</p>
<ul>
<li><strong>Views</strong> — apenas SELECT, sem lógica condicional ou modificação de dados</li>
<li><strong>Stored Procedures</strong> — podem ter IF/ELSE, loops, INSERT/UPDATE/DELETE, transacções e variáveis</li>
</ul>`
      },
      {
        heading: "Criar uma Stored Procedure",
        body: `<p>Exemplo de uma SP que insere ou actualiza dados de stock:</p>`,
        code: {
          filename: "criar_sp.sql",
          content: `<span class="kw">CREATE PROCEDURE</span> dbo.sp_AtualizarStock
    @ProdutoID <span class="cl">INT</span>,
    @Quantidade <span class="cl">INT</span>,
    @Operacao <span class="cl">VARCHAR</span>(<span class="nr">10</span>)  <span class="cm">-- 'entrada' ou 'saida'</span>
<span class="kw">AS</span>
<span class="kw">BEGIN</span>
    <span class="kw">SET NOCOUNT ON</span>;

    <span class="kw">IF</span> @Operacao = <span class="st">'entrada'</span>
    <span class="kw">BEGIN</span>
        <span class="kw">UPDATE</span> Produtos
        <span class="kw">SET</span> StockAtual = StockAtual + @Quantidade,
            UltimaAtualizacao = <span class="fn">GETDATE</span>()
        <span class="kw">WHERE</span> ProdutoID = @ProdutoID;
    <span class="kw">END</span>
    <span class="kw">ELSE IF</span> @Operacao = <span class="st">'saida'</span>
    <span class="kw">BEGIN</span>
        <span class="kw">IF EXISTS</span> (<span class="kw">SELECT</span> <span class="nr">1</span> <span class="kw">FROM</span> Produtos
                   <span class="kw">WHERE</span> ProdutoID = @ProdutoID
                   <span class="kw">AND</span> StockAtual >= @Quantidade)
        <span class="kw">BEGIN</span>
            <span class="kw">UPDATE</span> Produtos
            <span class="kw">SET</span> StockAtual = StockAtual - @Quantidade,
                UltimaAtualizacao = <span class="fn">GETDATE</span>()
            <span class="kw">WHERE</span> ProdutoID = @ProdutoID;
        <span class="kw">END</span>
        <span class="kw">ELSE</span>
            <span class="kw">RAISERROR</span>(<span class="st">'Stock insuficiente'</span>, <span class="nr">16</span>, <span class="nr">1</span>);
    <span class="kw">END</span>
<span class="kw">END</span>;`
        }
      },
      {
        heading: "Chamar SP em Python",
        body: `<p>Para executar uma Stored Procedure a partir de um script Python, usa-se <code>cursor.callproc()</code> ou <code>cursor.execute()</code> com <code>EXEC</code>:</p>`,
        code: {
          filename: "chamar_sp.py",
          content: `<span class="kw">def</span> <span class="fn">main</span>(**kwargs):
    env = kwargs[<span class="st">"ENV"</span>]
    produto_id = kwargs.get(<span class="st">"produto_id"</span>)
    quantidade = kwargs.get(<span class="st">"quantidade"</span>)
    operacao = kwargs.get(<span class="st">"operacao"</span>, <span class="st">"entrada"</span>)

    conn = pymssql.connect(
        env[<span class="st">"DATABASE_IP"</span>], env[<span class="st">"DATABASE_USER"</span>],
        env[<span class="st">"DATABASE_PASSWORD"</span>], env[<span class="st">"DATABASE_NAME"</span>]
    )
    cursor = conn.cursor()

    <span class="kw">try</span>:
        <span class="cm"># Opção 1: cursor.callproc</span>
        cursor.callproc(<span class="st">"sp_AtualizarStock"</span>,
                        (produto_id, quantidade, operacao))
        conn.commit()

        <span class="cm"># Opção 2: EXEC directo</span>
        <span class="cm"># cursor.execute("EXEC sp_AtualizarStock %s, %s, %s",</span>
        <span class="cm">#                (produto_id, quantidade, operacao))</span>
        <span class="cm"># conn.commit()</span>

        <span class="kw">return</span> {<span class="st">"status"</span>: <span class="st">"ok"</span>, <span class="st">"operacao"</span>: operacao}
    <span class="kw">except</span> Exception <span class="kw">as</span> e:
        conn.rollback()
        <span class="kw">raise</span>
    <span class="kw">finally</span>:
        conn.close()`
        }
      },
      {
        heading: "SET NOCOUNT ON",
        body: `<p><code>SET NOCOUNT ON</code> é uma prática standard no início de Stored Procedures. Impede que o SQL Server envie mensagens de contagem de linhas afectadas (<em>"N rows affected"</em>) para cada operação.</p>
<ul>
<li><strong>Sem NOCOUNT ON</strong> — cada INSERT/UPDATE gera uma mensagem extra, o que pode confundir drivers como o pymssql</li>
<li><strong>Com NOCOUNT ON</strong> — apenas os resultados explícitos (SELECT) são retornados, sem ruído</li>
</ul>`,
        callout: { label: "Boa prática", text: "Usa sempre <code>SET NOCOUNT ON</code> no início de todas as Stored Procedures. Evita problemas com drivers Python e melhora levemente a performance." }
      }
    ],
    quiz: [
      {
        q: "Qual a principal diferença entre uma View e uma Stored Procedure?",
        opts: ["Views são mais rápidas", "SPs podem ter lógica condicional, modificar dados e usar transacções", "Views podem modificar dados", "Não há diferença"],
        correct: 1,
        expl: "Stored Procedures suportam IF/ELSE, loops, INSERT/UPDATE/DELETE e transacções. Views são apenas consultas SELECT."
      },
      {
        q: "Qual método do pymssql se usa para chamar uma Stored Procedure?",
        opts: ["<code>cursor.run()</code>", "<code>cursor.callproc()</code>", "<code>cursor.stored()</code>", "<code>cursor.procedure()</code>"],
        correct: 1,
        expl: "<code>cursor.callproc('nome_sp', (param1, param2))</code> é o método do pymssql para executar Stored Procedures."
      },
      {
        q: "Para que serve <code>SET NOCOUNT ON</code> numa Stored Procedure?",
        opts: ["Limitar o número de resultados", "Impedir mensagens de contagem de linhas afectadas", "Desactivar a SP", "Contar as linhas automaticamente"],
        correct: 1,
        expl: "<code>SET NOCOUNT ON</code> impede que o SQL Server envie mensagens '<em>N rows affected</em>' que podem confundir drivers Python."
      },
      {
        q: "Após um <code>INSERT</code> ou <code>UPDATE</code> via pymssql, o que é necessário fazer?",
        opts: ["Nada, é automático", "<code>conn.commit()</code> para confirmar a transacção", "<code>cursor.save()</code>", "<code>conn.flush()</code>"],
        correct: 1,
        expl: "O pymssql não faz auto-commit. É necessário chamar <code>conn.commit()</code> para persistir as alterações na base de dados."
      },
      {
        q: "Se uma SP falhar a meio da execução Python, qual a boa prática?",
        opts: ["Ignorar o erro", "Fazer <code>conn.rollback()</code> no bloco except", "Repetir a chamada", "Fechar o Python"],
        correct: 1,
        expl: "Em caso de erro, deve-se fazer <code>conn.rollback()</code> para reverter quaisquer alterações parciais, e depois <code>conn.close()</code> no finally."
      }
    ]
  },
  {
    id: "merge",
    title: "MERGE Statement",
    theory: [
      {
        heading: "O que é o MERGE?",
        body: `<p>O <strong>MERGE</strong> é o comando T-SQL mais importante em pipelines ETL. Permite fazer <strong>INSERT, UPDATE e DELETE</strong> numa única operação, comparando dados de origem com dados de destino.</p>
<p>É frequentemente chamado de <strong>"upsert"</strong> — se o registo existe, actualiza; se não existe, insere.</p>`
      },
      {
        heading: "Sintaxe do MERGE",
        body: `<p>A estrutura base do MERGE tem três partes: <code>WHEN MATCHED</code>, <code>WHEN NOT MATCHED</code> e opcionalmente <code>WHEN NOT MATCHED BY SOURCE</code>.</p>`,
        code: {
          filename: "merge_basico.sql",
          content: `<span class="kw">MERGE INTO</span> TabelaDestino <span class="kw">AS</span> dest
<span class="kw">USING</span> TabelaOrigem <span class="kw">AS</span> orig
    <span class="kw">ON</span> dest.ChaveID = orig.ChaveID

<span class="cm">-- Registo existe no destino → actualizar</span>
<span class="kw">WHEN MATCHED THEN</span>
    <span class="kw">UPDATE SET</span>
        dest.Nome = orig.Nome,
        dest.Valor = orig.Valor,
        dest.UltimaSync = <span class="fn">GETDATE</span>()

<span class="cm">-- Registo não existe no destino → inserir</span>
<span class="kw">WHEN NOT MATCHED THEN</span>
    <span class="kw">INSERT</span> (ChaveID, Nome, Valor, UltimaSync)
    <span class="kw">VALUES</span> (orig.ChaveID, orig.Nome, orig.Valor, <span class="fn">GETDATE</span>())

<span class="cm">-- Registo existe no destino mas não na origem → eliminar (opcional)</span>
<span class="kw">WHEN NOT MATCHED BY SOURCE THEN</span>
    <span class="kw">DELETE</span>;`
        }
      },
      {
        heading: "Exemplo real: Sync de Produtos",
        body: `<p>Exemplo de MERGE usado em pipelines de sincronização de dados de produtos entre sistemas:</p>`,
        code: {
          filename: "merge_produtos.sql",
          content: `<span class="kw">MERGE INTO</span> BIADDO.dbo.DimProduto <span class="kw">AS</span> dest
<span class="kw">USING</span> (
    <span class="kw">SELECT</span>
        p.CodigoProduto,
        p.Nome,
        p.Categoria,
        p.PrecoBase,
        p.Ativo
    <span class="kw">FROM</span> StagingProdutos p
) <span class="kw">AS</span> orig
    <span class="kw">ON</span> dest.CodigoProduto = orig.CodigoProduto

<span class="kw">WHEN MATCHED AND</span> (
    dest.Nome <> orig.Nome
    <span class="kw">OR</span> dest.Categoria <> orig.Categoria
    <span class="kw">OR</span> dest.PrecoBase <> orig.PrecoBase
    <span class="kw">OR</span> dest.Ativo <> orig.Ativo
) <span class="kw">THEN</span>
    <span class="kw">UPDATE SET</span>
        dest.Nome = orig.Nome,
        dest.Categoria = orig.Categoria,
        dest.PrecoBase = orig.PrecoBase,
        dest.Ativo = orig.Ativo,
        dest.DataSync = <span class="fn">GETDATE</span>()

<span class="kw">WHEN NOT MATCHED THEN</span>
    <span class="kw">INSERT</span> (CodigoProduto, Nome, Categoria, PrecoBase, Ativo, DataSync)
    <span class="kw">VALUES</span> (orig.CodigoProduto, orig.Nome, orig.Categoria,
            orig.PrecoBase, orig.Ativo, <span class="fn">GETDATE</span>());`
        },
        callout: { label: "Dica", text: 'A condição extra no <code>WHEN MATCHED AND (...)</code> evita actualizações desnecessárias — só actualiza se algum campo realmente mudou. Isto melhora performance e evita triggers desnecessários.' }
      },
      {
        heading: "MERGE em Python",
        body: `<p>Num script do IA Engine, o MERGE é frequentemente usado para sincronizar dados de sistemas externos para o BIADDO:</p>`,
        code: {
          filename: "merge_python.py",
          content: `<span class="kw">def</span> <span class="fn">sync_produtos</span>(db, produtos_externos):
    <span class="cm">"""Insere dados numa tabela staging e executa MERGE."""</span>

    <span class="cm"># 1. Limpar staging</span>
    db.execute(<span class="st">"TRUNCATE TABLE StagingProdutos"</span>)

    <span class="cm"># 2. Inserir dados na staging</span>
    <span class="kw">for</span> p <span class="kw">in</span> produtos_externos:
        db.execute(
            <span class="st">"INSERT INTO StagingProdutos VALUES (%s, %s, %s, %s, %s)"</span>,
            (p[<span class="st">"codigo"</span>], p[<span class="st">"nome"</span>], p[<span class="st">"categoria"</span>],
             p[<span class="st">"preco"</span>], p[<span class="st">"ativo"</span>])
        )

    <span class="cm"># 3. Executar MERGE</span>
    db.execute(<span class="st">"""
        MERGE INTO BIADDO.dbo.DimProduto AS dest
        USING StagingProdutos AS orig
            ON dest.CodigoProduto = orig.CodigoProduto
        WHEN MATCHED THEN
            UPDATE SET dest.Nome = orig.Nome, ...
        WHEN NOT MATCHED THEN
            INSERT (...) VALUES (...);
    """</span>)
    db.commit()`
        }
      }
    ],
    quiz: [
      {
        q: "O que faz o comando <code>MERGE</code> no SQL Server?",
        opts: ["Apenas insere dados novos", "Combina INSERT, UPDATE e DELETE numa única operação", "Junta duas tabelas numa view", "Cria uma cópia de segurança"],
        correct: 1,
        expl: "O MERGE compara dados de origem com destino e executa INSERT, UPDATE ou DELETE conforme a correspondência — tudo numa única operação."
      },
      {
        q: "O que faz <code>WHEN NOT MATCHED THEN INSERT</code>?",
        opts: ["Actualiza registos existentes", "Insere registos que existem na origem mas não no destino", "Elimina registos sem correspondência", "Ignora registos novos"],
        correct: 1,
        expl: "<code>WHEN NOT MATCHED</code> refere-se a registos que existem na tabela de origem mas não na de destino — a acção é inserir esses novos registos."
      },
      {
        q: "Porque se adiciona uma condição extra no <code>WHEN MATCHED AND (...)</code>?",
        opts: ["É obrigatório pelo SQL Server", "Para evitar actualizações desnecessárias quando os dados não mudaram", "Para melhorar a segurança", "Para limitar o número de updates"],
        correct: 1,
        expl: "A condição extra verifica se algum campo realmente mudou antes de fazer UPDATE. Isto evita operações desnecessárias e melhora a performance."
      },
      {
        q: "Qual o padrão comum em ETL antes de executar um MERGE?",
        opts: ["Criar uma nova base de dados", "Inserir dados numa tabela staging e depois fazer MERGE", "Apagar a tabela de destino", "Fazer backup manual"],
        correct: 1,
        expl: "O padrão ETL típico é: carregar dados numa tabela staging (temporária), depois executar o MERGE entre a staging e a tabela de destino."
      },
      {
        q: "O que faz <code>WHEN NOT MATCHED BY SOURCE THEN DELETE</code>?",
        opts: ["Elimina registos que existem na origem", "Elimina registos que existem no destino mas não na origem", "Elimina toda a tabela", "Não faz nada"],
        correct: 1,
        expl: "<code>NOT MATCHED BY SOURCE</code> refere-se a registos no destino que já não existem na origem — útil para remover dados desactualizados."
      }
    ]
  },
  {
    id: "etl",
    title: "Pipelines ETL",
    theory: [
      {
        heading: "O que é ETL?",
        body: `<p><strong>ETL</strong> significa <strong>Extract, Transform, Load</strong> — o processo de mover dados de uma ou mais fontes para um destino (tipicamente um data warehouse como o BIADDO).</p>
<ul>
<li><strong>Extract</strong> — extrair dados da fonte (API, base de dados, ficheiro CSV, etc.)</li>
<li><strong>Transform</strong> — limpar, validar, mapear e transformar os dados para o formato de destino</li>
<li><strong>Load</strong> — carregar os dados transformados na tabela de destino (via INSERT, MERGE, etc.)</li>
</ul>`
      },
      {
        heading: "Padrão ETL no IA Engine",
        body: `<p>No IA Engine, os pipelines ETL são scripts Python agendados via <strong>task_engine</strong> (Schedule + Celery). O fluxo típico:</p>
<ul>
<li><strong>1. Extract</strong> — chamar API externa (VTEX, Odoo, etc.) ou consultar base de dados fonte</li>
<li><strong>2. Transform</strong> — normalizar campos, converter tipos, filtrar registos inválidos</li>
<li><strong>3. Load</strong> — inserir na staging table e executar MERGE para o BIADDO</li>
</ul>`,
        callout: { label: "Importante", text: "Os scripts ETL correm em background via Celery. Erros são reportados automaticamente ao Microsoft Teams. Cada execução fica registada na tabela de Executions do task_engine." }
      },
      {
        heading: "Exemplo completo de pipeline ETL",
        body: `<p>Script que extrai encomendas de uma API, transforma os dados e carrega no BIADDO:</p>`,
        code: {
          filename: "etl_encomendas.py",
          content: `<span class="kw">import</span> pymssql
<span class="kw">import</span> requests
<span class="kw">from</span> datetime <span class="kw">import</span> datetime


<span class="kw">class</span> <span class="cl">DatabaseWrapper</span>:
    <span class="kw">def</span> <span class="fn">__init__</span>(self, host, db, user, pwd):
        self.conn = pymssql.connect(host, user, pwd, db)
        self.cursor = self.conn.cursor(as_dict=<span class="kw">True</span>)

    <span class="kw">def</span> <span class="fn">execute</span>(self, sql, params=<span class="kw">None</span>):
        self.cursor.execute(sql, params <span class="kw">or</span> ())

    <span class="kw">def</span> <span class="fn">commit</span>(self): self.conn.commit()
    <span class="kw">def</span> <span class="fn">close</span>(self): self.conn.close()


<span class="cm"># ── EXTRACT ──</span>
<span class="kw">def</span> <span class="fn">extract_encomendas</span>(api_url, api_key):
    resp = requests.get(
        <span class="st">f"</span>{api_url}<span class="st">/api/orders"</span>,
        headers={<span class="st">"Authorization"</span>: <span class="st">f"Bearer </span>{api_key}<span class="st">"</span>}
    )
    resp.raise_for_status()
    <span class="kw">return</span> resp.json()[<span class="st">"orders"</span>]


<span class="cm"># ── TRANSFORM ──</span>
<span class="kw">def</span> <span class="fn">transform_encomenda</span>(raw):
    <span class="kw">return</span> {
        <span class="st">"order_id"</span>: raw[<span class="st">"id"</span>],
        <span class="st">"cliente"</span>: raw[<span class="st">"customer"</span>][<span class="st">"name"</span>].strip().upper(),
        <span class="st">"valor"</span>: <span class="fn">round</span>(<span class="fn">float</span>(raw[<span class="st">"total"</span>]), <span class="nr">2</span>),
        <span class="st">"data"</span>: datetime.fromisoformat(
            raw[<span class="st">"created_at"</span>]
        ).strftime(<span class="st">"%Y-%m-%d"</span>),
        <span class="st">"estado"</span>: raw.get(<span class="st">"status"</span>, <span class="st">"desconhecido"</span>).lower(),
    }


<span class="cm"># ── LOAD ──</span>
<span class="kw">def</span> <span class="fn">load_encomendas</span>(db, encomendas):
    db.execute(<span class="st">"TRUNCATE TABLE StagingEncomendas"</span>)
    <span class="kw">for</span> e <span class="kw">in</span> encomendas:
        db.execute(
            <span class="st">"INSERT INTO StagingEncomendas VALUES (%s,%s,%s,%s,%s)"</span>,
            (e[<span class="st">"order_id"</span>], e[<span class="st">"cliente"</span>], e[<span class="st">"valor"</span>],
             e[<span class="st">"data"</span>], e[<span class="st">"estado"</span>])
        )
    <span class="cm"># MERGE staging → destino</span>
    db.execute(<span class="st">"""
        MERGE INTO BIADDO.dbo.FactEncomendas AS d
        USING StagingEncomendas AS s ON d.OrderID = s.OrderID
        WHEN MATCHED THEN
            UPDATE SET d.Cliente=s.Cliente, d.Valor=s.Valor,
                       d.Estado=s.Estado, d.DataSync=GETDATE()
        WHEN NOT MATCHED THEN
            INSERT VALUES (s.OrderID, s.Cliente, s.Valor,
                           s.Data, s.Estado, GETDATE());
    """</span>)
    db.commit()


<span class="cm"># ── MAIN ──</span>
<span class="kw">def</span> <span class="fn">main</span>(**kwargs):
    env = kwargs[<span class="st">"ENV"</span>]

    <span class="cm"># Extract</span>
    raw_orders = extract_encomendas(env[<span class="st">"API_URL"</span>], env[<span class="st">"API_KEY"</span>])

    <span class="cm"># Transform</span>
    encomendas = [transform_encomenda(o) <span class="kw">for</span> o <span class="kw">in</span> raw_orders]

    <span class="cm"># Load</span>
    db = DatabaseWrapper(env[<span class="st">"DATABASE_IP"</span>], env[<span class="st">"DATABASE_NAME"</span>],
                         env[<span class="st">"DATABASE_USER"</span>], env[<span class="st">"DATABASE_PASSWORD"</span>])
    <span class="kw">try</span>:
        load_encomendas(db, encomendas)
        <span class="kw">return</span> (<span class="st">"ok"</span>, <span class="st">f"Sincronizadas </span>{<span class="fn">len</span>(encomendas)}<span class="st"> encomendas"</span>)
    <span class="kw">finally</span>:
        db.close()`
        }
      },
      {
        heading: "Staging Tables",
        body: `<p>As <strong>staging tables</strong> são tabelas temporárias usadas como zona de "aterragem" dos dados antes do MERGE final. São fundamentais no padrão ETL:</p>
<ul>
<li><strong>Isolamento</strong> — os dados brutos ficam separados da tabela final</li>
<li><strong>Validação</strong> — permite inspecionar os dados antes de aplicar o MERGE</li>
<li><strong>Performance</strong> — o MERGE é feito de uma só vez, em vez de INSERT/UPDATE individuais</li>
<li><strong>Idempotência</strong> — <code>TRUNCATE</code> + re-load garante que re-executar o script não duplica dados</li>
</ul>`,
        callout: { label: "Padrão", text: "O fluxo standard é: <code>TRUNCATE staging</code> → <code>INSERT dados na staging</code> → <code>MERGE staging → destino</code>. Este padrão é idempotente — pode ser re-executado sem problemas." }
      }
    ],
    quiz: [
      {
        q: "O que significa ETL?",
        opts: ["Execute, Test, Launch", "Extract, Transform, Load", "Export, Transfer, Link", "Evaluate, Track, Log"],
        correct: 1,
        expl: "ETL significa Extract (extrair dados da fonte), Transform (limpar e transformar) e Load (carregar no destino)."
      },
      {
        q: "No IA Engine, como são agendados os pipelines ETL?",
        opts: ["Manualmente pelo programador", "Via cron do sistema operativo", "Via task_engine com Schedule + Celery", "Via GitHub Actions"],
        correct: 2,
        expl: "Os pipelines ETL são scripts agendados pelo task_engine usando Schedules e executados por workers Celery em background."
      },
      {
        q: "Qual o papel da 'staging table' num pipeline ETL?",
        opts: ["Guardar logs de execução", "Servir como zona temporária de dados antes do MERGE final", "Substituir a tabela de destino", "Armazenar credenciais"],
        correct: 1,
        expl: "A staging table é uma zona temporária onde os dados são carregados antes de serem aplicados à tabela de destino via MERGE."
      },
      {
        q: "Porque se faz <code>TRUNCATE TABLE staging</code> antes de inserir dados?",
        opts: ["Para melhorar segurança", "Para garantir que a staging só tem dados da execução actual (idempotência)", "Porque o SQL Server obriga", "Para libertar espaço em disco"],
        correct: 1,
        expl: "O TRUNCATE garante que a staging começa limpa em cada execução. Isto torna o pipeline idempotente — re-executar não duplica dados."
      },
      {
        q: "No exemplo de ETL, qual a função da etapa 'Transform'?",
        opts: ["Conectar à base de dados", "Limpar, normalizar e converter dados para o formato de destino", "Enviar emails", "Criar tabelas novas"],
        correct: 1,
        expl: "A etapa Transform limpa, valida e converte os dados brutos para o formato esperado pela tabela de destino (ex: normalizar nomes, converter tipos, formatar datas)."
      }
    ]
  },
  {
    id: "database-wrapper",
    title: "Classe DatabaseWrapper",
    theory: [
      {
        heading: "Padrão de acesso à BD",
        body: `<p>Nos scripts do IA Engine, o acesso ao SQL Server é encapsulado numa <strong>classe wrapper</strong> que abstrai a gestão de conexões, execução de queries e tratamento de resultados.</p>
<p>Este padrão:</p>
<ul>
<li>Centraliza a lógica de conexão num único lugar</li>
<li>Facilita a gestão de recursos (<code>close()</code> no finally)</li>
<li>Permite reutilizar a mesma conexão em múltiplas queries</li>
<li>Mantém a <code>main()</code> limpa e focada no fluxo de negócio</li>
</ul>`
      },
      {
        heading: "Implementação completa",
        body: `<p>Exemplo de uma classe DatabaseWrapper robusta, com métodos para queries, execuções e transacções:</p>`,
        code: {
          filename: "database_wrapper.py",
          content: `<span class="kw">import</span> pymssql


<span class="kw">class</span> <span class="cl">DatabaseWrapper</span>:
    <span class="cm">"""Wrapper para conexão ao SQL Server via pymssql."""</span>

    <span class="kw">def</span> <span class="fn">__init__</span>(self, host, database, user, password):
        self.conn = pymssql.connect(
            server=host,
            database=database,
            user=user,
            password=password,
        )

    <span class="kw">def</span> <span class="fn">query</span>(self, sql, params=<span class="kw">None</span>):
        <span class="cm">"""Executa SELECT e retorna lista de dicts."""</span>
        cursor = self.conn.cursor(as_dict=<span class="kw">True</span>)
        cursor.execute(sql, params <span class="kw">or</span> ())
        <span class="kw">return</span> cursor.fetchall()

    <span class="kw">def</span> <span class="fn">execute</span>(self, sql, params=<span class="kw">None</span>):
        <span class="cm">"""Executa INSERT/UPDATE/DELETE sem retorno."""</span>
        cursor = self.conn.cursor()
        cursor.execute(sql, params <span class="kw">or</span> ())

    <span class="kw">def</span> <span class="fn">execute_many</span>(self, sql, data_list):
        <span class="cm">"""Executa a mesma query para múltiplos conjuntos de params."""</span>
        cursor = self.conn.cursor()
        cursor.executemany(sql, data_list)

    <span class="kw">def</span> <span class="fn">commit</span>(self):
        self.conn.commit()

    <span class="kw">def</span> <span class="fn">rollback</span>(self):
        self.conn.rollback()

    <span class="kw">def</span> <span class="fn">close</span>(self):
        self.conn.close()`
        }
      },
      {
        heading: "Uso correcto com try/finally",
        body: `<p>A regra mais importante: a conexão deve ser <strong>sempre fechada</strong>, mesmo em caso de erro.</p>`,
        code: {
          filename: "uso_wrapper.py",
          content: `<span class="kw">def</span> <span class="fn">main</span>(**kwargs):
    env = kwargs[<span class="st">"ENV"</span>]

    db = DatabaseWrapper(
        host=env[<span class="st">"DATABASE_IP"</span>],
        database=env[<span class="st">"DATABASE_NAME"</span>],
        user=env[<span class="st">"DATABASE_USER"</span>],
        password=env[<span class="st">"DATABASE_PASSWORD"</span>],
    )
    <span class="kw">try</span>:
        <span class="cm"># Consultas</span>
        produtos = db.query(
            <span class="st">"SELECT * FROM BIADDO.dbo.vw_Produtos WHERE Ativo = %s"</span>,
            (<span class="nr">1</span>,)
        )

        <span class="cm"># Modificações</span>
        db.execute(
            <span class="st">"UPDATE Logs SET UltimaExec = GETDATE() WHERE Script = %s"</span>,
            (<span class="st">"sync_produtos"</span>,)
        )
        db.commit()

        <span class="kw">return</span> {<span class="st">"total"</span>: <span class="fn">len</span>(produtos), <span class="st">"dados"</span>: produtos}
    <span class="kw">except</span> Exception:
        db.rollback()
        <span class="kw">raise</span>
    <span class="kw">finally</span>:
        db.close()`
        },
        callout: { label: "Regra de ouro", text: "Nunca esquecer o <code>finally: db.close()</code>. Conexões abertas acumuladas podem esgotar o pool de conexões do SQL Server e bloquear outros scripts." }
      },
      {
        heading: "executemany para inserções em massa",
        body: `<p>Quando precisas de inserir muitos registos, <code>executemany()</code> é mais eficiente que fazer um loop de <code>execute()</code>:</p>`,
        code: {
          filename: "execute_many.py",
          content: `<span class="cm"># ❌ Lento — um INSERT por iteração</span>
<span class="kw">for</span> item <span class="kw">in</span> dados:
    db.execute(<span class="st">"INSERT INTO Tabela VALUES (%s, %s)"</span>,
               (item[<span class="st">"a"</span>], item[<span class="st">"b"</span>]))

<span class="cm"># ✅ Rápido — executemany envia tudo de uma vez</span>
db.execute_many(
    <span class="st">"INSERT INTO Tabela VALUES (%s, %s)"</span>,
    [(item[<span class="st">"a"</span>], item[<span class="st">"b"</span>]) <span class="kw">for</span> item <span class="kw">in</span> dados]
)
db.commit()`
        }
      }
    ],
    quiz: [
      {
        q: "Porque se usa uma classe DatabaseWrapper em vez de usar pymssql directamente na <code>main()</code>?",
        opts: ["Porque o pymssql não funciona sem wrapper", "Para centralizar a lógica de conexão e manter a main() limpa", "Para melhorar a segurança da password", "Porque o Django obriga"],
        correct: 1,
        expl: "A classe wrapper centraliza a gestão de conexões, reutiliza a mesma conexão em múltiplas queries e mantém a <code>main()</code> focada no fluxo de negócio."
      },
      {
        q: "O que acontece se não fizermos <code>db.close()</code> no finally?",
        opts: ["Nada, o Python fecha automaticamente", "As conexões ficam abertas e podem esgotar o pool do SQL Server", "O script crashe", "Os dados são perdidos"],
        correct: 1,
        expl: "Conexões não fechadas acumulam-se e podem esgotar o pool de conexões do SQL Server, bloqueando outros scripts e serviços."
      },
      {
        q: "Qual a vantagem de <code>executemany()</code> sobre um loop de <code>execute()</code>?",
        opts: ["Não há vantagem", "É mais rápido porque envia múltiplos registos de uma vez", "É mais seguro", "Usa menos memória"],
        correct: 1,
        expl: "<code>executemany()</code> é mais eficiente porque minimiza as round-trips ao servidor, enviando múltiplos conjuntos de parâmetros numa só chamada."
      },
      {
        q: "Quando se deve fazer <code>db.rollback()</code>?",
        opts: ["Antes de cada query", "No bloco except, quando uma operação de escrita falha", "Depois de cada SELECT", "Nunca, não é necessário"],
        correct: 1,
        expl: "O <code>rollback()</code> deve ser feito no bloco <code>except</code> para reverter quaisquer alterações parciais quando uma operação de escrita falha."
      },
      {
        q: "No método <code>query()</code> do wrapper, porque se usa <code>as_dict=True</code>?",
        opts: ["Para melhorar performance", "Para que cada linha retornada seja um dicionário com nomes das colunas como chaves", "Para ordenar os resultados", "Para limitar o número de resultados"],
        correct: 1,
        expl: "<code>as_dict=True</code> faz com que os resultados sejam dicionários (ex: <code>{'Nome': 'Ana', 'Idade': 30}</code>) em vez de tuplos, facilitando o acesso por nome de coluna."
      }
    ]
  },
  {
    id: "quiz-final",
    title: "Quiz Final",
    theory: [
      {
        heading: "Revisão Geral",
        body: `<p>Esta secção testa o conhecimento completo sobre SQL Server e ETL no contexto do IA Engine. As perguntas cobrem todos os tópicos anteriores e incluem cenários práticos.</p>
<p>Tenta responder sem consultar as secções anteriores!</p>`
      }
    ],
    quiz: [
      {
        q: "Tens um requisito para sincronizar dados de uma API externa para o BIADDO diariamente. Que componentes do IA Engine usas?",
        opts: ["Apenas um FunctionService", "Um script ETL agendado via Schedule + Celery no task_engine", "Uma view no SQL Server", "Um ficheiro cron no servidor"],
        correct: 1,
        expl: "Para sincronizações agendadas, usa-se um script registado no task_engine com um Schedule configurado e executado por workers Celery."
      },
      {
        q: "Qual o fluxo correcto para carregar dados numa tabela de destino no BIADDO?",
        opts: ["DELETE all + INSERT", "TRUNCATE staging → INSERT na staging → MERGE staging → destino", "DROP TABLE + CREATE TABLE + INSERT", "UPDATE directo na tabela de destino"],
        correct: 1,
        expl: "O padrão standard é: limpar a staging, inserir os dados novos na staging, e executar MERGE para sincronizar com a tabela de destino."
      },
      {
        q: 'Tens este código. Qual o problema?<br><br><code>conn = pymssql.connect(...)<br>cursor = conn.cursor()<br>cursor.execute("UPDATE ...")<br>conn.close()</code>',
        opts: ["Falta <code>conn.commit()</code> antes do close", "Falta <code>as_dict=True</code>", "O cursor não pode fazer UPDATE", "Não há problema"],
        correct: 0,
        expl: "Sem <code>conn.commit()</code>, o UPDATE é feito mas não é persistido. Quando a conexão fecha, a transacção pendente é revertida automaticamente."
      },
      {
        q: "Qual a diferença entre uma View e uma Stored Procedure quando preciso de actualizar dados?",
        opts: ["Ambas podem actualizar dados", "Apenas a Stored Procedure pode fazer INSERT/UPDATE/DELETE", "Apenas a View pode actualizar dados", "Nenhuma pode actualizar dados"],
        correct: 1,
        expl: "Views são apenas SELECT (consulta). Para operações de escrita (INSERT/UPDATE/DELETE) com lógica condicional, usa-se Stored Procedures."
      },
      {
        q: "Num MERGE, o que acontece a um registo que existe no destino mas NÃO na origem?",
        opts: ["É automaticamente eliminado", "Nada, a menos que uses <code>WHEN NOT MATCHED BY SOURCE</code>", "É actualizado com NULL", "Causa um erro"],
        correct: 1,
        expl: "Registos no destino sem correspondência na origem são ignorados por defeito. Só são eliminados se incluíres a cláusula <code>WHEN NOT MATCHED BY SOURCE THEN DELETE</code>."
      },
      {
        q: "Qual a principal razão para usar staging tables em ETL?",
        opts: ["São obrigatórias pelo SQL Server", "Permitem isolar dados brutos, validar antes do MERGE e garantir idempotência", "São mais rápidas que tabelas normais", "Ocupam menos espaço"],
        correct: 1,
        expl: "Staging tables isolam os dados brutos, permitem inspecção antes do MERGE, e com TRUNCATE + re-load garantem que o pipeline é idempotente."
      },
      {
        q: "Qual o resultado correcto da função <code>main()</code> de um script do task_engine?",
        opts: ["Apenas uma string", "Um tuplo <code>(resultado, mensagem)</code>", "Apenas um dicionário", "Não precisa de retornar nada"],
        correct: 1,
        expl: "Scripts do task_engine devem retornar um tuplo <code>(resultado, mensagem)</code> — o resultado pode ser qualquer tipo e a mensagem é uma string descritiva."
      },
      {
        q: "Porque se usa <code>TRUNCATE</code> em vez de <code>DELETE</code> para limpar a staging table?",
        opts: ["<code>TRUNCATE</code> é mais seguro", "<code>TRUNCATE</code> é mais rápido e não gera log individual por linha", "Não há diferença", "<code>DELETE</code> não funciona em staging tables"],
        correct: 1,
        expl: "<code>TRUNCATE</code> remove todas as linhas de forma muito mais eficiente que <code>DELETE</code> porque não gera log transaccional individual por cada linha eliminada."
      },
      {
        q: "Se uma view no BIADDO retorna dados incorrectos, onde está provavelmente o problema?",
        opts: ["No driver pymssql", "Na definição SQL da view (query subjacente)", "No Python", "No sistema operativo"],
        correct: 1,
        expl: "Uma view é uma query SQL guardada. Se retorna dados incorrectos, o problema está na lógica da query (JOINs, filtros, agregações) que define a view."
      },
      {
        q: "Qual destas é uma boa prática ao escrever um script ETL no IA Engine?",
        opts: [
          "Fazer tudo na <code>main()</code> sem funções separadas",
          "Separar em funções extract, transform e load com DatabaseWrapper e try/finally",
          "Usar variáveis globais para a conexão",
          "Hardcodar a query de MERGE no código sem staging"
        ],
        correct: 1,
        expl: "A boa prática é separar o pipeline em funções claras (extract, transform, load), usar DatabaseWrapper para gestão de conexões, e garantir limpeza com try/finally."
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

export default function SqlEtlPage() {
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
        <img src="https://nossafarmacia.vtexassets.com/assets/vtex.file-manager-graphql/images/f432f301-b5fa-4453-aa24-22ea02396e16___13e59f7056915bc23b198375758778f6.png" alt="Nossa Farmácia" className="hero-logo" />
        <div className="hero-badge">SQL Server · Guia de Estudo</div>
        <h1>SQL Server & <em>ETL</em></h1>
        <p>Views, stored procedures, MERGE statements e pipelines de dados no BIADDO.</p>
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
