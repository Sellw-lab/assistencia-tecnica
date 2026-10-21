import { useMemo, useState } from "react";
import {
  Activity,
  ArrowUpRight,
  BadgeCheck,
  Bell,
  CalendarClock,
  Camera,
  Check,
  ChevronRight,
  ClipboardCheck,
  Clock3,
  Cpu,
  Eye,
  FileSignature,
  FileText,
  Headphones,
  KeyRound,
  LifeBuoy,
  LockKeyhole,
  Mail,
  MapPin,
  Menu,
  MonitorCog,
  MoreHorizontal,
  PackageCheck,
  Phone,
  ReceiptText,
  RotateCcw,
  Search,
  Send,
  ShieldCheck,
  Sparkles,
  UserRound,
  Wrench,
  X,
  Zap,
} from "lucide-react";

type ChecklistItem = {
  id: string;
  title: string;
  detail: string;
  icon: typeof UserRound;
};

type ChecklistSection = {
  id: string;
  number: string;
  title: string;
  description: string;
  icon: typeof UserRound;
  accent: string;
  items: ChecklistItem[];
};

const sections: ChecklistSection[] = [
  {
    id: "client",
    number: "01",
    title: "Dados do cliente",
    description: "Registe quem entrega o equipamento e como manter contacto.",
    icon: UserRound,
    accent: "coral",
    items: [
      { id: "client-name", title: "Nome completo e documento conferidos", detail: "CPF/RG conferido e associado à OS", icon: FileSignature },
      { id: "client-contact", title: "Telefone, WhatsApp e e-mail anotados", detail: "Confirmar o melhor canal para retorno", icon: Phone },
      { id: "client-address", title: "Endereço registrado", detail: "Morada completa para cadastro e comprovativo", icon: MapPin },
      { id: "client-os", title: "Cliente informado sobre a abertura da OS", detail: "Explicar o número e o fluxo do atendimento", icon: BadgeCheck },
    ],
  },
  {
    id: "device",
    number: "02",
    title: "Identificação do equipamento",
    description: "Deixe registado exatamente o que entrou na bancada.",
    icon: MonitorCog,
    accent: "blue",
    items: [
      { id: "device-model", title: "Tipo, marca e modelo registrados", detail: "Notebook, desktop, celular, impressora ou outro", icon: MonitorCog },
      { id: "device-serial", title: "Número de série / patrimônio registrado", detail: "Conferir a etiqueta física do equipamento", icon: KeyRound },
      { id: "device-accessories", title: "Acessórios recebidos conferidos", detail: "Carregador, mouse, bateria, cabos e mochila", icon: PackageCheck },
      { id: "device-password", title: "Senha de acesso solicitada, se necessária", detail: "Anotar a autorização somente na OS", icon: LockKeyhole },
    ],
  },
  {
    id: "problem",
    number: "03",
    title: "Relato do problema",
    description: "A melhor pista para o diagnóstico vem de quem usa o dispositivo.",
    icon: Headphones,
    accent: "yellow",
    items: [
      { id: "problem-description", title: "Defeito descrito com as palavras do cliente", detail: "Registar o relato sem traduzir ou resumir demais", icon: Headphones },
      { id: "problem-history", title: "Quando começou e o que aconteceu antes", detail: "Queda, líquido, oscilação ou outro evento", icon: FileText },
      { id: "problem-repair", title: "Histórico de outra assistência verificado", detail: "Saber se o equipamento foi aberto antes", icon: Wrench },
      { id: "problem-test", title: "Teste rápido feito na frente do cliente", detail: "Ligar e demonstrar o estado inicial", icon: Eye },
    ],
  },
  {
    id: "inspection",
    number: "04",
    title: "Vistoria do estado físico",
    description: "Proteja o cliente e a assistência documentando a entrada.",
    icon: Camera,
    accent: "violet",
    items: [
      { id: "inspection-body", title: "Riscos, amassados, trincas e peças soltas registrados", detail: "Descrever danos visíveis antes do diagnóstico", icon: Eye },
      { id: "inspection-photos", title: "Fotos do equipamento tiradas", detail: "Frente, verso, laterais e tela", icon: Camera },
      { id: "inspection-seals", title: "Lacres e parafusos verificados", detail: "Registar se foram violados ou não", icon: ShieldCheck },
      { id: "inspection-ports", title: "Portas, teclado, tela e entradas conferidos", detail: "Checklist físico realizado com o cliente", icon: MonitorCog },
    ],
  },
  {
    id: "privacy",
    number: "05",
    title: "Dados e privacidade",
    description: "Combine os limites de acesso antes de abrir qualquer ficheiro.",
    icon: ShieldCheck,
    accent: "green",
    items: [
      { id: "privacy-backup", title: "Cliente avisado para fazer backup", detail: "Reforçar a importância de uma cópia atualizada", icon: ShieldCheck },
      { id: "privacy-access", title: "Autorização de formatação e acesso definida", detail: "Registar limites de acesso aos arquivos", icon: LockKeyhole },
      { id: "privacy-liability", title: "Aviso sobre dados sem backup entregue", detail: "Cliente ciente da responsabilidade pelos dados", icon: FileSignature },
    ],
  },
  {
    id: "quote",
    number: "06",
    title: "Orçamento e prazos",
    description: "Alinhe expectativas antes de iniciar o serviço técnico.",
    icon: ReceiptText,
    accent: "pink",
    items: [
      { id: "quote-fee", title: "Taxa de diagnóstico e orçamento explicados", detail: "Informar valores e quando são cobrados", icon: ReceiptText },
      { id: "quote-deadline", title: "Prazo estimado informado", detail: "Registar uma previsão realista para o cliente", icon: CalendarClock },
      { id: "quote-channel", title: "Forma de contacto para aprovação combinada", detail: "WhatsApp, telefone, e-mail ou outro canal", icon: Send },
      { id: "quote-storage", title: "Prazo de retirada e armazenamento explicados", detail: "Informar o que acontece depois da conclusão", icon: Clock3 },
    ],
  },
  {
    id: "finish",
    number: "07",
    title: "Finalização do atendimento",
    description: "Feche a receção com rastreabilidade e uma boa experiência.",
    icon: ClipboardCheck,
    accent: "teal",
    items: [
      { id: "finish-os", title: "OS impressa, assinada e entregue ao cliente", detail: "Entregar a via física ou digital da OS", icon: FileSignature },
      { id: "finish-label", title: "Equipamento etiquetado com o número da OS", detail: "Identificação visível na bancada", icon: PackageCheck },
      { id: "finish-storage", title: "Equipamento guardado no local correto", detail: "Bancada ou prateleira identificada", icon: MonitorCog },
      { id: "finish-thanks", title: "Cliente agradecido e informado do acompanhamento", detail: "Partilhar o canal para consultar o estado", icon: BadgeCheck },
    ],
  },
];

const initialClient = {
  name: "Lucas Ferreira",
  document: "CPF 084.***.***-20",
  phone: "(87) 98842-0176",
  whatsapp: "(87) 98842-0176",
  email: "lucas.ferreira@emailficticio.com",
  address: "Rua Joaquim Godoy, 72 — São Cristóvão",
  device: "Notebook Lenovo IdeaPad 3",
  serial: "PF3A-0248-DEMO",
};

export default function Home() {
  const [completed, setCompleted] = useState<string[]>(["client-name"]);
  const [client, setClient] = useState(initialClient);
  const [menuOpen, setMenuOpen] = useState(false);
  const [showReport, setShowReport] = useState(false);

  const allItems = useMemo(() => sections.flatMap(section => section.items), []);
  const completedCount = completed.length;
  const totalCount = allItems.length;
  const progress = Math.round((completedCount / totalCount) * 100);
  const isComplete = completedCount === totalCount;
  const activeSectionIndex = sections.findIndex(section => section.items.some(item => !completed.includes(item.id)));
  const currentSection = sections[activeSectionIndex === -1 ? sections.length - 1 : activeSectionIndex];
  const nextItem = allItems.find(item => !completed.includes(item.id));

  function toggleItem(id: string) {
    setCompleted(current => current.includes(id) ? current.filter(item => item !== id) : [...current, id]);
  }

  function resetChecklist() {
    setCompleted([]);
    setShowReport(false);
  }

  function updateClient(field: keyof typeof client, value: string) {
    setClient(current => ({ ...current, [field]: value }));
  }

  return (
    <div className="app-shell">
      <aside className={`sidebar ${menuOpen ? "sidebar-open" : ""}`}>
        <div className="brand-lockup">
          <div className="brand-mark" aria-hidden="true"><span>S</span><span>B</span></div>
          <div><p className="brand-name">sert<span>byte</span></p><p className="brand-subtitle">assistência técnica</p></div>
          <button className="icon-button sidebar-close" aria-label="Fechar menu" onClick={() => setMenuOpen(false)}><X size={17} /></button>
        </div>
        <div className="sidebar-label">Espaço de trabalho</div>
        <nav className="sidebar-nav" aria-label="Navegação principal">
          <button className="nav-item active"><Activity size={17} /><span>Visão geral</span><span className="nav-active-dot" /></button>
          <button className="nav-item"><ClipboardCheck size={17} /><span>Atendimentos</span><span className="nav-count">04</span></button>
          <button className="nav-item"><Wrench size={17} /><span>Ordens de serviço</span></button>
          <button className="nav-item"><FileText size={17} /><span>Relatórios finais</span></button>
        </nav>
        <div className="sidebar-label nav-secondary-label">Apoio</div>
        <nav className="sidebar-nav" aria-label="Navegação de apoio">
          <button className="nav-item"><LifeBuoy size={17} /><span>Guia de atendimento</span></button>
          <button className="nav-item"><Wrench size={17} /><span>Definições</span></button>
        </nav>
        <div className="sidebar-bottom">
          <div className="open-status"><span className="status-dot" /> atendimento aberto <span>•</span> 08:00–18:00</div>
          <div className="location-card"><div className="location-icon"><MapPin size={16} /></div><div><strong>Serra Talhada, PE</strong><span>Rua do Sertão, 148 · Centro</span></div></div>
          <div className="fiction-note"><Sparkles size={14} /> Dados fictícios para dinâmica de curso</div>
        </div>
      </aside>
      {menuOpen && <button className="sidebar-overlay" aria-label="Fechar navegação" onClick={() => setMenuOpen(false)} />}

      <main className="main-content">
        <header className="topbar">
          <button className="icon-button mobile-menu" aria-label="Abrir menu" onClick={() => setMenuOpen(true)}><Menu size={20} /></button>
          <div className="breadcrumb"><span>Espaço de trabalho</span><ChevronRight size={14} /><strong>OS-0248 · Em receção</strong></div>
          <div className="topbar-actions"><div className="search-box"><Search size={15} /><span>Pesquisar</span><kbd>⌘ K</kbd></div><button className="icon-button notification-button" aria-label="Notificações"><Bell size={18} /><span className="notification-dot" /></button><div className="user-avatar">MC</div></div>
        </header>

        <div className="page-content">
          <section className="welcome-row">
            <div><div className="eyebrow"><span className="eyebrow-line" /> ordem de serviço <span className="eyebrow-clock"><Clock3 size={13} /> 10:42</span></div><h1>Atendimento <em>OS-0248.</em></h1><p className="page-intro">Recolha os dados certos. Dê retorno em cada etapa.</p></div>
            <div className="header-actions"><div className="live-pill"><span className="pulse-dot" /> acompanhamento ativo</div><button className="primary-button" onClick={() => document.getElementById("checklist")?.scrollIntoView({ behavior: "smooth" })}><ClipboardCheck size={17} /> Continuar checklist <ArrowUpRight size={16} /></button></div>
          </section>

          <section className="hero-card">
            <div className="hero-copy"><div className="hero-kicker"><Zap size={14} fill="currentColor" /> fluxo de atendimento</div><h2>Informação clara.<br /><span>Cliente tranquilo.</span></h2><p>Desde a entrada do equipamento até ao relatório final, cada etapa fica registada e pronta para ser comunicada.</p><div className="hero-meta"><span><CalendarClock size={15} /> etapa atual <strong>{currentSection.title}</strong></span><span className="hero-divider" /><span><ShieldCheck size={15} /> OS rastreável</span></div></div>
            <div className="hero-art" aria-hidden="true"><div className="art-grid" /><div className="art-orbit orbit-one" /><div className="art-orbit orbit-two" /><div className="art-chip"><Cpu size={29} /><span>OS<br /><strong>0248</strong></span></div><div className="art-spark spark-one" /><div className="art-spark spark-two" /><div className="art-spark spark-three" /><div className="art-line line-one" /><div className="art-line line-two" /></div>
          </section>

          <section className="metric-strip" aria-label="Resumo da ordem de serviço">
            <div className="metric-card featured"><div className="metric-icon coral"><ClipboardCheck size={17} /></div><div><span>Ordem de serviço ativa</span><strong>OS-0248</strong></div><div className="metric-arrow"><ArrowUpRight size={16} /></div></div>
            <div className="metric-card"><div className="metric-icon blue"><UserRound size={17} /></div><div><span>Cliente em receção</span><strong>{client.name}</strong></div><span className="metric-caption">dados a recolher</span></div>
            <div className="metric-card"><div className="metric-icon yellow"><MonitorCog size={17} /></div><div><span>Estado do dispositivo</span><strong>{isComplete ? "Pronto para entrega" : currentSection.title}</strong></div><span className="metric-caption">{progress}% concluído</span></div>
          </section>

          <section className="tracking-banner"><div className="tracking-icon"><Eye size={19} /></div><div><span className="panel-label">Retorno para o cliente</span><strong>O dispositivo está em: <em>{isComplete ? "finalização e relatório" : currentSection.title.toLowerCase()}</em></strong><p>{isComplete ? "A OS está pronta para gerar o relatório final." : `Próximo passo: ${nextItem?.title.toLowerCase() ?? "revisão final"}.`}</p></div><div className="tracking-progress"><span>{progress}%</span><div className="mini-progress"><div style={{ width: `${progress}%` }} /></div><small>do atendimento</small></div></section>

          <div className="section-heading" id="checklist"><div><div className="section-index">01 <span /> recolha completa</div><h2>Checklist da ordem de serviço</h2><p>Marque cada item enquanto conversa com o cliente e recebe o equipamento.</p></div><button className="ghost-button" onClick={resetChecklist}><RotateCcw size={15} /> Reiniciar OS</button></div>

          <section className="work-grid">
            <div className="checklist-panel panel-card">
              <div className="panel-topline"><div><span className="panel-label">Progresso da receção</span><div className="progress-numbers"><strong>{completedCount.toString().padStart(2, "0")}</strong><span>/ {totalCount.toString().padStart(2, "0")} itens</span></div></div><div className="progress-percentage">{progress}<small>%</small></div></div>
              <div className="progress-track"><div className="progress-fill" style={{ width: `${progress}%` }} /></div>
              <div className="checklist-status"><span className={`status-badge ${isComplete ? "done" : ""}`}><span /> {isComplete ? "OS concluída" : "Em andamento"}</span><span className="status-copy">{currentSection.title}</span></div>
              <div className="checklist-list">
                {sections.map(section => {
                  const SectionIcon = section.icon;
                  const sectionDone = section.items.every(item => completed.includes(item.id));
                  const sectionCount = section.items.filter(item => completed.includes(item.id)).length;
                  return <div className={`stage-block ${sectionDone ? "stage-done" : ""}`} key={section.id}>
                    <div className="stage-header"><div className={`stage-icon ${section.accent}`}><SectionIcon size={16} /></div><div className="stage-heading"><span>{section.number} · etapa</span><strong>{section.title}</strong><p>{section.description}</p></div><div className="stage-counter">{sectionCount}/{section.items.length}<small>{sectionDone ? "concluída" : "itens"}</small></div></div>
                    <div className="stage-items">{section.items.map(item => { const checked = completed.includes(item.id); const ItemIcon = item.icon; return <button key={item.id} className={`stage-item ${checked ? "checked" : ""}`} onClick={() => toggleItem(item.id)} aria-pressed={checked}><span className={`stage-check ${checked ? "checked-check" : ""}`}>{checked ? <Check size={13} strokeWidth={3} /> : <ItemIcon size={14} />}</span><span className="stage-copy"><strong>{item.title}</strong><span>{item.detail}</span></span><ChevronRight className="item-chevron" size={16} /></button>; })}</div>
                  </div>;
                })}
              </div>
              <div className="checklist-tip"><Sparkles size={16} /><span><strong>Como dar retorno:</strong> diga ao cliente em que etapa a OS está e qual é o próximo passo. Transparência também é assistência técnica.</span></div>
            </div>

            <aside className="detail-column">
              <div className="client-card panel-card client-form-card"><div className="card-heading"><div><span className="panel-label">Ficha editável da OS</span><h3>Dados do cliente</h3></div><button className="icon-button" aria-label="Mais opções"><MoreHorizontal size={18} /></button></div><div className="client-identity"><div className="client-avatar">{client.name.split(" ").map(part => part[0]).join("").slice(0, 2)}</div><div><strong>{client.name}</strong><span>Cliente da OS-0248</span></div><span className="client-status">em receção</span></div><div className="form-grid"><label>Nome completo<input value={client.name} onChange={e => updateClient("name", e.target.value)} /></label><label>CPF / RG<input value={client.document} onChange={e => updateClient("document", e.target.value)} /></label><label>Telefone<input value={client.phone} onChange={e => updateClient("phone", e.target.value)} /></label><label>WhatsApp<input value={client.whatsapp} onChange={e => updateClient("whatsapp", e.target.value)} /></label><label className="full-field">E-mail<input value={client.email} onChange={e => updateClient("email", e.target.value)} /></label><label className="full-field">Endereço<input value={client.address} onChange={e => updateClient("address", e.target.value)} /></label></div><div className="device-summary"><span className="issue-label"><MonitorCog size={13} /> equipamento na OS</span><strong>{client.device}</strong><span>N.º de série: {client.serial}</span></div></div>

              <div className="tracking-card panel-card"><div className="card-heading"><div><span className="panel-label">Acompanhamento</span><h3>Onde está o dispositivo</h3></div><Eye size={17} className="muted-icon" /></div><div className="tracking-list">{sections.map((section, index) => { const done = section.items.every(item => completed.includes(item.id)); const current = section.id === currentSection.id && !done; return <div className={`tracking-step ${done ? "done" : ""} ${current ? "current" : ""}`} key={section.id}><span className="tracking-step-dot">{done ? <Check size={11} /> : index + 1}</span><span>{section.title}</span>{current && <em>agora</em>}</div>; })}</div><div className="customer-return"><Send size={14} /><span>Mensagem para o cliente: <strong>“A sua OS está em {currentSection.title.toLowerCase()}.”</strong></span></div></div>

              <div className={`report-card panel-card ${isComplete ? "report-ready" : ""}`}><div className="report-card-head"><div className="report-icon"><ReceiptText size={19} /></div><div><span className="panel-label">Entrega ao cliente</span><h3>Relatório final</h3></div></div>{showReport ? <div className="report-preview"><strong>Relatório OS-0248</strong><span>{client.name} · {client.device}</span><span>Checklist concluído: {completedCount}/{totalCount} itens</span><span>Estado: pronto para entrega</span><button className="report-send"><Send size={14} /> Enviar relatório fictício</button></div> : <><p>{isComplete ? "Todos os dados foram conferidos. Gere um resumo final para entregar ao cliente." : `Complete os ${totalCount - completedCount} itens restantes para liberar o relatório final.`}</p><button className="report-button" disabled={!isComplete} onClick={() => setShowReport(true)}><FileText size={15} /> {isComplete ? "Gerar relatório final" : "Relatório bloqueado"}</button></>}</div>

              <div className="contact-card panel-card"><div className="contact-card-top"><div className="mini-brand-mark">SB</div><div><span>Precisa de apoio?</span><strong>Fale com a bancada</strong></div></div><div className="contact-actions"><button><Phone size={15} /> (87) 3831-2048</button><button><Mail size={15} /> oi@sertbyte.demo</button></div></div>
            </aside>
          </section>
          <footer className="page-footer"><div><span className="footer-mark">SB</span><span>SertByte Assistência Técnica</span></div><span>Serra Talhada · PE</span><span className="footer-disclaimer"><Sparkles size={13} /> projeto fictício para fins pedagógicos</span></footer>
        </div>
      </main>
    </div>
  );
}
