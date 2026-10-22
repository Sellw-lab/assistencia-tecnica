import { useEffect, useMemo, useState } from "react";
import { jsPDF } from "jspdf";
import {
  Activity,
  AlertCircle,
  ArrowUpRight,
  BadgeCheck,
  Bell,
  CalendarClock,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  ChevronUp,
  ClipboardCheck,
  Clock3,
  Cpu,
  Eye,
  FileSignature,
  FileText,
  Headphones,
  LifeBuoy,
  LockKeyhole,
  Mail,
  MapPin,
  Menu,
  MonitorCog,
  MoreHorizontal,
  PackageCheck,
  Phone,
  Plus,
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

type ClientData = {
  name: string;
  document: string;
  phone: string;
  email: string;
  address: string;
  contactChannel: string;
};

type DeviceData = {
  type: string;
  model: string;
  serial: string;
  accessories: string;
};

type ProblemData = {
  serviceType: string;
  description: string;
  started: string;
  event: string;
  quickTest: string;
  repairNotes: string;
  resolution: string;
};

type SafetyData = {
  backup: string;
  access: string;
  responsibility: boolean;
};

type ClosingData = {
  fee: string;
  deadline: string;
  approval: string;
  storage: string;
  finalValue: string;
  pickupTerms: string;
  warranty: string;
};

type IntakeData = {
  client: ClientData;
  device: DeviceData;
  problem: ProblemData;
  safety: SafetyData;
  closing: ClosingData;
};

type BlockId = keyof IntakeData;

const emptyData: IntakeData = {
  client: { name: "", document: "", phone: "", email: "", address: "", contactChannel: "" },
  device: { type: "", model: "", serial: "", accessories: "" },
  problem: { serviceType: "", description: "", started: "", event: "", quickTest: "", repairNotes: "", resolution: "" },
  safety: { backup: "", access: "", responsibility: false },
  closing: { fee: "", deadline: "", approval: "", storage: "", finalValue: "", pickupTerms: "", warranty: "" },
};

const blockMeta: Array<{ id: BlockId; number: string; title: string; description: string; icon: typeof UserRound; accent: string; label: string }> = [
  { id: "client", number: "01", title: "Dados do cliente", description: "Quem está a deixar o equipamento e como contactar.", icon: UserRound, accent: "coral", label: "cadastro" },
  { id: "device", number: "02", title: "Equipamento", description: "O que entrou na assistência, exatamente.", icon: MonitorCog, accent: "blue", label: "identificação" },
  { id: "problem", number: "03", title: "Problema relatado", description: "O que o cliente percebeu e o que foi testado.", icon: Headphones, accent: "yellow", label: "triagem" },
  { id: "safety", number: "04", title: "Dados e autorização", description: "Backup, privacidade e limites de acesso.", icon: ShieldCheck, accent: "green", label: "segurança" },
  { id: "closing", number: "05", title: "Prazo e combinado", description: "Orçamento, retorno e entrega da OS.", icon: ReceiptText, accent: "teal", label: "alinhamento" },
];

const requiredByBlock: Record<BlockId, string[]> = {
  client: ["name", "document", "phone", "address", "contactChannel"],
  device: ["type", "model", "serial", "accessories"],
  problem: ["serviceType", "description", "started", "event", "quickTest", "repairNotes", "resolution"],
  safety: ["backup", "access", "responsibility"],
  closing: ["fee", "deadline", "approval", "storage", "finalValue", "pickupTerms", "warranty"],
};

async function generateReportPdf(data: IntakeData) {
  const pdf = new jsPDF({ unit: "mm", format: "a4" });
  const margin = 18;
  const pageWidth = 210;
  const contentWidth = pageWidth - margin * 2;
  let y = 20;
  let logoData: string | undefined;
  try {
    const response = await fetch("/brand-mark.png");
    const blob = await response.blob();
    logoData = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(String(reader.result));
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  } catch {
    // O relatório continua disponível mesmo que o logo não carregue.
  }
  const addWatermark = () => {
    if (!logoData) return;
    try {
      pdf.setGState({ opacity: 0.07 });
      pdf.addImage(logoData, "PNG", 66, 105, 78, 78);
      pdf.setGState({ opacity: 1 });
    } catch {
      // A marca é decorativa; não impede a emissão do documento.
    }
  };
  const ensureSpace = (height: number) => {
    if (y + height > 278) {
      pdf.addPage();
      y = 20;
      addWatermark();
    }
  };
  const text = (value: string | undefined, fallback = "Não informado") => value?.trim() || fallback;
  const addWrapped = (label: string, value: string | undefined, options: { required?: boolean } = {}) => {
    const content = text(value, options.required ? "Não informado" : "Não se aplica");
    const lines = pdf.splitTextToSize(content, contentWidth - 42);
    ensureSpace(8 + lines.length * 5);
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(9);
    pdf.setTextColor(70, 84, 78);
    pdf.text(label, margin, y);
    pdf.setFont("helvetica", "normal");
    pdf.setTextColor(88, 101, 95);
    pdf.text(lines, margin + 42, y);
    y += Math.max(7, lines.length * 5);
  };
  const section = (title: string) => {
    ensureSpace(14);
    y += 3;
    pdf.setFillColor(237, 115, 85);
    pdf.roundedRect(margin, y - 5, contentWidth, 8, 2, 2, "F");
    pdf.setTextColor(16, 24, 32);
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(10);
    pdf.text(title.toUpperCase(), margin + 4, y + 0.5);
    y += 10;
  };
  addWatermark();
  if (logoData) pdf.addImage(logoData, "PNG", margin, y - 5, 16, 16);
  pdf.setTextColor(16, 24, 32);
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(18);
  pdf.text("SertByte Assistência Técnica", margin + 21, y + 2);
  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(9);
  pdf.setTextColor(105, 116, 110);
  pdf.text("Relatório de atendimento / ordem de serviço", margin + 21, y + 8);
  pdf.text(`Emitido em ${new Date().toLocaleDateString("pt-BR")}`, pageWidth - margin, y + 8, { align: "right" });
  y += 25;

  section("Cliente");
  addWrapped("Nome", data.client.name, { required: true });
  addWrapped("CPF/RG", data.client.document, { required: true });
  addWrapped("Telefone", data.client.phone, { required: true });
  addWrapped("E-mail", data.client.email);
  addWrapped("Endereço", data.client.address, { required: true });
  addWrapped("Retorno", data.client.contactChannel, { required: true });

  section("Equipamento");
  addWrapped("Tipo", data.device.type, { required: true });
  addWrapped("Marca/modelo", data.device.model, { required: true });
  addWrapped("N.º série", data.device.serial, { required: true });
  addWrapped("Acessórios", data.device.accessories, { required: true });

  section("Diagnóstico e serviço");
  addWrapped("Atendimento", data.problem.serviceType, { required: true });
  addWrapped("Problema", data.problem.description, { required: true });
  addWrapped("Início", data.problem.started, { required: true });
  addWrapped("Ocorrência", data.problem.event, { required: true });
  addWrapped("Teste inicial", data.problem.quickTest, { required: true });
  addWrapped("Observações", data.problem.repairNotes, { required: true });
  addWrapped("Solução/resultado", data.problem.resolution, { required: true });

  section("Dados, autorização e condições");
  addWrapped("Backup", data.safety.backup, { required: true });
  addWrapped("Acesso/formatação", data.safety.access, { required: true });
  addWrapped("Responsabilidade", data.safety.responsibility ? "Cliente avisado sobre backup" : "Não confirmado", { required: true });
  addWrapped("Taxa diagnóstico", data.closing.fee, { required: true });
  addWrapped("Prazo estimado", data.closing.deadline, { required: true });
  addWrapped("Aprovação", data.closing.approval, { required: true });
  addWrapped("Armazenamento", data.closing.storage, { required: true });
  addWrapped("Valor final", data.closing.finalValue, { required: true });
  addWrapped("Retirada/espera", data.closing.pickupTerms, { required: true });
  addWrapped("Garantia", data.closing.warranty, { required: true });

  ensureSpace(25);
  y += 5;
  pdf.setDrawColor(220, 226, 222);
  pdf.line(margin, y, pageWidth - margin, y);
  y += 8;
  pdf.setFont("helvetica", "italic");
  pdf.setFontSize(8);
  pdf.setTextColor(120, 130, 124);
  pdf.text("Documento informativo da assistência técnica. Guarde este relatório para a retirada do equipamento.", margin, y);
  pdf.text("SertByte · Serra Talhada, PE · (87) 3831-2048 · oi@sertbyte.demo", margin, y + 5);
  pdf.save(`relatorio-sertbyte-${data.client.name.trim().replace(/\s+/g, "-").toLowerCase() || "atendimento"}.pdf`);
}

function isBlockComplete(data: IntakeData, blockId: BlockId) {
  return requiredByBlock[blockId].every(field => {
    const value = data[blockId][field as never];
    return typeof value === "boolean" ? value : String(value ?? "").trim().length > 0;
  });
}

export default function Home() {
  const [data, setData] = useState<IntakeData>(emptyData);
  const [openBlock, setOpenBlock] = useState<BlockId>("client");
  const [menuOpen, setMenuOpen] = useState(false);
  const [showReport, setShowReport] = useState(false);

  const completedBlocks = useMemo(() => blockMeta.filter(block => isBlockComplete(data, block.id)), [data]);
  const completedCount = completedBlocks.length;
  const progress = Math.round((completedCount / blockMeta.length) * 100);
  const allComplete = completedCount === blockMeta.length;
  const activeBlock = blockMeta.find(block => !isBlockComplete(data, block.id)) ?? blockMeta[blockMeta.length - 1];
  const nextBlock = blockMeta[blockMeta.findIndex(block => block.id === activeBlock.id) + 1];

  useEffect(() => {
    if (!allComplete) {
      setOpenBlock(activeBlock.id);
      setShowReport(false);
    }
  }, [activeBlock.id, allComplete]);

  function updateBlock<K extends BlockId>(block: K, field: keyof IntakeData[K], value: string | boolean) {
    setData(current => ({ ...current, [block]: { ...current[block], [field]: value } }));
  }

  function resetOS() {
    setData(emptyData);
    setOpenBlock("client");
    setShowReport(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function advanceFrom(blockId: BlockId) {
    const index = blockMeta.findIndex(block => block.id === blockId);
    const next = blockMeta[index + 1];
    if (next) {
      setOpenBlock(next.id);
      document.getElementById(`block-${next.id}`)?.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }

  const clientInitials = data.client.name.trim() ? data.client.name.trim().split(" ").map(word => word[0]).join("").slice(0, 2).toUpperCase() : "—";

  return (
    <div className="app-shell">
      <aside className={`sidebar ${menuOpen ? "sidebar-open" : ""}`}>
        <div className="brand-lockup"><div className="brand-mark" aria-hidden="true"><span>S</span><span>B</span></div><div><p className="brand-name">sert<span>byte</span></p><p className="brand-subtitle">assistência técnica</p></div><button className="icon-button sidebar-close" aria-label="Fechar menu" onClick={() => setMenuOpen(false)}><X size={17} /></button></div>
        <div className="sidebar-label">Espaço de trabalho</div>
        <nav className="sidebar-nav" aria-label="Navegação principal"><button className="nav-item active"><Activity size={17} /><span>Nova OS</span><span className="nav-active-dot" /></button><button className="nav-item"><ClipboardCheck size={17} /><span>Atendimentos</span><span className="nav-count">04</span></button><button className="nav-item"><Wrench size={17} /><span>Ordens de serviço</span></button><button className="nav-item"><FileText size={17} /><span>Relatórios finais</span></button></nav>
        <div className="sidebar-label nav-secondary-label">Apoio</div><nav className="sidebar-nav" aria-label="Navegação de apoio"><button className="nav-item"><LifeBuoy size={17} /><span>Guia de atendimento</span></button><button className="nav-item"><Wrench size={17} /><span>Definições</span></button></nav>
        <div className="sidebar-bottom"><div className="open-status"><span className="status-dot" /> atendimento aberto <span>•</span> 08:00–18:00</div><div className="location-card"><div className="location-icon"><MapPin size={16} /></div><div><strong>Serra Talhada, PE</strong><span>Rua do Sertão, 148 · Centro</span></div></div><div className="fiction-note"><Sparkles size={14} /> Dados fictícios para dinâmica de curso</div></div>
      </aside>
      {menuOpen && <button className="sidebar-overlay" aria-label="Fechar navegação" onClick={() => setMenuOpen(false)} />}

      <main className="main-content">
        <header className="topbar"><button className="icon-button mobile-menu" aria-label="Abrir menu" onClick={() => setMenuOpen(true)}><Menu size={20} /></button><div className="breadcrumb"><span>Espaço de trabalho</span><ChevronRight size={14} /><strong>Nova ordem de serviço</strong></div><div className="topbar-actions"><div className="search-box"><Search size={15} /><span>Pesquisar</span><kbd>⌘ K</kbd></div><button className="icon-button notification-button" aria-label="Notificações"><Bell size={18} /><span className="notification-dot" /></button><div className="user-avatar">MC</div></div></header>

        <div className="page-content">
          <section className="welcome-row"><div><div className="eyebrow"><span className="eyebrow-line" /> receção · nova OS <span className="eyebrow-clock"><Clock3 size={13} /> 10:42</span></div><h1>Comece pelo <em>cliente.</em></h1><p className="page-intro">Preencha o essencial, conclua um bloco e avance sem perder informação.</p></div><div className="header-actions"><div className="live-pill"><span className="pulse-dot" /> atendimento vazio</div><button className="primary-button" onClick={() => document.getElementById("checklist")?.scrollIntoView({ behavior: "smooth" })}><Plus size={17} /> Adicionar cliente <ArrowUpRight size={16} /></button></div></section>

          <section className="hero-card"><div className="hero-copy"><div className="hero-kicker"><Zap size={14} fill="currentColor" /> fluxo simples de receção</div><h2>Uma etapa de cada vez.<br /><span>Sem esquecer o essencial.</span></h2><p>Crie a OS do zero, recolha os dados indispensáveis e dê ao cliente um retorno claro sobre onde o equipamento está.</p><div className="hero-meta"><span><CalendarClock size={15} /> próxima etapa <strong>{activeBlock.title}</strong></span><span className="hero-divider" /><span><ShieldCheck size={15} /> dados organizados</span></div></div><div className="hero-art" aria-hidden="true"><div className="art-grid" /><div className="art-orbit orbit-one" /><div className="art-orbit orbit-two" /><div className="art-chip"><Cpu size={29} /><span>OS<br /><strong>NOVA</strong></span></div><div className="art-spark spark-one" /><div className="art-spark spark-two" /><div className="art-spark spark-three" /><div className="art-line line-one" /><div className="art-line line-two" /></div></section>

          <section className="metric-strip" aria-label="Resumo da nova ordem de serviço"><div className="metric-card featured"><div className="metric-icon coral"><ClipboardCheck size={17} /></div><div><span>Nova ordem de serviço</span><strong>Será criada ao concluir</strong></div><div className="metric-arrow"><ArrowUpRight size={16} /></div></div><div className="metric-card"><div className="metric-icon blue"><UserRound size={17} /></div><div><span>Cliente</span><strong>{data.client.name || "Ainda não adicionado"}</strong></div><span className="metric-caption">{data.client.phone || "aguarda dados"}</span></div><div className="metric-card"><div className="metric-icon yellow"><MonitorCog size={17} /></div><div><span>Progresso da OS</span><strong>{completedCount}/{blockMeta.length} blocos</strong></div><span className="metric-caption">{progress}% concluído</span></div></section>

          <section className="tracking-banner"><div className="tracking-icon"><Eye size={19} /></div><div><span className="panel-label">Retorno para o cliente</span><strong>{allComplete ? "OS pronta para relatório final" : `Agora: ${activeBlock.title}`}</strong><p>{allComplete ? "Todas as informações essenciais foram conferidas." : `Quando este bloco fechar, avance para ${nextBlock?.title.toLowerCase() ?? "a finalização"}.`}</p></div><div className="tracking-progress"><span>{progress}%</span><div className="mini-progress"><div style={{ width: `${progress}%` }} /></div><small>da OS concluída</small></div></section>

          <div className="section-heading" id="checklist"><div><div className="section-index">01 <span /> entrada prática</div><h2>Adicionar cliente e avançar</h2><p>Cada bloco fecha sozinho quando os campos essenciais estiverem completos.</p></div><button className="ghost-button" onClick={resetOS}><RotateCcw size={15} /> Limpar e começar de novo</button></div>

          <section className="work-grid intake-grid"><div className="checklist-panel panel-card intake-panel"><div className="panel-topline"><div><span className="panel-label">Progresso da nova OS</span><div className="progress-numbers"><strong>{completedCount.toString().padStart(2, "0")}</strong><span>/ {blockMeta.length.toString().padStart(2, "0")} blocos</span></div></div><div className="progress-percentage">{progress}<small>%</small></div></div><div className="progress-track"><div className="progress-fill" style={{ width: `${progress}%` }} /></div><div className="checklist-status"><span className={`status-badge ${allComplete ? "done" : ""}`}><span /> {allComplete ? "OS pronta" : "A preencher"}</span><span className="status-copy">{allComplete ? "Relatório disponível" : `${activeBlock.title} em aberto`}</span></div>

            <div className="intake-blocks">{blockMeta.map((block, index) => { const complete = isBlockComplete(data, block.id); const open = openBlock === block.id; const Icon = block.icon; return <section className={`intake-block ${open ? "open" : ""} ${complete ? "complete" : ""}`} id={`block-${block.id}`} key={block.id}><button className="intake-block-header" onClick={() => setOpenBlock(open ? block.id : block.id)} aria-expanded={open}><span className={`block-number ${complete ? "block-number-done" : ""}`}>{complete ? <Check size={14} strokeWidth={3} /> : block.number}</span><span className={`block-icon ${block.accent}`}><Icon size={16} /></span><span className="block-heading"><span>{block.label}</span><strong>{block.title}</strong><small>{block.description}</small></span><span className={`block-status ${complete ? "complete-status" : ""}`}>{complete ? "OK" : open ? "aberto" : "pendente"}</span>{open ? <ChevronUp size={17} className="block-chevron" /> : <ChevronDown size={17} className="block-chevron" />}</button>
                  {open && <div className="intake-block-body">{block.id === "client" && <ClientFields data={data.client} update={(field, value) => updateBlock("client", field, value)} />}{block.id === "device" && <DeviceFields data={data.device} update={(field, value) => updateBlock("device", field, value)} />}{block.id === "problem" && <ProblemFields data={data.problem} update={(field, value) => updateBlock("problem", field, value)} />}{block.id === "safety" && <SafetyFields data={data.safety} update={(field, value) => updateBlock("safety", field, value)} />}{block.id === "closing" && <ClosingFields data={data.closing} update={(field, value) => updateBlock("closing", field, value)} />}{complete && <div className="block-complete-note"><CheckCircle2 size={15} /><span><strong>Bloco concluído automaticamente.</strong> Informação essencial preenchida.</span><button onClick={() => advanceFrom(block.id)}>{nextBlock ? `Ir para ${nextBlock.title}` : "Ver relatório"} <ChevronRight size={14} /></button></div>}{!complete && <div className="block-required-note"><AlertCircle size={14} /><span>Preencha os campos marcados como essenciais para fechar este bloco e avançar.</span></div>}</div>}</section>; })}</div>

            <div className="checklist-tip"><Sparkles size={16} /><span><strong>Regra prática:</strong> terminou os campos essenciais? O sistema marca “OK”, atualiza a barra e abre o próximo bloco automaticamente.</span></div></div>

            <aside className="detail-column"><div className="client-card panel-card client-form-card"><div className="card-heading"><div><span className="panel-label">Resumo da nova OS</span><h3>{data.client.name || "Sem cliente"}</h3></div><div className="client-avatar">{clientInitials}</div></div>{data.client.name ? <div className="summary-lines"><div><Phone size={14} /><span>{data.client.phone || "Telefone pendente"}</span></div><div><Mail size={14} /><span>{data.client.email || "E-mail pendente"}</span></div><div><MapPin size={14} /><span>{data.client.address || "Endereço pendente"}</span></div></div> : <div className="empty-summary"><UserRound size={22} /><strong>Adicione o primeiro cliente</strong><span>Os dados aparecerão aqui enquanto preenche o bloco 01.</span></div>}<div className="device-summary"><span className="issue-label"><MonitorCog size={13} /> equipamento</span><strong>{data.device.model || "Ainda não identificado"}</strong><span>{data.device.serial ? `N.º de série: ${data.device.serial}` : "O número de série será registado no bloco 02."}</span></div></div>

              <div className="tracking-card panel-card"><div className="card-heading"><div><span className="panel-label">Acompanhamento</span><h3>Onde está a OS</h3></div><Eye size={17} className="muted-icon" /></div><div className="tracking-list">{blockMeta.map((block, index) => { const done = isBlockComplete(data, block.id); const current = block.id === activeBlock.id && !done; return <div className={`tracking-step ${done ? "done" : ""} ${current ? "current" : ""}`} key={block.id}><span className="tracking-step-dot">{done ? <Check size={11} /> : index + 1}</span><span>{block.title}</span>{current && <em>agora</em>}</div>; })}</div><div className="customer-return"><Send size={14} /><span>Retorno: <strong>{allComplete ? "“A sua OS está pronta para o relatório final.”" : `“A sua OS está em ${activeBlock.title.toLowerCase()}.”`}</strong></span></div></div>

              <div className={`report-card panel-card ${allComplete ? "report-ready" : ""}`}><div className="report-card-head"><div className="report-icon"><ReceiptText size={19} /></div><div><span className="panel-label">Entrega ao cliente</span><h3>Relatório final</h3></div></div>{showReport ? <div className="report-preview"><strong>Relatório da nova OS</strong><span>{data.client.name} · {data.device.model}</span><span>Blocos concluídos: {completedCount}/{blockMeta.length}</span><span>Estado: pronto para entrega</span><button className="report-send" onClick={() => void generateReportPdf(data)}><Send size={14} /> Enviar relatório em PDF</button></div> : <><p>{allComplete ? "Todos os blocos foram conferidos. Gere um resumo final para entregar ao cliente." : "O relatório aparece depois de concluir todos os blocos essenciais."}</p><button className="report-button" disabled={!allComplete} onClick={() => setShowReport(true)}><FileText size={15} /> {allComplete ? "Gerar relatório final" : "Relatório bloqueado"}</button></>}</div>

              <div className="contact-card panel-card"><div className="contact-card-top"><div className="mini-brand-mark">SB</div><div><span>Precisa de apoio?</span><strong>Fale com a bancada</strong></div></div><div className="contact-actions"><button><Phone size={15} /> (87) 3831-2048</button><button><Mail size={15} /> oi@sertbyte.demo</button></div></div></aside>
          </section>
          <footer className="page-footer"><div><span className="footer-mark">SB</span><span>SertByte Assistência Técnica</span></div><span>Serra Talhada · PE</span><span className="footer-disclaimer"><Sparkles size={13} /> projeto fictício para fins pedagógicos</span></footer>
        </div>
      </main>
    </div>
  );
}

function Field({ label, value, placeholder, onChange, required = true, type = "text" }: { label: string; value: string; placeholder?: string; onChange: (value: string) => void; required?: boolean; type?: string }) {
  return <label className="form-field">{label}{!required && <small>opcional</small>}<input type={type} value={value} placeholder={placeholder} onChange={event => onChange(event.target.value)} /></label>;
}

function SelectField({ label, value, placeholder, options, onChange }: { label: string; value: string; placeholder: string; options: string[]; onChange: (value: string) => void }) {
  return <label className="form-field">{label}<select value={value} onChange={event => onChange(event.target.value)}><option value="">{placeholder}</option>{options.map(option => <option key={option} value={option}>{option}</option>)}</select></label>;
}

function TextAreaField({ label, value, placeholder, onChange }: { label: string; value: string; placeholder: string; onChange: (value: string) => void }) {
  return <label className="form-field full-field">{label}<textarea value={value} placeholder={placeholder} onChange={event => onChange(event.target.value)} rows={3} /></label>;
}

function ClientFields({ data, update }: { data: ClientData; update: (field: keyof ClientData, value: string) => void }) {
  return <div className="fields-grid"><Field label="Nome completo" value={data.name} placeholder="Ex.: Ana Beatriz Lima" onChange={value => update("name", value)} /><Field label="CPF ou RG" value={data.document} placeholder="Ex.: CPF 000.000.000-00" onChange={value => update("document", value)} /><Field label="Telefone / WhatsApp" value={data.phone} placeholder="Ex.: (87) 99999-0000" onChange={value => update("phone", value)} /><Field label="E-mail" value={data.email} placeholder="Ex.: cliente@email.com" onChange={value => update("email", value)} required={false} type="email" /><Field label="Endereço" value={data.address} placeholder="Rua, número e bairro" onChange={value => update("address", value)} /><SelectField label="Canal para retorno" value={data.contactChannel} placeholder="Escolha um canal" options={["WhatsApp", "Telefone", "E-mail"]} onChange={value => update("contactChannel", value)} /><div className="field-help full-field"><CheckCircle2 size={14} /> O cliente verá este canal no acompanhamento da OS.</div></div>;
}

function DeviceFields({ data, update }: { data: DeviceData; update: (field: keyof DeviceData, value: string) => void }) {
  return <div className="fields-grid"><SelectField label="Tipo de equipamento" value={data.type} placeholder="Escolha o tipo" options={["Notebook", "Desktop", "Celular", "Impressora", "Tablet", "Outro"]} onChange={value => update("type", value)} /><Field label="Marca e modelo" value={data.model} placeholder="Ex.: Lenovo IdeaPad 3" onChange={value => update("model", value)} /><Field label="N.º de série / patrimônio" value={data.serial} placeholder="Se não houver, escreva: não informado" onChange={value => update("serial", value)} /><Field label="Acessórios recebidos" value={data.accessories} placeholder="Ex.: carregador e mochila" onChange={value => update("accessories", value)} /></div>;
}

function ProblemFields({ data, update }: { data: ProblemData; update: (field: keyof ProblemData, value: string) => void }) {
  function selectService(value: string) {
    update("serviceType", value);
    if (value !== "Reparo técnico") {
      if (!data.description) update("description", value === "Limpeza preventiva" ? "Sem problema relatado; solicitada limpeza preventiva." : "Sem problema relatado; solicitado atendimento de limpeza/cuidados.");
      if (!data.started) update("started", "Não se aplica");
      if (!data.event) update("event", "Nada relatado");
      if (!data.quickTest) update("quickTest", "Ligou normalmente");
      if (!data.repairNotes) update("repairNotes", "Limpeza e cuidados realizados conforme necessidade do equipamento.");
      if (!data.resolution) update("resolution", "Equipamento sem falha identificada; serviço de limpeza/cuidados concluído.");
    }
  }
  return <div className="fields-grid"><SelectField label="Tipo de atendimento" value={data.serviceType} placeholder="Escolha o serviço" options={["Reparo técnico", "Limpeza preventiva", "Limpeza e higienização", "Outros cuidados necessários"]} onChange={selectService} /><TextAreaField label="Problema relatado pelo cliente" value={data.description} placeholder="Escreva o problema ou indique que não há falha..." onChange={value => update("description", value)} /><Field label="Quando começou?" value={data.started} placeholder="Ex.: há 2 semanas / não se aplica" onChange={value => update("started", value)} /><SelectField label="O que aconteceu antes?" value={data.event} placeholder="Selecione uma opção" options={["Nada relatado", "Queda ou impacto", "Contacto com líquido", "Oscilação de energia", "Outro"]} onChange={value => update("event", value)} /><SelectField label="Teste rápido na receção" value={data.quickTest} placeholder="Registe o resultado" options={["Ligou normalmente", "Ligou com falha", "Não ligou", "Não se aplica"]} onChange={value => update("quickTest", value)} /><TextAreaField label="Observações durante o atendimento" value={data.repairNotes} placeholder="Limpeza feita, peças verificadas, cuidados necessários..." onChange={value => update("repairNotes", value)} /><TextAreaField label="Problema resolvido / resultado" value={data.resolution} placeholder="Descreva o que foi resolvido e como o equipamento ficou..." onChange={value => update("resolution", value)} /></div>;
}

function SafetyFields({ data, update }: { data: SafetyData; update: (field: keyof SafetyData, value: string | boolean) => void }) {
  return <div className="fields-grid"><SelectField label="Backup dos dados" value={data.backup} placeholder="Condição informada" options={["Cliente fará backup", "Backup já realizado", "Sem backup confirmado"]} onChange={value => update("backup", value)} /><SelectField label="Acesso e formatação" value={data.access} placeholder="Autorização definida" options={["Pode acessar arquivos", "Pode formatar", "Sem autorização de acesso", "A combinar no orçamento"]} onChange={value => update("access", value)} /><label className="consent-check full-field"><input type="checkbox" checked={data.responsibility} onChange={event => update("responsibility", event.target.checked)} /><span><strong>Cliente avisado:</strong> a assistência não se responsabiliza por dados sem backup.</span></label></div>;
}

function ClosingFields({ data, update }: { data: ClosingData; update: (field: keyof ClosingData, value: string) => void }) {
  return <div className="fields-grid"><SelectField label="Taxa de diagnóstico explicada" value={data.fee} placeholder="Confirme com o cliente" options={["Sem taxa", "Taxa explicada e aceite", "Taxa explicada, aguarda decisão"]} onChange={value => update("fee", value)} /><Field label="Prazo estimado" value={data.deadline} placeholder="Ex.: até 3 dias úteis" onChange={value => update("deadline", value)} /><SelectField label="Canal para aprovar orçamento" value={data.approval} placeholder="Canal combinado" options={["WhatsApp", "Telefone", "E-mail", "Cliente aprova presencialmente"]} onChange={value => update("approval", value)} /><SelectField label="Retirada e armazenamento" value={data.storage} placeholder="Condições explicadas" options={["Prazo de retirada explicado", "Cobrança de armazenamento explicada", "Ambos explicados"]} onChange={value => update("storage", value)} /><Field label="Valor final do atendimento" value={data.finalValue} placeholder="Ex.: R$ 80,00" onChange={value => update("finalValue", value)} /><TextAreaField label="Termos de retirada e tempo de espera" value={data.pickupTerms} placeholder="Prazo para retirar, tolerância e condições de espera..." onChange={value => update("pickupTerms", value)} /><TextAreaField label="Garantia do serviço" value={data.warranty} placeholder="Ex.: 90 dias para o serviço realizado, conforme condições informadas..." onChange={value => update("warranty", value)} /><div className="field-help full-field"><FileSignature size={14} /> Ao fechar este bloco, a OS fica pronta para o relatório final em PDF.</div></div>;
}
