import { useState, useRef, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  FiUploadCloud, FiChevronDown, FiChevronUp,
  FiAlertTriangle, FiAlertCircle, FiInfo,
  FiMessageSquare, FiTrendingUp, FiZap, FiBarChart2, FiCpu,
  FiHome, FiList, FiMail, FiFile, FiCheckCircle
} from "react-icons/fi"
import API from "./services/api"
import bg from "/fiti-bg.jpg"
import FullReport from "./components/FullReport"
import ProgressLoader, { CLASSIFY_STEPS, REPORT_STEPS } from "./components/ProgressLoader"


// ─── CONSTANTS ────────────────────────────────────────────────────────────────
const MAX_FILE_SIZE_MB    = 10
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024

const validateFile = (selectedFile) => {
  if (!selectedFile) return "No file selected."
  const ext = selectedFile.name.split(".").pop().toLowerCase()
  if (!["csv", "xlsx"].includes(ext)) return "Only CSV and Excel (.xlsx) files are supported."
  if (selectedFile.size > MAX_FILE_SIZE_BYTES) return `File is too large. Maximum size is ${MAX_FILE_SIZE_MB}MB.`
  return null
}


// ─── SLIDESHOW DATA ───────────────────────────────────────────────────────────
const SLIDES = [
  {
    icon:     FiBarChart2,
    title:    "Know Your Financial Self",
    subtitle: "FITI reveals the behavioral patterns behind your spending",
    gradient: "from-violet-600 via-purple-600 to-indigo-700",
    glow:     "shadow-violet-500/30",
    dot:      "bg-violet-400",
  },
  {
    icon:     FiTrendingUp,
    title:    "16 Chart Types Generated",
    subtitle: "Every angle of your financial data visualized automatically",
    gradient: "from-emerald-500 via-teal-600 to-cyan-700",
    glow:     "shadow-emerald-500/30",
    dot:      "bg-emerald-400",
  },
  {
    icon:     FiZap,
    title:    "Anomaly Detection",
    subtitle: "Unusual spending days spotted and flagged automatically",
    gradient: "from-orange-500 via-amber-500 to-yellow-600",
    glow:     "shadow-orange-500/30",
    dot:      "bg-orange-400",
  },
  {
    icon:     FiMessageSquare,
    title:    "AI Financial Chat",
    subtitle: "Ask anything about your transactions in plain language",
    gradient: "from-rose-500 via-pink-600 to-fuchsia-700",
    glow:     "shadow-rose-500/30",
    dot:      "bg-rose-400",
  },
  {
    icon:     FiCpu,
    title:    "Multi-Model AI Pipeline",
    subtitle: "4 specialized models working in sequence on your data",
    gradient: "from-blue-500 via-cyan-600 to-teal-700",
    glow:     "shadow-blue-500/30",
    dot:      "bg-blue-400",
  },
]


// ─── NAVBAR ───────────────────────────────────────────────────────────────────
function Navbar({ onHomeClick }) {
  const links = [
    { label: "Home",    icon: FiHome,  action: onHomeClick },
    { label: "Logs",    icon: FiList,  action: () => {} },
    { label: "Contact", icon: FiMail,  action: () => {} },
  ]

  return (
    <motion.nav
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="fixed top-0 left-0 right-0 z-50"
    >
      <div
        className="backdrop-blur-md border-b border-white/10"
        style={{ background: "rgba(9, 9, 11, 0.85)" }}
      >
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">

          {/* Logo */}
          <motion.div
            className="flex items-center gap-2 cursor-pointer"
            onClick={onHomeClick}
            whileHover={{ scale: 1.02 }}
          >
            <span
              className="text-xl font-black tracking-wider"
              style={{ fontFamily: "'Space Grotesk', 'Syne', sans-serif", letterSpacing: "0.15em" }}
            >
              FITI
            </span>
            <span
              className="text-xs font-medium px-2 py-0.5 rounded-full border"
              style={{ color: "#a78bfa", borderColor: "#a78bfa40", background: "#a78bfa10" }}
            >
              AI
            </span>
          </motion.div>

          {/* Nav links */}
          <div className="flex items-center gap-8">
            {links.map(({ label, icon: Icon, action }) => (
              <NavLink key={label} label={label} Icon={Icon} onClick={action} />
            ))}
          </div>

        </div>
      </div>
    </motion.nav>
  )
}

function NavLink({ label, Icon, onClick }) {
  const [hovered, setHovered] = useState(false)

  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="relative flex items-center gap-1.5 text-sm font-medium transition-colors duration-200"
      style={{ color: hovered ? "#ffffff" : "#a1a1aa" }}
    >
      <Icon size={14} />
      {label}
      <motion.div
        className="absolute -bottom-1 left-0 right-0 h-px bg-white"
        initial={{ scaleX: 0, opacity: 0 }}
        animate={{ scaleX: hovered ? 1 : 0, opacity: hovered ? 1 : 0 }}
        transition={{ duration: 0.2, ease: "easeOut" }}
        style={{ originX: 0 }}
      />
    </button>
  )
}


// ─── FEATURE SLIDESHOW ────────────────────────────────────────────────────────
function FeatureSlideshow() {
  const [current, setCurrent] = useState(0)

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent(prev => (prev + 1) % SLIDES.length)
    }, 3000)
    return () => clearInterval(timer)
  }, [])

  const slide = SLIDES[current]
  const Icon  = slide.icon

  return (
    <div className="w-full">
      <div
        className={`relative rounded-3xl overflow-hidden shadow-2xl ${slide.glow}`}
        style={{ minHeight: "320px" }}
      >
        {/* Animated gradient background */}
        <AnimatePresence mode="wait">
          <motion.div
            key={current}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6 }}
            className={`absolute inset-0 bg-gradient-to-br ${slide.gradient}`}
          />
        </AnimatePresence>

        {/* Noise texture overlay */}
        <div
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.4'/%3E%3C/svg%3E")`,
            backgroundSize: "128px 128px",
          }}
        />

        {/* Decorative circle */}
        <div
          className="absolute -top-16 -right-16 w-64 h-64 rounded-full opacity-20"
          style={{ background: "rgba(255,255,255,0.3)", filter: "blur(40px)" }}
        />
        <div
          className="absolute -bottom-12 -left-12 w-48 h-48 rounded-full opacity-15"
          style={{ background: "rgba(255,255,255,0.2)", filter: "blur(30px)" }}
        />

        {/* Content */}
        <div className="relative z-10 flex flex-col items-center justify-center text-center px-10 py-16">
          <AnimatePresence mode="wait">
            <motion.div
              key={current}
              initial={{ opacity: 0, y: 24, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -16, scale: 0.97 }}
              transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
              className="flex flex-col items-center gap-5"
            >
              {/* Icon bubble */}
              <div
                className="flex items-center justify-center w-16 h-16 rounded-2xl"
                style={{ background: "rgba(255,255,255,0.2)", backdropFilter: "blur(8px)" }}
              >
                <Icon size={30} color="white" />
              </div>

              <div>
                <h3 className="text-3xl font-bold text-white mb-3 tracking-tight">
                  {slide.title}
                </h3>
                <p className="text-white/75 text-base max-w-sm leading-relaxed">
                  {slide.subtitle}
                </p>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* Slide dots */}
      <div className="flex items-center justify-center gap-2 mt-5">
        {SLIDES.map((s, i) => (
          <button
            key={i}
            onClick={() => setCurrent(i)}
            className="transition-all duration-300"
          >
            <div
              className={`rounded-full transition-all duration-300 ${s.dot} ${
                i === current ? "w-6 h-2 opacity-100" : "w-2 h-2 opacity-40"
              }`}
            />
          </button>
        ))}
      </div>
    </div>
  )
}


// ─── UPLOAD ZONE ─────────────────────────────────────────────────────────────
function UploadZone({ file, onFileChange, onAnalyze, loading, error }) {
  const inputRef   = useRef(null)
  const [drag, setDrag] = useState(false)

  const handleDrop = (e) => {
    e.preventDefault()
    setDrag(false)
    const dropped = e.dataTransfer.files[0]
    if (dropped) onFileChange({ target: { files: [dropped] } })
  }

  return (
    <div className="flex flex-col items-center w-full">

      {/* Drop zone */}
      <div
        onDragOver={(e) => { e.preventDefault(); setDrag(true) }}
        onDragLeave={() => setDrag(false)}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        className="w-full cursor-pointer transition-all duration-300"
        style={{
          border: `2px dashed ${drag ? "#a78bfa" : file ? "#4ade80" : "#3f3f46"}`,
          borderRadius: "20px",
          padding: "40px 24px",
          background: drag
            ? "rgba(167,139,250,0.06)"
            : file
              ? "rgba(74,222,128,0.04)"
              : "rgba(39,39,42,0.4)",
          transition: "all 0.25s ease",
        }}
      >
        <input
          ref={inputRef}
          type="file"
          accept=".csv,.xlsx"
          onChange={onFileChange}
          className="hidden"
        />

        <div className="flex flex-col items-center gap-4 text-center">
          {file ? (
            <>
              <div
                className="flex items-center justify-center w-14 h-14 rounded-2xl"
                style={{ background: "rgba(74,222,128,0.12)" }}
              >
                <FiCheckCircle size={28} color="#4ade80" />
              </div>
              <div>
                <p className="text-white font-semibold text-sm">{file.name}</p>
                <p className="text-zinc-500 text-xs mt-1">
                  {(file.size / 1024 / 1024).toFixed(2)} MB — ready to analyze
                </p>
              </div>
              <p className="text-zinc-600 text-xs">click to change file</p>
            </>
          ) : (
            <>
              <div
                className="flex items-center justify-center w-14 h-14 rounded-2xl"
                style={{ background: "rgba(167,139,250,0.12)" }}
              >
                <FiUploadCloud size={28} color="#a78bfa" />
              </div>
              <div>
                <p className="text-white font-semibold text-sm">
                  {drag ? "Drop it here" : "Drop your statement here"}
                </p>
                <p className="text-zinc-500 text-xs mt-1">
                  or click to browse — CSV or Excel, max {MAX_FILE_SIZE_MB}MB
                </p>
              </div>
              <div className="flex items-center gap-2 mt-1">
                {["GTB", "Access", "Moniepoint", "UBA", "Zenith", "UK Banks"].map(b => (
                  <span
                    key={b}
                    className="text-xs px-2 py-0.5 rounded-full"
                    style={{ background: "rgba(255,255,255,0.06)", color: "#71717a" }}
                  >
                    {b}
                  </span>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Error */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-2 mt-4 text-red-400 text-sm"
        >
          <FiAlertTriangle size={14} />
          {error}
        </motion.div>
      )}

      {/* Analyze button */}
      <motion.button
        onClick={onAnalyze}
        disabled={loading || !file}
        whileHover={!loading && file ? { scale: 1.02 } : {}}
        whileTap={!loading && file ? { scale: 0.98 } : {}}
        className="mt-6 w-full py-4 rounded-2xl font-semibold text-sm tracking-wide transition-all duration-300 disabled:opacity-40 disabled:cursor-not-allowed"
        style={{
          background: file && !loading
            ? "linear-gradient(135deg, #a78bfa, #818cf8)"
            : "rgba(255,255,255,0.06)",
          color: file && !loading ? "#ffffff" : "#71717a",
          border: "none",
          boxShadow: file && !loading ? "0 0 24px rgba(167,139,250,0.3)" : "none",
        }}
      >
        {loading ? "Analysing..." : "Analyze Statement"}
      </motion.button>

    </div>
  )
}


// ─── MAIN APP ─────────────────────────────────────────────────────────────────
function App() {

  const [file, setFile]                       = useState(null)
  const [loading, setLoading]                 = useState(false)
  const [reportLoading, setReportLoading]     = useState(false)
  const [report, setReport]                   = useState(null)
  const [fullReport, setFullReport]           = useState(null)
  const [error, setError]                     = useState("")
  const [showRaw, setShowRaw]                 = useState(false)
  const [activeTab, setActiveTab]             = useState("insights")
  const [columnMapping, setColumnMapping]     = useState(null)
  const [classifications, setClassifications] = useState(null)

  const heroRef = useRef(null)

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0]
    if (!selectedFile) return
    const validationError = validateFile(selectedFile)
    if (validationError) {
      setError(validationError)
      setFile(null)
      return
    }
    setError("")
    setFile(selectedFile)
  }

  const handleAnalysis = async () => {
    if (!file) return
    const validationError = validateFile(file)
    if (validationError) { setError(validationError); return }

    try {
      setLoading(true)
      setError("")
      setReport(null)
      setFullReport(null)
      setActiveTab("insights")

      const formData = new FormData()
      formData.append("file", file)

      const response = await API.post("/classify", formData, {
        headers: { "Content-Type": "multipart/form-data" },
        timeout: 2000000,
      })

      setReport(response.data)
      setColumnMapping(response.data.column_mapping)
      setClassifications(response.data.classifications)

    } catch (err) {
      const errorMessage =
        err?.response?.data?.detail?.error ||
        err?.response?.data?.detail?.message ||
        err?.response?.data?.detail ||
        err?.message ||
        "Failed to analyze statement."
      setError(typeof errorMessage === "string" ? errorMessage : JSON.stringify(errorMessage))
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
  const formatAmount    = (amount) => `${currency}${Number(amount).toLocaleString()}`

  const severityIcon = (severity) => {
    if (severity === "high")   return <FiAlertTriangle className="text-red-400"    size={18} />
    if (severity === "medium") return <FiAlertCircle   className="text-yellow-400" size={18} />
    return                            <FiInfo           className="text-blue-400"   size={18} />
  }

  const severityColor = (severity) => {
    if (severity === "high")   return "border-red-500/40 bg-red-500/10"
    if (severity === "medium") return "border-yellow-500/40 bg-yellow-500/10"
    return "border-blue-500/40 bg-blue-500/10"
  }

  return (
    <div
      className="min-h-screen text-white"
      style={{
        backgroundImage:      `url(${bg})`,
        backgroundSize:       "cover",
        backgroundPosition:   "center",
        backgroundAttachment: "fixed",
        backgroundRepeat:     "no-repeat",
      }}
    >
      <div className="min-h-screen bg-black/40">

        {/* NAVBAR */}
        <Navbar onHomeClick={scrollToTop} />

        <div className="max-w-6xl mx-auto px-6 pt-32 pb-16">

          {/* HERO */}
          <motion.div
            ref={heroRef}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h1
              className="text-6xl font-black mb-4 tracking-tight"
              style={{ letterSpacing: "-0.02em" }}
            >
              FITI AI
            </h1>
            <p className="text-zinc-400 text-lg max-w-2xl mx-auto leading-relaxed">
              AI-powered financial intelligence system for transaction statement analysis and reporting.
            </p>
          </motion.div>

          {/* UPLOAD / SLIDESHOW SECTION */}
          <motion.div
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
          >
            <div
              className="rounded-3xl p-8 md:p-10"
              style={{
                background:    "rgba(18,18,20,0.85)",
                backdropFilter: "blur(16px)",
                border:        "1px solid rgba(255,255,255,0.07)",
                minHeight:     "480px",
              }}
            >
              <AnimatePresence mode="wait">
                {loading ? (
                  <motion.div
                    key="slideshow"
                    initial={{ opacity: 0, scale: 0.97 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.97 }}
                    transition={{ duration: 0.4 }}
                  >
                    <FeatureSlideshow />
                  </motion.div>
                ) : (
                  <motion.div
                    key="upload"
                    initial={{ opacity: 0, scale: 0.97 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.97 }}
                    transition={{ duration: 0.4 }}
                    className="flex flex-col items-center"
                  >
                    <div className="mb-6 text-center">
                      <h2 className="text-2xl font-bold mb-2">Upload Statement</h2>
                      <p className="text-zinc-500 text-sm">
                        Any bank, any format. FITI figures it out.
                      </p>
                    </div>
                    <div className="w-full max-w-md">
                      <UploadZone
                        file={file}
                        onFileChange={handleFileChange}
                        onAnalyze={handleAnalysis}
                        loading={loading}
                        error={error}
                      />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>

          {/* PROGRESS LOADER */}
          <ProgressLoader active={loading} steps={CLASSIFY_STEPS} />

          {/* REPORT SECTION */}
          {report && (
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="mt-16"
            >

              {/* TAB NAVIGATION */}
              <div className="flex items-center justify-between mb-10">
                <div
                  className="flex gap-1 p-1 rounded-2xl"
                  style={{ background: "rgba(18,18,20,0.85)", border: "1px solid rgba(255,255,255,0.07)" }}
                >
                  <button
                    onClick={() => setActiveTab("insights")}
                    className={`px-6 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 ${
                      activeTab === "insights" ? "bg-white text-black" : "text-zinc-400 hover:text-white"
                    }`}
                  >
                    AI Insights
                  </button>
                  <button
                    onClick={() => { if (!fullReport) { handleFullReport() } else { setActiveTab("report") } }}
                    className={`px-6 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 ${
                      activeTab === "report" ? "bg-white text-black" : "text-zinc-400 hover:text-white"
                    }`}
                  >
                    {reportLoading ? "Generating..." : "Full Report"}
                  </button>
                </div>

                <button
                  onClick={() => setShowRaw(!showRaw)}
                  className="flex items-center gap-2 text-zinc-400 hover:text-white transition text-sm border border-zinc-700 px-4 py-2 rounded-xl"
                >
                  {showRaw ? <FiChevronUp /> : <FiChevronDown />}
                  {showRaw ? "Hide Raw JSON" : "View Raw JSON"}
                </button>
              </div>

              {/* RAW JSON */}
              <AnimatePresence>
                {showRaw && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3 }}
                    className="overflow-hidden mb-10"
                  >
                    <pre className="text-green-400 text-sm overflow-auto bg-zinc-900/80 backdrop-blur-sm p-6 rounded-2xl max-h-96">
                      {JSON.stringify(report, null, 2)}
                    </pre>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* TABS */}
              <AnimatePresence mode="wait">

                {activeTab === "insights" && (
                  <motion.div
                    key="insights"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.4 }}
                  >
                    <div className="mb-8">
                      <h2 className="text-4xl font-bold">Financial Snapshot</h2>
                      <p className="text-zinc-500 text-sm mt-1">
                        {report.rows_processed} transactions analysed · {new Date(report.report.generated_at).toLocaleString()}
                      </p>
                    </div>

                    {/* EXECUTIVE SUMMARY CARDS */}
                    <div className="grid md:grid-cols-3 gap-6 mb-8">
                      <div className="bg-zinc-900/80 backdrop-blur-sm p-6 rounded-3xl border border-zinc-800">
                        <h3 className="text-zinc-400 text-sm mb-2">Total Income</h3>
                        <p className="text-3xl font-bold text-green-400">
                          {formatAmount(report.report.executive_summary.total_income)}
                        </p>
                      </div>
                      <div className="bg-zinc-900/80 backdrop-blur-sm p-6 rounded-3xl border border-zinc-800">
                        <h3 className="text-zinc-400 text-sm mb-2">Total Spending</h3>
                        <p className="text-3xl font-bold text-red-400">
                          {formatAmount(report.report.executive_summary.total_spending)}
                        </p>
                      </div>
                      <div className="bg-zinc-900/80 backdrop-blur-sm p-6 rounded-3xl border border-zinc-800">
                        <h3 className="text-zinc-400 text-sm mb-2">Average Transaction</h3>
                        <p className="text-3xl font-bold">
                          {formatAmount(report.report.executive_summary.average_spending)}
                        </p>
                      </div>
                    </div>

                    {/* SPENDING RATIO */}
                    <div className="bg-zinc-900/80 backdrop-blur-sm border border-zinc-800 rounded-3xl p-6 mb-8">
                      <div className="flex justify-between items-center mb-3">
                        <h3 className="text-zinc-400 text-sm">Spending Ratio</h3>
                        <span className={`text-sm font-semibold ${
                          spendingPercent >= 90 ? "text-red-400" : spendingPercent >= 70 ? "text-yellow-400" : "text-green-400"
                        }`}>
                          {spendingPercent}% of income spent
                        </span>
                      </div>
                      <div className="w-full bg-zinc-800 rounded-full h-3">
                        <div
                          className={`h-3 rounded-full transition-all duration-1000 ${
                            spendingPercent >= 90 ? "bg-red-500" : spendingPercent >= 70 ? "bg-yellow-500" : "bg-green-500"
                          }`}
                          style={{ width: `${Math.min(spendingPercent, 100)}%` }}
                        />
                      </div>
                      <p className="text-zinc-500 text-xs mt-2">
                        {formatAmount(report.report.executive_summary.total_income - report.report.executive_summary.total_spending)} remaining after all spending
                      </p>
                    </div>

                    {/* TRANSACTION BREAKDOWN + RISK FLAGS */}
                    <div className="grid md:grid-cols-2 gap-6 mb-8">
                      <div className="bg-zinc-900/80 backdrop-blur-sm border border-zinc-800 rounded-3xl p-6">
                        <h3 className="text-lg font-semibold mb-5">Transaction Breakdown</h3>
                        <div className="space-y-3">
                          <div className="flex justify-between items-center py-2 border-b border-zinc-800">
                            <span className="text-zinc-400 text-sm">Transfers</span>
                            <span className="font-semibold">{report.report.transaction_summary.transfer_transactions}</span>
                          </div>
                          <div className="flex justify-between items-center py-2 border-b border-zinc-800">
                            <span className="text-zinc-400 text-sm">Bank Fees</span>
                            <span className="font-semibold">{report.report.transaction_summary.fee_transactions}</span>
                          </div>
                          <div className="flex justify-between items-center py-2 border-b border-zinc-800">
                            <span className="text-zinc-400 text-sm">Gambling</span>
                            <span className={`font-semibold ${
                              report.report.transaction_summary.gambling_transactions > 0 ? "text-red-400" : "text-green-400"
                            }`}>
                              {report.report.transaction_summary.gambling_transactions > 0
                                ? report.report.transaction_summary.gambling_transactions
                                : "None detected"}
                            </span>
                          </div>
                          <div className="pt-2">
                            <p className="text-zinc-500 text-xs mb-3">Top Categories</p>
                            <div className="space-y-2">
                              {report.report.transaction_summary.top_categories.map(([cat, count], i) => (
                                <div key={i} className="flex justify-between items-center py-2 border-b border-zinc-800">
                                  <span className="text-zinc-400 text-sm capitalize">{cat}</span>
                                  <span className="font-semibold">{count}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="bg-zinc-900/80 backdrop-blur-sm border border-zinc-800 rounded-3xl p-6">
                        <h3 className="text-lg font-semibold mb-5">Risk Flags</h3>
                        {report.report.risk_analysis.risks.length === 0 ? (
                          <p className="text-green-400 text-sm">No risks detected.</p>
                        ) : (
                          <div className="space-y-3">
                            {report.report.risk_analysis.risks.map((risk, i) => (
                              <div key={i} className={`flex items-start gap-3 p-4 rounded-2xl border ${severityColor(risk.severity)}`}>
                                <div className="mt-0.5">{severityIcon(risk.severity)}</div>
                                <div>
                                  <p className="text-sm font-semibold capitalize mb-0.5">
                                    {risk.risk.replace(/_/g, " ")}
                                  </p>
                                  <p className="text-xs text-zinc-400">{risk.message}</p>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* AI INSIGHTS */}
                    <div className="bg-zinc-900/80 backdrop-blur-sm border border-zinc-800 rounded-3xl p-8">
                      <h3 className="text-2xl font-bold mb-2">AI Financial Insights</h3>
                      <p className="text-zinc-500 text-sm mb-6">Generated by FITI intelligence engine</p>
                      <div className="space-y-4">
                        {report.report.ai_insights
                          .split("\n")
                          .filter(line => line.trim())
                          .map((line, i) => (
                            <div key={i} className="flex items-start gap-3">
                              <span className="text-zinc-600 mt-1">—</span>
                              <p className="text-zinc-300 leading-relaxed">
                                {line.replace(/^\*\s*/, "")}
                              </p>
                            </div>
                          ))}
                      </div>
                    </div>

                  </motion.div>
                )}

                {activeTab === "report" && fullReport && (
                  <motion.div
                    key="report"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.4 }}
                  >
                    <FullReport reportData={fullReport} />
                  </motion.div>
                )}

                {activeTab === "report" && reportLoading && (
                  <motion.div
                    key="report-loading"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                  >
                    <ProgressLoader active={reportLoading} steps={REPORT_STEPS} />
                  </motion.div>
                )}

              </AnimatePresence>
            </motion.div>
          )}

        </div>
      </div>
    </div>
  )
}

export default App





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
















