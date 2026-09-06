# UCIP-omon

Jogo "quem é este UCIPomon?" — adivinha o nome de quem está em cada caricatura.
Reconstruído como um Cloudflare Worker (com ficheiros estáticos + API), base de
dados D1 e imagens no R2, para poderes adicionar novas pessoas diretamente pelo
browser, sem teres de mexer em código.

## O que mudou em relação à versão anterior

- O motor de perguntas deixou de ser o Hot Potatoes: agora é uma página normal
  que vai buscar as perguntas a uma API.
- As respostas certas **já não estão no código-fonte da página** — são
  verificadas no servidor, por isso já não dá para ver as respostas com
  "Ver código fonte" no browser.
- As imagens deixam de estar na pasta `caricaturas/` do repositório (e por
  isso deixam de ir para o histórico do Git): passam a viver num bucket R2.
- Há uma página `/admin` protegida por password onde podes arrastar uma nova
  imagem, escrever o nome da pessoa, e ela aparece logo no jogo — sem precisares
  de fazer commit/push.
- O número de perguntas por jogo é configurável (por omissão, 20 — antes
  estava hardcoded em 10 por engano).

## Estrutura do projeto

```
wrangler.toml         configuração do Worker (assets, D1, R2)
schema.sql             esquema da base de dados (correr uma vez)
src/worker.js           código da API (jogo + admin)
public/                 páginas estáticas do site
  index.html              página inicial
  game/index.html         o jogo
  admin/index.html        página de gestão (admin)
  bd/index.html           placeholder "em manutenção" (como já existia)
migration/              ficheiros só para a migração inicial dos dados antigos
  images/                 as 38 imagens já redimensionadas/comprimidas (JPEG)
  seed.sql                as 38 pessoas (nome + aliases) já prontas a inserir
  upload-images.mjs       script que carrega as imagens para o R2
```

## Passos para pôr isto a funcionar (só precisas de fazer isto uma vez)

Vais precisar de ter o [Node.js](https://nodejs.org) instalado e uma conta
Cloudflare com o domínio `abranches-qol.pt` já ativo (que já tens).

### 1. Instalar dependências

Num terminal, dentro da pasta do projeto:

```
npm install
npx wrangler login
```

Isto abre o browser para autorizares o wrangler a mexer na tua conta Cloudflare.

### 2. Criar a base de dados D1

```
npx wrangler d1 create ucipomon
```

O comando devolve um `database_id`. Copia-o e cola-o no `wrangler.toml`, a
substituir `PREENCHER_DEPOIS_DE_CRIAR`.

Depois cria as tabelas:

```
npx wrangler d1 execute ucipomon --remote --file=./schema.sql
```

### 3. Criar o bucket R2 (para as imagens)

```
npx wrangler r2 bucket create ucipomon-images
```

### 4. Definir a password de admin

Escolhe uma password só tua (não a partilhes no chat/código) e define-a como
secret do Worker:

```
npx wrangler secret put ADMIN_PASSWORD
```

Vai pedir para escreveres a password no terminal — essa é a password que vais
usar para entrar em `/admin`.

### 5. Migrar as 38 pessoas já existentes

Primeiro carregar as imagens para o R2:

```
node migration/upload-images.mjs
```

Depois inserir os nomes na base de dados:

```
npx wrangler d1 execute ucipomon --remote --file=./migration/seed.sql
```

Depois de confirmares que está tudo bem (secção "Verificar" abaixo), podes
apagar a pasta `migration/` do repositório — já não é precisa no dia a dia.

### 6. Testar localmente (opcional mas recomendado)

```
npm run dev
```

Abre o endereço que aparece no terminal (normalmente `http://localhost:8787`)
e testa o jogo e o `/admin`.

### 7. Publicar

**Opção simples — deploy manual:**

```
npm run deploy
```

**Opção recomendada — ligar ao GitHub (como fizeste para o NutriCIP/VentiCIP/etc.):**

1. Faz commit e push deste projeto para o repositório `UCIPomon` no GitHub
   (recomendo tornares o repositório **privado**, já que agora só tem código —
   as fotos deixaram de estar aqui).
2. No dashboard da Cloudflare: **Workers & Pages → Create → Connect to Git**,
   escolhe o repositório `UCIPomon`.
3. Nas definições do projeto, adiciona o domínio personalizado
   `ucipomon.abranches-qol.pt` (Settings → Domains & Routes).
4. A partir daqui, qualquer `git push` para `main` publica automaticamente.

### 8. Verificar

- Abre `https://ucipomon.abranches-qol.pt/` — deve mostrar a página inicial.
- Abre `/game/` — deve mostrar uma caricatura e pedir um nome. Confirma que
  aparecem as 38 pessoas ao longo de vários jogos (ou muda "Perguntas por jogo"
  para 38 temporariamente em `/admin` para as veres todas de seguida).
- Abre `/admin/`, entra com a password definida no passo 4, e confirma que a
  lista mostra as 38 pessoas com as fotos certas.
- Testa adicionar uma pessoa nova por arrastar-e-largar, e testa apagá-la.

## Nota sobre o histórico do Git

As imagens antigas (os PNGs grandes) continuam a existir nos commits antigos
do repositório atual, mesmo depois de as removeres da pasta `caricaturas/`.
Se quiseres mesmo limpar isso do histórico (não é obrigatório, só deixa o
`.git` mais pesado do que precisa), a forma mais simples é começar este
projeto num repositório novo em vez de reaproveitar o histórico do antigo.

## Notas de segurança

- A password de admin viaja em cada pedido a `/api/admin/*` num cabeçalho
  (`X-Admin-Password`), protegida pelo HTTPS da Cloudflare. É suficiente para
  um projeto pessoal/de equipa pequena, mas não uses a mesma password de
  outras contas importantes.
- As respostas do jogo (`/api/check`) só devolvem `true`/`false` — o nome da
  pessoa só é enviado ao browser quando o jogador acerta, ou quando desiste
  explicitamente ("Desisto — ver resposta"). Isto evita que alguém veja as
  respostas todas só por abrir as ferramentas de programador do browser
  (o que era possível na versão anterior, feita em Hot Potatoes).
