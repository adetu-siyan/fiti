import { useState, useRef, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  FiUploadCloud, FiAlertTriangle, FiAlertCircle, FiInfo,
  FiMessageSquare, FiTrendingUp, FiZap, FiBarChart2, FiCpu,
  FiHome, FiList, FiMail, FiMenu, FiX, FiSun, FiMoon,
  FiGitBranch, FiShare2, FiChevronLeft
} from "react-icons/fi"
import API from "./services/api"
import FullReport from "./components/FullReport"
import ProgressLoader, { CLASSIFY_STEPS, REPORT_STEPS } from "./components/ProgressLoader"


// ─── CONSTANTS ────────────────────────────────────────────────────────────────
const MAX_FILE_SIZE_MB    = 10
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024
const BRAND               = "#d08b5b"

const validateFile = (f) => {
  if (!f) return "No file selected."
  const ext = f.name.split(".").pop().toLowerCase()
  if (!["csv","xlsx"].includes(ext)) return "Only CSV and Excel (.xlsx) files are supported."
  if (f.size > MAX_FILE_SIZE_BYTES) return `File is too large. Max ${MAX_FILE_SIZE_MB}MB.`
  return null
}

function getGreeting() {
  const h = new Date().getHours()
  if (h < 12) return "Good morning"
  if (h < 17) return "Good afternoon"
  return "Good evening"
}


// ─── SVG CHART DECORATIONS ────────────────────────────────────────────────────
function BarChartDecoration({ opacity = 0.10 }) {
  const bars = [40,75,55,90,65,80,45,95,70,60,85,50]
  return (
    <svg viewBox="0 0 300 120" className="w-full h-full" preserveAspectRatio="none">
      {bars.map((h, i) => (
        <rect key={i} x={i*25+2} y={120-h} width={20} height={h} rx={3} fill="white" opacity={opacity} />
      ))}
    </svg>
  )
}

function LineChartDecoration({ opacity = 0.10 }) {
  const points = [[0,80],[30,60],[60,75],[90,40],[120,55],[150,30],[180,45],[210,25],[240,35],[270,20],[300,30]]
  const path   = points.map((p,i) => `${i===0?"M":"L"} ${p[0]} ${p[1]}`).join(" ")
  const area   = path + " L 300 120 L 0 120 Z"
  return (
    <svg viewBox="0 0 300 120" className="w-full h-full" preserveAspectRatio="none">
      <path d={area} fill="white" opacity={opacity*0.5} />
      <path d={path} fill="none" stroke="white" strokeWidth="2.5" opacity={opacity*2} />
      {points.map((p,i) => <circle key={i} cx={p[0]} cy={p[1]} r="3.5" fill="white" opacity={opacity*2.5} />)}
    </svg>
  )
}

function AreaChartDecoration({ opacity = 0.10 }) {
  const p1 = [[0,90],[50,65],[100,80],[150,45],[200,60],[250,35],[300,50]]
  const p2 = [[0,70],[50,50],[100,60],[150,30],[200,45],[250,20],[300,35]]
  const path1 = p1.map((p,i) => `${i===0?"M":"L"} ${p[0]} ${p[1]}`).join(" ") + " L 300 120 L 0 120 Z"
  const path2 = p2.map((p,i) => `${i===0?"M":"L"} ${p[0]} ${p[1]}`).join(" ")
  return (
    <svg viewBox="0 0 300 120" className="w-full h-full" preserveAspectRatio="none">
      <path d={path1} fill="white" opacity={opacity*0.6} />
      <path d={path2} fill="none" stroke="white" strokeWidth="2" opacity={opacity*2.5} strokeDasharray="6 3" />
    </svg>
  )
}

function ScatterDecoration({ opacity = 0.10 }) {
  const dots = [[30,90],[60,60],[90,75],[120,40],[150,65],[180,35],[210,55],[240,30],[270,50],[45,80],[135,50],[195,45],[255,40],[75,70],[165,60]]
  return (
    <svg viewBox="0 0 300 120" className="w-full h-full" preserveAspectRatio="none">
      {dots.map((d,i) => <circle key={i} cx={d[0]} cy={d[1]} r={i%3===0?5:3} fill="white" opacity={opacity*(i%2===0?2:1.2)} />)}
      <line x1="0" y1="110" x2="300" y2="10" stroke="white" strokeWidth="1" opacity={opacity} strokeDasharray="4 4" />
    </svg>
  )
}

function PieDecoration({ opacity = 0.10 }) {
  return (
    <svg viewBox="0 0 120 120" className="w-full h-full" preserveAspectRatio="xMidYMid meet">
      <circle cx="60" cy="60" r="50" fill="none" stroke="white" strokeWidth="28" strokeDasharray="188 126" strokeDashoffset="0" opacity={opacity*2} />
      <circle cx="60" cy="60" r="50" fill="none" stroke="white" strokeWidth="28" strokeDasharray="94 220" strokeDashoffset="-188" opacity={opacity} />
      <circle cx="60" cy="60" r="50" fill="none" stroke="white" strokeWidth="28" strokeDasharray="63 251" strokeDashoffset="-282" opacity={opacity*1.5} />
      <circle cx="60" cy="60" r="30" fill="none" stroke="rgba(0,0,0,0.3)" strokeWidth="20" />
    </svg>
  )
}


// ─── SLIDESHOW ────────────────────────────────────────────────────────────────
const SLIDES = [
  {
    icon: FiBarChart2, title: "Know Your Financial Self",
    subtitle: "FITI reveals the behavioral patterns behind your spending",
    bg: "linear-gradient(135deg, #1a1035 0%, #2d1b5e 50%, #1a1035 100%)",
    accent: "#7c3aed", accentLight: "#a78bfa",
    Chart: BarChartDecoration, chartPos: "bottom-0 left-0 right-0 h-28",
  },
  {
    icon: FiTrendingUp, title: "16 Chart Types Generated",
    subtitle: "Every angle of your financial data visualized automatically",
    bg: "linear-gradient(135deg, #0a2a1f 0%, #0d3d2e 50%, #0a2a1f 100%)",
    accent: "#059669", accentLight: "#34d399",
    Chart: LineChartDecoration, chartPos: "bottom-0 left-0 right-0 h-32",
  },
  {
    icon: FiZap, title: "Anomaly Detection",
    subtitle: "Unusual spending days spotted and flagged automatically",
    bg: "linear-gradient(135deg, #1f1400 0%, #3d2800 50%, #1f1400 100%)",
    accent: "#d97706", accentLight: "#fbbf24",
    Chart: ScatterDecoration, chartPos: "bottom-0 left-0 right-0 h-28",
  },
  {
    icon: FiMessageSquare, title: "AI Financial Chat",
    subtitle: "Ask anything about your transactions in plain language",
    bg: "linear-gradient(135deg, #1f0a1a 0%, #3d1535 50%, #1f0a1a 100%)",
    accent: "#be185d", accentLight: "#f472b6",
    Chart: AreaChartDecoration, chartPos: "bottom-0 left-0 right-0 h-32",
  },
  {
    icon: FiCpu, title: "Multi-Model AI Pipeline",
    subtitle: "4 specialized models working in sequence on your data",
    bg: "linear-gradient(135deg, #0a1929 0%, #0d2d4a 50%, #0a1929 100%)",
    accent: "#0369a1", accentLight: "#38bdf8",
    Chart: PieDecoration, chartPos: "bottom-4 right-8 w-36 h-36",
  },
]

function FeatureSlideshow() {
  const [current, setCurrent] = useState(0)

  useEffect(() => {
    const t = setInterval(() => setCurrent(p => (p+1) % SLIDES.length), 6000)
    return () => clearInterval(t)
  }, [])

  const slide = SLIDES[current]
  const Icon  = slide.icon
  const Chart = slide.Chart

  return (
    <div className="w-full flex flex-col">
      <div className="relative overflow-hidden rounded-3xl" style={{ height: "420px" }}>
        <AnimatePresence mode="wait">
          <motion.div
            key={`bg-${current}`}
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            transition={{ duration: 0.7 }}
            className="absolute inset-0"
            style={{ background: slide.bg }}
          />
        </AnimatePresence>
        <div className="absolute inset-0 transition-all duration-700"
          style={{ background: `radial-gradient(ellipse 60% 50% at 30% 40%, ${slide.accent}22 0%, transparent 70%)` }} />
        <div className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: `linear-gradient(${slide.accentLight}30 1px, transparent 1px), linear-gradient(90deg, ${slide.accentLight}30 1px, transparent 1px)`,
            backgroundSize: "40px 40px",
          }} />
        <AnimatePresence mode="wait">
          <motion.div
            key={`chart-${current}`}
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className={`absolute ${slide.chartPos} pointer-events-none`}
          >
            <Chart opacity={0.10} />
          </motion.div>
        </AnimatePresence>
        <div className="absolute top-6 right-6 flex flex-col gap-2 opacity-25">
          {[82,67,91].map((v,i) => (
            <div key={i} className="flex items-center gap-2">
              <div className="h-1 rounded-full" style={{ width: `${v*0.6}px`, background: slide.accentLight }} />
              <span className="text-xs text-white font-mono">{v}%</span>
            </div>
          ))}
        </div>
        <div className="relative z-10 flex flex-col justify-center h-full px-10">
          <AnimatePresence mode="wait">
            <motion.div
              key={`content-${current}`}
              initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.5, ease: [0.22,1,0.36,1] }}
              className="max-w-lg"
            >
              <div className="flex items-center justify-center w-12 h-12 rounded-xl mb-6"
                style={{ background: `${slide.accent}30`, border: `1px solid ${slide.accent}50` }}>
                <Icon size={22} color={slide.accentLight} />
              </div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium mb-4"
                style={{ background: `${slide.accent}25`, color: slide.accentLight, border: `1px solid ${slide.accent}40` }}>
                <div className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: slide.accentLight }} />
                FITI Intelligence
              </div>
              <h3 className="text-3xl font-bold text-white mb-3 leading-tight">{slide.title}</h3>
              <p className="text-zinc-400 text-base leading-relaxed">{slide.subtitle}</p>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
      <div className="flex items-center justify-center gap-2 mt-4">
        {SLIDES.map((s,i) => (
          <button key={i} onClick={() => setCurrent(i)}>
            <motion.div
              animate={{ width: i===current ? 24 : 8, opacity: i===current ? 1 : 0.35 }}
              transition={{ duration: 0.3 }}
              className="h-1.5 rounded-full"
              style={{ background: i===current ? SLIDES[i].accentLight : "#52525b" }}
            />
          </button>
        ))}
      </div>
    </div>
  )
}


// ─── SIDEBAR ──────────────────────────────────────────────────────────────────
function Sidebar({ open, onClose, dark }) {
  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-40"
            style={{ background: "rgba(0,0,0,0.4)" }}
          />
          <motion.div
            initial={{ x: -300 }} animate={{ x: 0 }} exit={{ x: -300 }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className="fixed left-0 top-0 bottom-0 z-50 w-72 flex flex-col"
            style={{
              background: dark ? "#0a0a0a" : "#ffffff",
              borderRight: `1px solid ${dark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)"}`,
            }}
          >
            <div className="flex items-center justify-between px-5 py-5">
              <span className="font-bold text-lg" style={{ color: dark ? "#ffffff" : "#000000" }}>FITI</span>
              <button onClick={onClose} style={{ color: dark ? "#71717a" : "#a1a1aa" }}>
                <FiX size={18} />
              </button>
            </div>

            <div className="flex-1 px-4 py-2">
              <p className="text-xs font-medium px-2 mb-3" style={{ color: dark ? "#52525b" : "#a1a1aa" }}>
                RECENT CHATS
              </p>
              <div
                className="px-3 py-8 rounded-2xl text-center"
                style={{ background: dark ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.03)" }}
              >
                <p className="text-sm" style={{ color: dark ? "#52525b" : "#a1a1aa" }}>
                  Chat history coming soon
                </p>
                <p className="text-xs mt-1" style={{ color: dark ? "#3f3f46" : "#d4d4d8" }}>
                  Requires account system
                </p>
              </div>
            </div>

            <div className="px-4 py-4 border-t" style={{ borderColor: dark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)" }}>
              <p className="text-xs px-2" style={{ color: dark ? "#3f3f46" : "#d4d4d8" }}>
                Profile • Settings — Coming Soon
              </p>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}


// ─── NAV LINK ─────────────────────────────────────────────────────────────────
function NavLink({ label, Icon, onClick, dark }) {
  const [hovered, setHovered] = useState(false)
  const baseColor = dark ? "#71717a" : "#6b7280"
  const hoverColor = dark ? "#ffffff" : "#000000"
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="relative flex items-center gap-1.5 text-sm font-medium transition-colors duration-200"
      style={{ color: hovered ? hoverColor : baseColor }}
    >
      <Icon size={14} />
      {label}
      <motion.div
        className="absolute -bottom-1 left-0 right-0 h-px"
        style={{ background: hovered ? hoverColor : "transparent" }}
        initial={{ scaleX: 0, opacity: 0 }}
        animate={{ scaleX: hovered ? 1 : 0, opacity: hovered ? 1 : 0 }}
        transition={{ duration: 0.2 }}
        style={{ originX: 0, background: hoverColor }}
      />
    </button>
  )
}


// ─── MAIN APP ─────────────────────────────────────────────────────────────────
export default function App() {
  const [file, setFile]                       = useState(null)
  const [loading, setLoading]                 = useState(false)
  const [reportLoading, setReportLoading]     = useState(false)
  const [report, setReport]                   = useState(null)
  const [fullReport, setFullReport]           = useState(null)
  const [error, setError]                     = useState("")
  const [activeTab, setActiveTab]             = useState("insights")
  const [columnMapping, setColumnMapping]     = useState(null)
  const [classifications, setClassifications] = useState(null)
  const [ownerName, setOwnerName]             = useState(null)
  const [dark, setDark]                       = useState(true)
  const [sidebarOpen, setSidebarOpen]         = useState(false)
  const [chatStarted, setChatStarted]         = useState(false)

  const inputRef = useRef(null)

  const bg       = dark ? "#0a0a0a"        : "#f5f5f4"
  const surface  = dark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.04)"
  const border   = dark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)"
  const textPrimary   = dark ? "#ffffff" : "#000000"
  const textSecondary = dark ? "#a1a1aa" : "#6b7280"
  const textMuted     = dark ? "#52525b" : "#a1a1aa"

  const greeting = getGreeting()

  const handleFileChange = (e) => {
    const f = e.target.files[0]
    if (!f) return
    const err = validateFile(f)
    if (err) { setError(err); setFile(null); return }
    setError("")
    setFile(f)
  }

  const handleAnalysis = async () => {
    if (!file) return
    const err = validateFile(file)
    if (err) { setError(err); return }

    try {
      setLoading(true)
      setError("")
      setReport(null)
      setFullReport(null)
      setActiveTab("insights")
      setChatStarted(false)

      const formData = new FormData()
      formData.append("file", file)

      const response = await API.post("/classify", formData, {
        headers: { "Content-Type": "multipart/form-data" },
        timeout: 2000000,
      })

      setReport(response.data)
      setColumnMapping(response.data.column_mapping)
      setClassifications(response.data.classifications)
      setOwnerName(response.data.owner_name || null)

    } catch (err) {
      const msg =
        err?.response?.data?.detail?.error ||
        err?.response?.data?.detail?.message ||
        err?.response?.data?.detail ||
        err?.message ||
        "Failed to analyze statement."
      setError(typeof msg === "string" ? msg : JSON.stringify(msg))
    } finally {
      setLoading(false)
    }
  }

  const handleFullReport = async () => {
    if (!file || !classifications || !columnMapping) return
    try {
      setReportLoading(true)
      setError("")
      const formData = new FormData()
      formData.append("file", file)
      formData.append("classifications", JSON.stringify(classifications))
      formData.append("column_mapping", JSON.stringify(columnMapping))
      if (report?.report?.executive_summary) {
        formData.append("executive_summary", JSON.stringify(report.report.executive_summary))
      }
      const response = await API.post("/report/generate", formData, {
        headers: { "Content-Type": "multipart/form-data" },
        timeout: 2000000,
      })
      setFullReport(response.data.report)
      setActiveTab("report")
    } catch (err) {
      setError("Failed to generate full report.")
    } finally {
      setReportLoading(false)
    }
  }

  const currency        = report?.report?.executive_summary?.currency || "₦"
  const spendingRatio   = report?.report?.executive_summary?.spending_ratio || 0
  const spendingPercent = Math.round(spendingRatio * 100)
  const formatAmount    = (v) => `${currency}${Number(v).toLocaleString()}`

  const severityIcon = (s) => {
    if (s === "high")   return <FiAlertTriangle className="text-red-400"    size={18} />
    if (s === "medium") return <FiAlertCircle   className="text-yellow-400" size={18} />
    return <FiInfo className="text-blue-400" size={18} />
  }
  const severityColor = (s) => {
    if (s === "high")   return "border-red-500/40 bg-red-500/10"
    if (s === "medium") return "border-yellow-500/40 bg-yellow-500/10"
    return "border-blue-500/40 bg-blue-500/10"
  }

  const headerTitle = chatStarted && file
    ? file.name.replace(/\.[^/.]+$/, "")
    : null

  return (
    <div className="min-h-screen transition-colors duration-300" style={{ background: bg, color: textPrimary }}>

      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} dark={dark} />

      {/* NAVBAR */}
      <motion.nav
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="fixed top-0 left-0 right-0 z-30"
        style={{
          background: dark ? "rgba(10,10,10,0.9)" : "rgba(245,245,244,0.9)",
          backdropFilter: "blur(12px)",
          borderBottom: `1px solid ${border}`,
        }}
      >
        <div className="max-w-5xl mx-auto px-6 h-14 flex items-center justify-between">

          {/* Left: menu + logo OR doc name */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="transition-colors duration-200"
              style={{ color: textMuted }}
            >
              <FiMenu size={18} />
            </button>

            {headerTitle ? (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => { setReport(null); setFullReport(null); setChatStarted(false) }}
                  style={{ color: textMuted }}
                >
                  <FiChevronLeft size={16} />
                </button>
                <span className="text-sm font-medium truncate max-w-xs" style={{ color: textSecondary }}>
                  {headerTitle}
                </span>
              </div>
            ) : (
              <span className="font-bold text-base" style={{ color: textPrimary }}>FITI</span>
            )}
          </div>

          {/* Center: report tabs when in report view */}
          {report && chatStarted && (
            <div className="flex gap-1 p-0.5 rounded-xl" style={{ background: surface, border: `1px solid ${border}` }}>
              <button
                onClick={() => setActiveTab("insights")}
                className="px-4 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200"
                style={activeTab === "insights"
                  ? { background: dark ? "#ffffff" : "#000000", color: dark ? "#000000" : "#ffffff" }
                  : { color: textSecondary }
                }
              >
                Insights
              </button>
              <button
                onClick={() => { if (!fullReport) handleFullReport(); else setActiveTab("report") }}
                className="px-4 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200"
                style={activeTab === "report"
                  ? { background: dark ? "#ffffff" : "#000000", color: dark ? "#000000" : "#ffffff" }
                  : { color: textSecondary }
                }
              >
                {reportLoading ? "Loading..." : "Report"}
              </button>
            </div>
          )}

          {/* Right: share + dark mode */}
          <div className="flex items-center gap-4">
            {chatStarted && (
              <button style={{ color: textMuted }}>
                <FiShare2 size={16} />
              </button>
            )}
            <button
              onClick={() => setDark(!dark)}
              className="transition-colors duration-200"
              style={{ color: textMuted }}
            >
              {dark ? <FiSun size={16} /> : <FiMoon size={16} />}
            </button>
            {!report && (
              <>
                <NavLink label="Logs"    Icon={FiList} onClick={() => {}} dark={dark} />
                <NavLink label="Contact" Icon={FiMail} onClick={() => {}} dark={dark} />
              </>
            )}
          </div>
        </div>
      </motion.nav>

      {/* MAIN CONTENT */}
      <div className="max-w-5xl mx-auto px-6 pt-24 pb-16">

        {/* GREETING + UPLOAD (pre-analysis) */}
        {!report && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            {/* Greeting */}
            <div className="mb-10">
              <h1 className="text-4xl font-bold mb-2" style={{ color: textPrimary }}>
                {greeting}, I'm FITI
              </h1>
              <p className="text-base" style={{ color: textSecondary }}>
                Upload your bank statement and I'll tell you everything about your financial life.
              </p>
            </div>

            {/* Upload / Slideshow container */}
            <AnimatePresence mode="wait">
              {loading ? (
                <motion.div
                  key="slideshow"
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  transition={{ duration: 0.4 }}
                >
                  <FeatureSlideshow />
                </motion.div>
              ) : (
                <motion.div
                  key="upload"
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  transition={{ duration: 0.4 }}
                >
                  {/* Upload area */}
                  <div
                    className="rounded-3xl p-8"
                    style={{ background: surface, border: `1px solid ${border}` }}
                  >
                    <div className="flex flex-col items-center text-center">
                      <div
                        className="w-12 h-12 rounded-2xl flex items-center justify-center mb-5"
                        style={{ background: `rgba(208,139,91,0.1)` }}
                      >
                        <FiUploadCloud size={24} color={BRAND} />
                      </div>

                      <h2 className="text-xl font-semibold mb-1" style={{ color: textPrimary }}>
                        Upload Statement
                      </h2>
                      <p className="text-sm mb-6" style={{ color: textSecondary }}>
                        CSV or Excel from any bank. Max {MAX_FILE_SIZE_MB}MB.
                      </p>

                      {/* File input row */}
                      <div className="flex gap-3 w-full max-w-md">
                        <input
                          ref={inputRef}
                          type="file"
                          accept=".csv,.xlsx"
                          onChange={handleFileChange}
                          className="hidden"
                        />
                        <button
                          onClick={() => inputRef.current?.click()}
                          className="flex-none flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200"
                          style={{
                            background: surface,
                            border: `1px solid ${border}`,
                            color: textPrimary,
                          }}
                        >
                          <FiUploadCloud size={14} />
                          Choose File
                        </button>
                        <div
                          className="flex-1 flex items-center px-4 py-2.5 rounded-xl text-sm truncate"
                          style={{
                            background: dark ? "rgba(255,255,255,0.02)" : "rgba(0,0,0,0.02)",
                            border: `1px solid ${border}`,
                            color: file ? textPrimary : textMuted,
                          }}
                        >
                          {file ? file.name : "No file chosen"}
                        </div>
                      </div>

                      {error && (
                        <motion.div
                          initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }}
                          className="flex items-center gap-2 mt-3 text-red-400 text-xs"
                        >
                          <FiAlertTriangle size={13} />
                          {error}
                        </motion.div>
                      )}

                      <button
                        onClick={handleAnalysis}
                        disabled={loading || !file}
                        className="mt-5 px-8 py-3 rounded-2xl font-semibold text-sm transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed"
                        style={{
                          background: file ? BRAND : surface,
                          color: file ? "#ffffff" : textMuted,
                          border: file ? "none" : `1px solid ${border}`,
                        }}
                      >
                        Analyze Statement
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <ProgressLoader active={loading} steps={CLASSIFY_STEPS} />
          </motion.div>
        )}

        {/* POST-ANALYSIS */}
        {report && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            onAnimationComplete={() => setChatStarted(true)}
          >
            {/* Dynamic greeting after analysis */}
            <div className="mb-8">
              <h2 className="text-2xl font-bold" style={{ color: textPrimary }}>
                {ownerName
                  ? `FITI says hi, ${ownerName} 👋`
                  : "Analysis complete 👋"
                }
              </h2>
              <p className="text-sm mt-1" style={{ color: textSecondary }}>
                {report.rows_processed} transactions analysed · {new Date(report.report.generated_at).toLocaleString()}
              </p>
            </div>

            <AnimatePresence mode="wait">

              {/* AI INSIGHTS TAB */}
              {activeTab === "insights" && (
                <motion.div
                  key="insights"
                  initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -16 }} transition={{ duration: 0.3 }}
                >
                  {/* Summary cards */}
                  <div className="grid md:grid-cols-3 gap-4 mb-6">
                    {[
                      { label: "Total Income",   value: formatAmount(report.report.executive_summary.total_income),   color: "#4ade80" },
                      { label: "Total Spending",  value: formatAmount(report.report.executive_summary.total_spending), color: "#f87171" },
                      { label: "Avg Transaction", value: formatAmount(report.report.executive_summary.average_spending), color: textPrimary },
                    ].map(({ label, value, color }) => (
                      <div key={label} className="p-5 rounded-2xl" style={{ background: surface, border: `1px solid ${border}` }}>
                        <p className="text-xs mb-2" style={{ color: textSecondary }}>{label}</p>
                        <p className="text-2xl font-bold" style={{ color }}>{value}</p>
                      </div>
                    ))}
                  </div>

                  {/* Spending ratio */}
                  <div className="p-5 rounded-2xl mb-6" style={{ background: surface, border: `1px solid ${border}` }}>
                    <div className="flex justify-between items-center mb-3">
                      <p className="text-sm" style={{ color: textSecondary }}>Spending Ratio</p>
                      <span className={`text-sm font-semibold ${spendingPercent >= 90 ? "text-red-400" : spendingPercent >= 70 ? "text-yellow-400" : "text-green-400"}`}>
                        {spendingPercent}% of income spent
                      </span>
                    </div>
                    <div className="w-full rounded-full h-2" style={{ background: dark ? "#27272a" : "#e5e5e5" }}>
                      <div
                        className={`h-2 rounded-full transition-all duration-1000 ${spendingPercent >= 90 ? "bg-red-500" : spendingPercent >= 70 ? "bg-yellow-500" : "bg-green-500"}`}
                        style={{ width: `${Math.min(spendingPercent, 100)}%` }}
                      />
                    </div>
                    <p className="text-xs mt-2" style={{ color: textMuted }}>
                      {formatAmount(report.report.executive_summary.total_income - report.report.executive_summary.total_spending)} remaining
                    </p>
                  </div>

                  {/* Transaction breakdown + risks */}
                  <div className="grid md:grid-cols-2 gap-4 mb-6">
                    <div className="p-5 rounded-2xl" style={{ background: surface, border: `1px solid ${border}` }}>
                      <h3 className="text-sm font-semibold mb-4" style={{ color: textPrimary }}>Transaction Breakdown</h3>
                      <div className="space-y-3">
                        {[
                          { label: "Transfers",  value: report.report.transaction_summary.transfer_transactions },
                          { label: "Bank Fees",  value: report.report.transaction_summary.fee_transactions },
                          { label: "Gambling",   value: report.report.transaction_summary.gambling_transactions, highlight: true },
                        ].map(({ label, value, highlight }) => (
                          <div key={label} className="flex justify-between items-center py-2" style={{ borderBottom: `1px solid ${border}` }}>
                            <span className="text-sm" style={{ color: textSecondary }}>{label}</span>
                            <span className={`font-semibold text-sm ${highlight && value > 0 ? "text-red-400" : highlight ? "text-green-400" : ""}`} style={{ color: highlight ? undefined : textPrimary }}>
                              {highlight && value === 0 ? "None detected" : value}
                            </span>
                          </div>
                        ))}
                        <div className="pt-2">
                          <p className="text-xs mb-3" style={{ color: textMuted }}>Top Categories</p>
                          {report.report.transaction_summary.top_categories.map(([cat, count], i) => (
                            <div key={i} className="flex justify-between items-center py-2" style={{ borderBottom: `1px solid ${border}` }}>
                              <span className="text-sm capitalize" style={{ color: textSecondary }}>{cat}</span>
                              <span className="font-semibold text-sm" style={{ color: textPrimary }}>{count}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="p-5 rounded-2xl" style={{ background: surface, border: `1px solid ${border}` }}>
                      <h3 className="text-sm font-semibold mb-4" style={{ color: textPrimary }}>Risk Flags</h3>
                      {report.report.risk_analysis.risks.length === 0 ? (
                        <p className="text-green-400 text-sm">No risks detected.</p>
                      ) : (
                        <div className="space-y-3">
                          {report.report.risk_analysis.risks.map((risk, i) => (
                            <div key={i} className={`flex items-start gap-3 p-3 rounded-xl border ${severityColor(risk.severity)}`}>
                              <div className="mt-0.5">{severityIcon(risk.severity)}</div>
                              <div>
                                <p className="text-sm font-semibold capitalize mb-0.5">{risk.risk.replace(/_/g," ")}</p>
                                <p className="text-xs text-zinc-400">{risk.message}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* AI Insights */}
                  <div className="p-6 rounded-2xl" style={{ background: surface, border: `1px solid ${border}` }}>
                    <h3 className="text-base font-semibold mb-1" style={{ color: textPrimary }}>AI Financial Insights</h3>
                    <p className="text-xs mb-5" style={{ color: textMuted }}>Generated by FITI intelligence engine</p>
                    <div className="space-y-4">
                      {report.report.ai_insights.split("\n").filter(l => l.trim()).map((line, i) => (
                        <div key={i} className="flex items-start gap-3">
                          <span className="mt-1" style={{ color: BRAND }}>—</span>
                          <p className="text-sm leading-relaxed" style={{ color: dark ? "#d4d4d8" : "#374151" }}>
                            {line.replace(/^\*\s*/, "")}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}

              {/* FULL REPORT TAB */}
              {activeTab === "report" && fullReport && (
                <motion.div
                  key="report"
                  initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -16 }} transition={{ duration: 0.3 }}
                >
                  <FullReport
                    reportData={fullReport}
                    fileName={file?.name}
                  />
                </motion.div>
              )}

              {activeTab === "report" && reportLoading && (
                <motion.div key="report-loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                  <ProgressLoader active={reportLoading} steps={REPORT_STEPS} />
                </motion.div>
              )}

            </AnimatePresence>
          </motion.div>
        )}

      </div>
    </div>
  )
}







// import { useState, useRef, useEffect } from "react"
// import { motion, AnimatePresence } from "framer-motion"
// import {
//   FiUploadCloud, FiChevronDown, FiChevronUp,
//   FiAlertTriangle, FiAlertCircle, FiInfo,
//   FiMessageSquare, FiTrendingUp, FiZap, FiBarChart2, FiCpu,
//   FiHome, FiList, FiMail
// } from "react-icons/fi"
// import API from "./services/api"
// import bg from "/fiti-bg.jpg"
// import FullReport from "./components/FullReport"
// import ProgressLoader, { CLASSIFY_STEPS, REPORT_STEPS } from "./components/ProgressLoader"


// // ─── CONSTANTS ────────────────────────────────────────────────────────────────
// const MAX_FILE_SIZE_MB    = 10
// const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024

// const validateFile = (selectedFile) => {
//   if (!selectedFile) return "No file selected."
//   const ext = selectedFile.name.split(".").pop().toLowerCase()
//   if (!["csv", "xlsx"].includes(ext)) return "Only CSV and Excel (.xlsx) files are supported."
//   if (selectedFile.size > MAX_FILE_SIZE_BYTES) return `File is too large. Maximum size is ${MAX_FILE_SIZE_MB}MB.`
//   return null
// }


// // ─── SVG CHART DECORATIONS ────────────────────────────────────────────────────
// function BarChartDecoration({ opacity = 0.12 }) {
//   const bars = [40, 75, 55, 90, 65, 80, 45, 95, 70, 60, 85, 50]
//   return (
//     <svg viewBox="0 0 300 120" className="w-full h-full" preserveAspectRatio="none">
//       {bars.map((h, i) => (
//         <rect
//           key={i}
//           x={i * 25 + 2}
//           y={120 - h}
//           width={20}
//           height={h}
//           rx={3}
//           fill="white"
//           opacity={opacity}
//         />
//       ))}
//     </svg>
//   )
// }

// function LineChartDecoration({ opacity = 0.12 }) {
//   const points = [
//     [0, 80], [30, 60], [60, 75], [90, 40], [120, 55],
//     [150, 30], [180, 45], [210, 25], [240, 35], [270, 20], [300, 30]
//   ]
//   const path = points.map((p, i) => `${i === 0 ? "M" : "L"} ${p[0]} ${p[1]}`).join(" ")
//   const area = path + ` L 300 120 L 0 120 Z`
//   return (
//     <svg viewBox="0 0 300 120" className="w-full h-full" preserveAspectRatio="none">
//       <path d={area} fill="white" opacity={opacity * 0.5} />
//       <path d={path} fill="none" stroke="white" strokeWidth="2.5" opacity={opacity * 2} />
//       {points.map((p, i) => (
//         <circle key={i} cx={p[0]} cy={p[1]} r="3.5" fill="white" opacity={opacity * 2.5} />
//       ))}
//     </svg>
//   )
// }

// function AreaChartDecoration({ opacity = 0.12 }) {
//   const points1 = [
//     [0, 90], [50, 65], [100, 80], [150, 45], [200, 60], [250, 35], [300, 50]
//   ]
//   const points2 = [
//     [0, 70], [50, 50], [100, 60], [150, 30], [200, 45], [250, 20], [300, 35]
//   ]
//   const path1 = points1.map((p, i) => `${i === 0 ? "M" : "L"} ${p[0]} ${p[1]}`).join(" ") + " L 300 120 L 0 120 Z"
//   const path2 = points2.map((p, i) => `${i === 0 ? "M" : "L"} ${p[0]} ${p[1]}`).join(" ")
//   return (
//     <svg viewBox="0 0 300 120" className="w-full h-full" preserveAspectRatio="none">
//       <path d={path1} fill="white" opacity={opacity * 0.6} />
//       <path d={path2} fill="none" stroke="white" strokeWidth="2" opacity={opacity * 2.5} strokeDasharray="6 3" />
//     </svg>
//   )
// }

// function PieDecoration({ opacity = 0.12 }) {
//   return (
//     <svg viewBox="0 0 120 120" className="w-full h-full" preserveAspectRatio="xMidYMid meet">
//       <circle cx="60" cy="60" r="50" fill="none" stroke="white" strokeWidth="28"
//         strokeDasharray="188 126" strokeDashoffset="0" opacity={opacity * 2} />
//       <circle cx="60" cy="60" r="50" fill="none" stroke="white" strokeWidth="28"
//         strokeDasharray="94 220" strokeDashoffset="-188" opacity={opacity} />
//       <circle cx="60" cy="60" r="50" fill="none" stroke="white" strokeWidth="28"
//         strokeDasharray="63 251" strokeDashoffset="-282" opacity={opacity * 1.5} />
//       <circle cx="60" cy="60" r="30" fill="none" stroke="rgba(0,0,0,0.3)" strokeWidth="20" />
//     </svg>
//   )
// }

// function ScatterDecoration({ opacity = 0.12 }) {
//   const dots = [
//     [30,90],[60,60],[90,75],[120,40],[150,65],[180,35],[210,55],[240,30],[270,50],
//     [45,80],[135,50],[195,45],[255,40],[75,70],[165,60]
//   ]
//   return (
//     <svg viewBox="0 0 300 120" className="w-full h-full" preserveAspectRatio="none">
//       {dots.map((d, i) => (
//         <circle key={i} cx={d[0]} cy={d[1]} r={i % 3 === 0 ? 5 : 3} fill="white" opacity={opacity * (i % 2 === 0 ? 2 : 1.2)} />
//       ))}
//       <line x1="0" y1="110" x2="300" y2="10" stroke="white" strokeWidth="1" opacity={opacity} strokeDasharray="4 4" />
//     </svg>
//   )
// }


// // ─── SLIDESHOW ────────────────────────────────────────────────────────────────
// const SLIDES = [
//   {
//     icon:        FiBarChart2,
//     title:       "Know Your Financial Self",
//     subtitle:    "FITI reveals the behavioral patterns behind your spending",
//     bg:          "linear-gradient(135deg, #1a1035 0%, #2d1b5e 50%, #1a1035 100%)",
//     accent:      "#7c3aed",
//     accentLight: "#a78bfa",
//     Chart:       BarChartDecoration,
//     chartPos:    "bottom-0 left-0 right-0 h-28",
//   },
//   {
//     icon:        FiTrendingUp,
//     title:       "16 Chart Types Generated",
//     subtitle:    "Every angle of your financial data visualized automatically",
//     bg:          "linear-gradient(135deg, #0a2a1f 0%, #0d3d2e 50%, #0a2a1f 100%)",
//     accent:      "#059669",
//     accentLight: "#34d399",
//     Chart:       LineChartDecoration,
//     chartPos:    "bottom-0 left-0 right-0 h-32",
//   },
//   {
//     icon:        FiZap,
//     title:       "Anomaly Detection",
//     subtitle:    "Unusual spending days spotted and flagged automatically",
//     bg:          "linear-gradient(135deg, #1f1400 0%, #3d2800 50%, #1f1400 100%)",
//     accent:      "#d97706",
//     accentLight: "#fbbf24",
//     Chart:       ScatterDecoration,
//     chartPos:    "bottom-0 left-0 right-0 h-28",
//   },
//   {
//     icon:        FiMessageSquare,
//     title:       "AI Financial Chat",
//     subtitle:    "Ask anything about your transactions in plain language",
//     bg:          "linear-gradient(135deg, #1f0a1a 0%, #3d1535 50%, #1f0a1a 100%)",
//     accent:      "#be185d",
//     accentLight: "#f472b6",
//     Chart:       AreaChartDecoration,
//     chartPos:    "bottom-0 left-0 right-0 h-32",
//   },
//   {
//     icon:        FiCpu,
//     title:       "Multi-Model AI Pipeline",
//     subtitle:    "4 specialized models working in sequence on your data",
//     bg:          "linear-gradient(135deg, #0a1929 0%, #0d2d4a 50%, #0a1929 100%)",
//     accent:      "#0369a1",
//     accentLight: "#38bdf8",
//     Chart:       PieDecoration,
//     chartPos:    "bottom-4 right-8 w-36 h-36",
//   },
// ]

// function FeatureSlideshow() {
//   const [current, setCurrent] = useState(0)

//   useEffect(() => {
//     const timer = setInterval(() => setCurrent(prev => (prev + 1) % SLIDES.length), 3500)
//     return () => clearInterval(timer)
//   }, [])

//   const slide = SLIDES[current]
//   const Icon  = slide.icon
//   const Chart = slide.Chart

//   return (
//     <div className="w-full flex flex-col">
//       <div
//         className="relative overflow-hidden rounded-3xl"
//         style={{ height: "420px" }}
//       >
//         {/* Background */}
//         <AnimatePresence mode="wait">
//           <motion.div
//             key={`bg-${current}`}
//             initial={{ opacity: 0 }}
//             animate={{ opacity: 1 }}
//             exit={{ opacity: 0 }}
//             transition={{ duration: 0.7 }}
//             className="absolute inset-0"
//             style={{ background: slide.bg }}
//           />
//         </AnimatePresence>

//         {/* Radial glow from accent */}
//         <div
//           className="absolute inset-0 transition-all duration-700"
//           style={{
//             background: `radial-gradient(ellipse 60% 50% at 30% 40%, ${slide.accent}22 0%, transparent 70%)`,
//           }}
//         />

//         {/* Grid overlay */}
//         <div
//           className="absolute inset-0 opacity-10"
//           style={{
//             backgroundImage: `linear-gradient(${slide.accentLight}30 1px, transparent 1px), linear-gradient(90deg, ${slide.accentLight}30 1px, transparent 1px)`,
//             backgroundSize: "40px 40px",
//           }}
//         />

//         {/* Chart decoration */}
//         <AnimatePresence mode="wait">
//           <motion.div
//             key={`chart-${current}`}
//             initial={{ opacity: 0, y: 20 }}
//             animate={{ opacity: 1, y: 0 }}
//             exit={{ opacity: 0 }}
//             transition={{ duration: 0.8, delay: 0.2 }}
//             className={`absolute ${slide.chartPos} pointer-events-none`}
//           >
//             <Chart opacity={0.10} />
//           </motion.div>
//         </AnimatePresence>

//         {/* Bottom fade */}
//         <div
//           className="absolute bottom-0 left-0 right-0 h-20 pointer-events-none"
//           style={{ background: `linear-gradient(to top, ${slide.bg.split("0%")[0]}1f0a1a 0%, transparent 100%)` }}
//         />

//         {/* Floating data points top right */}
//         <div className="absolute top-6 right-6 flex flex-col gap-2 opacity-30">
//           {[82, 67, 91].map((v, i) => (
//             <div key={i} className="flex items-center gap-2">
//               <div className="h-1 rounded-full" style={{ width: `${v * 0.6}px`, background: slide.accentLight }} />
//               <span className="text-xs text-white font-mono">{v}%</span>
//             </div>
//           ))}
//         </div>

//         {/* Content */}
//         <div className="relative z-10 flex flex-col justify-center h-full px-10">
//           <AnimatePresence mode="wait">
//             <motion.div
//               key={`content-${current}`}
//               initial={{ opacity: 0, x: -20 }}
//               animate={{ opacity: 1, x: 0 }}
//               exit={{ opacity: 0, x: 20 }}
//               transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
//               className="max-w-lg"
//             >
//               {/* Icon */}
//               <div
//                 className="flex items-center justify-center w-12 h-12 rounded-xl mb-6"
//                 style={{ background: `${slide.accent}30`, border: `1px solid ${slide.accent}50` }}
//               >
//                 <Icon size={22} color={slide.accentLight} />
//               </div>

//               {/* Label */}
//               <div
//                 className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium mb-4"
//                 style={{ background: `${slide.accent}25`, color: slide.accentLight, border: `1px solid ${slide.accent}40` }}
//               >
//                 <div className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: slide.accentLight }} />
//                 FITI Intelligence
//               </div>

//               <h3 className="text-3xl font-bold text-white mb-3 leading-tight">
//                 {slide.title}
//               </h3>
//               <p className="text-zinc-400 text-base leading-relaxed">
//                 {slide.subtitle}
//               </p>
//             </motion.div>
//           </AnimatePresence>
//         </div>
//       </div>

//       {/* Dots */}
//       <div className="flex items-center justify-center gap-2 mt-4">
//         {SLIDES.map((s, i) => (
//           <button key={i} onClick={() => setCurrent(i)}>
//             <motion.div
//               animate={{ width: i === current ? 24 : 8, opacity: i === current ? 1 : 0.35 }}
//               transition={{ duration: 0.3 }}
//               className="h-1.5 rounded-full"
//               style={{ background: i === current ? SLIDES[i].accentLight : "#52525b" }}
//             />
//           </button>
//         ))}
//       </div>
//     </div>
//   )
// }


// // ─── NAVBAR ───────────────────────────────────────────────────────────────────
// function NavLink({ label, Icon, onClick }) {
//   const [hovered, setHovered] = useState(false)
//   return (
//     <button
//       onClick={onClick}
//       onMouseEnter={() => setHovered(true)}
//       onMouseLeave={() => setHovered(false)}
//       className="relative flex items-center gap-1.5 text-sm font-medium transition-colors duration-200"
//       style={{ color: hovered ? "#ffffff" : "#a1a1aa" }}
//     >
//       <Icon size={14} />
//       {label}
//       <motion.div
//         className="absolute -bottom-1 left-0 right-0 h-px bg-white"
//         initial={{ scaleX: 0, opacity: 0 }}
//         animate={{ scaleX: hovered ? 1 : 0, opacity: hovered ? 1 : 0 }}
//         transition={{ duration: 0.2, ease: "easeOut" }}
//         style={{ originX: 0 }}
//       />
//     </button>
//   )
// }

// function Navbar({ onHomeClick }) {
//   return (
//     <motion.nav
//       initial={{ opacity: 0, y: -20 }}
//       animate={{ opacity: 1, y: 0 }}
//       transition={{ duration: 0.6 }}
//       className="fixed top-0 left-0 right-0 z-50"
//     >
//       <div className="backdrop-blur-md border-b border-white/10" style={{ background: "rgba(9,9,11,0.85)" }}>
//         <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
//           <motion.div
//             className="flex items-center gap-2 cursor-pointer"
//             onClick={onHomeClick}
//             whileHover={{ scale: 1.02 }}
//           >
//             <span className="text-xl font-bold tracking-wide text-white">FITI</span>
//             <span
//               className="text-xs font-medium px-2 py-0.5 rounded-full border"
//               style={{ color: "#a78bfa", borderColor: "#a78bfa40", background: "#a78bfa10" }}
//             >
//               AI
//             </span>
//           </motion.div>
//           <div className="flex items-center gap-8">
//             <NavLink label="Home"    Icon={FiHome} onClick={onHomeClick} />
//             <NavLink label="Logs"    Icon={FiList} onClick={() => {}} />
//             <NavLink label="Contact" Icon={FiMail} onClick={() => {}} />
//           </div>
//         </div>
//       </div>
//     </motion.nav>
//   )
// }


// // ─── UPLOAD ZONE (original style) ─────────────────────────────────────────────
// function UploadZone({ file, onFileChange, loading, error }) {
//   const inputRef = useRef(null)
//   return (
//     <div className="flex flex-col items-center w-full">
//       <div className="flex gap-4 w-full max-w-md">

//         {/* Choose file button */}
//         <div
//           className="flex-none"
//           onClick={() => inputRef.current?.click()}
//         >
//           <input
//             ref={inputRef}
//             type="file"
//             accept=".csv,.xlsx"
//             onChange={onFileChange}
//             className="hidden"
//           />
//           <div
//             className="flex items-center gap-2 px-5 py-3 rounded-xl cursor-pointer transition-all duration-200 text-sm font-medium text-white"
//             style={{
//               background: "rgba(255,255,255,0.08)",
//               border: "1px solid rgba(255,255,255,0.15)",
//               whiteSpace: "nowrap",
//             }}
//             onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.12)"}
//             onMouseLeave={e => e.currentTarget.style.background = "rgba(255,255,255,0.08)"}
//           >
//             <FiUploadCloud size={16} />
//             Choose File
//           </div>
//         </div>

//         {/* File name display */}
//         <div
//           className="flex-1 flex items-center px-4 py-3 rounded-xl text-sm"
//           style={{
//             background: "rgba(255,255,255,0.04)",
//             border: "1px solid rgba(255,255,255,0.08)",
//             color: file ? "#d4d4d8" : "#52525b",
//             minWidth: 0,
//           }}
//         >
//           <span className="truncate">
//             {file ? file.name : "No file chosen"}
//           </span>
//         </div>

//       </div>

//       {/* Error */}
//       {error && (
//         <motion.div
//           initial={{ opacity: 0, y: 4 }}
//           animate={{ opacity: 1, y: 0 }}
//           className="flex items-center gap-2 mt-3 text-red-400 text-xs"
//         >
//           <FiAlertTriangle size={13} />
//           {error}
//         </motion.div>
//       )}
//     </div>
//   )
// }


// // ─── MAIN APP ─────────────────────────────────────────────────────────────────
// function App() {

//   const [file, setFile]                       = useState(null)
//   const [loading, setLoading]                 = useState(false)
//   const [reportLoading, setReportLoading]     = useState(false)
//   const [report, setReport]                   = useState(null)
//   const [fullReport, setFullReport]           = useState(null)
//   const [error, setError]                     = useState("")
//   const [showRaw, setShowRaw]                 = useState(false)
//   const [activeTab, setActiveTab]             = useState("insights")
//   const [columnMapping, setColumnMapping]     = useState(null)
//   const [classifications, setClassifications] = useState(null)

//   const scrollToTop = () => window.scrollTo({ top: 0, behavior: "smooth" })

//   const handleFileChange = (e) => {
//     const selectedFile = e.target.files[0]
//     if (!selectedFile) return
//     const validationError = validateFile(selectedFile)
//     if (validationError) { setError(validationError); setFile(null); return }
//     setError("")
//     setFile(selectedFile)
//   }

//   const handleAnalysis = async () => {
//     if (!file) return
//     const validationError = validateFile(file)
//     if (validationError) { setError(validationError); return }

//     try {
//       setLoading(true)
//       setError("")
//       setReport(null)
//       setFullReport(null)
//       setActiveTab("insights")

//       const formData = new FormData()
//       formData.append("file", file)

//       const response = await API.post("/classify", formData, {
//         headers: { "Content-Type": "multipart/form-data" },
//         timeout: 2000000,
//       })

//       setReport(response.data)
//       setColumnMapping(response.data.column_mapping)
//       setClassifications(response.data.classifications)

//     } catch (err) {
//       const errorMessage =
//         err?.response?.data?.detail?.error ||
//         err?.response?.data?.detail?.message ||
//         err?.response?.data?.detail ||
//         err?.message ||
//         "Failed to analyze statement."
//       setError(typeof errorMessage === "string" ? errorMessage : JSON.stringify(errorMessage))
//     } finally {
//       setLoading(false)
//     }
//   }

//   const handleFullReport = async () => {
//     if (!file || !classifications || !columnMapping) return
//     try {
//       setReportLoading(true)
//       setError("")
//       const formData = new FormData()
//       formData.append("file", file)
//       formData.append("classifications", JSON.stringify(classifications))
//       formData.append("column_mapping", JSON.stringify(columnMapping))
//       if (report?.report?.executive_summary) {
//         formData.append("executive_summary", JSON.stringify(report.report.executive_summary))
//       }
//       const response = await API.post("/report/generate", formData, {
//         headers: { "Content-Type": "multipart/form-data" },
//         timeout: 2000000,
//       })
//       setFullReport(response.data.report)
//       setActiveTab("report")
//     } catch (err) {
//       setError("Failed to generate full report.")
//     } finally {
//       setReportLoading(false)
//     }
//   }

//   const currency        = report?.report?.executive_summary?.currency || "₦"
//   const spendingRatio   = report?.report?.executive_summary?.spending_ratio || 0
//   const spendingPercent = Math.round(spendingRatio * 100)
//   const formatAmount    = (amount) => `${currency}${Number(amount).toLocaleString()}`

//   const severityIcon = (severity) => {
//     if (severity === "high")   return <FiAlertTriangle className="text-red-400"    size={18} />
//     if (severity === "medium") return <FiAlertCircle   className="text-yellow-400" size={18} />
//     return                            <FiInfo           className="text-blue-400"   size={18} />
//   }

//   const severityColor = (severity) => {
//     if (severity === "high")   return "border-red-500/40 bg-red-500/10"
//     if (severity === "medium") return "border-yellow-500/40 bg-yellow-500/10"
//     return "border-blue-500/40 bg-blue-500/10"
//   }

//   return (
//     <div
//       className="min-h-screen text-white"
//       style={{
//         backgroundImage:      `url(${bg})`,
//         backgroundSize:       "cover",
//         backgroundPosition:   "center",
//         backgroundAttachment: "fixed",
//         backgroundRepeat:     "no-repeat",
//       }}
//     >
//       <div className="min-h-screen bg-black/40">

//         <Navbar onHomeClick={scrollToTop} />

//         <div className="max-w-6xl mx-auto px-6 pt-32 pb-16">

//           {/* HERO */}
//           <motion.div
//             initial={{ opacity: 0, y: 30 }}
//             animate={{ opacity: 1, y: 0 }}
//             transition={{ duration: 0.8 }}
//             className="text-center mb-16"
//           >
//             <h1 className="text-6xl font-bold mb-6">FITI AI</h1>
//             <p className="text-zinc-400 text-lg max-w-2xl mx-auto">
//               AI-powered financial intelligence system
//               for transaction statement analysis and reporting.
//             </p>
//           </motion.div>

//           {/* UPLOAD / SLIDESHOW SECTION */}
//           <motion.div
//             initial={{ opacity: 0, scale: 0.97 }}
//             animate={{ opacity: 1, scale: 1 }}
//             transition={{ delay: 0.2 }}
//           >
//             <div
//               className="rounded-3xl p-10"
//               style={{
//                 background:    "rgba(18,18,20,0.85)",
//                 backdropFilter: "blur(16px)",
//                 border:        "1px solid rgba(255,255,255,0.07)",
//               }}
//             >
//               <AnimatePresence mode="wait">
//                 {loading ? (

//                   /* SLIDESHOW */
//                   <motion.div
//                     key="slideshow"
//                     initial={{ opacity: 0 }}
//                     animate={{ opacity: 1 }}
//                     exit={{ opacity: 0 }}
//                     transition={{ duration: 0.4 }}
//                   >
//                     <FeatureSlideshow />
//                   </motion.div>

//                 ) : (

//                   /* UPLOAD UI */
//                   <motion.div
//                     key="upload"
//                     initial={{ opacity: 0 }}
//                     animate={{ opacity: 1 }}
//                     exit={{ opacity: 0 }}
//                     transition={{ duration: 0.4 }}
//                     className="flex flex-col items-center text-center"
//                   >
//                     <div className="bg-zinc-800 p-5 rounded-full mb-6">
//                       <FiUploadCloud size={40} />
//                     </div>

//                     <h2 className="text-3xl font-semibold mb-3">Upload Statement</h2>
//                     <p className="text-zinc-400 mb-8">
//                       Supports CSV and Excel files from any bank. Max {MAX_FILE_SIZE_MB}MB.
//                     </p>

//                     <UploadZone
//                       file={file}
//                       onFileChange={handleFileChange}
//                       loading={loading}
//                       error={error}
//                     />

//                     <button
//                       onClick={handleAnalysis}
//                       disabled={loading || !file}
//                       className={`mt-8 px-8 py-4 rounded-2xl font-semibold hover:scale-105 transition border disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 ${
//                         file
//                           ? "bg-transparent text-white border-white"
//                           : "bg-white text-black border-transparent"
//                       }`}
//                     >
//                       {loading ? "Analysing..." : "Analyze Statement"}
//                     </button>
//                   </motion.div>
//                 )}
//               </AnimatePresence>
//             </div>
//           </motion.div>

//           {/* PROGRESS LOADER */}
//           <ProgressLoader active={loading} steps={CLASSIFY_STEPS} />

//           {/* ERROR (outside loading) */}
//           {error && !loading && (
//             <motion.div
//               initial={{ opacity: 0, y: 10 }}
//               animate={{ opacity: 1, y: 0 }}
//               className="mt-10 text-center"
//             >
//               <div className="inline-flex items-center gap-2 bg-red-500/10 border border-red-500/30 text-red-400 px-6 py-3 rounded-2xl text-sm">
//                 <FiAlertTriangle size={16} />
//                 {error}
//               </div>
//             </motion.div>
//           )}

//           {/* REPORT SECTION */}
//           {report && (
//             <motion.div
//               initial={{ opacity: 0, y: 40 }}
//               animate={{ opacity: 1, y: 0 }}
//               transition={{ duration: 0.6 }}
//               className="mt-16"
//             >

//               {/* TAB NAVIGATION */}
//               <div className="flex items-center justify-between mb-10">
//                 <div className="flex gap-2 bg-zinc-900/80 backdrop-blur-sm border border-zinc-800 rounded-2xl p-1">
//                   <button
//                     onClick={() => setActiveTab("insights")}
//                     className={`px-6 py-2.5 rounded-xl text-sm font-semibold transition ${
//                       activeTab === "insights" ? "bg-white text-black" : "text-zinc-400 hover:text-white"
//                     }`}
//                   >
//                     AI Insights
//                   </button>
//                   <button
//                     onClick={() => { if (!fullReport) { handleFullReport() } else { setActiveTab("report") } }}
//                     className={`px-6 py-2.5 rounded-xl text-sm font-semibold transition ${
//                       activeTab === "report" ? "bg-white text-black" : "text-zinc-400 hover:text-white"
//                     }`}
//                   >
//                     {reportLoading ? "Generating..." : "Full Report"}
//                   </button>
//                 </div>

//                 <button
//                   onClick={() => setShowRaw(!showRaw)}
//                   className="flex items-center gap-2 text-zinc-400 hover:text-white transition text-sm border border-zinc-700 px-4 py-2 rounded-xl"
//                 >
//                   {showRaw ? <FiChevronUp /> : <FiChevronDown />}
//                   {showRaw ? "Hide Raw JSON" : "View Raw JSON"}
//                 </button>
//               </div>

//               {/* RAW JSON */}
//               <AnimatePresence>
//                 {showRaw && (
//                   <motion.div
//                     initial={{ opacity: 0, height: 0 }}
//                     animate={{ opacity: 1, height: "auto" }}
//                     exit={{ opacity: 0, height: 0 }}
//                     transition={{ duration: 0.3 }}
//                     className="overflow-hidden mb-10"
//                   >
//                     <pre className="text-green-400 text-sm overflow-auto bg-zinc-900/80 backdrop-blur-sm p-6 rounded-2xl max-h-96">
//                       {JSON.stringify(report, null, 2)}
//                     </pre>
//                   </motion.div>
//                 )}
//               </AnimatePresence>

//               {/* TABS */}
//               <AnimatePresence mode="wait">

//                 {activeTab === "insights" && (
//                   <motion.div
//                     key="insights"
//                     initial={{ opacity: 0, y: 20 }}
//                     animate={{ opacity: 1, y: 0 }}
//                     exit={{ opacity: 0, y: -20 }}
//                     transition={{ duration: 0.4 }}
//                   >
//                     <div className="mb-8">
//                       <h2 className="text-4xl font-bold">Financial Snapshot</h2>
//                       <p className="text-zinc-500 text-sm mt-1">
//                         {report.rows_processed} transactions analysed · {new Date(report.report.generated_at).toLocaleString()}
//                       </p>
//                     </div>

//                     <div className="grid md:grid-cols-3 gap-6 mb-8">
//                       <div className="bg-zinc-900/80 backdrop-blur-sm p-6 rounded-3xl border border-zinc-800">
//                         <h3 className="text-zinc-400 text-sm mb-2">Total Income</h3>
//                         <p className="text-3xl font-bold text-green-400">{formatAmount(report.report.executive_summary.total_income)}</p>
//                       </div>
//                       <div className="bg-zinc-900/80 backdrop-blur-sm p-6 rounded-3xl border border-zinc-800">
//                         <h3 className="text-zinc-400 text-sm mb-2">Total Spending</h3>
//                         <p className="text-3xl font-bold text-red-400">{formatAmount(report.report.executive_summary.total_spending)}</p>
//                       </div>
//                       <div className="bg-zinc-900/80 backdrop-blur-sm p-6 rounded-3xl border border-zinc-800">
//                         <h3 className="text-zinc-400 text-sm mb-2">Average Transaction</h3>
//                         <p className="text-3xl font-bold">{formatAmount(report.report.executive_summary.average_spending)}</p>
//                       </div>
//                     </div>

//                     <div className="bg-zinc-900/80 backdrop-blur-sm border border-zinc-800 rounded-3xl p-6 mb-8">
//                       <div className="flex justify-between items-center mb-3">
//                         <h3 className="text-zinc-400 text-sm">Spending Ratio</h3>
//                         <span className={`text-sm font-semibold ${
//                           spendingPercent >= 90 ? "text-red-400" : spendingPercent >= 70 ? "text-yellow-400" : "text-green-400"
//                         }`}>
//                           {spendingPercent}% of income spent
//                         </span>
//                       </div>
//                       <div className="w-full bg-zinc-800 rounded-full h-3">
//                         <div
//                           className={`h-3 rounded-full transition-all duration-1000 ${
//                             spendingPercent >= 90 ? "bg-red-500" : spendingPercent >= 70 ? "bg-yellow-500" : "bg-green-500"
//                           }`}
//                           style={{ width: `${Math.min(spendingPercent, 100)}%` }}
//                         />
//                       </div>
//                       <p className="text-zinc-500 text-xs mt-2">
//                         {formatAmount(report.report.executive_summary.total_income - report.report.executive_summary.total_spending)} remaining after all spending
//                       </p>
//                     </div>

//                     <div className="grid md:grid-cols-2 gap-6 mb-8">
//                       <div className="bg-zinc-900/80 backdrop-blur-sm border border-zinc-800 rounded-3xl p-6">
//                         <h3 className="text-lg font-semibold mb-5">Transaction Breakdown</h3>
//                         <div className="space-y-3">
//                           <div className="flex justify-between items-center py-2 border-b border-zinc-800">
//                             <span className="text-zinc-400 text-sm">Transfers</span>
//                             <span className="font-semibold">{report.report.transaction_summary.transfer_transactions}</span>
//                           </div>
//                           <div className="flex justify-between items-center py-2 border-b border-zinc-800">
//                             <span className="text-zinc-400 text-sm">Bank Fees</span>
//                             <span className="font-semibold">{report.report.transaction_summary.fee_transactions}</span>
//                           </div>
//                           <div className="flex justify-between items-center py-2 border-b border-zinc-800">
//                             <span className="text-zinc-400 text-sm">Gambling</span>
//                             <span className={`font-semibold ${report.report.transaction_summary.gambling_transactions > 0 ? "text-red-400" : "text-green-400"}`}>
//                               {report.report.transaction_summary.gambling_transactions > 0
//                                 ? report.report.transaction_summary.gambling_transactions
//                                 : "None detected"}
//                             </span>
//                           </div>
//                           <div className="pt-2">
//                             <p className="text-zinc-500 text-xs mb-3">Top Categories</p>
//                             <div className="space-y-2">
//                               {report.report.transaction_summary.top_categories.map(([cat, count], i) => (
//                                 <div key={i} className="flex justify-between items-center py-2 border-b border-zinc-800">
//                                   <span className="text-zinc-400 text-sm capitalize">{cat}</span>
//                                   <span className="font-semibold">{count}</span>
//                                 </div>
//                               ))}
//                             </div>
//                           </div>
//                         </div>
//                       </div>

//                       <div className="bg-zinc-900/80 backdrop-blur-sm border border-zinc-800 rounded-3xl p-6">
//                         <h3 className="text-lg font-semibold mb-5">Risk Flags</h3>
//                         {report.report.risk_analysis.risks.length === 0 ? (
//                           <p className="text-green-400 text-sm">No risks detected.</p>
//                         ) : (
//                           <div className="space-y-3">
//                             {report.report.risk_analysis.risks.map((risk, i) => (
//                               <div key={i} className={`flex items-start gap-3 p-4 rounded-2xl border ${severityColor(risk.severity)}`}>
//                                 <div className="mt-0.5">{severityIcon(risk.severity)}</div>
//                                 <div>
//                                   <p className="text-sm font-semibold capitalize mb-0.5">{risk.risk.replace(/_/g, " ")}</p>
//                                   <p className="text-xs text-zinc-400">{risk.message}</p>
//                                 </div>
//                               </div>
//                             ))}
//                           </div>
//                         )}
//                       </div>
//                     </div>

//                     <div className="bg-zinc-900/80 backdrop-blur-sm border border-zinc-800 rounded-3xl p-8">
//                       <h3 className="text-2xl font-bold mb-2">AI Financial Insights</h3>
//                       <p className="text-zinc-500 text-sm mb-6">Generated by FITI intelligence engine</p>
//                       <div className="space-y-4">
//                         {report.report.ai_insights
//                           .split("\n")
//                           .filter(line => line.trim())
//                           .map((line, i) => (
//                             <div key={i} className="flex items-start gap-3">
//                               <span className="text-zinc-600 mt-1">—</span>
//                               <p className="text-zinc-300 leading-relaxed">{line.replace(/^\*\s*/, "")}</p>
//                             </div>
//                           ))}
//                       </div>
//                     </div>
//                   </motion.div>
//                 )}

//                 {activeTab === "report" && fullReport && (
//                   <motion.div
//                     key="report"
//                     initial={{ opacity: 0, y: 20 }}
//                     animate={{ opacity: 1, y: 0 }}
//                     exit={{ opacity: 0, y: -20 }}
//                     transition={{ duration: 0.4 }}
//                   >
//                     <FullReport reportData={fullReport} />
//                   </motion.div>
//                 )}

//                 {activeTab === "report" && reportLoading && (
//                   <motion.div key="report-loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
//                     <ProgressLoader active={reportLoading} steps={REPORT_STEPS} />
//                   </motion.div>
//                 )}

//               </AnimatePresence>
//             </motion.div>
//           )}

//         </div>
//       </div>
//     </div>
//   )
// }

// export default App











// import { useState } from "react"
// import { motion, AnimatePresence } from "framer-motion"
// import { FiUploadCloud, FiChevronDown, FiChevronUp, FiAlertTriangle, FiAlertCircle, FiInfo } from "react-icons/fi"
// import API from "./services/api"
// import bg from "/fiti-bg.jpg"
// import FullReport from "./components/FullReport"
// import ProgressLoader, { CLASSIFY_STEPS, REPORT_STEPS } from "./components/ProgressLoader"


// const MAX_FILE_SIZE_MB    = 10
// const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024

// const validateFile = (selectedFile) => {
//   if (!selectedFile) return "No file selected."

//   const ext = selectedFile.name.split(".").pop().toLowerCase()
//   if (!["csv", "xlsx"].includes(ext)) {
//     return "Only CSV and Excel (.xlsx) files are supported."
//   }

//   if (selectedFile.size > MAX_FILE_SIZE_BYTES) {
//     return `File is too large. Maximum size is ${MAX_FILE_SIZE_MB}MB.`
//   }

//   return null
// }


// function App() {

//   const [file, setFile]                       = useState(null)
//   const [loading, setLoading]                 = useState(false)
//   const [reportLoading, setReportLoading]     = useState(false)
//   const [report, setReport]                   = useState(null)
//   const [fullReport, setFullReport]           = useState(null)
//   const [error, setError]                     = useState("")
//   const [showRaw, setShowRaw]                 = useState(false)
//   const [activeTab, setActiveTab]             = useState("insights")
//   const [columnMapping, setColumnMapping]     = useState(null)
//   const [classifications, setClassifications] = useState(null)


//   const handleFileChange = (e) => {
//     const selectedFile = e.target.files[0]
//     if (!selectedFile) return

//     const validationError = validateFile(selectedFile)
//     if (validationError) {
//       setError(validationError)
//       setFile(null)
//       e.target.value = ""
//       return
//     }

//     setError("")
//     setFile(selectedFile)
//   }


//   const handleAnalysis = async () => {

//     if (!file) {
//       alert("Please upload a statement file.")
//       return
//     }

//     const validationError = validateFile(file)
//     if (validationError) {
//       setError(validationError)
//       return
//     }

//     try {

//       setLoading(true)
//       setError("")
//       setReport(null)
//       setFullReport(null)
//       setActiveTab("insights")

//       const formData = new FormData()
//       formData.append("file", file)

//       const response = await API.post(
//         "/classify",
//         formData,
//         {
//           headers: { "Content-Type": "multipart/form-data" },
//           timeout: 2000000
//         }
//       )

//       console.log(response.data)
//       setReport(response.data)
//       setColumnMapping(response.data.column_mapping)
//       setClassifications(response.data.classifications)

//     } catch (err) {
//       console.error("FITI ANALYSIS ERROR:", err)

//       const errorMessage =
//         err?.response?.data?.detail?.error ||
//         err?.response?.data?.detail?.message ||
//         err?.response?.data?.detail ||
//         err?.message ||
//         "Failed to analyze statement."

//       setError(
//         typeof errorMessage === "string"
//           ? errorMessage
//           : JSON.stringify(errorMessage)
//       )
//     } finally {
//       setLoading(false)
//     }
//   }

//   const handleFullReport = async () => {

//     if (!file || !classifications || !columnMapping) return

//     try {

//       setReportLoading(true)
//       setError("")

//       const formData = new FormData()
//       formData.append("file", file)
//       formData.append("classifications", JSON.stringify(classifications))
//       formData.append("column_mapping", JSON.stringify(columnMapping))
      
//       // Send the executive summary so backend uses real numbers
//       if (report?.report?.executive_summary) {
//         formData.append("executive_summary", JSON.stringify(report.report.executive_summary))
//       }

//       const response = await API.post(
//         "/report/generate",
//         formData,
//         {
//           headers: { "Content-Type": "multipart/form-data" },
//           timeout: 2000000
//         }
//       )

//       console.log(response.data)
//       setFullReport(response.data.report)
//       setActiveTab("report")

//     } catch (err) {
//       console.error(err)
//       setError("Failed to generate full report.")
//     } finally {
//       setReportLoading(false)
//     }
//   }


//   const currency        = report?.report?.executive_summary?.currency || "₦"
//   const spendingRatio   = report?.report?.executive_summary?.spending_ratio || 0
//   const spendingPercent = Math.round(spendingRatio * 100)

//   const formatAmount = (amount) => `${currency}${Number(amount).toLocaleString()}`

//   const severityIcon = (severity) => {
//     if (severity === "high")   return <FiAlertTriangle className="text-red-400"    size={18} />
//     if (severity === "medium") return <FiAlertCircle   className="text-yellow-400" size={18} />
//     return                            <FiInfo           className="text-blue-400"   size={18} />
//   }

//   const severityColor = (severity) => {
//     if (severity === "high")   return "border-red-500/40 bg-red-500/10"
//     if (severity === "medium") return "border-yellow-500/40 bg-yellow-500/10"
//     return "border-blue-500/40 bg-blue-500/10"
//   }


//   return (

//     <div
//       className="min-h-screen text-white"
//       style={{
//         backgroundImage:      `url(${bg})`,
//         backgroundSize:       "cover",
//         backgroundPosition:   "center",
//         backgroundAttachment: "fixed",
//         backgroundRepeat:     "no-repeat"
//       }}
//     >

//       <div className="min-h-screen bg-black/40">
//         <div className="max-w-6xl mx-auto px-6 py-16">


//           {/* HERO */}
//           <motion.div
//             initial={{ opacity: 0, y: 30 }}
//             animate={{ opacity: 1, y: 0 }}
//             transition={{ duration: 0.8 }}
//             className="text-center"
//           >
//             <h1 className="text-6xl font-bold mb-6">FITI AI</h1>
//             <p className="text-zinc-400 text-lg max-w-2xl mx-auto">
//               AI-powered financial intelligence system
//               for transaction statement analysis and reporting.
//             </p>
//           </motion.div>


//           {/* UPLOAD SECTION */}
//           <motion.div
//             initial={{ opacity: 0, scale: 0.95 }}
//             animate={{ opacity: 1, scale: 1 }}
//             transition={{ delay: 0.2 }}
//             className="mt-16"
//           >
//             <div className="bg-zinc-900/80 backdrop-blur-sm border border-zinc-800 rounded-3xl p-10">
//               <div className="flex flex-col items-center text-center">

//                 <div className="bg-zinc-800 p-5 rounded-full mb-6">
//                   <FiUploadCloud size={40} />
//                 </div>

//                 <h2 className="text-3xl font-semibold mb-3">Upload Statement</h2>
//                 <p className="text-zinc-400 mb-8">
//                   Supports CSV and Excel files from any bank. Max {MAX_FILE_SIZE_MB}MB.
//                 </p>

//                 <input
//                   type="file"
//                   accept=".csv,.xlsx"
//                   onChange={handleFileChange}
//                   className="bg-zinc-800 p-4 rounded-xl w-full max-w-md"
//                 />

//                 {file && !error && (
//                   <p className="text-zinc-500 text-xs mt-2">
//                     {file.name} — {(file.size / 1024 / 1024).toFixed(2)}MB
//                   </p>
//                 )}

//                 <button
//                   onClick={handleAnalysis}
//                   disabled={loading || !file}
//                   className={`mt-8 px-8 py-4 rounded-2xl font-semibold hover:scale-105 transition border disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 ${
//                     file
//                       ? "bg-transparent text-white border-white"
//                       : "bg-white text-black border-transparent"
//                   }`}
//                 >
//                   {loading ? "Analysing..." : "Analyze Statement"}
//                 </button>

//               </div>
//             </div>
//           </motion.div>


//           {/* LOADING */}
//           <ProgressLoader active={loading} steps={CLASSIFY_STEPS} />


//           {/* ERROR */}
//           {error && (
//             <motion.div
//               initial={{ opacity: 0, y: 10 }}
//               animate={{ opacity: 1, y: 0 }}
//               className="mt-10 text-center"
//             >
//               <div className="inline-flex items-center gap-2 bg-red-500/10 border border-red-500/30 text-red-400 px-6 py-3 rounded-2xl text-sm">
//                 <FiAlertTriangle size={16} />
//                 {error}
//               </div>
//             </motion.div>
//           )}


//           {/* REPORT SECTION */}
//           {report && (

//             <motion.div
//               initial={{ opacity: 0, y: 40 }}
//               animate={{ opacity: 1, y: 0 }}
//               transition={{ duration: 0.6 }}
//               className="mt-16"
//             >

//               {/* TAB NAVIGATION */}
//               <div className="flex items-center justify-between mb-10">

//                 <div className="flex gap-2 bg-zinc-900/80 backdrop-blur-sm border border-zinc-800 rounded-2xl p-1">

//                   <button
//                     onClick={() => setActiveTab("insights")}
//                     className={`px-6 py-2.5 rounded-xl text-sm font-semibold transition ${
//                       activeTab === "insights" ? "bg-white text-black" : "text-zinc-400 hover:text-white"
//                     }`}
//                   >
//                     AI Insights
//                   </button>

//                   <button
//                     onClick={() => {
//                       if (!fullReport) {
//                         handleFullReport()
//                       } else {
//                         setActiveTab("report")
//                       }
//                     }}
//                     className={`px-6 py-2.5 rounded-xl text-sm font-semibold transition ${
//                       activeTab === "report" ? "bg-white text-black" : "text-zinc-400 hover:text-white"
//                     }`}
//                   >
//                     {reportLoading ? "Generating..." : "Full Report"}
//                   </button>

//                 </div>

//                 <button
//                   onClick={() => setShowRaw(!showRaw)}
//                   className="flex items-center gap-2 text-zinc-400 hover:text-white transition text-sm border border-zinc-700 px-4 py-2 rounded-xl"
//                 >
//                   {showRaw ? <FiChevronUp /> : <FiChevronDown />}
//                   {showRaw ? "Hide Raw JSON" : "View Raw JSON"}
//                 </button>

//               </div>


//               {/* RAW JSON TOGGLE */}
//               <AnimatePresence>
//                 {showRaw && (
//                   <motion.div
//                     initial={{ opacity: 0, height: 0 }}
//                     animate={{ opacity: 1, height: "auto" }}
//                     exit={{ opacity: 0, height: 0 }}
//                     transition={{ duration: 0.3 }}
//                     className="overflow-hidden mb-10"
//                   >
//                     <pre className="text-green-400 text-sm overflow-auto bg-zinc-900/80 backdrop-blur-sm p-6 rounded-2xl max-h-96">
//                       {JSON.stringify(report, null, 2)}
//                     </pre>
//                   </motion.div>
//                 )}
//               </AnimatePresence>


//               {/* TABS */}
//               <AnimatePresence mode="wait">

//                 {/* AI INSIGHTS TAB */}
//                 {activeTab === "insights" && (
//                   <motion.div
//                     key="insights"
//                     initial={{ opacity: 0, y: 20 }}
//                     animate={{ opacity: 1, y: 0 }}
//                     exit={{ opacity: 0, y: -20 }}
//                     transition={{ duration: 0.4 }}
//                   >

//                     <div className="mb-8">
//                       <h2 className="text-4xl font-bold">Financial Snapshot</h2>
//                       <p className="text-zinc-500 text-sm mt-1">
//                         {report.rows_processed} transactions analysed · {new Date(report.report.generated_at).toLocaleString()}
//                       </p>
//                     </div>


//                     {/* EXECUTIVE SUMMARY CARDS */}
//                     <div className="grid md:grid-cols-3 gap-6 mb-8">

//                       <div className="bg-zinc-900/80 backdrop-blur-sm p-6 rounded-3xl border border-zinc-800">
//                         <h3 className="text-zinc-400 text-sm mb-2">Total Income</h3>
//                         <p className="text-3xl font-bold text-green-400">
//                           {formatAmount(report.report.executive_summary.total_income)}
//                         </p>
//                       </div>

//                       <div className="bg-zinc-900/80 backdrop-blur-sm p-6 rounded-3xl border border-zinc-800">
//                         <h3 className="text-zinc-400 text-sm mb-2">Total Spending</h3>
//                         <p className="text-3xl font-bold text-red-400">
//                           {formatAmount(report.report.executive_summary.total_spending)}
//                         </p>
//                       </div>

//                       <div className="bg-zinc-900/80 backdrop-blur-sm p-6 rounded-3xl border border-zinc-800">
//                         <h3 className="text-zinc-400 text-sm mb-2">Average Transaction</h3>
//                         <p className="text-3xl font-bold">
//                           {formatAmount(report.report.executive_summary.average_spending)}
//                         </p>
//                       </div>

//                     </div>


//                     {/* SPENDING RATIO */}
//                     <div className="bg-zinc-900/80 backdrop-blur-sm border border-zinc-800 rounded-3xl p-6 mb-8">

//                       <div className="flex justify-between items-center mb-3">
//                         <h3 className="text-zinc-400 text-sm">Spending Ratio</h3>
//                         <span className={`text-sm font-semibold ${
//                           spendingPercent >= 90 ? "text-red-400" : spendingPercent >= 70 ? "text-yellow-400" : "text-green-400"
//                         }`}>
//                           {spendingPercent}% of income spent
//                         </span>
//                       </div>

//                       <div className="w-full bg-zinc-800 rounded-full h-3">
//                         <div
//                           className={`h-3 rounded-full transition-all duration-1000 ${
//                             spendingPercent >= 90 ? "bg-red-500" : spendingPercent >= 70 ? "bg-yellow-500" : "bg-green-500"
//                           }`}
//                           style={{ width: `${spendingPercent}%` }}
//                         />
//                       </div>

//                       <p className="text-zinc-500 text-xs mt-2">
//                         {formatAmount(report.report.executive_summary.total_income - report.report.executive_summary.total_spending)} remaining after all spending
//                       </p>

//                     </div>


//                     {/* TRANSACTION BREAKDOWN + RISK FLAGS */}
//                     <div className="grid md:grid-cols-2 gap-6 mb-8">

//                       <div className="bg-zinc-900/80 backdrop-blur-sm border border-zinc-800 rounded-3xl p-6">
//                         <h3 className="text-lg font-semibold mb-5">Transaction Breakdown</h3>
//                         <div className="space-y-3">

//                           <div className="flex justify-between items-center py-2 border-b border-zinc-800">
//                             <span className="text-zinc-400 text-sm">Transfers</span>
//                             <span className="font-semibold">{report.report.transaction_summary.transfer_transactions}</span>
//                           </div>

//                           <div className="flex justify-between items-center py-2 border-b border-zinc-800">
//                             <span className="text-zinc-400 text-sm">Bank Fees</span>
//                             <span className="font-semibold">{report.report.transaction_summary.fee_transactions}</span>
//                           </div>

//                           <div className="flex justify-between items-center py-2 border-b border-zinc-800">
//                             <span className="text-zinc-400 text-sm">Gambling</span>
//                             <span className={`font-semibold ${
//                               report.report.transaction_summary.gambling_transactions > 0 ? "text-red-400" : "text-green-400"
//                             }`}>
//                               {report.report.transaction_summary.gambling_transactions > 0
//                                 ? report.report.transaction_summary.gambling_transactions
//                                 : "None detected"}
//                             </span>
//                           </div>

//                           <div className="pt-2">
//                             <p className="text-zinc-500 text-xs mb-3">Top Categories</p>
//                             <div className="space-y-2">
//                               {report.report.transaction_summary.top_categories.map(([cat, count], i) => (
//                                 <div key={i} className="flex justify-between items-center py-2 border-b border-zinc-800">
//                                   <span className="text-zinc-400 text-sm capitalize">{cat}</span>
//                                   <span className="font-semibold">{count}</span>
//                                 </div>
//                               ))}
//                             </div>
//                           </div>

//                         </div>
//                       </div>


//                       <div className="bg-zinc-900/80 backdrop-blur-sm border border-zinc-800 rounded-3xl p-6">
//                         <h3 className="text-lg font-semibold mb-5">Risk Flags</h3>
//                         {report.report.risk_analysis.risks.length === 0 ? (
//                           <p className="text-green-400 text-sm">No risks detected.</p>
//                         ) : (
//                           <div className="space-y-3">
//                             {report.report.risk_analysis.risks.map((risk, i) => (
//                               <div
//                                 key={i}
//                                 className={`flex items-start gap-3 p-4 rounded-2xl border ${severityColor(risk.severity)}`}
//                               >
//                                 <div className="mt-0.5">{severityIcon(risk.severity)}</div>
//                                 <div>
//                                   <p className="text-sm font-semibold capitalize mb-0.5">
//                                     {risk.risk.replace(/_/g, " ")}
//                                   </p>
//                                   <p className="text-xs text-zinc-400">{risk.message}</p>
//                                 </div>
//                               </div>
//                             ))}
//                           </div>
//                         )}
//                       </div>

//                     </div>


//                     {/* AI INSIGHTS */}
//                     <div className="bg-zinc-900/80 backdrop-blur-sm border border-zinc-800 rounded-3xl p-8">
//                       <h3 className="text-2xl font-bold mb-2">AI Financial Insights</h3>
//                       <p className="text-zinc-500 text-sm mb-6">Generated by FITI intelligence engine</p>
//                       <div className="space-y-4">
//                         {report.report.ai_insights
//                           .split("\n")
//                           .filter(line => line.trim())
//                           .map((line, i) => (
//                             <div key={i} className="flex items-start gap-3">
//                               <span className="text-zinc-600 mt-1">—</span>
//                               <p className="text-zinc-300 leading-relaxed">
//                                 {line.replace(/^\*\s*/, "")}
//                               </p>
//                             </div>
//                           ))}
//                       </div>
//                     </div>

//                   </motion.div>
//                 )}


//                 {/* FULL REPORT TAB */}
//                 {activeTab === "report" && fullReport && (
//                   <motion.div
//                     key="report"
//                     initial={{ opacity: 0, y: 20 }}
//                     animate={{ opacity: 1, y: 0 }}
//                     exit={{ opacity: 0, y: -20 }}
//                     transition={{ duration: 0.4 }}
//                   >
//                     <FullReport reportData={fullReport} />
//                   </motion.div>
//                 )}


//                 {/* FULL REPORT LOADING */}
//                 {activeTab === "report" && reportLoading && (
//                   <motion.div
//                     key="report-loading"
//                     initial={{ opacity: 0 }}
//                     animate={{ opacity: 1 }}
//                   >
//                     <ProgressLoader active={reportLoading} steps={REPORT_STEPS} />
//                   </motion.div>
//                 )}

//               </AnimatePresence>

//             </motion.div>
//           )}

//         </div>
//       </div>

//     </div>
//   )
// }

// export default App
















