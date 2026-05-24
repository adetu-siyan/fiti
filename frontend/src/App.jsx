import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { FiUploadCloud, FiChevronDown, FiChevronUp, FiAlertTriangle, FiAlertCircle, FiInfo } from "react-icons/fi"
import API from "./services/api"
import bg from "/fiti-bg.jpg"
import FullReport from "./components/FullReport"
import ProgressLoader, { CLASSIFY_STEPS, REPORT_STEPS } from "./components/ProgressLoader"


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


  const handleFileChange = (e) => {
    setFile(e.target.files[0])
  }


  const handleAnalysis = async () => {

    if (!file) {
      alert("Please upload a statement file.")
      return
    }

    try {

      setLoading(true)
      setError("")
      setReport(null)
      setFullReport(null)
      setActiveTab("insights")

      const formData = new FormData()
      formData.append("file", file)

      const response = await API.post(
        "/classify",
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
          timeout: 2000000
        }
      )

      console.log(response.data)
      setReport(response.data)
      setColumnMapping(response.data.column_mapping)
      setClassifications(response.data.classifications)

    } catch (err) {
      console.error(err)
      setError("Failed to analyze statement.")
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

      const response = await API.post(
        "/report/generate",
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
          timeout: 2000000
        }
      )

      console.log(response.data)
      setFullReport(response.data.report)
      setActiveTab("report")

    } catch (err) {
      console.error(err)
      setError("Failed to generate full report.")
    } finally {
      setReportLoading(false)
    }
  }


  const currency        = report?.report?.executive_summary?.currency || "₦"
  const spendingRatio   = report?.report?.executive_summary?.spending_ratio || 0
  const spendingPercent = Math.round(spendingRatio * 100)

  const formatAmount = (amount) => `${currency}${Number(amount).toLocaleString()}`

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
        backgroundRepeat:     "no-repeat"
      }}
    >

      <div className="min-h-screen bg-black/40">
        <div className="max-w-6xl mx-auto px-6 py-16">


          {/* HERO */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center"
          >
            <h1 className="text-6xl font-bold mb-6">FITI AI</h1>
            <p className="text-zinc-400 text-lg max-w-2xl mx-auto">
              AI-powered financial intelligence system
              for transaction statement analysis and reporting.
            </p>
          </motion.div>


          {/* UPLOAD SECTION */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="mt-16"
          >
            <div className="bg-zinc-900/80 backdrop-blur-sm border border-zinc-800 rounded-3xl p-10">
              <div className="flex flex-col items-center text-center">

                <div className="bg-zinc-800 p-5 rounded-full mb-6">
                  <FiUploadCloud size={40} />
                </div>

                <h2 className="text-3xl font-semibold mb-3">Upload Statement</h2>
                <p className="text-zinc-400 mb-8">Supports CSV and Excel files from any bank.</p>

                <input
                  type="file"
                  onChange={handleFileChange}
                  className="bg-zinc-800 p-4 rounded-xl w-full max-w-md"
                />

                <button
                  onClick={handleAnalysis}
                  disabled={loading}
                  className={`mt-8 px-8 py-4 rounded-2xl font-semibold hover:scale-105 transition border disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 ${
                    file
                      ? "bg-transparent text-white border-white"
                      : "bg-white text-black border-transparent"
                  }`}
                >
                  {loading ? "Analysing..." : "Analyze Statement"}
                </button>

              </div>
            </div>
          </motion.div>


          {/* LOADING */}
          <ProgressLoader active={loading} steps={CLASSIFY_STEPS} />


          {/* ERROR */}
          {error && (
            <div className="mt-10 text-center text-red-400">{error}</div>
          )}


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

                <div className="flex gap-2 bg-zinc-900/80 backdrop-blur-sm border border-zinc-800 rounded-2xl p-1">

                  <button
                    onClick={() => setActiveTab("insights")}
                    className={`px-6 py-2.5 rounded-xl text-sm font-semibold transition ${
                      activeTab === "insights" ? "bg-white text-black" : "text-zinc-400 hover:text-white"
                    }`}
                  >
                    AI Insights
                  </button>

                  <button
                    onClick={() => {
                      if (!fullReport) {
                        handleFullReport()
                      } else {
                        setActiveTab("report")
                      }
                    }}
                    className={`px-6 py-2.5 rounded-xl text-sm font-semibold transition ${
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


              {/* RAW JSON TOGGLE */}
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

                {/* AI INSIGHTS TAB */}
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
                          style={{ width: `${spendingPercent}%` }}
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
                              <div
                                key={i}
                                className={`flex items-start gap-3 p-4 rounded-2xl border ${severityColor(risk.severity)}`}
                              >
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


                {/* FULL REPORT TAB */}
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


                {/* FULL REPORT LOADING */}
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


// function App() {

//   const [file, setFile] = useState(null)
//   const [loading, setLoading] = useState(false)
//   const [reportLoading, setReportLoading] = useState(false)
//   const [report, setReport] = useState(null)
//   const [fullReport, setFullReport] = useState(null)
//   const [error, setError] = useState("")
//   const [showRaw, setShowRaw] = useState(false)
//   const [activeTab, setActiveTab] = useState("insights")
//   const [columnMapping, setColumnMapping] = useState(null)
//   const [classifications, setClassifications] = useState(null)


//   const handleFileChange = (e) => {
//     setFile(e.target.files[0])
//   }


//   const handleAnalysis = async () => {

//     if (!file) {
//       alert("Please upload a statement file.")
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
//           headers: {
//             "Content-Type": "multipart/form-data"
//           }
//         }
//       )

//       console.log(response.data)
//       setReport(response.data)
//       setColumnMapping(response.data.column_mapping)
//       setClassifications(response.data.classifications)

//     } catch (err) {

//       console.error(err)
//       setError("Failed to analyze statement.")

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

//       const response = await API.post(
//         "/report/generate",
//         formData,
//         {
//           headers: {
//             "Content-Type": "multipart/form-data"
//           }
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


//   const currency = report?.report?.executive_summary?.currency || "₦"

//   const formatAmount = (amount) => {
//     return `${currency}${Number(amount).toLocaleString()}`
//   }

//   const severityIcon = (severity) => {
//     if (severity === "high") return <FiAlertTriangle className="text-red-400" size={18} />
//     if (severity === "medium") return <FiAlertCircle className="text-yellow-400" size={18} />
//     return <FiInfo className="text-blue-400" size={18} />
//   }

//   const severityColor = (severity) => {
//     if (severity === "high") return "border-red-500/40 bg-red-500/10"
//     if (severity === "medium") return "border-yellow-500/40 bg-yellow-500/10"
//     return "border-blue-500/40 bg-blue-500/10"
//   }

//   const spendingRatio = report?.report?.executive_summary?.spending_ratio || 0
//   const spendingPercent = Math.round(spendingRatio * 100)


//   return (

//     <div
//       className="min-h-screen text-white"
//       style={{
//         backgroundImage: `url(${bg})`,
//         backgroundSize: "cover",
//         backgroundPosition: "center",
//         backgroundAttachment: "fixed",
//         backgroundRepeat: "no-repeat"
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

//             <h1 className="text-6xl font-bold mb-6">
//               FITI AI
//             </h1>

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

//                 <h2 className="text-3xl font-semibold mb-3">
//                   Upload Statement
//                 </h2>

//                 <p className="text-zinc-400 mb-8">
//                   Supports CSV and Excel files from any bank.
//                 </p>

//                 <input
//                   type="file"
//                   onChange={handleFileChange}
//                   className="bg-zinc-800 p-4 rounded-xl w-full max-w-md"
//                 />

//                 <button
//                   onClick={handleAnalysis}
//                   className={`mt-8 px-8 py-4 rounded-2xl font-semibold hover:scale-105 transition border ${
//                     file
//                       ? "bg-transparent text-white border-white"
//                       : "bg-white text-black border-transparent"
//                   }`}
//                 >
//                   Analyze Statement
//                 </button>

//               </div>

//             </div>

//           </motion.div>


//           {/* CLASSIFY LOADING */}

//           <ProgressLoader active={loading} steps={CLASSIFY_STEPS} />


//           {/* ERROR */}

//           {error && (
//             <div className="mt-10 text-center text-red-400">
//               {error}
//             </div>
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
//                       activeTab === "insights"
//                         ? "bg-white text-black"
//                         : "text-zinc-400 hover:text-white"
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
//                       activeTab === "report"
//                         ? "bg-white text-black"
//                         : "text-zinc-400 hover:text-white"
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
//                         <span className={`text-sm font-semibold ${spendingPercent >= 90 ? "text-red-400" : spendingPercent >= 70 ? "text-yellow-400" : "text-green-400"}`}>
//                           {spendingPercent}% of income spent
//                         </span>
//                       </div>

//                       <div className="w-full bg-zinc-800 rounded-full h-3">
//                         <div
//                           className={`h-3 rounded-full transition-all duration-1000 ${spendingPercent >= 90 ? "bg-red-500" : spendingPercent >= 70 ? "bg-yellow-500" : "bg-green-500"}`}
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
//                             <span className={`font-semibold ${report.report.transaction_summary.gambling_transactions > 0 ? "text-red-400" : "text-green-400"}`}>
//                               {report.report.transaction_summary.gambling_transactions > 0 ? report.report.transaction_summary.gambling_transactions : "None detected"}
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

//                       <p className="text-zinc-500 text-sm mb-6">
//                         Generated by FITI intelligence engine
//                       </p>

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





// import { useState } from "react"
// import { motion, AnimatePresence } from "framer-motion"
// import { FiUploadCloud, FiChevronDown, FiChevronUp, FiAlertTriangle, FiAlertCircle, FiInfo } from "react-icons/fi"
// import API from "./services/api"
// import bg from "/fiti-bg.jpg"
// import FullReport from "./components/FullReport"
// import ProgressLoader, { CLASSIFY_STEPS, REPORT_STEPS } from "./components/ProgressLoader"


// function App() {

//   const [file, setFile] = useState(null)
//   {/* LOADING */}
// <ProgressLoader active={loading} steps={CLASSIFY_STEPS} />
//   const [reportLoading, setReportLoading] = useState(false)
//   const [report, setReport] = useState(null)
//   const [fullReport, setFullReport] = useState(null)
//   const [error, setError] = useState("")
//   const [showRaw, setShowRaw] = useState(false)
//   const [activeTab, setActiveTab] = useState("insights")
//   const [columnMapping, setColumnMapping] = useState(null)
//   const [classifications, setClassifications] = useState(null)


//   const handleFileChange = (e) => {
//     setFile(e.target.files[0])
//   }


//   const handleAnalysis = async () => {

//     if (!file) {
//       alert("Please upload a statement file.")
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
//           headers: {
//             "Content-Type": "multipart/form-data"
//           }
//         }
//       )

//       console.log(response.data)
//       setReport(response.data)
//       setColumnMapping(response.data.column_mapping)
//       setClassifications(response.data.classifications)

//     } catch (err) {

//       console.error(err)
//       setError("Failed to analyze statement.")

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

//       const response = await API.post(
//         "/report/generate",
//         formData,
//         {
//           headers: {
//             "Content-Type": "multipart/form-data"
//           }
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


//   const currency = report?.report?.executive_summary?.currency || "₦"

//   const formatAmount = (amount) => {
//     return `${currency}${Number(amount).toLocaleString()}`
//   }

//   const severityIcon = (severity) => {
//     if (severity === "high") return <FiAlertTriangle className="text-red-400" size={18} />
//     if (severity === "medium") return <FiAlertCircle className="text-yellow-400" size={18} />
//     return <FiInfo className="text-blue-400" size={18} />
//   }

//   const severityColor = (severity) => {
//     if (severity === "high") return "border-red-500/40 bg-red-500/10"
//     if (severity === "medium") return "border-yellow-500/40 bg-yellow-500/10"
//     return "border-blue-500/40 bg-blue-500/10"
//   }

//   const spendingRatio = report?.report?.executive_summary?.spending_ratio || 0
//   const spendingPercent = Math.round(spendingRatio * 100)


//   return (

//     <div
//       className="min-h-screen text-white"
//       style={{
//         backgroundImage: `url(${bg})`,
//         backgroundSize: "cover",
//         backgroundPosition: "center",
//         backgroundAttachment: "fixed",
//         backgroundRepeat: "no-repeat"
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

//             <h1 className="text-6xl font-bold mb-6">
//               FITI AI
//             </h1>

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

//                 <h2 className="text-3xl font-semibold mb-3">
//                   Upload Statement
//                 </h2>

//                 <p className="text-zinc-400 mb-8">
//                   Supports CSV and Excel files from any bank.
//                 </p>

//                 <input
//                   type="file"
//                   onChange={handleFileChange}
//                   className="bg-zinc-800 p-4 rounded-xl w-full max-w-md"
//                 />

//                 <button
//                   onClick={handleAnalysis}
//                   className={`mt-8 px-8 py-4 rounded-2xl font-semibold hover:scale-105 transition border ${
//                     file
//                       ? "bg-transparent text-white border-white"
//                       : "bg-white text-black border-transparent"
//                   }`}
//                 >
//                   Analyze Statement
//                 </button>

//               </div>

//             </div>

//           </motion.div>


//           {/* LOADING */}

//           {loading && (
//             <div className="mt-10 text-center">
//               <p className="text-zinc-400 text-lg">
//                 Analyzing financial statement...
//               </p>
//             </div>
//           )}


//           {/* ERROR */}

//           {error && (
//             <div className="mt-10 text-center text-red-400">
//               {error}
//             </div>
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
//                       activeTab === "insights"
//                         ? "bg-white text-black"
//                         : "text-zinc-400 hover:text-white"
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
//                       activeTab === "report"
//                         ? "bg-white text-black"
//                         : "text-zinc-400 hover:text-white"
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


//               {/* AI INSIGHTS TAB */}

//               <AnimatePresence mode="wait">

//                 {activeTab === "insights" && (

//                   <motion.div
//                     key="insights"
//                     initial={{ opacity: 0, y: 20 }}
//                     animate={{ opacity: 1, y: 0 }}
//                     exit={{ opacity: 0, y: -20 }}
//                     transition={{ duration: 0.4 }}
//                   >

//                     {/* REPORT HEADER */}

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


//                     {/* SPENDING RATIO BAR */}

//                     <div className="bg-zinc-900/80 backdrop-blur-sm border border-zinc-800 rounded-3xl p-6 mb-8">

//                       <div className="flex justify-between items-center mb-3">
//                         <h3 className="text-zinc-400 text-sm">Spending Ratio</h3>
//                         <span className={`text-sm font-semibold ${spendingPercent >= 90 ? "text-red-400" : spendingPercent >= 70 ? "text-yellow-400" : "text-green-400"}`}>
//                           {spendingPercent}% of income spent
//                         </span>
//                       </div>

//                       <div className="w-full bg-zinc-800 rounded-full h-3">
//                         <div
//                           className={`h-3 rounded-full transition-all duration-1000 ${spendingPercent >= 90 ? "bg-red-500" : spendingPercent >= 70 ? "bg-yellow-500" : "bg-green-500"}`}
//                           style={{ width: `${spendingPercent}%` }}
//                         />
//                       </div>

//                       <p className="text-zinc-500 text-xs mt-2">
//                         {formatAmount(report.report.executive_summary.total_income - report.report.executive_summary.total_spending)} remaining after all spending
//                       </p>

//                     </div>


//                     {/* TRANSACTION SUMMARY + RISK FLAGS */}

//                     <div className="grid md:grid-cols-2 gap-6 mb-8">


//                       {/* TRANSACTION BREAKDOWN */}

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
//                               {report.report.transaction_summary.gambling_transactions > 0 ? report.report.transaction_summary.gambling_transactions : "None detected"}
//                             </span>
//                           </div>

//                           <div className="pt-2">
//                             <p className="text-zinc-500 text-xs mb-3">Top Categories</p>
//                             <div className="space-y-2">
//                               {report.report.transaction_summary.top_categories.map(([cat, count], i) => (
//                                 <div key={i} className="flex justify-between items-center">
//                                   <span className="text-sm text-zinc-300 capitalize">{cat}</span>
//                                   <span className="text-xs text-zinc-500">{count} transactions</span>
//                                 </div>
//                               ))}
//                             </div>
//                           </div>

//                         </div>

//                       </div>


//                       {/* RISK FLAGS */}

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

//                       <p className="text-zinc-500 text-sm mb-6">
//                         Generated by FITI intelligence engine
//                       </p>

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

//                 {activeTab === "report" && reportLoading && (

//                   <motion.div
//                     key="report-loading"
//                     initial={{ opacity: 0 }}
//                     animate={{ opacity: 1 }}
//                     className="mt-10 text-center"
//                   >
//                     <p className="text-zinc-400 text-lg">
//                       Generating full report...
//                     </p>
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
// import { FiUploadCloud, FiChevronDown, FiChevronUp } from "react-icons/fi"
// import API from "./services/api"
// import bg from "/fiti-bg.jpg"


// function App() {

//   const [file, setFile] = useState(null)
//   const [loading, setLoading] = useState(false)
//   const [report, setReport] = useState(null)
//   const [error, setError] = useState("")
//   const [showRaw, setShowRaw] = useState(false)


//   const handleFileChange = (e) => {
//     setFile(e.target.files[0])
//   }


//   const handleAnalysis = async () => {

//     if (!file) {
//       alert("Please upload a statement file.")
//       return
//     }

//     try {

//       setLoading(true)
//       setError("")

//       const formData = new FormData()
//       formData.append("file", file)

//       const response = await API.post(
//         "/classify",
//         formData,
//         {
//           headers: {
//             "Content-Type": "multipart/form-data"
//           }
//         }
//       )

//       console.log(response.data)
//       setReport(response.data)

//     } catch (err) {

//       console.error(err)
//       setError("Failed to analyze statement.")

//     } finally {
//       setLoading(false)
//     }
//   }


//   const currency = report?.report?.executive_summary?.currency || "₦"

//   const formatAmount = (amount) => {
//     return `${currency}${Number(amount).toLocaleString()}`
//   }


//   return (

//     <div
//       className="min-h-screen text-white"
//       style={{
//         backgroundImage: `url(${bg})`,
//         backgroundSize: "cover",
//         backgroundPosition: "center",
//         backgroundAttachment: "fixed",
//         backgroundRepeat: "no-repeat"
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

//             <h1 className="text-6xl font-bold mb-6">
//               FITI AI
//             </h1>

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

//                 <h2 className="text-3xl font-semibold mb-3">
//                   Upload Statement
//                 </h2>

//                 <p className="text-zinc-400 mb-8">
//                   Supports CSV and Excel files from any bank.
//                 </p>

//                 <input
//                   type="file"
//                   onChange={handleFileChange}
//                   className="bg-zinc-800 p-4 rounded-xl w-full max-w-md"
//                 />

//                 <button
//                   onClick={handleAnalysis}
//                   className={`mt-8 px-8 py-4 rounded-2xl font-semibold hover:scale-105 transition border ${
//                     file
//                       ? "bg-transparent text-white border-white"
//                       : "bg-white text-black border-transparent"
//                   }`}
//                 >
//                   Analyze Statement
//                 </button>

//               </div>

//             </div>

//           </motion.div>


//           {/* LOADING */}

//           {loading && (
//             <div className="mt-10 text-center">
//               <p className="text-zinc-400 text-lg">
//                 Analyzing financial statement...
//               </p>
//             </div>
//           )}


//           {/* ERROR */}

//           {error && (
//             <div className="mt-10 text-center text-red-400">
//               {error}
//             </div>
//           )}


//           {/* REPORT */}

//           {report && (

//             <div className="mt-16">

//               <h2 className="text-4xl font-bold mb-10">
//                 Financial Report
//               </h2>


//               {/* DEBUG TOGGLE */}

//               <div className="mb-6">

//                 <button
//                   onClick={() => setShowRaw(!showRaw)}
//                   className="flex items-center gap-2 text-zinc-400 hover:text-white transition text-sm border border-zinc-700 px-4 py-2 rounded-xl"
//                 >
//                   {showRaw ? <FiChevronUp /> : <FiChevronDown />}
//                   {showRaw ? "Hide Raw JSON" : "View Raw JSON"}
//                 </button>

//                 <AnimatePresence>
//                   {showRaw && (
//                     <motion.div
//                       initial={{ opacity: 0, height: 0 }}
//                       animate={{ opacity: 1, height: "auto" }}
//                       exit={{ opacity: 0, height: 0 }}
//                       transition={{ duration: 0.3 }}
//                       className="overflow-hidden"
//                     >
//                       <pre className="mt-4 text-green-400 text-sm overflow-auto bg-zinc-900/80 backdrop-blur-sm p-6 rounded-2xl max-h-96">
//                         {JSON.stringify(report, null, 2)}
//                       </pre>
//                     </motion.div>
//                   )}
//                 </AnimatePresence>

//               </div>


//               {/* EXECUTIVE SUMMARY */}

//               <div className="grid md:grid-cols-3 gap-6">

//                 <div className="bg-zinc-900/80 backdrop-blur-sm p-6 rounded-3xl border border-zinc-800">
//                   <h3 className="text-zinc-400 mb-2">Total Income</h3>
//                   <p className="text-3xl font-bold">
//                     {formatAmount(report?.report?.executive_summary?.total_income || 0)}
//                   </p>
//                 </div>

//                 <div className="bg-zinc-900/80 backdrop-blur-sm p-6 rounded-3xl border border-zinc-800">
//                   <h3 className="text-zinc-400 mb-2">Total Spending</h3>
//                   <p className="text-3xl font-bold">
//                     {formatAmount(report?.report?.executive_summary?.total_spending || 0)}
//                   </p>
//                 </div>

//                 <div className="bg-zinc-900/80 backdrop-blur-sm p-6 rounded-3xl border border-zinc-800">
//                   <h3 className="text-zinc-400 mb-2">Risk Count</h3>
//                   <p className="text-3xl font-bold">
//                     {report?.report?.executive_summary?.total_risks || 0}
//                   </p>
//                 </div>

//               </div>


//               {/* AI INSIGHTS */}

//               <div className="mt-10 bg-zinc-900/80 backdrop-blur-sm border border-zinc-800 rounded-3xl p-8">

//                 <h3 className="text-2xl font-bold mb-4">
//                   AI Financial Insights
//                 </h3>

//                 <p className="text-zinc-300 leading-relaxed whitespace-pre-line">
//                   {report?.report?.ai_insights || "No AI insights generated."}
//                 </p>

//               </div>

//             </div>
//           )}

//         </div>

//       </div>

//     </div>
//   )
// }

// export default App













// import { useState } from "react"

// import { motion } from "framer-motion"

// import { FiUploadCloud } from "react-icons/fi"

// import API from "./services/api"


// function App() {

//   const [file, setFile] = useState(null)

//   const [loading, setLoading] = useState(false)

//   const [report, setReport] = useState(null)

//   const [error, setError] = useState("")


//   // ==========================================
//   // HANDLE FILE CHANGE
//   // ==========================================

//   const handleFileChange = (e) => {

//     setFile(e.target.files[0])
//   }


//   // ==========================================
//   // HANDLE ANALYSIS
//   // ==========================================

//   const handleAnalysis = async () => {

//     if (!file) {

//       alert("Please upload a statement file.")

//       return
//     }

//     try {

//       setLoading(true)

//       setError("")

//       const formData = new FormData()

//       formData.append("file", file)

//       const response = await API.post(

//         "/classify",

//         formData,

//         {

//           headers: {

//             "Content-Type":
//             "multipart/form-data"
//           }
//         }
//       )

//       console.log(response.data)

//       setReport(response.data)

//     } catch (err) {

//       console.error(err)

//       setError("Failed to analyze statement.")

//     } finally {

//       setLoading(false)
//     }
//   }


//   return (

//     <div className="min-h-screen bg-black text-white">

//       <div className="max-w-6xl mx-auto px-6 py-16">

//         {/* HERO */}

//         <motion.div

//           initial={{ opacity: 0, y: 30 }}

//           animate={{ opacity: 1, y: 0 }}

//           transition={{ duration: 0.8 }}

//           className="text-center"
//         >

//           <h1 className="text-6xl font-bold mb-6">

//             FITI AI

//           </h1>

//           <p className="text-zinc-400 text-lg max-w-2xl mx-auto">

//             AI-powered financial intelligence
//             system for transaction statement
//             analysis and reporting.

//           </p>

//         </motion.div>


//         {/* UPLOAD SECTION */}

//         <motion.div

//           initial={{ opacity: 0, scale: 0.95 }}

//           animate={{ opacity: 1, scale: 1 }}

//           transition={{ delay: 0.2 }}

//           className="mt-16"
//         >

//           <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-10">

//             <div className="flex flex-col items-center text-center">

//               <div className="bg-zinc-800 p-5 rounded-full mb-6">

//                 <FiUploadCloud size={40} />

//               </div>

//               <h2 className="text-3xl font-semibold mb-3">

//                 Upload Statement

//               </h2>

//               <p className="text-zinc-400 mb-8">

//                 Supports CSV and Excel files
//                 from any bank.

//               </p>

//               <input

//                 type="file"

//                 onChange={handleFileChange}

//                 className="bg-zinc-800 p-4 rounded-xl w-full max-w-md"
//               />

//               <button

//                 onClick={handleAnalysis}

//                 className="mt-8 bg-white text-black px-8 py-4 rounded-2xl font-semibold hover:scale-105 transition"
//               >

//                 Analyze Statement

//               </button>

//             </div>

//           </div>

//         </motion.div>


//         {/* LOADING */}

//         {

//           loading && (

//             <div className="mt-10 text-center">

//               <p className="text-zinc-400 text-lg">

//                 Analyzing financial statement...

//               </p>

//             </div>
//           )
//         }


//         {/* ERROR */}

//         {

//           error && (

//             <div className="mt-10 text-center text-red-400">

//               {error}

//             </div>
//           )
//         }


//         {/* REPORT */}

//         {

//           report && (

//             <div className="mt-16">

//               <h2 className="text-4xl font-bold mb-10">

//                 Financial Report

//               </h2>


//               {/* DEBUG VIEW */}

//               <pre className="mb-10 text-green-400 text-sm overflow-auto bg-zinc-900 p-6 rounded-2xl">

//                 {JSON.stringify(report, null, 2)}

//               </pre>


//               {/* EXECUTIVE SUMMARY */}

//               <div className="grid md:grid-cols-3 gap-6">

//                 <div className="bg-zinc-900 p-6 rounded-3xl border border-zinc-800">

//                   <h3 className="text-zinc-400 mb-2">

//                     Total Income

//                   </h3>

//                   <p className="text-3xl font-bold">

//                     ₦

//                     {

//                       report?.report
//                         ?.executive_summary
//                         ?.total_income || 0

//                     }

//                   </p>

//                 </div>


//                 <div className="bg-zinc-900 p-6 rounded-3xl border border-zinc-800">

//                   <h3 className="text-zinc-400 mb-2">

//                     Total Spending

//                   </h3>

//                   <p className="text-3xl font-bold">

//                     ₦

//                     {

//                       report?.report
//                         ?.executive_summary
//                         ?.total_spending || 0

//                     }

//                   </p>

//                 </div>


//                 <div className="bg-zinc-900 p-6 rounded-3xl border border-zinc-800">

//                   <h3 className="text-zinc-400 mb-2">

//                     Risk Count

//                   </h3>

//                   <p className="text-3xl font-bold">

//                     {

//                       report?.report
//                         ?.executive_summary
//                         ?.total_risks || 0

//                     }

//                   </p>

//                 </div>

//               </div>


//               {/* AI INSIGHTS */}

//               <div className="mt-10 bg-zinc-900 border border-zinc-800 rounded-3xl p-8">

//                 <h3 className="text-2xl font-bold mb-4">

//                   AI Financial Insights

//                 </h3>

//                 <p className="text-zinc-300 leading-relaxed whitespace-pre-line">

//                   {

//                     report?.report
//                       ?.ai_insights ||

//                     "No AI insights generated."

//                   }

//                 </p>

//               </div>

//             </div>
//           )
//         }

//       </div>

//     </div>
//   )
// }

// export default App

