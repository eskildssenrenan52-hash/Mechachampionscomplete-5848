/**
 * Modo História — “Crônicas da Primeira Luz”.
 * Dados tipados (cenas, falas, escolhas, batalhas) + transações de recompensa à prova de repetição.
 */
import { fightReward, grantXP } from "./engine";
import { ROBOT_MAP } from "./robots";
import { addGold, addPlayerXP, applyPetRewards, getState, incBattlesWon, setState, updateRobots } from "./save";

export type SpeakerId =
  | "lyra" | "nara" | "aurorion" | "narrador" | "sistema"
  | "scavenger" | "scrapking" | "siegetank" | "mirrorduelist" | "chronoguard" | "voidarchon"
  | "lyra_orbit" | "voidnavigator";

export interface Speaker { name: string; portrait?: string; side: "left" | "right"; tone: string }

export const SPEAKERS: Record<SpeakerId, Speaker> = {
  lyra: { name: "COMANDANTE LYRA", portrait: "/story/lyra.png", side: "left", tone: "#35e2f0" },
  nara: { name: "ENGENHEIRA NARA", portrait: "/story/nara.png", side: "left", tone: "#ffb21a" },
  aurorion: { name: "AURORION", portrait: "/busts/aurorion_bust.png", side: "right", tone: "#ffe08a" },
  narrador: { name: "", side: "left", tone: "#9fc3d6" },
  sistema: { name: "SISTEMA · LINHA AURORA", side: "left", tone: "#7dff8a" },
  scavenger: { name: "CATADOR ÓPTICO", portrait: "/busts/npc_scavenger_bust.png", side: "right", tone: "#7dff8a" },
  scrapking: { name: "REI DA SUCATA", portrait: "/busts/npc_scrapking_bust.png", side: "right", tone: "#ff8a3d" },
  siegetank: { name: "BASTIÃO DE CERCO", portrait: "/busts/npc_siegetank_bust.png", side: "right", tone: "#ff5b4d" },
  mirrorduelist: { name: "DUELISTA PRISMÁTICO", portrait: "/busts/npc_mirrorduelist_bust.png", side: "right", tone: "#c9a7ff" },
  chronoguard: { name: "GUARDIÃO CRONAL", portrait: "/busts/npc_chronoguard_bust.png", side: "right", tone: "#8fd8ff" },
  voidarchon: { name: "ARCONTE DO VAZIO", portrait: "/busts/npc_voidarchon_bust.png", side: "right", tone: "#b46bff" },
  lyra_orbit: { name: "LYRA · TRAJE ORBITAL", portrait: "/story/lyra-s2.webp", side: "left", tone: "#63f2ff" },
  voidnavigator: { name: "NAVEGANTE DO VAZIO", portrait: "/story/npc-s2-voidnavigator.webp", side: "right", tone: "#d28cff" },
};

export type StoryFx = "shake" | "flash" | "glitch" | "zoom" | "alarm" | "quake";

export interface StoryLine {
  kind: "line";
  who: SpeakerId;
  text: string;
  fx?: StoryFx;
  /** mostra a fala só se a flag tiver esse valor. */
  when?: [string, string];
}
export interface StoryChoice {
  kind: "choice";
  flag: string;
  prompt: string;
  options: { value: string; label: string; reply: StoryLine[] }[];
}
export interface StoryEnemy { id: string; level: number; trained: number; statScale?: number }
export interface StoryBattle {
  kind: "battle";
  id: string;
  label: string;
  arena: string;
  enemies: StoryEnemy[];
}
export interface StoryBackdrop { kind: "bg"; art: string }
export type StoryBeat = StoryLine | StoryChoice | StoryBattle | StoryBackdrop;

export interface StoryChapter {
  id: string;
  num: number;
  title: string;
  subtitle: string;
  synopsis: string;
  art: string;
  thumb: string;
  recommended: number;
  reward: { gold: number; xp: number; item: string; qty: number };
  beats: StoryBeat[];
  /** Posição no mapa panorâmico vertical da campanha. Ausente nos capítulos antigos = legado. */
  map?: { x: number; y: number; region: string };
}

const L = (who: SpeakerId, text: string, fx?: StoryFx, when?: [string, string]): StoryLine => ({ kind: "line", who, text, fx, when });
const art = (n: string) => `/story/${n}.webp`;

export const STORY_CHAPTERS: StoryChapter[] = [
  {
    id: "ferrugem", num: 1, title: "FERRUGEM NA LINHA", subtitle: "Plataforma Aurora · 23:40",
    synopsis: "Os trens pararam. Algo está devorando os cabos do metrô.",
    art: art("ch1"), thumb: art("ch1-thumb"), recommended: 1,
    reward: { gold: 250, xp: 50, item: "repair_kit", qty: 2 }, map: { x: 24, y: 92, region: "LINHA AURORA" },
    beats: [
      L("narrador", "Três noites depois da Primeira Luz, a cidade voltou a dormir tranquila. Quase."),
      L("sistema", "ALERTA: LINHA AURORA SEM ENERGIA. SETE COMPOSIÇÕES PARADAS.", "alarm"),
      L("lyra", "Piloto, preciso de você no subsolo. As câmeras da plataforma mostram movimento… pequeno, rápido e em grupo."),
      L("aurorion", "Sinto cheiro de cobre queimado. Alguém está arrancando os cabos de força com as garras."),
      L("scavenger", "Krrr… peças. Peças boas. O REI quer todas.", "glitch"),
      L("lyra", "‘O Rei’? Ótimo. Um enxame com hierarquia. Tire esses catadores da linha antes que derrubem a ponte de energia."),
      { kind: "battle", id: "ferrugem-1", label: "PLATAFORMA AURORA · ENXAME", arena: "undercity", enemies: [{ id: "npc_scavenger", level: 2, trained: 1, statScale: 0.75 }] },
      L("aurorion", "O enxame recuou pelo túnel norte. Levaram um núcleo de reator inteiro.", "shake"),
      L("nara", "Um núcleo inteiro?! Aquilo pesa duas toneladas. Ninguém carrega isso a pé — eles têm um guindaste lá fora."),
      L("lyra", "O túnel norte sai no ferro-velho do distrito industrial. Descanse, piloto. Amanhã vamos conhecer esse rei."),
    ],
  },
  {
    id: "trono", num: 2, title: "O TRONO DE SUCATA", subtitle: "Ferro-velho Industrial · Pôr do sol",
    synopsis: "Um soberano feito de refugo reivindica a cidade.",
    art: art("ch2"), thumb: art("ch2-thumb"), recommended: 3,
    reward: { gold: 500, xp: 100, item: "energy_cell", qty: 2 }, map: { x: 68, y: 82, region: "FERRO-VELHO" },
    beats: [
      L("nara", "Olha esse lugar. Cada pilha de sucata aqui já foi um robô de alguém."),
      L("scrapking", "BEM-VINDOS AO MEU REINO! Tudo que a cidade joga fora, eu coroo.", "quake"),
      L("aurorion", "Você roubou o núcleo do metrô. Milhares de pessoas dependem daquela linha."),
      L("scrapking", "Roubei? Eu RESGATEI. Alguém lá em cima me ofereceu um preço… e prometeu que o céu vai escurecer.", "glitch"),
      L("lyra", "Quem te contratou? Responda e a gente conversa."),
      L("scrapking", "Só respondo a quem derruba a coroa. GUARDA, ÀS GARRAS!", "shake"),
      { kind: "battle", id: "trono-1", label: "FERRO-VELHO · GUARDA REAL", arena: "foundry", enemies: [{ id: "npc_scavenger", level: 3, trained: 2, statScale: 0.8 }, { id: "npc_scrapking", level: 3, trained: 2, statScale: 0.75 }] },
      L("scrapking", "Hngh… a fornalha… está apagando…", "flash"),
      L("nara", "O núcleo do metrô está na caldeira dele. Se eu tirar agora, a fornalha dele morre junto."),
      {
        kind: "choice", flag: "rei", prompt: "O que fazer com o Rei da Sucata?",
        options: [
          { value: "poupou", label: "Poupar — trocar uma bateria pelo núcleo", reply: [L("nara", "Fechado. Uma célula reserva no lugar do núcleo. Ele vive, a linha volta."), L("scrapking", "…Ninguém nunca me devolveu nada. Eu não esqueço dívidas, piloto.")] },
          { value: "desmontou", label: "Desligar — recuperar o núcleo agora", reply: [L("nara", "Núcleo recuperado. A fornalha apagou, mas ele ainda pisca."), L("scrapking", "Frio… tão frio… ELE vai fazer a cidade inteira sentir isso.", "glitch")] },
        ],
      },
      L("lyra", "Ele falou do céu escurecendo. Nara, cruze isso com os registros da usina."),
      L("nara", "Já cruzei. A usina está recebendo pedidos de carga de um endereço que não existe."),
    ],
  },
  {
    id: "cerco", num: 3, title: "CERCO À USINA", subtitle: "Usina Central · Tempestade",
    synopsis: "Uma máquina de invasão marcha contra o coração elétrico da cidade.",
    art: art("ch3"), thumb: art("ch3-thumb"), recommended: 6,
    reward: { gold: 900, xp: 180, item: "shield_chip", qty: 2 }, map: { x: 28, y: 70, region: "USINA CENTRAL" },
    beats: [
      L("sistema", "MURALHA EXTERNA DA USINA ROMPIDA. INTEGRIDADE 41%.", "alarm"),
      L("lyra", "Aquilo é um Bastião de Cerco. Máquina de guerra autônoma. Ninguém fabrica isso há quarenta anos."),
      L("siegetank", "ORDEM RECEBIDA: DRENAR O NÚCLEO. OBSTÁCULOS SERÃO CONVERTIDOS EM ENTULHO.", "quake"),
      L("aurorion", "Ele não pensa. Só obedece. Então vamos quebrar a ordem junto com a blindagem."),
      L("scrapking", "Ei, latão! Meus catadores abriram uma brecha no flanco esquerdo dele. Estamos quites.", undefined, ["rei", "poupou"]),
      L("nara", "Sem ajuda dessa vez. Acerte as juntas das esteiras — é onde a couraça é mais fina.", undefined, ["rei", "desmontou"]),
      { kind: "battle", id: "cerco-1", label: "USINA CENTRAL · BASTIÃO", arena: "reactor", enemies: [{ id: "npc_scavenger", level: 5, trained: 3, statScale: 0.85 }, { id: "npc_siegetank", level: 6, trained: 4, statScale: 0.85 }] },
      L("siegetank", "ORDEM… INTERROMPIDA… ORIGEM DA ORDEM: SALÃO… DOS… ESPELHOS…", "glitch"),
      L("lyra", "Salão dos Espelhos? Isso fica embaixo do museu. Interditado desde a fundação da cidade."),
      L("aurorion", "Então alguém tem a chave de um lugar que não deveria ter porta."),
    ],
  },
  {
    id: "espelhos", num: 4, title: "SALÃO DOS ESPELHOS", subtitle: "Cofre sob o Museu · Silêncio",
    synopsis: "Um duelista de vidro mostra ao piloto o que ele poderia se tornar.",
    art: art("ch4"), thumb: art("ch4-thumb"), recommended: 9,
    reward: { gold: 1500, xp: 300, item: "mega_repair", qty: 1 }, map: { x: 66, y: 58, region: "MUSEU SUBTERRÂNEO" },
    beats: [
      L("narrador", "Cada espelho devolve um Aurorion diferente. Uns coroados. Uns quebrados. Uns que nunca saíram do hangar."),
      L("mirrorduelist", "Bem-vindo, campeão. Aqui guardamos os futuros que a cidade descartou.", "flash"),
      L("mirrorduelist", "Meu mestre me mostrou o seu: você cai no dia do eclipse. A menos que lute ao lado dele."),
      {
        kind: "choice", flag: "espelho", prompt: "Como responder ao Duelista?",
        options: [
          { value: "confiar", label: "Ouvir — perguntar quem é o mestre", reply: [L("mirrorduelist", "O Arconte do Vazio. Ele não quer destruir a cidade. Quer desligá-la… para sempre ficar em paz."), L("aurorion", "Paz sem ninguém para senti-la é só escuridão.")] },
          { value: "quebrar", label: "Recusar — futuro se escolhe lutando", reply: [L("aurorion", "Eu não aceito futuro emprestado."), L("mirrorduelist", "Então vou te mostrar o reflexo de cada erro seu.", "shake")] },
        ],
      },
      { kind: "battle", id: "espelhos-1", label: "SALÃO DOS ESPELHOS · DUELO", arena: "crystal", enemies: [{ id: "npc_mirrorduelist", level: 9, trained: 6, statScale: 0.9 }] },
      L("mirrorduelist", "Os reflexos… racharam. Talvez o seu futuro não estivesse escrito.", "flash"),
      L("mirrorduelist", "Corra ao Observatório. O Guardião Cronal está segurando a hora do eclipse. Se ele soltar, o portal abre.", undefined, ["espelho", "confiar"]),
      L("lyra", "Os sensores do Observatório pararam às 03:00:00. Faz uma hora que eles marcam o mesmo segundo.", undefined, ["espelho", "quebrar"]),
      L("nara", "Tempo parado. Claro. Por que seria um problema simples?"),
    ],
  },
  {
    id: "segundos", num: 5, title: "ENTRE DOIS SEGUNDOS", subtitle: "Observatório · 03:00:00",
    synopsis: "No alto da cidade, o tempo parou — e alguém guarda a ampulheta.",
    art: art("ch5"), thumb: art("ch5-thumb"), recommended: 12,
    reward: { gold: 2400, xp: 480, item: "energy_cell", qty: 3 }, map: { x: 32, y: 46, region: "OBSERVATÓRIO" },
    beats: [
      L("narrador", "A chuva não cai. O raio não termina. Só os passos de Aurorion fazem barulho."),
      L("chronoguard", "Tique. Você chegou entre um segundo e o próximo. Ninguém deveria caminhar aqui.", "zoom"),
      L("aurorion", "Você está prendendo a cidade nesse instante. Por quê?"),
      L("chronoguard", "Enquanto este segundo durar, o eclipse não chega. Eu protejo vocês do Arconte… do único jeito que sei.", "glitch"),
      L("lyra", "Ninguém vive dentro de um segundo, Guardião. Solte o tempo e nos deixe lutar."),
      L("chronoguard", "Prove que consegue vencer o amanhã. Vença primeiro o agora.", "shake"),
      { kind: "battle", id: "segundos-1", label: "OBSERVATÓRIO · HORA ZERO", arena: "archive", enemies: [{ id: "npc_chronoguard", level: 12, trained: 8, statScale: 0.9 }] },
      L("narrador", "A chuva desaba de uma vez. O trovão completa o rugido que começou uma hora atrás.", "flash"),
      L("chronoguard", "O tempo é seu de novo. Use bem. Ele já está aqui.", "quake"),
      L("sistema", "ANOMALIA SOBRE A PRAÇA DO PORTAL. LUMINOSIDADE DA CIDADE CAINDO.", "alarm"),
    ],
  },
  {
    id: "eclipse", num: 6, title: "ECLIPSE DA PRIMEIRA LUZ", subtitle: "Praça do Portal · O fim da noite",
    synopsis: "O Arconte do Vazio abre o céu. A última luz é a sua.",
    art: art("ch6"), thumb: art("ch6-thumb"), recommended: 15,
    reward: { gold: 3600, xp: 750, item: "revive_core", qty: 2 }, map: { x: 60, y: 36, region: "PRAÇA DO PORTAL" },
    beats: [
      L("narrador", "O sol negro se abre sobre a praça. As janelas da cidade apagam uma a uma.", "quake"),
      L("voidarchon", "Pequena luz. Vim apagar o cansaço deste mundo. Ninguém mais precisará lutar.", "glitch"),
      L("aurorion", "Lutar é o que nos faz levantar de novo. Você não vai tirar isso de ninguém."),
      L("scrapking", "E O REI TAMBÉM VEIO! Meus catadores religaram os postes da praça!", "shake", ["rei", "poupou"]),
      L("mirrorduelist", "Eu vi todos os futuros. Em nenhum deles você recua. Lute — eu desvio os reflexos dele.", undefined, ["espelho", "confiar"]),
      L("lyra", "Todos os canais da cidade estão com você, piloto. Primeira Luz: LANÇAR!"),
      { kind: "battle", id: "eclipse-1", label: "PORTAL · ARAUTOS DO VAZIO", arena: "rift", enemies: [{ id: "npc_chronoguard", level: 14, trained: 9, statScale: 0.85 }, { id: "npc_voidarchon", level: 14, trained: 9, statScale: 0.85 }] },
      L("voidarchon", "Interessante. Então vou mostrar a escuridão inteira.", "quake"),
      L("nara", "A energia dele dobrou! Aurorion, o seu reator aguenta mais um minuto. UM.", "alarm"),
      { kind: "battle", id: "eclipse-2", label: "ECLIPSE · ARCONTE DESPERTO", arena: "genesis", enemies: [{ id: "npc_voidarchon", level: 16, trained: 11, statScale: 0.95 }] },
      L("narrador", "Uma linha dourada corta o sol negro. Depois outra. Depois a manhã inteira.", "flash"),
      L("voidarchon", "Então… a luz… também cansa de perder.", "glitch"),
      L("lyra", "A cidade está acordando. Bom trabalho, piloto. De verdade."),
      L("aurorion", "Não foi só meu reator. Foi cada pessoa que acendeu uma luz esta noite."),
      L("sistema", "CRÔNICAS DA PRIMEIRA LUZ — CONCLUÍDAS. NOVAS AMEAÇAS SERÃO REGISTRADAS."),
    ],
  },
  {
    id: "orbital", num: 7, title: "A CIDADE ACIMA DO CÉU", subtitle: "Porto Aurora · Órbita baixa",
    synopsis: "O sinal que guiou o Arconte veio de uma estação esquecida acima das nuvens.",
    art: art("ch7"), thumb: art("ch7-thumb"), recommended: 18,
    reward: { gold: 4800, xp: 950, item: "mega_repair", qty: 2 }, map: { x: 76, y: 25, region: "PORTO AURORA" },
    beats: [
      L("lyra_orbit", "Vista o traje orbital, piloto. A estação está sem gravidade e sem leis há quinze anos."),
      L("nara", "O pedido de carga que não existia… vinha daqui. Alguém continuou alimentando a estação depois do eclipse."),
      L("voidnavigator", "Vocês chegaram tarde. A cidade abaixo é apenas o primeiro mapa que o Vazio vai apagar.", "glitch"),
      L("lyra_orbit", "Navegante, entregue o núcleo cartográfico e ninguém precisa cair hoje."),
      { kind: "choice", flag: "orbital", prompt: "Como atravessar a estação em colapso?", options: [
        { value: "resgate", label: "Resgatar os trabalhadores presos", reply: [L("lyra_orbit", "Primeiro vidas. O mapa pode esperar."), L("voidnavigator", "Ainda escolhem pessoas. Interessante.")] },
        { value: "atalho", label: "Cortar caminho pelo reator", reply: [L("nara", "Se o reator romper, perdemos a estação inteira."), L("voidnavigator", "Um piloto que escolhe velocidade. Eu conheço esse tipo de coragem.")] },
      ] },
      { kind: "battle", id: "orbital-1", label: "PORTO AURORA · DRONES SEM GRAVIDADE", arena: "nebula", enemies: [{ id: "npc_siegetank", level: 18, trained: 12, statScale: 0.9 }, { id: "npc_mirrorduelist", level: 18, trained: 11, statScale: 0.88 }] },
      L("voidnavigator", "O núcleo não guarda coordenadas. Guarda destinos. E o próximo está no Jardim do Anel.", "zoom"),
      L("lyra_orbit", "Então subimos mais uma vez. Primeira Luz, em formação."),
    ],
  },
  {
    id: "anel", num: 8, title: "O JARDIM DO ANEL", subtitle: "Estação Helix · Noite artificial",
    synopsis: "Uma floresta orbital conserva mapas de mundos que ainda não nasceram.",
    art: art("ch8"), thumb: art("ch8-thumb"), recommended: 21,
    reward: { gold: 6200, xp: 1250, item: "revive_core", qty: 2 }, map: { x: 38, y: 14, region: "JARDIM HELIX" },
    beats: [
      L("narrador", "O jardim gira sem vento. Cada folha mostra um lugar diferente quando a luz passa por ela."),
      L("voidnavigator", "Este anel desenhou a primeira cidade. Também desenhou o fim dela."),
      L("aurorion", "Você fala como se tivesse visto tudo."),
      L("voidnavigator", "Eu naveguei entre os segundos que vocês chamam de futuro. Em alguns, vocês vencem."),
      { kind: "choice", flag: "anel", prompt: "Qual mapa levar para a cidade?", options: [
        { value: "origem", label: "O mapa da origem — entender a Primeira Luz", reply: [L("nara", "Se descobrirmos quem ligou o primeiro reator, talvez desliguemos o Vazio sem destruí-lo.")] },
        { value: "futuro", label: "O mapa do futuro — encontrar a próxima ameaça", reply: [L("lyra_orbit", "Informação primeiro. A cidade precisa sobreviver à próxima onda.")] },
      ] },
      { kind: "battle", id: "anel-1", label: "JARDIM HELIX · RAÍZES DE CRISTAL", arena: "jungle", enemies: [{ id: "npc_chronoguard", level: 21, trained: 14, statScale: 0.92 }, { id: "npc_voidarchon", level: 21, trained: 13, statScale: 0.9 }] },
      L("narrador", "A raiz central abre uma janela para a lua quebrada. O mapa aponta para o outro lado da órbita.", "flash"),
      L("voidnavigator", "O último ponto não é um lugar. É uma decisão."),
    ],
  },
  {
    id: "fronteira", num: 9, title: "A ÚLTIMA COORDENADA", subtitle: "Lua partida · Depois do eclipse",
    synopsis: "No limite do mapa, o piloto encontra o lugar onde a luz foi inventada.",
    art: art("ch9"), thumb: art("ch9-thumb"), recommended: 25,
    reward: { gold: 9000, xp: 1900, item: "energy_cell", qty: 5 }, map: { x: 78, y: 4, region: "LUA PARTIDA" },
    beats: [
      L("sistema", "COORDENADA FORA DO CATÁLOGO. ORIGEM: ANTES DA PRIMEIRA LUZ.", "alarm"),
      L("lyra_orbit", "A cidade inteira está olhando para nós. Não importa o que exista do outro lado: voltamos juntos."),
      L("voidnavigator", "Eu fui criado para mapear o silêncio. Vocês me deram uma rota de volta.", "glitch"),
      L("aurorion", "Então escolha: ser o caminho ou ser o fim dele."),
      { kind: "battle", id: "fronteira-1", label: "LUA PARTIDA · O MAPA VIVO", arena: "rift", enemies: [{ id: "npc_voidarchon", level: 25, trained: 16, statScale: 0.95 }, { id: "npc_chronoguard", level: 25, trained: 15, statScale: 0.92 }] },
      L("voidnavigator", "O mapa está aberto. Não para o Vazio — para todos os lugares que ainda podemos construir.", "flash"),
      L("lyra_orbit", "Crônicas da Primeira Luz: segunda rota concluída. A próxima história começa onde a nossa termina."),
      L("sistema", "NOVA ROTA REGISTRADA. O HORIZONTE NÃO É MAIS UM LIMITE."),
    ],
  },
];

export const STORY_MAP = Object.fromEntries(STORY_CHAPTERS.map((c) => [c.id, c])) as Record<string, StoryChapter>;

export function chapterUnlocked(cleared: string[], index: number): boolean {
  return index === 0 || cleared.includes(STORY_CHAPTERS[index - 1].id);
}

export function storyEnemies(b: StoryBattle) {
  return b.enemies.map((e) => ({ id: e.id, level: e.level, xp: 0, trained: { str: e.trained, def: e.trained, agl: e.trained }, statScale: e.statScale }));
}

/** Recompensa normal de uma luta da história (como qualquer batalha). Paga ouro/XP à equipe. */
export function payStoryFight(b: StoryBattle, won: boolean): { gold: number; xp: number; levelUps: { name: string; level: number }[] } {
  const raw = b.enemies.reduce((acc, e) => {
    const r = fightReward(ROBOT_MAP[e.id].ratios, e.level);
    return { gold: acc.gold + r.gold, xp: acc.xp + r.xp };
  }, { gold: 0, xp: 0 });
  const earned = applyPetRewards(won ? raw : { gold: Math.round(raw.gold / 4), xp: Math.round(raw.xp / 4) });
  const levelUps = distribute(earned.gold, earned.xp);
  if (won) incBattlesWon();
  return { ...earned, levelUps };
}

function distribute(gold: number, xp: number) {
  const g = getState();
  addGold(gold);
  addPlayerXP(xp);
  const levelUps: { name: string; level: number }[] = [];
  const team = new Set(g.team);
  updateRobots(g.robots.map((r) => {
    if (!team.has(r.id)) return r;
    const res = grantXP(r, xp);
    if (res.levelsGained > 0) levelUps.push({ name: ROBOT_MAP[r.id]?.name ?? r.id, level: res.save.level });
    return res.save;
  }));
  return levelUps;
}

export function setStoryFlag(flag: string, value: string) {
  setState((s) => ({ ...s, story: { ...s.story, flags: { ...s.story.flags, [flag]: value } } }));
}
export function markStoryOpened(id: string) {
  setState((s) => (s.story.last === id ? s : { ...s, story: { ...s.story, last: id } }));
}

/**
 * Conclui um capítulo. A recompensa de estreia é paga uma única vez: a checagem e a marcação
 * acontecem na mesma transação de estado, então replays, cliques duplos e recargas não duplicam.
 */
export function completeStoryChapter(id: string): { first: boolean; gold: number; xp: number; item?: string; qty?: number } {
  const ch = STORY_MAP[id];
  if (!ch) return { first: false, gold: 0, xp: 0 };
  let first = false;
  setState((s) => {
    if (s.story.cleared.includes(id)) return s;
    first = true;
    return {
      ...s,
      gold: s.gold + ch.reward.gold,
      items: { ...s.items, [ch.reward.item]: (s.items[ch.reward.item] ?? 0) + ch.reward.qty },
      story: { ...s.story, cleared: [...s.story.cleared, id] },
    };
  });
  if (!first) return { first: false, gold: 0, xp: 0 };
  addPlayerXP(ch.reward.xp);
  return { first: true, gold: ch.reward.gold, xp: ch.reward.xp, item: ch.reward.item, qty: ch.reward.qty };
}
