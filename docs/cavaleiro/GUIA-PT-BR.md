# Guia do Cavaleiro Agent Harness (português)

Este guia explica o que é o Cavaleiro Agent Harness, como ele é organizado por dentro, como instalar em Windows, macOS e Linux, como usar no dia a dia, como configurar e como resolver os problemas mais comuns. Para a visão geral, veja o [README em português](../../README.pt-BR.md); para os detalhes técnicos das correções, o [relatório de engenharia](ENGINEERING.md) (em inglês).

> O Cavaleiro Agent Harness é mantido pela [Cavaleiro AI](https://github.com/cavaleiro-ai). Os comandos e identificadores continuam com o nome `ecc` por compatibilidade.

## Sumário

1. [O que é e para quem](#1-o-que-é-e-para-quem)
2. [Arquitetura](#2-arquitetura)
3. [Instalação passo a passo](#3-instalação-passo-a-passo)
4. [Primeiros passos](#4-primeiros-passos)
5. [Exemplos práticos](#5-exemplos-práticos)
6. [Configuração](#6-configuração)
7. [Solução de problemas](#7-solução-de-problemas)
8. [Como contribuir](#8-como-contribuir)

## 1. O que é e para quem

O Cavaleiro Agent Harness é um "arnês" (harness) para agentes de programação com IA: um conjunto de **skills** (fluxos de trabalho), **agentes** especializados, **comandos**, **hooks** (automações que rodam antes e depois de cada ação do agente), **regras** sempre carregadas e **instaladores** que colocam tudo isso no lugar certo para cada ferramenta.

Ele serve para:

- **Quem usa Claude Code** e quer que o agente planeje, escreva testes primeiro, revise o próprio trabalho e respeite guardas de segurança (por exemplo, não pular git hooks com `--no-verify`).
- **Quem usa Codex, Cursor, OpenCode, Gemini, Qwen, Kimi, Zed, GitHub Copilot** e outros, e quer reaproveitar as mesmas skills e regras entre ferramentas.
- **Times** que querem padronizar o comportamento dos agentes com regras por linguagem e hooks configuráveis.
- **Quem usa Windows**: este derivado corrige vários problemas específicos do Windows (BOM do PowerShell 5.1, ferramenta PowerShell burlando git hooks, apelidos do NTFS, saída cp1252).

O que ele **não** é: um modelo de IA, um serviço hospedado ou um pacote npm próprio. Ele roda localmente com o agente que você já usa.

## 2. Arquitetura

### Visão geral

```text
                        ┌────────────────────────────────────────────┐
                        │        Conteúdo (Markdown + YAML)          │
                        │  skills/  agents/  commands/  rules/       │
                        │  contexts/  mcp-configs/  examples/        │
                        └───────────────┬────────────────────────────┘
                                        │ empacotado por
              ┌─────────────────────────┼──────────────────────────────┐
              ▼                         ▼                              ▼
   ┌─────────────────────┐  ┌──────────────────────────┐  ┌────────────────────────┐
   │ Plugins nativos      │  │ CLI `ecc` (scripts/ecc.js)│  │ Sync legado do Codex   │
   │ .claude-plugin/      │  │ setup · install · plan    │  │ scripts/sync-ecc-to-   │
   │ .codex-plugin/       │  │ doctor · repair · uninstall│ │ codex.sh               │
   │ .qoder-plugin/       │  │ catalog · consult · memory│  │  ├ merge-codex-config  │
   └──────────┬──────────┘  └────────────┬─────────────┘  │  └ merge-mcp-config    │
              │                          │                 └───────────┬────────────┘
              │             manifests/ (perfis, módulos,               │
              │             componentes) → plano de instalação         │
              │                          │                             │
              ▼                          ▼                             ▼
   ┌───────────────────────────────────────────────────────────────────────────────┐
   │ Destinos: ~/.claude · ~/.codex · .cursor/ · .gemini/ · .opencode · .kimi-code/  │
   │           .github/ (Copilot) · .zed/ · ... + estado de instalação (install-state)│
   └───────────────────────────────────────┬───────────────────────────────────────┘
                                           │ em cada evento do agente
                                           ▼
   ┌───────────────────────────────────────────────────────────────────────────────┐
   │ Hooks: hooks/hooks.json → plugin-hook-bootstrap.js → run-with-flags.js          │
   │   (perfil minimal/standard/strict, ECC_DISABLED_HOOKS, ecc/setup.json)         │
   │   → block-no-verify · config-protection · gateguard · mcp-health-check ·      │
   │     commit-quality · session-start/end · governance-capture · ...             │
   └───────────────────────────────────────────────────────────────────────────────┘
```

### Componentes e responsabilidades

| Componente | Onde fica | Responsabilidade |
| --- | --- | --- |
| Skills | `skills/<nome>/SKILL.md` | Fluxos de trabalho e conhecimento de domínio (TDD, segurança, padrões de frameworks). Superfície principal. |
| Agentes | `agents/*.md` | Subagentes com frontmatter (`name`, `description`, `tools`, `model`) para delegar tarefas. |
| Comandos | `commands/*.md`, `legacy-command-shims/` | Atalhos `/comando` que acionam skills e agentes. |
| Regras | `rules/common`, `rules/<linguagem>` | Diretrizes sempre carregadas: segurança, estilo, testes, git. |
| Hooks | `hooks/hooks.json`, `hooks/hooks.metadata.json`, `scripts/hooks/` | Automações por evento. `hooks.metadata.json` guarda IDs estáveis e uma impressão digital de cada entrada. |
| CLI | `scripts/ecc.js` e `scripts/*.js` | Ponto de entrada: setup, instalação seletiva, diagnóstico, reparo, desinstalação, memória, sessões. |
| Instalador | `scripts/install-apply.js`, `scripts/lib/install/`, `scripts/lib/install-targets/`, `scripts/lib/install-executor.js`, `scripts/lib/install-state.js` | Resolve o plano a partir dos manifests e grava os arquivos de cada destino, registrando o que pertence ao harness para atualizar e desinstalar com segurança. |
| Manifests | `manifests/install-profiles.json`, `install-modules.json`, `install-components.json` | Perfis (minimal, core, developer, full...) → módulos → componentes. |
| Sync do Codex | `scripts/sync-ecc-to-codex.sh`, `scripts/codex/`, `scripts/lib/toml-text.js` | Copia referências para `~/.codex` e mescla `config.toml` sem sobrescrever escolhas do usuário. |
| Adaptadores | `.cursor/`, `.opencode/`, `.gemini/`, `.zed/`, `.kiro/`, `.agents/skills/`, `pi/core/`, `.github/copilot-instructions.md` | Formatos específicos de cada ferramenta. |
| Validadores | `scripts/ci/*.js` | Checam agentes, comandos, regras, skills, hooks, manifests, contagens do catálogo, segurança de unicode e de workflows. |
| Testes | `tests/**/*.test.js` (Node), `tests/test_*.py` (Python) | `tests/run-all.js` roda cada arquivo em um processo separado. Os testes Python cobrem o pacote `src/llm` e scripts de skills. |
| Controle 2.0 (alfa) | `ecc2/` (Rust) | Esboço do plano de controle; experimental. |

### Fluxo de um hook

1. O agente (por exemplo, o Claude Code) vai rodar uma ferramenta, como `Bash` ou `PowerShell`.
2. O comando registrado em `hooks/hooks.json` localiza a raiz do plugin e chama `scripts/hooks/plugin-hook-bootstrap.js`.
3. `run-with-flags.js` confere se o hook está habilitado (perfil, `ECC_DISABLED_HOOKS`, `ecc/setup.json`) e chama a função `run()` do hook com o JSON recebido em stdin.
4. O hook responde: código de saída `0` (seguir), `2` (bloquear, com o motivo em stderr) ou um JSON de saída (por exemplo, contexto adicional).
5. Hooks consultivos **falham abertos**: entrada malformada, ferramenta ausente ou erro interno não bloqueiam o agente.

### Fluxo do sync do Codex

`sync-ecc-to-codex.sh` faz backup, registra um manifesto de propriedade dos arquivos, copia `AGENTS.md`, prompts e papéis, e chama `merge-codex-config.js` (configurações básicas) e `merge-mcp-config.js` (servidores MCP). No Cavaleiro, as duas mesclagens leem o TOML entendendo strings e cabeçalhos, e **recusam gravar** um resultado que não seja TOML válido ou que altere um valor existente. Se algo falhar, o sync desfaz as alterações.

## 3. Instalação passo a passo

### Pré-requisitos (todos os sistemas)

- **Node.js 18 ou mais recente** (`node --version`).
- **Git** (`git --version`).
- O agente que você vai usar (por exemplo, `claude --version` para o Claude Code 2.1+ ou `codex --version`).
- Opcional: **Python 3.11+** para algumas skills e para os testes Python; **Bash** (Git Bash no Windows) para recursos baseados em shell.

### Windows (PowerShell)

1. Instale o Node.js LTS, o Git for Windows e o seu agente. Feche e abra o PowerShell.
2. Confira:

   ```powershell
   node --version
   git --version
   claude --version
   ```

3. Clone e instale as dependências (sem rodar scripts de instalação de terceiros):

   ```powershell
   git clone https://github.com/cavaleiro-ai/cavaleiro-agent-harness.git
   cd cavaleiro-agent-harness
   npm ci --ignore-scripts
   ```

4. Rode o assistente do plugin do Claude Code e escolha **Usuário global** e o perfil de hooks **Standard**:

   ```powershell
   node scripts/ecc.js setup
   ```

5. Abra uma nova sessão do Claude Code e confirme com `/plugin list` que `ecc@ecc` está habilitado.

Para outros destinos use o wrapper do PowerShell, por exemplo `.\install.ps1 --profile minimal --target cursor`. Se a execução de scripts estiver bloqueada, use `powershell -ExecutionPolicy Bypass -File .\install.ps1 ...` apenas para esse comando. Arquivos de configuração salvos pelo PowerShell 5.1 com `Set-Content`/`Out-File` têm BOM UTF-8; o Cavaleiro aceita esse BOM em `ecc/setup.json` e no `config.toml` do Codex.

### macOS

1. Instale o Node.js (pelo instalador oficial ou `brew install node`), o Git (`xcode-select --install` ou `brew install git`) e o seu agente.
2. Clone e instale:

   ```bash
   git clone https://github.com/cavaleiro-ai/cavaleiro-agent-harness.git
   cd cavaleiro-agent-harness
   npm ci --ignore-scripts
   node scripts/ecc.js setup
   ```

3. Observação: o Bash do sistema no macOS é a versão 3.2; algumas automações opcionais em shell (como o caminho GAN) exigem um Bash mais novo (`brew install bash`).

### Linux

1. Instale o Node.js 18+ (pelo gerenciador da distribuição, pelo NodeSource ou pelo `nvm`), o Git e o seu agente.
2. Clone e instale:

   ```bash
   git clone https://github.com/cavaleiro-ai/cavaleiro-agent-harness.git
   cd cavaleiro-agent-harness
   npm ci --ignore-scripts
   node scripts/ecc.js setup
   ```

3. Para vários agentes de uma vez, use o assistente multi-harness:

   ```bash
   node scripts/ecc.js install --guided
   ```

### Escolha um caminho por agente

- **Claude Code:** assistente (`node scripts/ecc.js setup`) **ou** plugin nativo (`/plugin marketplace add https://github.com/cavaleiro-ai/cavaleiro-agent-harness` e `/plugin install ecc@ecc`). Não empilhe uma instalação manual completa (`--profile full`) por cima do plugin.
- **Codex:** plugin nativo (`codex plugin marketplace add cavaleiro-ai/cavaleiro-agent-harness` e `codex plugin add ecc@ecc`) **ou** o sync legado (`bash scripts/sync-ecc-to-codex.sh`), nunca os dois.
- **Outros:** `./install.sh --profile minimal --target <destino>` (ou `.\install.ps1` no Windows). Veja a tabela no [README em português](../../README.pt-BR.md#outros-agentes-e-editores).

Sempre que quiser ver o efeito antes, acrescente `--dry-run`.

### Sobre o pacote npm

`npx ecc-universal@2.2.3 setup` funciona, mas instala o **projeto original** publicado no npm, sem as correções do Cavaleiro. O Cavaleiro Agent Harness é distribuído apenas como código-fonte.

## 4. Primeiros passos

Depois de instalar, abra o agente na pasta do seu projeto e experimente:

| Objetivo | O que digitar |
| --- | --- |
| Planejar uma funcionalidade | `/ecc:plan "Adicionar login com OAuth"` |
| Escrever testes primeiro | peça para usar a skill `tdd-workflow` |
| Revisar o que foi feito | `/code-review` |
| Consertar um build quebrado | `/build-fix` |
| Ver quanto contexto está em uso | `/context-budget` |
| Salvar e retomar uma sessão longa | `/save-session` e depois `/resume-session` |
| Auditar a configuração do agente | `/security-scan` |

Comandos úteis no terminal, a partir do clone:

```bash
node scripts/ecc.js catalog profiles          # perfis de instalação disponíveis
node scripts/ecc.js consult "revisão de segurança"  # recomenda componentes
node scripts/ecc.js list-installed            # o que está instalado
node scripts/ecc.js doctor                    # diagnóstico
```

## 5. Exemplos práticos

### Exemplo 1: nova funcionalidade com TDD

```text
/ecc:plan "Adicionar exportação de relatórios em CSV"
  → o agente planner escreve o plano e os critérios de aceite
use a skill tdd-workflow
  → o tdd-guide escreve primeiro um teste que falha, depois implementa
/code-review
  → o code-reviewer revisa em um contexto limpo
```

### Exemplo 2: corrigir um bug com teste de regressão

1. Descreva o bug e peça: "reproduza com um teste que falhe antes de corrigir".
2. O agente cria o teste, confirma que ele falha, corrige e confirma que passa.
3. Rode `/code-review` antes de fazer o commit.

### Exemplo 3: instalar só o essencial no Cursor

```bash
./install.sh --profile minimal --target cursor --dry-run   # confira o plano
./install.sh --profile minimal --target cursor
```

### Exemplo 4: Codex com um `config.toml` existente

```bash
# Faça uma cópia antes, por garantia
cp ~/.codex/config.toml ~/.codex/config.toml.bak
bash scripts/sync-ecc-to-codex.sh --dry-run
bash scripts/sync-ecc-to-codex.sh
```

Se o seu `config.toml` usa chaves pontuadas (`features.x = true`), tabelas inline (`agents = { ... }`) ou servidores MCP com aspas, o Cavaleiro mantém essas definições e mostra um aviso quando não consegue completá-las com segurança, em vez de gravar um arquivo que o Codex rejeitaria.

### Exemplo 5: desligar um hook que atrapalha

```bash
export ECC_DISABLED_HOOKS="pre:bash:commit-quality,pre:bash:tmux-reminder"
```

```powershell
$env:ECC_DISABLED_HOOKS = 'pre:bash:commit-quality,pre:bash:tmux-reminder'
```

## 6. Configuração

### Perfis de hooks

| Perfil | Quando usar |
| --- | --- |
| `minimal` | Só as proteções essenciais (por exemplo, bloquear `--no-verify`). |
| `standard` | Padrão: proteções, avisos úteis e memória de sessão. |
| `strict` | Inclui verificações de qualidade de commit, lembretes de tmux e de `git push`. |

Escolha com `ECC_HOOK_PROFILE` ou no assistente (`node scripts/ecc.js setup`).

### Variáveis de ambiente

| Variável | Efeito |
| --- | --- |
| `ECC_HOOK_PROFILE` | Perfil dos hooks (`minimal`, `standard`, `strict`). |
| `ECC_HOOKS_ENABLED` | `false` desliga todos os hooks. |
| `ECC_DISABLED_HOOKS` | IDs de hooks desligados, separados por vírgula (por exemplo `pre:bash:block-no-verify`, `pre:powershell:block-no-verify`). |
| `ECC_HOOK_CONFIG` | Caminho de um `setup.json` gerenciado (padrão: `<plugin>/ecc/setup.json`). |
| `ECC_SESSION_START_MAX_CHARS` | Limite de contexto injetado no início da sessão (padrão 8000). |
| `ECC_SESSION_START_CONTEXT` | `off` desliga esse contexto adicional. |
| `ECC_SESSION_RETENTION_DAYS` | Dias de retenção das sessões temporárias (padrão 30). |
| `ECC_MCP_HEALTH_FAIL_OPEN` | `1` faz a verificação de saúde de MCP apenas avisar, sem bloquear. |
| `ECC_DISABLED_MCPS` | Servidores MCP que o sync do Codex não deve instalar (e remove se existirem). |
| `CLAUDE_PACKAGE_MANAGER` | Gerenciador de pacotes preferido (`npm`, `pnpm`, `yarn`, `bun`). |
| `CLAUDE_CONFIG_DIR`, `CODEX_HOME` | Pastas de configuração alternativas do Claude Code e do Codex. |

### Arquivo `ecc/setup.json`

O assistente grava as escolhas de hooks neste arquivo:

```json
{
  "hooks": {
    "enabled": true,
    "profile": "standard"
  }
}
```

Variáveis de ambiente têm prioridade sobre o arquivo. O arquivo pode ter BOM UTF-8.

### Regras

Copie apenas os pacotes de regras que você usa para `~/.claude/rules/ecc/` (por exemplo `rules/common` e `rules/typescript`). Regras são carregadas sempre, então menos regras significa menos contexto ocupado.

## 7. Solução de problemas

| Sintoma | Causa provável | O que fazer |
| --- | --- | --- |
| Skills, comandos ou hooks duplicados | Duas instalações no mesmo agente (plugin + manual) | `node scripts/ecc.js list-installed`, depois `node scripts/ecc.js uninstall --dry-run` e remova uma delas. |
| Nada do Cavaleiro Agent Harness aparece no Claude Code | Plugin desabilitado ou sessão antiga | `/plugin list`; abra uma nova sessão; rode `node scripts/ecc.js doctor`. |
| Hooks não rodam | `ECC_HOOKS_ENABLED=false`, perfil ou ID desligado | Confira as variáveis e o `ecc/setup.json`; `node scripts/ecc.js doctor`. |
| "BLOCKED: --no-verify flag is not allowed" | O hook `block-no-verify` protege seus git hooks | Corrija o problema apontado pelo hook. Se for mesmo necessário, desligue o hook de forma explícita com `ECC_DISABLED_HOOKS`. |
| Commit bloqueado pela verificação de qualidade (perfil strict) | `debugger`, segredo ou erro de lint no conteúdo em stage | Remova o problema; para desligar, `ECC_DISABLED_HOOKS=pre:bash:commit-quality`. |
| Ferramenta MCP bloqueada com "marked unhealthy" | O servidor falhou recentemente e está em espera | Aguarde a nova tentativa, corrija o servidor ou use `ECC_MCP_HEALTH_FAIL_OPEN=1`. |
| Codex não carrega o `config.toml` | Arquivo inválido (por exemplo, editado à mão) | Restaure o backup do sync; rode o sync de novo: ele recusa gravar TOML inválido. |
| Sync do Codex aborta com "Refusing to write" | A mesclagem detectou que o resultado seria inválido ou mudaria um valor seu | Leia a mensagem, ajuste a entrada indicada no `config.toml` e rode de novo. |
| Erros de caminho no Git Bash | Conversão automática de caminhos do MSYS | Use o PowerShell com `node scripts/ecc.js ...` ou `.\install.ps1`. |
| `npm ci` falha | Versão do Node antiga ou cache corrompido | Atualize o Node (18+), rode `npm cache verify` e tente de novo. |
| Testes com `EPERM ... symlink` no Windows | Criar links simbólicos exige o Modo de Desenvolvedor | Ative o Modo de Desenvolvedor do Windows ou ignore esses testes; não é um problema do produto. |

Mais casos estão em [TROUBLESHOOTING.md](../../TROUBLESHOOTING.md) (em inglês).

## 8. Como contribuir

1. Leia o [guia de contribuição](../../CONTRIBUTING.md) e o [Código de Conduta](../../CODE_OF_CONDUCT.md).
2. Faça um fork de `cavaleiro-ai/cavaleiro-agent-harness`, crie um branch e instale com `npm ci --ignore-scripts`.
3. Para corrigir um bug, escreva primeiro um teste que falhe, depois a correção, e mostre as duas execuções no pull request.
4. Nunca teste instaladores, sync ou hooks contra a sua configuração real: aponte `HOME`, `USERPROFILE`, `CLAUDE_CONFIG_DIR` e `CODEX_HOME` para uma pasta temporária, como os testes em `tests/` fazem.
5. Mantenha os identificadores (`ecc`, `ecc-universal`, `ecc@ecc`, IDs de skills e hooks, variáveis `ECC_*`) inalterados.
6. Rode os testes da área que você mudou (`node tests/run-all.js <filtro-de-caminho>`) e, se possível, `npm test`.
7. Acrescente uma linha em **Unreleased** no [CHANGELOG.md](../../CHANGELOG.md).
8. Vulnerabilidades vão em privado: <https://github.com/cavaleiro-ai/cavaleiro-agent-harness/security/advisories/new>.
