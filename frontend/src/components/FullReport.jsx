import { useRef } from "react"
import { motion } from "framer-motion"
import { FiDownload } from "react-icons/fi"
import {
  BarChart, Bar, LineChart, Line, AreaChart, Area,
  PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, ReferenceLine
} from "recharts"
import ChatBot from "./ChatBot"


const COLORS = [
  "#ffffff", "#a1a1aa", "#71717a", "#52525b",
  "#3f3f46", "#27272a", "#18181b"
]

const ACCENT   = "#ffffff"
const POSITIVE = "#4ade80"
const NEGATIVE = "#f87171"
const NEUTRAL  = "#a1a1aa"
const BLUE     = "#60a5fa"

const TOOLTIP_STYLE = {
  background:   "#18181b",
  border:       "1px solid #3f3f46",
  borderRadius: 12,
  color:        "#ffffff"
}

const TOOLTIP_LABEL_STYLE = {
  color:    "#a1a1aa",
  fontSize: 11
}


function ChartBlock({ chart_id, title, eda, currency }) {

  const data = eda[chart_id]
  if (!data || data.length === 0) return null

  const fmt = (val) => `${currency}${Number(val).toLocaleString()}`

  const chartMap = {

    monthly_flow: (
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data} margin={{ top: 10, right: 20, left: 20, bottom: 40 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
          <XAxis dataKey="month" tick={{ fill: NEUTRAL, fontSize: 11 }} angle={-45} textAnchor="end" />
          <YAxis tick={{ fill: NEUTRAL, fontSize: 11 }} tickFormatter={(v) => `${currency}${(v / 1000).toFixed(0)}k`} />
          <Tooltip formatter={(val) => fmt(val)} contentStyle={TOOLTIP_STYLE} labelStyle={TOOLTIP_LABEL_STYLE} />
          <Legend wrapperStyle={{ paddingTop: 20 }} />
          <Bar dataKey="income"   name="Income"   fill={POSITIVE} radius={[4, 4, 0, 0]} />
          <Bar dataKey="spending" name="Spending" fill={NEGATIVE} radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    ),

    savings_margin: (
      <ResponsiveContainer width="100%" height={280}>
        <BarChart data={data} margin={{ top: 10, right: 20, left: 20, bottom: 40 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
          <XAxis dataKey="month" tick={{ fill: NEUTRAL, fontSize: 11 }} angle={-45} textAnchor="end" />
          <YAxis tick={{ fill: NEUTRAL, fontSize: 11 }} tickFormatter={(v) => `${currency}${(v / 1000).toFixed(0)}k`} />
          <Tooltip formatter={(val) => fmt(val)} contentStyle={TOOLTIP_STYLE} labelStyle={TOOLTIP_LABEL_STYLE} />
          <ReferenceLine y={0} stroke={NEUTRAL} strokeDasharray="4 4" />
          <Bar dataKey="margin" name="Savings Margin" radius={[4, 4, 0, 0]}>
            {data.map((entry, i) => (
              <Cell key={i} fill={entry.margin >= 0 ? POSITIVE : NEGATIVE} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    ),

    day_of_week_spending: (
      <ResponsiveContainer width="100%" height={280}>
        <BarChart data={data} margin={{ top: 10, right: 20, left: 20, bottom: 10 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
          <XAxis dataKey="day" tick={{ fill: NEUTRAL, fontSize: 11 }} />
          <YAxis tick={{ fill: NEUTRAL, fontSize: 11 }} tickFormatter={(v) => `${currency}${(v / 1000).toFixed(0)}k`} />
          <Tooltip formatter={(val) => fmt(val)} contentStyle={TOOLTIP_STYLE} labelStyle={TOOLTIP_LABEL_STYLE} />
          <Bar dataKey="total_spending" name="Spending" fill={NEGATIVE} radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    ),

    top_spending_days: (
      <ResponsiveContainer width="100%" height={260}>
        <BarChart data={data} layout="vertical" margin={{ top: 10, right: 30, left: 80, bottom: 10 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
          <XAxis type="number" tick={{ fill: NEUTRAL, fontSize: 11 }} tickFormatter={(v) => `${currency}${(v / 1000).toFixed(0)}k`} />
          <YAxis type="category" dataKey="date" tick={{ fill: NEUTRAL, fontSize: 11 }} />
          <Tooltip formatter={(val) => fmt(val)} contentStyle={TOOLTIP_STYLE} labelStyle={TOOLTIP_LABEL_STYLE} />
          <Bar dataKey="total_spending" name="Spending" fill={NEGATIVE} radius={[0, 4, 4, 0]} />
        </BarChart>
      </ResponsiveContainer>
    ),

    top_credit_days: (
      <ResponsiveContainer width="100%" height={260}>
        <BarChart data={data} layout="vertical" margin={{ top: 10, right: 30, left: 80, bottom: 10 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
          <XAxis type="number" tick={{ fill: NEUTRAL, fontSize: 11 }} tickFormatter={(v) => `${currency}${(v / 1000).toFixed(0)}k`} />
          <YAxis type="category" dataKey="date" tick={{ fill: NEUTRAL, fontSize: 11 }} />
          <Tooltip formatter={(val) => fmt(val)} contentStyle={TOOLTIP_STYLE} labelStyle={TOOLTIP_LABEL_STYLE} />
          <Bar dataKey="total_credit" name="Income" fill={POSITIVE} radius={[0, 4, 4, 0]} />
        </BarChart>
      </ResponsiveContainer>
    ),

    top_transactions: (
      <ResponsiveContainer width="100%" height={400}>
        <BarChart data={data.slice(0, 10)} layout="vertical" margin={{ top: 10, right: 30, left: 200, bottom: 10 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
          <XAxis type="number" tick={{ fill: NEUTRAL, fontSize: 11 }} tickFormatter={(v) => `${currency}${(v / 1000).toFixed(0)}k`} />
          <YAxis
            type="category"
            dataKey="narration"
            tick={{ fill: NEUTRAL, fontSize: 10 }}
            width={190}
            tickFormatter={(v) => v.length > 30 ? v.substring(0, 30) + "..." : v}
          />
          <Tooltip formatter={(val) => fmt(val)} contentStyle={TOOLTIP_STYLE} labelStyle={TOOLTIP_LABEL_STYLE} />
          <Bar dataKey="amount" name="Amount" fill={NEGATIVE} radius={[0, 4, 4, 0]} />
        </BarChart>
      </ResponsiveContainer>
    ),

    mom_change: (
      <ResponsiveContainer width="100%" height={280}>
        <LineChart data={data} margin={{ top: 10, right: 20, left: 20, bottom: 40 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
          <XAxis dataKey="month" tick={{ fill: NEUTRAL, fontSize: 11 }} angle={-45} textAnchor="end" />
          <YAxis tick={{ fill: NEUTRAL, fontSize: 11 }} tickFormatter={(v) => `${v}%`} />
          <Tooltip formatter={(val) => `${val}%`} contentStyle={TOOLTIP_STYLE} labelStyle={TOOLTIP_LABEL_STYLE} />
          <ReferenceLine y={0} stroke={NEUTRAL} strokeDasharray="4 4" />
          <Line type="monotone" dataKey="change_percent" name="MoM Change" stroke={ACCENT} strokeWidth={2} dot={{ fill: ACCENT, r: 4 }} />
        </LineChart>
      </ResponsiveContainer>
    ),

    rolling_avg: (
      <ResponsiveContainer width="100%" height={280}>
        <LineChart data={data} margin={{ top: 10, right: 20, left: 20, bottom: 40 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
          <XAxis dataKey="month" tick={{ fill: NEUTRAL, fontSize: 11 }} angle={-45} textAnchor="end" />
          <YAxis tick={{ fill: NEUTRAL, fontSize: 11 }} tickFormatter={(v) => `${currency}${(v / 1000).toFixed(0)}k`} />
          <Tooltip formatter={(val) => fmt(val)} contentStyle={TOOLTIP_STYLE} labelStyle={TOOLTIP_LABEL_STYLE} />
          <Legend wrapperStyle={{ paddingTop: 20 }} />
          <Line type="monotone" dataKey="spending"    name="Spending" stroke={NEGATIVE} strokeWidth={2} dot={{ fill: NEGATIVE, r: 3 }} />
          <Line type="monotone" dataKey="rolling_avg" name="3M Avg"   stroke={ACCENT}   strokeWidth={2} strokeDasharray="6 3" dot={false} />
        </LineChart>
      </ResponsiveContainer>
    ),

    quarterly: (
      <ResponsiveContainer width="100%" height={280}>
        <BarChart data={data} margin={{ top: 10, right: 20, left: 20, bottom: 10 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
          <XAxis dataKey="quarter" tick={{ fill: NEUTRAL, fontSize: 11 }} />
          <YAxis tick={{ fill: NEUTRAL, fontSize: 11 }} tickFormatter={(v) => `${currency}${(v / 1000).toFixed(0)}k`} />
          <Tooltip formatter={(val) => fmt(val)} contentStyle={TOOLTIP_STYLE} labelStyle={TOOLTIP_LABEL_STYLE} />
          <Legend />
          <Bar dataKey="income"   name="Income"   fill={POSITIVE} radius={[4, 4, 0, 0]} />
          <Bar dataKey="spending" name="Spending" fill={NEGATIVE} radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    ),

    anomalies: (
      <ResponsiveContainer width="100%" height={280}>
        <BarChart data={data} margin={{ top: 10, right: 20, left: 20, bottom: 40 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
          <XAxis dataKey="date" tick={{ fill: NEUTRAL, fontSize: 9 }} angle={-45} textAnchor="end" interval={Math.floor(data.length / 10)} />
          <YAxis tick={{ fill: NEUTRAL, fontSize: 11 }} tickFormatter={(v) => `${currency}${(v / 1000).toFixed(0)}k`} />
          <Tooltip formatter={(val) => fmt(val)} contentStyle={TOOLTIP_STYLE} labelStyle={TOOLTIP_LABEL_STYLE} />
          <ReferenceLine y={data[0]?.threshold} stroke="#fbbf24" strokeDasharray="4 4" label={{ value: "Threshold", fill: "#fbbf24", fontSize: 10 }} />
          <Bar dataKey="total_spending" name="Daily Spending" radius={[2, 2, 0, 0]}>
            {data.map((entry, i) => (
              <Cell key={i} fill={entry.is_anomaly ? "#f87171" : "#3f3f46"} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    ),

    cumulative_flow: (
      <ResponsiveContainer width="100%" height={300}>
        <AreaChart data={data} margin={{ top: 10, right: 20, left: 20, bottom: 40 }}>
          <defs>
            <linearGradient id="positiveGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%"  stopColor={POSITIVE} stopOpacity={0.3} />
              <stop offset="95%" stopColor={POSITIVE} stopOpacity={0}   />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
          <XAxis dataKey="date" tick={{ fill: NEUTRAL, fontSize: 9 }} angle={-45} textAnchor="end" interval={Math.floor(data.length / 8)} />
          <YAxis tick={{ fill: NEUTRAL, fontSize: 11 }} tickFormatter={(v) => `${currency}${(v / 1000).toFixed(0)}k`} />
          <Tooltip formatter={(val) => fmt(val)} contentStyle={TOOLTIP_STYLE} labelStyle={TOOLTIP_LABEL_STYLE} />
          <ReferenceLine y={0} stroke={NEUTRAL} strokeDasharray="4 4" />
          <Area type="monotone" dataKey="cumulative" name="Cumulative Balance" stroke={POSITIVE} fill="url(#positiveGrad)" strokeWidth={2} />
        </AreaChart>
      </ResponsiveContainer>
    ),

    histogram: (
      <ResponsiveContainer width="100%" height={280}>
        <BarChart data={data} margin={{ top: 10, right: 20, left: 20, bottom: 40 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
          <XAxis dataKey="range" tick={{ fill: NEUTRAL, fontSize: 10 }} angle={-45} textAnchor="end" />
          <YAxis tick={{ fill: NEUTRAL, fontSize: 11 }} />
          <Tooltip contentStyle={TOOLTIP_STYLE} labelStyle={TOOLTIP_LABEL_STYLE} />
          <Bar dataKey="count" name="Transactions" fill={BLUE} radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    ),

    heatmap: (
      <ResponsiveContainer width="100%" height={320}>
        <BarChart data={data} margin={{ top: 10, right: 20, left: 20, bottom: 40 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
          <XAxis dataKey="day" tick={{ fill: NEUTRAL, fontSize: 11 }} angle={-45} textAnchor="end" />
          <YAxis tick={{ fill: NEUTRAL, fontSize: 11 }} tickFormatter={(v) => `${currency}${(v / 1000).toFixed(0)}k`} />
          <Tooltip formatter={(val) => fmt(val)} contentStyle={TOOLTIP_STYLE} labelStyle={TOOLTIP_LABEL_STYLE} />
          <Legend />
          <Bar dataKey="total_spending" name="Spending" fill={NEGATIVE} radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    ),

    recurring_transactions: (
      <ResponsiveContainer width="100%" height={400}>
        <BarChart data={data.slice(0, 10)} layout="vertical" margin={{ top: 10, right: 30, left: 200, bottom: 10 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
          <XAxis type="number" tick={{ fill: NEUTRAL, fontSize: 11 }} tickFormatter={(v) => `${currency}${(v / 1000).toFixed(0)}k`} />
          <YAxis
            type="category"
            dataKey="narration"
            tick={{ fill: NEUTRAL, fontSize: 10 }}
            width={190}
            tickFormatter={(v) => v.length > 30 ? v.substring(0, 30) + "..." : v}
          />
          <Tooltip
            formatter={(val, name) => name === "count" ? val : fmt(val)}
            contentStyle={TOOLTIP_STYLE}
            labelStyle={TOOLTIP_LABEL_STYLE}
          />
          <Legend />
          <Bar dataKey="total_amount" name="Total Spent" fill={NEGATIVE} radius={[0, 4, 4, 0]} />
        </BarChart>
      </ResponsiveContainer>
    ),

    year_over_year: (
      <ResponsiveContainer width="100%" height={280}>
        <BarChart data={data} margin={{ top: 10, right: 20, left: 20, bottom: 10 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
          <XAxis dataKey="year" tick={{ fill: NEUTRAL, fontSize: 12 }} />
          <YAxis tick={{ fill: NEUTRAL, fontSize: 11 }} tickFormatter={(v) => `${currency}${(v / 1000).toFixed(0)}k`} />
          <Tooltip formatter={(val) => fmt(val)} contentStyle={TOOLTIP_STYLE} labelStyle={TOOLTIP_LABEL_STYLE} />
          <Legend />
          <Bar dataKey="income"   name="Income"   fill={POSITIVE} radius={[4, 4, 0, 0]} />
          <Bar dataKey="spending" name="Spending" fill={NEGATIVE} radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    ),

    seasonal_patterns: (
      <ResponsiveContainer width="100%" height={280}>
        <LineChart data={data} margin={{ top: 10, right: 20, left: 20, bottom: 10 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
          <XAxis dataKey="month" tick={{ fill: NEUTRAL, fontSize: 11 }} />
          <YAxis tick={{ fill: NEUTRAL, fontSize: 11 }} tickFormatter={(v) => `${currency}${(v / 1000).toFixed(0)}k`} />
          <Tooltip formatter={(val) => fmt(val)} contentStyle={TOOLTIP_STYLE} labelStyle={TOOLTIP_LABEL_STYLE} />
          <Legend />
          <Line type="monotone" dataKey="avg_spending" name="Avg Spending" stroke={NEGATIVE} strokeWidth={2} dot={{ fill: NEGATIVE, r: 3 }} />
          <Line type="monotone" dataKey="avg_income"   name="Avg Income"   stroke={POSITIVE} strokeWidth={2} dot={{ fill: POSITIVE, r: 3 }} />
        </LineChart>
      </ResponsiveContainer>
    ),

    balance_trend: (
      <ResponsiveContainer width="100%" height={280}>
        <AreaChart data={data} margin={{ top: 10, right: 20, left: 20, bottom: 40 }}>
          <defs>
            <linearGradient id="balanceGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%"  stopColor={BLUE} stopOpacity={0.3} />
              <stop offset="95%" stopColor={BLUE} stopOpacity={0}   />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
          <XAxis dataKey="date" tick={{ fill: NEUTRAL, fontSize: 9 }} angle={-45} textAnchor="end" interval={Math.floor(data.length / 8)} />
          <YAxis tick={{ fill: NEUTRAL, fontSize: 11 }} tickFormatter={(v) => `${currency}${(v / 1000).toFixed(0)}k`} />
          <Tooltip formatter={(val) => fmt(val)} contentStyle={TOOLTIP_STYLE} labelStyle={TOOLTIP_LABEL_STYLE} />
          <Area type="monotone" dataKey="balance" name="Balance" stroke={BLUE} fill="url(#balanceGrad)" strokeWidth={2} />
        </AreaChart>
      </ResponsiveContainer>
    ),

    category_breakdown: (
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={data.slice(0, 7)}
            dataKey="amount"
            nameKey="category"
            cx="50%"
            cy="50%"
            outerRadius={110}
            label={({ category, percent }) => `${category} ${(percent * 100).toFixed(0)}%`}
            labelLine={{ stroke: NEUTRAL }}
          >
            {data.slice(0, 7).map((_, i) => (
              <Cell key={i} fill={COLORS[i % COLORS.length]} stroke="#09090b" strokeWidth={2} />
            ))}
          </Pie>
          <Tooltip formatter={(val) => fmt(val)} contentStyle={TOOLTIP_STYLE} labelStyle={TOOLTIP_LABEL_STYLE} />
        </PieChart>
      </ResponsiveContainer>
    ),

    bank_charges_breakdown: (
      <ResponsiveContainer width="100%" height={280}>
        <PieChart>
          <Pie
            data={data.slice(0, 6)}
            dataKey="amount"
            nameKey="category"
            cx="50%"
            cy="50%"
            outerRadius={100}
            label={({ category, percent }) => `${category} ${(percent * 100).toFixed(0)}%`}
            labelLine={{ stroke: NEUTRAL }}
          >
            {data.slice(0, 6).map((_, i) => (
              <Cell key={i} fill={COLORS[i % COLORS.length]} stroke="#09090b" strokeWidth={2} />
            ))}
          </Pie>
          <Tooltip formatter={(val) => fmt(val)} contentStyle={TOOLTIP_STYLE} labelStyle={TOOLTIP_LABEL_STYLE} />
        </PieChart>
      </ResponsiveContainer>
    ),

    type_distribution: (
      <ResponsiveContainer width="100%" height={260}>
        <BarChart data={data} margin={{ top: 10, right: 20, left: 20, bottom: 10 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
          <XAxis dataKey="type" tick={{ fill: NEUTRAL, fontSize: 12 }} />
          <YAxis tick={{ fill: NEUTRAL, fontSize: 11 }} />
          <Tooltip contentStyle={TOOLTIP_STYLE} labelStyle={TOOLTIP_LABEL_STYLE} />
          <Bar dataKey="count" name="Transactions" radius={[4, 4, 0, 0]}>
            {data.map((_, i) => (
              <Cell key={i} fill={COLORS[i % COLORS.length]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-zinc-900/60 backdrop-blur-sm border border-zinc-800 rounded-3xl p-6 my-6"
    >
      <p className="text-zinc-400 text-sm font-medium mb-4">{title}</p>
      {chartMap[chart_id] || null}
    </motion.div>
  )
}


function NarrativeBlock({ block, eda, currency }) {

  if (block.type === "section_header") {
    return (
      <motion.h2
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.4 }}
        className="text-2xl font-bold mt-12 mb-4 text-white border-l-4 border-white pl-4"
      >
        {block.content}
      </motion.h2>
    )
  }

  if (block.type === "paragraph") {
    return (
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4 }}
        className="text-zinc-300 leading-relaxed mb-4"
      >
        {block.content}
      </motion.p>
    )
  }

  if (block.type === "chart") {
    return (
      <ChartBlock
        chart_id={block.chart_id}
        title={block.title}
        eda={eda}
        currency={currency}
      />
    )
  }

  return null
}


export default function FullReport({ reportData }) {

  const { narrative, eda, risk_analysis, behavior_analysis } = reportData
  const currency  = eda?.currency || "₦"
  const reportRef = useRef(null)


  const handleDownload = () => {
    const element = reportRef.current
    if (!element) return

    // Serialize all rendered SVG nodes from Recharts
    const svgNodes = element.querySelectorAll("svg")
    const svgMap   = {}
    svgNodes.forEach((svg, i) => {
      const serializer = new XMLSerializer()
      svgMap[i] = serializer.serializeToString(svg)
    })

    let svgIndex = 0

    const html = `
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>FITI Financial Report</title>
    <style>
      * { box-sizing: border-box; margin: 0; padding: 0; }
      body {
        background: #09090b;
        color: #ffffff;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
        padding: 48px;
        line-height: 1.6;
        max-width: 900px;
        margin: 0 auto;
      }
      h1 { font-size: 2rem; font-weight: 700; margin-bottom: 8px; }
      h2 {
        font-size: 1.4rem;
        font-weight: 700;
        margin-top: 48px;
        margin-bottom: 16px;
        padding-left: 16px;
        border-left: 4px solid #ffffff;
      }
      p {
        color: #d4d4d8;
        margin-bottom: 16px;
        font-size: 0.95rem;
      }
      .subtitle {
        color: #71717a;
        font-size: 0.85rem;
        margin-bottom: 48px;
      }
      .chart-block {
        background: #18181b;
        border: 1px solid #3f3f46;
        border-radius: 12px;
        padding: 24px;
        margin: 24px 0;
      }
      .chart-title {
        color: #a1a1aa;
        font-size: 0.8rem;
        margin-bottom: 16px;
      }
      .chart-block svg {
        width: 100% !important;
        height: auto !important;
      }
    </style>
  </head>
  <body>
    <h1>FITI Financial Report</h1>
    <p class="subtitle">AI-generated analysis — powered by FITI intelligence engine</p>
    ${narrative.map(block => {
      if (block.type === "section_header") {
        return `<h2>${block.content}</h2>`
      }
      if (block.type === "paragraph") {
        return `<p>${block.content}</p>`
      }
      if (block.type === "chart") {
        const svg = svgMap[svgIndex] || ""
        svgIndex++
        return `
          <div class="chart-block">
            <p class="chart-title">${block.title}</p>
            ${svg}
          </div>`
      }
      return ""
    }).join("\n")}
  </body>
</html>`

    const blob = new Blob([html], { type: "text/html" })
    const url  = URL.createObjectURL(blob)
    const a    = document.createElement("a")
    a.href     = url
    a.download = "FITI_Report.html"
    a.click()
    URL.revokeObjectURL(url)
  }


  return (
    <motion.div
      ref={reportRef}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
      className="max-w-4xl mx-auto pb-32 text-white"
    >

      <div className="mb-10 flex items-start justify-between">
        <div>
          <h1 className="text-4xl font-bold mb-2">Full Financial Report</h1>
          <p className="text-zinc-500 text-sm">
            AI-generated analysis — powered by FITI intelligence engine
          </p>
        </div>

        <button
          onClick={handleDownload}
          className="flex items-center gap-2 text-sm font-semibold px-5 py-2.5 rounded-2xl border border-zinc-700 text-zinc-300 hover:text-white hover:border-white transition mt-1"
        >
          <FiDownload size={15} />
          Download HTML
        </button>
      </div>

      <div>
        {narrative.map((block, i) => (
          <NarrativeBlock
            key={i}
            block={block}
            eda={eda}
            currency={currency}
          />
        ))}
      </div>

      <ChatBot
        eda={eda}
        riskAnalysis={risk_analysis || {}}
        behaviorAnalysis={behavior_analysis || []}
        currency={currency}
      />

    </motion.div>
  )
}


// import { useRef } from "react"
// import { motion } from "framer-motion"
// import { FiDownload } from "react-icons/fi"
// import {
//   BarChart, Bar, LineChart, Line, AreaChart, Area,
//   PieChart, Pie, Cell,
//   XAxis, YAxis, CartesianGrid, Tooltip, Legend,
//   ResponsiveContainer, ReferenceLine
// } from "recharts"
// import ChatBot from "./ChatBot"


// const COLORS = [
//   "#ffffff", "#a1a1aa", "#71717a", "#52525b",
//   "#3f3f46", "#27272a", "#18181b"
// ]

// const ACCENT   = "#ffffff"
// const POSITIVE = "#4ade80"
// const NEGATIVE = "#f87171"
// const NEUTRAL  = "#a1a1aa"
// const BLUE     = "#60a5fa"

// const TOOLTIP_STYLE = {
//   background:   "#18181b",
//   border:       "1px solid #3f3f46",
//   borderRadius: 12,
//   color:        "#ffffff"
// }

// const TOOLTIP_LABEL_STYLE = {
//   color:    "#a1a1aa",
//   fontSize: 11
// }


// function ChartBlock({ chart_id, title, eda, currency }) {

//   const data = eda[chart_id]
//   if (!data || data.length === 0) return null

//   const fmt = (val) => `${currency}${Number(val).toLocaleString()}`

//   const chartMap = {

//     monthly_flow: (
//       <ResponsiveContainer width="100%" height={300}>
//         <BarChart data={data} margin={{ top: 10, right: 20, left: 20, bottom: 40 }}>
//           <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
//           <XAxis dataKey="month" tick={{ fill: NEUTRAL, fontSize: 11 }} angle={-45} textAnchor="end" />
//           <YAxis tick={{ fill: NEUTRAL, fontSize: 11 }} tickFormatter={(v) => `${currency}${(v / 1000).toFixed(0)}k`} />
//           <Tooltip formatter={(val) => fmt(val)} contentStyle={TOOLTIP_STYLE} labelStyle={TOOLTIP_LABEL_STYLE} />
//           <Legend wrapperStyle={{ paddingTop: 20 }} />
//           <Bar dataKey="income"   name="Income"   fill={POSITIVE} radius={[4, 4, 0, 0]} />
//           <Bar dataKey="spending" name="Spending" fill={NEGATIVE} radius={[4, 4, 0, 0]} />
//         </BarChart>
//       </ResponsiveContainer>
//     ),

//     savings_margin: (
//       <ResponsiveContainer width="100%" height={280}>
//         <BarChart data={data} margin={{ top: 10, right: 20, left: 20, bottom: 40 }}>
//           <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
//           <XAxis dataKey="month" tick={{ fill: NEUTRAL, fontSize: 11 }} angle={-45} textAnchor="end" />
//           <YAxis tick={{ fill: NEUTRAL, fontSize: 11 }} tickFormatter={(v) => `${currency}${(v / 1000).toFixed(0)}k`} />
//           <Tooltip formatter={(val) => fmt(val)} contentStyle={TOOLTIP_STYLE} labelStyle={TOOLTIP_LABEL_STYLE} />
//           <ReferenceLine y={0} stroke={NEUTRAL} strokeDasharray="4 4" />
//           <Bar dataKey="margin" name="Savings Margin" radius={[4, 4, 0, 0]}>
//             {data.map((entry, i) => (
//               <Cell key={i} fill={entry.margin >= 0 ? POSITIVE : NEGATIVE} />
//             ))}
//           </Bar>
//         </BarChart>
//       </ResponsiveContainer>
//     ),

//     day_of_week_spending: (
//       <ResponsiveContainer width="100%" height={280}>
//         <BarChart data={data} margin={{ top: 10, right: 20, left: 20, bottom: 10 }}>
//           <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
//           <XAxis dataKey="day" tick={{ fill: NEUTRAL, fontSize: 11 }} />
//           <YAxis tick={{ fill: NEUTRAL, fontSize: 11 }} tickFormatter={(v) => `${currency}${(v / 1000).toFixed(0)}k`} />
//           <Tooltip formatter={(val) => fmt(val)} contentStyle={TOOLTIP_STYLE} labelStyle={TOOLTIP_LABEL_STYLE} />
//           <Bar dataKey="total_spending" name="Spending" fill={NEGATIVE} radius={[4, 4, 0, 0]} />
//         </BarChart>
//       </ResponsiveContainer>
//     ),

//     top_spending_days: (
//       <ResponsiveContainer width="100%" height={260}>
//         <BarChart data={data} layout="vertical" margin={{ top: 10, right: 30, left: 80, bottom: 10 }}>
//           <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
//           <XAxis type="number" tick={{ fill: NEUTRAL, fontSize: 11 }} tickFormatter={(v) => `${currency}${(v / 1000).toFixed(0)}k`} />
//           <YAxis type="category" dataKey="date" tick={{ fill: NEUTRAL, fontSize: 11 }} />
//           <Tooltip formatter={(val) => fmt(val)} contentStyle={TOOLTIP_STYLE} labelStyle={TOOLTIP_LABEL_STYLE} />
//           <Bar dataKey="total_spending" name="Spending" fill={NEGATIVE} radius={[0, 4, 4, 0]} />
//         </BarChart>
//       </ResponsiveContainer>
//     ),

//     top_credit_days: (
//       <ResponsiveContainer width="100%" height={260}>
//         <BarChart data={data} layout="vertical" margin={{ top: 10, right: 30, left: 80, bottom: 10 }}>
//           <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
//           <XAxis type="number" tick={{ fill: NEUTRAL, fontSize: 11 }} tickFormatter={(v) => `${currency}${(v / 1000).toFixed(0)}k`} />
//           <YAxis type="category" dataKey="date" tick={{ fill: NEUTRAL, fontSize: 11 }} />
//           <Tooltip formatter={(val) => fmt(val)} contentStyle={TOOLTIP_STYLE} labelStyle={TOOLTIP_LABEL_STYLE} />
//           <Bar dataKey="total_credit" name="Income" fill={POSITIVE} radius={[0, 4, 4, 0]} />
//         </BarChart>
//       </ResponsiveContainer>
//     ),

//     top_transactions: (
//       <ResponsiveContainer width="100%" height={400}>
//         <BarChart data={data.slice(0, 10)} layout="vertical" margin={{ top: 10, right: 30, left: 200, bottom: 10 }}>
//           <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
//           <XAxis type="number" tick={{ fill: NEUTRAL, fontSize: 11 }} tickFormatter={(v) => `${currency}${(v / 1000).toFixed(0)}k`} />
//           <YAxis
//             type="category"
//             dataKey="narration"
//             tick={{ fill: NEUTRAL, fontSize: 10 }}
//             width={190}
//             tickFormatter={(v) => v.length > 30 ? v.substring(0, 30) + "..." : v}
//           />
//           <Tooltip formatter={(val) => fmt(val)} contentStyle={TOOLTIP_STYLE} labelStyle={TOOLTIP_LABEL_STYLE} />
//           <Bar dataKey="amount" name="Amount" fill={NEGATIVE} radius={[0, 4, 4, 0]} />
//         </BarChart>
//       </ResponsiveContainer>
//     ),

//     mom_change: (
//       <ResponsiveContainer width="100%" height={280}>
//         <LineChart data={data} margin={{ top: 10, right: 20, left: 20, bottom: 40 }}>
//           <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
//           <XAxis dataKey="month" tick={{ fill: NEUTRAL, fontSize: 11 }} angle={-45} textAnchor="end" />
//           <YAxis tick={{ fill: NEUTRAL, fontSize: 11 }} tickFormatter={(v) => `${v}%`} />
//           <Tooltip formatter={(val) => `${val}%`} contentStyle={TOOLTIP_STYLE} labelStyle={TOOLTIP_LABEL_STYLE} />
//           <ReferenceLine y={0} stroke={NEUTRAL} strokeDasharray="4 4" />
//           <Line type="monotone" dataKey="change_percent" name="MoM Change" stroke={ACCENT} strokeWidth={2} dot={{ fill: ACCENT, r: 4 }} />
//         </LineChart>
//       </ResponsiveContainer>
//     ),

//     rolling_avg: (
//       <ResponsiveContainer width="100%" height={280}>
//         <LineChart data={data} margin={{ top: 10, right: 20, left: 20, bottom: 40 }}>
//           <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
//           <XAxis dataKey="month" tick={{ fill: NEUTRAL, fontSize: 11 }} angle={-45} textAnchor="end" />
//           <YAxis tick={{ fill: NEUTRAL, fontSize: 11 }} tickFormatter={(v) => `${currency}${(v / 1000).toFixed(0)}k`} />
//           <Tooltip formatter={(val) => fmt(val)} contentStyle={TOOLTIP_STYLE} labelStyle={TOOLTIP_LABEL_STYLE} />
//           <Legend wrapperStyle={{ paddingTop: 20 }} />
//           <Line type="monotone" dataKey="spending"    name="Spending" stroke={NEGATIVE} strokeWidth={2} dot={{ fill: NEGATIVE, r: 3 }} />
//           <Line type="monotone" dataKey="rolling_avg" name="3M Avg"   stroke={ACCENT}   strokeWidth={2} strokeDasharray="6 3" dot={false} />
//         </LineChart>
//       </ResponsiveContainer>
//     ),

//     quarterly: (
//       <ResponsiveContainer width="100%" height={280}>
//         <BarChart data={data} margin={{ top: 10, right: 20, left: 20, bottom: 10 }}>
//           <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
//           <XAxis dataKey="quarter" tick={{ fill: NEUTRAL, fontSize: 11 }} />
//           <YAxis tick={{ fill: NEUTRAL, fontSize: 11 }} tickFormatter={(v) => `${currency}${(v / 1000).toFixed(0)}k`} />
//           <Tooltip formatter={(val) => fmt(val)} contentStyle={TOOLTIP_STYLE} labelStyle={TOOLTIP_LABEL_STYLE} />
//           <Legend />
//           <Bar dataKey="income"   name="Income"   fill={POSITIVE} radius={[4, 4, 0, 0]} />
//           <Bar dataKey="spending" name="Spending" fill={NEGATIVE} radius={[4, 4, 0, 0]} />
//         </BarChart>
//       </ResponsiveContainer>
//     ),

//     anomalies: (
//       <ResponsiveContainer width="100%" height={280}>
//         <BarChart data={data} margin={{ top: 10, right: 20, left: 20, bottom: 40 }}>
//           <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
//           <XAxis dataKey="date" tick={{ fill: NEUTRAL, fontSize: 9 }} angle={-45} textAnchor="end" interval={Math.floor(data.length / 10)} />
//           <YAxis tick={{ fill: NEUTRAL, fontSize: 11 }} tickFormatter={(v) => `${currency}${(v / 1000).toFixed(0)}k`} />
//           <Tooltip formatter={(val) => fmt(val)} contentStyle={TOOLTIP_STYLE} labelStyle={TOOLTIP_LABEL_STYLE} />
//           <ReferenceLine y={data[0]?.threshold} stroke="#fbbf24" strokeDasharray="4 4" label={{ value: "Threshold", fill: "#fbbf24", fontSize: 10 }} />
//           <Bar dataKey="total_spending" name="Daily Spending" radius={[2, 2, 0, 0]}>
//             {data.map((entry, i) => (
//               <Cell key={i} fill={entry.is_anomaly ? "#f87171" : "#3f3f46"} />
//             ))}
//           </Bar>
//         </BarChart>
//       </ResponsiveContainer>
//     ),

//     cumulative_flow: (
//       <ResponsiveContainer width="100%" height={300}>
//         <AreaChart data={data} margin={{ top: 10, right: 20, left: 20, bottom: 40 }}>
//           <defs>
//             <linearGradient id="positiveGrad" x1="0" y1="0" x2="0" y2="1">
//               <stop offset="5%"  stopColor={POSITIVE} stopOpacity={0.3} />
//               <stop offset="95%" stopColor={POSITIVE} stopOpacity={0}   />
//             </linearGradient>
//           </defs>
//           <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
//           <XAxis dataKey="date" tick={{ fill: NEUTRAL, fontSize: 9 }} angle={-45} textAnchor="end" interval={Math.floor(data.length / 8)} />
//           <YAxis tick={{ fill: NEUTRAL, fontSize: 11 }} tickFormatter={(v) => `${currency}${(v / 1000).toFixed(0)}k`} />
//           <Tooltip formatter={(val) => fmt(val)} contentStyle={TOOLTIP_STYLE} labelStyle={TOOLTIP_LABEL_STYLE} />
//           <ReferenceLine y={0} stroke={NEUTRAL} strokeDasharray="4 4" />
//           <Area type="monotone" dataKey="cumulative" name="Cumulative Balance" stroke={POSITIVE} fill="url(#positiveGrad)" strokeWidth={2} />
//         </AreaChart>
//       </ResponsiveContainer>
//     ),

//     histogram: (
//       <ResponsiveContainer width="100%" height={280}>
//         <BarChart data={data} margin={{ top: 10, right: 20, left: 20, bottom: 40 }}>
//           <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
//           <XAxis dataKey="range" tick={{ fill: NEUTRAL, fontSize: 10 }} angle={-45} textAnchor="end" />
//           <YAxis tick={{ fill: NEUTRAL, fontSize: 11 }} />
//           <Tooltip contentStyle={TOOLTIP_STYLE} labelStyle={TOOLTIP_LABEL_STYLE} />
//           <Bar dataKey="count" name="Transactions" fill={BLUE} radius={[4, 4, 0, 0]} />
//         </BarChart>
//       </ResponsiveContainer>
//     ),

//     heatmap: (
//       <ResponsiveContainer width="100%" height={320}>
//         <BarChart data={data} margin={{ top: 10, right: 20, left: 20, bottom: 40 }}>
//           <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
//           <XAxis dataKey="day" tick={{ fill: NEUTRAL, fontSize: 11 }} angle={-45} textAnchor="end" />
//           <YAxis tick={{ fill: NEUTRAL, fontSize: 11 }} tickFormatter={(v) => `${currency}${(v / 1000).toFixed(0)}k`} />
//           <Tooltip formatter={(val) => fmt(val)} contentStyle={TOOLTIP_STYLE} labelStyle={TOOLTIP_LABEL_STYLE} />
//           <Legend />
//           <Bar dataKey="total_spending" name="Spending" fill={NEGATIVE} radius={[4, 4, 0, 0]} />
//         </BarChart>
//       </ResponsiveContainer>
//     ),

//     recurring_transactions: (
//       <ResponsiveContainer width="100%" height={400}>
//         <BarChart data={data.slice(0, 10)} layout="vertical" margin={{ top: 10, right: 30, left: 200, bottom: 10 }}>
//           <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
//           <XAxis type="number" tick={{ fill: NEUTRAL, fontSize: 11 }} tickFormatter={(v) => `${currency}${(v / 1000).toFixed(0)}k`} />
//           <YAxis
//             type="category"
//             dataKey="narration"
//             tick={{ fill: NEUTRAL, fontSize: 10 }}
//             width={190}
//             tickFormatter={(v) => v.length > 30 ? v.substring(0, 30) + "..." : v}
//           />
//           <Tooltip
//             formatter={(val, name) => name === "count" ? val : fmt(val)}
//             contentStyle={TOOLTIP_STYLE}
//             labelStyle={TOOLTIP_LABEL_STYLE}
//           />
//           <Legend />
//           <Bar dataKey="total_amount" name="Total Spent" fill={NEGATIVE} radius={[0, 4, 4, 0]} />
//         </BarChart>
//       </ResponsiveContainer>
//     ),

//     year_over_year: (
//       <ResponsiveContainer width="100%" height={280}>
//         <BarChart data={data} margin={{ top: 10, right: 20, left: 20, bottom: 10 }}>
//           <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
//           <XAxis dataKey="year" tick={{ fill: NEUTRAL, fontSize: 12 }} />
//           <YAxis tick={{ fill: NEUTRAL, fontSize: 11 }} tickFormatter={(v) => `${currency}${(v / 1000).toFixed(0)}k`} />
//           <Tooltip formatter={(val) => fmt(val)} contentStyle={TOOLTIP_STYLE} labelStyle={TOOLTIP_LABEL_STYLE} />
//           <Legend />
//           <Bar dataKey="income"   name="Income"   fill={POSITIVE} radius={[4, 4, 0, 0]} />
//           <Bar dataKey="spending" name="Spending" fill={NEGATIVE} radius={[4, 4, 0, 0]} />
//         </BarChart>
//       </ResponsiveContainer>
//     ),

//     seasonal_patterns: (
//       <ResponsiveContainer width="100%" height={280}>
//         <LineChart data={data} margin={{ top: 10, right: 20, left: 20, bottom: 10 }}>
//           <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
//           <XAxis dataKey="month" tick={{ fill: NEUTRAL, fontSize: 11 }} />
//           <YAxis tick={{ fill: NEUTRAL, fontSize: 11 }} tickFormatter={(v) => `${currency}${(v / 1000).toFixed(0)}k`} />
//           <Tooltip formatter={(val) => fmt(val)} contentStyle={TOOLTIP_STYLE} labelStyle={TOOLTIP_LABEL_STYLE} />
//           <Legend />
//           <Line type="monotone" dataKey="avg_spending" name="Avg Spending" stroke={NEGATIVE} strokeWidth={2} dot={{ fill: NEGATIVE, r: 3 }} />
//           <Line type="monotone" dataKey="avg_income"   name="Avg Income"   stroke={POSITIVE} strokeWidth={2} dot={{ fill: POSITIVE, r: 3 }} />
//         </LineChart>
//       </ResponsiveContainer>
//     ),

//     balance_trend: (
//       <ResponsiveContainer width="100%" height={280}>
//         <AreaChart data={data} margin={{ top: 10, right: 20, left: 20, bottom: 40 }}>
//           <defs>
//             <linearGradient id="balanceGrad" x1="0" y1="0" x2="0" y2="1">
//               <stop offset="5%"  stopColor={BLUE} stopOpacity={0.3} />
//               <stop offset="95%" stopColor={BLUE} stopOpacity={0}   />
//             </linearGradient>
//           </defs>
//           <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
//           <XAxis dataKey="date" tick={{ fill: NEUTRAL, fontSize: 9 }} angle={-45} textAnchor="end" interval={Math.floor(data.length / 8)} />
//           <YAxis tick={{ fill: NEUTRAL, fontSize: 11 }} tickFormatter={(v) => `${currency}${(v / 1000).toFixed(0)}k`} />
//           <Tooltip formatter={(val) => fmt(val)} contentStyle={TOOLTIP_STYLE} labelStyle={TOOLTIP_LABEL_STYLE} />
//           <Area type="monotone" dataKey="balance" name="Balance" stroke={BLUE} fill="url(#balanceGrad)" strokeWidth={2} />
//         </AreaChart>
//       </ResponsiveContainer>
//     ),

//     category_breakdown: (
//       <ResponsiveContainer width="100%" height={300}>
//         <PieChart>
//           <Pie
//             data={data.slice(0, 7)}
//             dataKey="amount"
//             nameKey="category"
//             cx="50%"
//             cy="50%"
//             outerRadius={110}
//             label={({ category, percent }) => `${category} ${(percent * 100).toFixed(0)}%`}
//             labelLine={{ stroke: NEUTRAL }}
//           >
//             {data.slice(0, 7).map((_, i) => (
//               <Cell key={i} fill={COLORS[i % COLORS.length]} stroke="#09090b" strokeWidth={2} />
//             ))}
//           </Pie>
//           <Tooltip formatter={(val) => fmt(val)} contentStyle={TOOLTIP_STYLE} labelStyle={TOOLTIP_LABEL_STYLE} />
//         </PieChart>
//       </ResponsiveContainer>
//     ),

//     bank_charges_breakdown: (
//       <ResponsiveContainer width="100%" height={280}>
//         <PieChart>
//           <Pie
//             data={data.slice(0, 6)}
//             dataKey="amount"
//             nameKey="category"
//             cx="50%"
//             cy="50%"
//             outerRadius={100}
//             label={({ category, percent }) => `${category} ${(percent * 100).toFixed(0)}%`}
//             labelLine={{ stroke: NEUTRAL }}
//           >
//             {data.slice(0, 6).map((_, i) => (
//               <Cell key={i} fill={COLORS[i % COLORS.length]} stroke="#09090b" strokeWidth={2} />
//             ))}
//           </Pie>
//           <Tooltip formatter={(val) => fmt(val)} contentStyle={TOOLTIP_STYLE} labelStyle={TOOLTIP_LABEL_STYLE} />
//         </PieChart>
//       </ResponsiveContainer>
//     ),

//     type_distribution: (
//       <ResponsiveContainer width="100%" height={260}>
//         <BarChart data={data} margin={{ top: 10, right: 20, left: 20, bottom: 10 }}>
//           <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
//           <XAxis dataKey="type" tick={{ fill: NEUTRAL, fontSize: 12 }} />
//           <YAxis tick={{ fill: NEUTRAL, fontSize: 11 }} />
//           <Tooltip contentStyle={TOOLTIP_STYLE} labelStyle={TOOLTIP_LABEL_STYLE} />
//           <Bar dataKey="count" name="Transactions" radius={[4, 4, 0, 0]}>
//             {data.map((_, i) => (
//               <Cell key={i} fill={COLORS[i % COLORS.length]} />
//             ))}
//           </Bar>
//         </BarChart>
//       </ResponsiveContainer>
//     )
//   }

//   return (
//     <motion.div
//       initial={{ opacity: 0, y: 20 }}
//       animate={{ opacity: 1, y: 0 }}
//       transition={{ duration: 0.5 }}
//       className="bg-zinc-900/60 backdrop-blur-sm border border-zinc-800 rounded-3xl p-6 my-6"
//     >
//       <p className="text-zinc-400 text-sm font-medium mb-4">{title}</p>
//       {chartMap[chart_id] || null}
//     </motion.div>
//   )
// }


// function NarrativeBlock({ block, eda, currency }) {

//   if (block.type === "section_header") {
//     return (
//       <motion.h2
//         initial={{ opacity: 0, x: -20 }}
//         animate={{ opacity: 1, x: 0 }}
//         transition={{ duration: 0.4 }}
//         className="text-2xl font-bold mt-12 mb-4 text-white border-l-4 border-white pl-4"
//       >
//         {block.content}
//       </motion.h2>
//     )
//   }

//   if (block.type === "paragraph") {
//     return (
//       <motion.p
//         initial={{ opacity: 0 }}
//         animate={{ opacity: 1 }}
//         transition={{ duration: 0.4 }}
//         className="text-zinc-300 leading-relaxed mb-4"
//       >
//         {block.content}
//       </motion.p>
//     )
//   }

//   if (block.type === "chart") {
//     return (
//       <ChartBlock
//         chart_id={block.chart_id}
//         title={block.title}
//         eda={eda}
//         currency={currency}
//       />
//     )
//   }

//   return null
// }


// export default function FullReport({ reportData }) {

//   const { narrative, eda, risk_analysis, behavior_analysis } = reportData
//   const currency  = eda?.currency || "₦"
//   const reportRef = useRef(null)


//   const handleDownload = () => {
//     const element = reportRef.current
//     if (!element) return

//     // Serialize all rendered SVG nodes from Recharts
//     const svgNodes = element.querySelectorAll("svg")
//     const svgMap   = {}
//     svgNodes.forEach((svg, i) => {
//       const serializer = new XMLSerializer()
//       svgMap[i] = serializer.serializeToString(svg)
//     })

//     let svgIndex = 0

//     const html = `
// <!DOCTYPE html>
// <html lang="en">
//   <head>
//     <meta charset="UTF-8" />
//     <meta name="viewport" content="width=device-width, initial-scale=1.0" />
//     <title>FITI Financial Report</title>
//     <style>
//       * { box-sizing: border-box; margin: 0; padding: 0; }
//       body {
//         background: #09090b;
//         color: #ffffff;
//         font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
//         padding: 48px;
//         line-height: 1.6;
//         max-width: 900px;
//         margin: 0 auto;
//       }
//       h1 { font-size: 2rem; font-weight: 700; margin-bottom: 8px; }
//       h2 {
//         font-size: 1.4rem;
//         font-weight: 700;
//         margin-top: 48px;
//         margin-bottom: 16px;
//         padding-left: 16px;
//         border-left: 4px solid #ffffff;
//       }
//       p {
//         color: #d4d4d8;
//         margin-bottom: 16px;
//         font-size: 0.95rem;
//       }
//       .subtitle {
//         color: #71717a;
//         font-size: 0.85rem;
//         margin-bottom: 48px;
//       }
//       .chart-block {
//         background: #18181b;
//         border: 1px solid #3f3f46;
//         border-radius: 12px;
//         padding: 24px;
//         margin: 24px 0;
//       }
//       .chart-title {
//         color: #a1a1aa;
//         font-size: 0.8rem;
//         margin-bottom: 16px;
//       }
//       .chart-block svg {
//         width: 100% !important;
//         height: auto !important;
//       }
//     </style>
//   </head>
//   <body>
//     <h1>FITI Financial Report</h1>
//     <p class="subtitle">AI-generated analysis — powered by FITI intelligence engine</p>
//     ${narrative.map(block => {
//       if (block.type === "section_header") {
//         return `<h2>${block.content}</h2>`
//       }
//       if (block.type === "paragraph") {
//         return `<p>${block.content}</p>`
//       }
//       if (block.type === "chart") {
//         const svg = svgMap[svgIndex] || ""
//         svgIndex++
//         return `
//           <div class="chart-block">
//             <p class="chart-title">${block.title}</p>
//             ${svg}
//           </div>`
//       }
//       return ""
//     }).join("\n")}
//   </body>
// </html>`

//     const blob = new Blob([html], { type: "text/html" })
//     const url  = URL.createObjectURL(blob)
//     const a    = document.createElement("a")
//     a.href     = url
//     a.download = "FITI_Report.html"
//     a.click()
//     URL.revokeObjectURL(url)
//   }


//   return (
//     <motion.div
//       ref={reportRef}
//       initial={{ opacity: 0 }}
//       animate={{ opacity: 1 }}
//       transition={{ duration: 0.6 }}
//       className="max-w-4xl mx-auto pb-32 text-white"
//     >

//       <div className="mb-10 flex items-start justify-between">
//         <div>
//           <h1 className="text-4xl font-bold mb-2">Full Financial Report</h1>
//           <p className="text-zinc-500 text-sm">
//             AI-generated analysis — powered by FITI intelligence engine
//           </p>
//         </div>

//         <button
//           onClick={handleDownload}
//           className="flex items-center gap-2 text-sm font-semibold px-5 py-2.5 rounded-2xl border border-zinc-700 text-zinc-300 hover:text-white hover:border-white transition mt-1"
//         >
//           <FiDownload size={15} />
//           Download HTML
//         </button>
//       </div>

//       <div>
//         {narrative.map((block, i) => (
//           <NarrativeBlock
//             key={i}
//             block={block}
//             eda={eda}
//             currency={currency}
//           />
//         ))}
//       </div>

//       <ChatBot
//         eda={eda}
//         riskAnalysis={risk_analysis || {}}
//         behaviorAnalysis={behavior_analysis || []}
//         currency={currency}
//       />

//     </motion.div>
//   )
// }






// import { useRef } from "react"
// import { motion } from "framer-motion"
// import { FiDownload } from "react-icons/fi"
// import {
//   BarChart, Bar, LineChart, Line, AreaChart, Area,
//   PieChart, Pie, Cell,
//   XAxis, YAxis, CartesianGrid, Tooltip, Legend,
//   ResponsiveContainer, ReferenceLine
// } from "recharts"
// import ChatBot from "./ChatBot"


// const COLORS = [
//   "#ffffff", "#a1a1aa", "#71717a", "#52525b",
//   "#3f3f46", "#27272a", "#18181b"
// ]

// const ACCENT   = "#ffffff"
// const POSITIVE = "#4ade80"
// const NEGATIVE = "#f87171"
// const NEUTRAL  = "#a1a1aa"
// const BLUE     = "#60a5fa"

// const TOOLTIP_STYLE = {
//   background:   "#18181b",
//   border:       "1px solid #3f3f46",
//   borderRadius: 12,
//   color:        "#ffffff"
// }

// const TOOLTIP_LABEL_STYLE = {
//   color:    "#a1a1aa",
//   fontSize: 11
// }


// function ChartBlock({ chart_id, title, eda, currency }) {

//   const data = eda[chart_id]
//   if (!data || data.length === 0) return null

//   const fmt = (val) => `${currency}${Number(val).toLocaleString()}`

//   const chartMap = {

//     monthly_flow: (
//       <ResponsiveContainer width="100%" height={300}>
//         <BarChart data={data} margin={{ top: 10, right: 20, left: 20, bottom: 40 }}>
//           <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
//           <XAxis dataKey="month" tick={{ fill: NEUTRAL, fontSize: 11 }} angle={-45} textAnchor="end" />
//           <YAxis tick={{ fill: NEUTRAL, fontSize: 11 }} tickFormatter={(v) => `${currency}${(v / 1000).toFixed(0)}k`} />
//           <Tooltip formatter={(val) => fmt(val)} contentStyle={TOOLTIP_STYLE} labelStyle={TOOLTIP_LABEL_STYLE} />
//           <Legend wrapperStyle={{ paddingTop: 20 }} />
//           <Bar dataKey="income"   name="Income"   fill={POSITIVE} radius={[4, 4, 0, 0]} />
//           <Bar dataKey="spending" name="Spending" fill={NEGATIVE} radius={[4, 4, 0, 0]} />
//         </BarChart>
//       </ResponsiveContainer>
//     ),

//     savings_margin: (
//       <ResponsiveContainer width="100%" height={280}>
//         <BarChart data={data} margin={{ top: 10, right: 20, left: 20, bottom: 40 }}>
//           <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
//           <XAxis dataKey="month" tick={{ fill: NEUTRAL, fontSize: 11 }} angle={-45} textAnchor="end" />
//           <YAxis tick={{ fill: NEUTRAL, fontSize: 11 }} tickFormatter={(v) => `${currency}${(v / 1000).toFixed(0)}k`} />
//           <Tooltip formatter={(val) => fmt(val)} contentStyle={TOOLTIP_STYLE} labelStyle={TOOLTIP_LABEL_STYLE} />
//           <ReferenceLine y={0} stroke={NEUTRAL} strokeDasharray="4 4" />
//           <Bar dataKey="margin" name="Savings Margin" radius={[4, 4, 0, 0]}>
//             {data.map((entry, i) => (
//               <Cell key={i} fill={entry.margin >= 0 ? POSITIVE : NEGATIVE} />
//             ))}
//           </Bar>
//         </BarChart>
//       </ResponsiveContainer>
//     ),

//     day_of_week_spending: (
//       <ResponsiveContainer width="100%" height={280}>
//         <BarChart data={data} margin={{ top: 10, right: 20, left: 20, bottom: 10 }}>
//           <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
//           <XAxis dataKey="day" tick={{ fill: NEUTRAL, fontSize: 11 }} />
//           <YAxis tick={{ fill: NEUTRAL, fontSize: 11 }} tickFormatter={(v) => `${currency}${(v / 1000).toFixed(0)}k`} />
//           <Tooltip formatter={(val) => fmt(val)} contentStyle={TOOLTIP_STYLE} labelStyle={TOOLTIP_LABEL_STYLE} />
//           <Bar dataKey="total_spending" name="Spending" fill={NEGATIVE} radius={[4, 4, 0, 0]} />
//         </BarChart>
//       </ResponsiveContainer>
//     ),

//     top_spending_days: (
//       <ResponsiveContainer width="100%" height={260}>
//         <BarChart data={data} layout="vertical" margin={{ top: 10, right: 30, left: 80, bottom: 10 }}>
//           <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
//           <XAxis type="number" tick={{ fill: NEUTRAL, fontSize: 11 }} tickFormatter={(v) => `${currency}${(v / 1000).toFixed(0)}k`} />
//           <YAxis type="category" dataKey="date" tick={{ fill: NEUTRAL, fontSize: 11 }} />
//           <Tooltip formatter={(val) => fmt(val)} contentStyle={TOOLTIP_STYLE} labelStyle={TOOLTIP_LABEL_STYLE} />
//           <Bar dataKey="total_spending" name="Spending" fill={NEGATIVE} radius={[0, 4, 4, 0]} />
//         </BarChart>
//       </ResponsiveContainer>
//     ),

//     top_credit_days: (
//       <ResponsiveContainer width="100%" height={260}>
//         <BarChart data={data} layout="vertical" margin={{ top: 10, right: 30, left: 80, bottom: 10 }}>
//           <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
//           <XAxis type="number" tick={{ fill: NEUTRAL, fontSize: 11 }} tickFormatter={(v) => `${currency}${(v / 1000).toFixed(0)}k`} />
//           <YAxis type="category" dataKey="date" tick={{ fill: NEUTRAL, fontSize: 11 }} />
//           <Tooltip formatter={(val) => fmt(val)} contentStyle={TOOLTIP_STYLE} labelStyle={TOOLTIP_LABEL_STYLE} />
//           <Bar dataKey="total_credit" name="Income" fill={POSITIVE} radius={[0, 4, 4, 0]} />
//         </BarChart>
//       </ResponsiveContainer>
//     ),

//     top_transactions: (
//       <ResponsiveContainer width="100%" height={400}>
//         <BarChart data={data.slice(0, 10)} layout="vertical" margin={{ top: 10, right: 30, left: 200, bottom: 10 }}>
//           <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
//           <XAxis type="number" tick={{ fill: NEUTRAL, fontSize: 11 }} tickFormatter={(v) => `${currency}${(v / 1000).toFixed(0)}k`} />
//           <YAxis
//             type="category"
//             dataKey="narration"
//             tick={{ fill: NEUTRAL, fontSize: 10 }}
//             width={190}
//             tickFormatter={(v) => v.length > 30 ? v.substring(0, 30) + "..." : v}
//           />
//           <Tooltip formatter={(val) => fmt(val)} contentStyle={TOOLTIP_STYLE} labelStyle={TOOLTIP_LABEL_STYLE} />
//           <Bar dataKey="amount" name="Amount" fill={NEGATIVE} radius={[0, 4, 4, 0]} />
//         </BarChart>
//       </ResponsiveContainer>
//     ),

//     mom_change: (
//       <ResponsiveContainer width="100%" height={280}>
//         <LineChart data={data} margin={{ top: 10, right: 20, left: 20, bottom: 40 }}>
//           <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
//           <XAxis dataKey="month" tick={{ fill: NEUTRAL, fontSize: 11 }} angle={-45} textAnchor="end" />
//           <YAxis tick={{ fill: NEUTRAL, fontSize: 11 }} tickFormatter={(v) => `${v}%`} />
//           <Tooltip formatter={(val) => `${val}%`} contentStyle={TOOLTIP_STYLE} labelStyle={TOOLTIP_LABEL_STYLE} />
//           <ReferenceLine y={0} stroke={NEUTRAL} strokeDasharray="4 4" />
//           <Line type="monotone" dataKey="change_percent" name="MoM Change" stroke={ACCENT} strokeWidth={2} dot={{ fill: ACCENT, r: 4 }} />
//         </LineChart>
//       </ResponsiveContainer>
//     ),

//     rolling_avg: (
//       <ResponsiveContainer width="100%" height={280}>
//         <LineChart data={data} margin={{ top: 10, right: 20, left: 20, bottom: 40 }}>
//           <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
//           <XAxis dataKey="month" tick={{ fill: NEUTRAL, fontSize: 11 }} angle={-45} textAnchor="end" />
//           <YAxis tick={{ fill: NEUTRAL, fontSize: 11 }} tickFormatter={(v) => `${currency}${(v / 1000).toFixed(0)}k`} />
//           <Tooltip formatter={(val) => fmt(val)} contentStyle={TOOLTIP_STYLE} labelStyle={TOOLTIP_LABEL_STYLE} />
//           <Legend wrapperStyle={{ paddingTop: 20 }} />
//           <Line type="monotone" dataKey="spending"    name="Spending" stroke={NEGATIVE} strokeWidth={2} dot={{ fill: NEGATIVE, r: 3 }} />
//           <Line type="monotone" dataKey="rolling_avg" name="3M Avg"   stroke={ACCENT}   strokeWidth={2} strokeDasharray="6 3" dot={false} />
//         </LineChart>
//       </ResponsiveContainer>
//     ),

//     quarterly: (
//       <ResponsiveContainer width="100%" height={280}>
//         <BarChart data={data} margin={{ top: 10, right: 20, left: 20, bottom: 10 }}>
//           <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
//           <XAxis dataKey="quarter" tick={{ fill: NEUTRAL, fontSize: 11 }} />
//           <YAxis tick={{ fill: NEUTRAL, fontSize: 11 }} tickFormatter={(v) => `${currency}${(v / 1000).toFixed(0)}k`} />
//           <Tooltip formatter={(val) => fmt(val)} contentStyle={TOOLTIP_STYLE} labelStyle={TOOLTIP_LABEL_STYLE} />
//           <Legend />
//           <Bar dataKey="income"   name="Income"   fill={POSITIVE} radius={[4, 4, 0, 0]} />
//           <Bar dataKey="spending" name="Spending" fill={NEGATIVE} radius={[4, 4, 0, 0]} />
//         </BarChart>
//       </ResponsiveContainer>
//     ),

//     anomalies: (
//       <ResponsiveContainer width="100%" height={280}>
//         <BarChart data={data} margin={{ top: 10, right: 20, left: 20, bottom: 40 }}>
//           <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
//           <XAxis dataKey="date" tick={{ fill: NEUTRAL, fontSize: 9 }} angle={-45} textAnchor="end" interval={Math.floor(data.length / 10)} />
//           <YAxis tick={{ fill: NEUTRAL, fontSize: 11 }} tickFormatter={(v) => `${currency}${(v / 1000).toFixed(0)}k`} />
//           <Tooltip formatter={(val) => fmt(val)} contentStyle={TOOLTIP_STYLE} labelStyle={TOOLTIP_LABEL_STYLE} />
//           <ReferenceLine y={data[0]?.threshold} stroke="#fbbf24" strokeDasharray="4 4" label={{ value: "Threshold", fill: "#fbbf24", fontSize: 10 }} />
//           <Bar dataKey="total_spending" name="Daily Spending" radius={[2, 2, 0, 0]}>
//             {data.map((entry, i) => (
//               <Cell key={i} fill={entry.is_anomaly ? "#f87171" : "#3f3f46"} />
//             ))}
//           </Bar>
//         </BarChart>
//       </ResponsiveContainer>
//     ),

//     cumulative_flow: (
//       <ResponsiveContainer width="100%" height={300}>
//         <AreaChart data={data} margin={{ top: 10, right: 20, left: 20, bottom: 40 }}>
//           <defs>
//             <linearGradient id="positiveGrad" x1="0" y1="0" x2="0" y2="1">
//               <stop offset="5%"  stopColor={POSITIVE} stopOpacity={0.3} />
//               <stop offset="95%" stopColor={POSITIVE} stopOpacity={0}   />
//             </linearGradient>
//           </defs>
//           <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
//           <XAxis dataKey="date" tick={{ fill: NEUTRAL, fontSize: 9 }} angle={-45} textAnchor="end" interval={Math.floor(data.length / 8)} />
//           <YAxis tick={{ fill: NEUTRAL, fontSize: 11 }} tickFormatter={(v) => `${currency}${(v / 1000).toFixed(0)}k`} />
//           <Tooltip formatter={(val) => fmt(val)} contentStyle={TOOLTIP_STYLE} labelStyle={TOOLTIP_LABEL_STYLE} />
//           <ReferenceLine y={0} stroke={NEUTRAL} strokeDasharray="4 4" />
//           <Area type="monotone" dataKey="cumulative" name="Cumulative Balance" stroke={POSITIVE} fill="url(#positiveGrad)" strokeWidth={2} />
//         </AreaChart>
//       </ResponsiveContainer>
//     ),

//     histogram: (
//       <ResponsiveContainer width="100%" height={280}>
//         <BarChart data={data} margin={{ top: 10, right: 20, left: 20, bottom: 40 }}>
//           <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
//           <XAxis dataKey="range" tick={{ fill: NEUTRAL, fontSize: 10 }} angle={-45} textAnchor="end" />
//           <YAxis tick={{ fill: NEUTRAL, fontSize: 11 }} />
//           <Tooltip contentStyle={TOOLTIP_STYLE} labelStyle={TOOLTIP_LABEL_STYLE} />
//           <Bar dataKey="count" name="Transactions" fill={BLUE} radius={[4, 4, 0, 0]} />
//         </BarChart>
//       </ResponsiveContainer>
//     ),

//     heatmap: (
//       <ResponsiveContainer width="100%" height={320}>
//         <BarChart data={data} margin={{ top: 10, right: 20, left: 20, bottom: 40 }}>
//           <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
//           <XAxis dataKey="day" tick={{ fill: NEUTRAL, fontSize: 11 }} angle={-45} textAnchor="end" />
//           <YAxis tick={{ fill: NEUTRAL, fontSize: 11 }} tickFormatter={(v) => `${currency}${(v / 1000).toFixed(0)}k`} />
//           <Tooltip formatter={(val) => fmt(val)} contentStyle={TOOLTIP_STYLE} labelStyle={TOOLTIP_LABEL_STYLE} />
//           <Legend />
//           <Bar dataKey="total_spending" name="Spending" fill={NEGATIVE} radius={[4, 4, 0, 0]} />
//         </BarChart>
//       </ResponsiveContainer>
//     ),

//     recurring_transactions: (
//       <ResponsiveContainer width="100%" height={400}>
//         <BarChart data={data.slice(0, 10)} layout="vertical" margin={{ top: 10, right: 30, left: 200, bottom: 10 }}>
//           <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
//           <XAxis type="number" tick={{ fill: NEUTRAL, fontSize: 11 }} tickFormatter={(v) => `${currency}${(v / 1000).toFixed(0)}k`} />
//           <YAxis
//             type="category"
//             dataKey="narration"
//             tick={{ fill: NEUTRAL, fontSize: 10 }}
//             width={190}
//             tickFormatter={(v) => v.length > 30 ? v.substring(0, 30) + "..." : v}
//           />
//           <Tooltip
//             formatter={(val, name) => name === "count" ? val : fmt(val)}
//             contentStyle={TOOLTIP_STYLE}
//             labelStyle={TOOLTIP_LABEL_STYLE}
//           />
//           <Legend />
//           <Bar dataKey="total_amount" name="Total Spent" fill={NEGATIVE} radius={[0, 4, 4, 0]} />
//         </BarChart>
//       </ResponsiveContainer>
//     ),

//     year_over_year: (
//       <ResponsiveContainer width="100%" height={280}>
//         <BarChart data={data} margin={{ top: 10, right: 20, left: 20, bottom: 10 }}>
//           <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
//           <XAxis dataKey="year" tick={{ fill: NEUTRAL, fontSize: 12 }} />
//           <YAxis tick={{ fill: NEUTRAL, fontSize: 11 }} tickFormatter={(v) => `${currency}${(v / 1000).toFixed(0)}k`} />
//           <Tooltip formatter={(val) => fmt(val)} contentStyle={TOOLTIP_STYLE} labelStyle={TOOLTIP_LABEL_STYLE} />
//           <Legend />
//           <Bar dataKey="income"   name="Income"   fill={POSITIVE} radius={[4, 4, 0, 0]} />
//           <Bar dataKey="spending" name="Spending" fill={NEGATIVE} radius={[4, 4, 0, 0]} />
//         </BarChart>
//       </ResponsiveContainer>
//     ),

//     seasonal_patterns: (
//       <ResponsiveContainer width="100%" height={280}>
//         <LineChart data={data} margin={{ top: 10, right: 20, left: 20, bottom: 10 }}>
//           <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
//           <XAxis dataKey="month" tick={{ fill: NEUTRAL, fontSize: 11 }} />
//           <YAxis tick={{ fill: NEUTRAL, fontSize: 11 }} tickFormatter={(v) => `${currency}${(v / 1000).toFixed(0)}k`} />
//           <Tooltip formatter={(val) => fmt(val)} contentStyle={TOOLTIP_STYLE} labelStyle={TOOLTIP_LABEL_STYLE} />
//           <Legend />
//           <Line type="monotone" dataKey="avg_spending" name="Avg Spending" stroke={NEGATIVE} strokeWidth={2} dot={{ fill: NEGATIVE, r: 3 }} />
//           <Line type="monotone" dataKey="avg_income"   name="Avg Income"   stroke={POSITIVE} strokeWidth={2} dot={{ fill: POSITIVE, r: 3 }} />
//         </LineChart>
//       </ResponsiveContainer>
//     ),

//     balance_trend: (
//       <ResponsiveContainer width="100%" height={280}>
//         <AreaChart data={data} margin={{ top: 10, right: 20, left: 20, bottom: 40 }}>
//           <defs>
//             <linearGradient id="balanceGrad" x1="0" y1="0" x2="0" y2="1">
//               <stop offset="5%"  stopColor={BLUE} stopOpacity={0.3} />
//               <stop offset="95%" stopColor={BLUE} stopOpacity={0}   />
//             </linearGradient>
//           </defs>
//           <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
//           <XAxis dataKey="date" tick={{ fill: NEUTRAL, fontSize: 9 }} angle={-45} textAnchor="end" interval={Math.floor(data.length / 8)} />
//           <YAxis tick={{ fill: NEUTRAL, fontSize: 11 }} tickFormatter={(v) => `${currency}${(v / 1000).toFixed(0)}k`} />
//           <Tooltip formatter={(val) => fmt(val)} contentStyle={TOOLTIP_STYLE} labelStyle={TOOLTIP_LABEL_STYLE} />
//           <Area type="monotone" dataKey="balance" name="Balance" stroke={BLUE} fill="url(#balanceGrad)" strokeWidth={2} />
//         </AreaChart>
//       </ResponsiveContainer>
//     ),

//     category_breakdown: (
//       <ResponsiveContainer width="100%" height={300}>
//         <PieChart>
//           <Pie
//             data={data.slice(0, 7)}
//             dataKey="amount"
//             nameKey="category"
//             cx="50%"
//             cy="50%"
//             outerRadius={110}
//             label={({ category, percent }) => `${category} ${(percent * 100).toFixed(0)}%`}
//             labelLine={{ stroke: NEUTRAL }}
//           >
//             {data.slice(0, 7).map((_, i) => (
//               <Cell key={i} fill={COLORS[i % COLORS.length]} stroke="#1a272b" strokeWidth={2} />
//             ))}
//           </Pie>
//           <Tooltip formatter={(val) => fmt(val)} contentStyle={TOOLTIP_STYLE} labelStyle={TOOLTIP_LABEL_STYLE} />
//         </PieChart>
//       </ResponsiveContainer>
//     ),

//     bank_charges_breakdown: (
//       <ResponsiveContainer width="100%" height={280}>
//         <PieChart>
//           <Pie
//             data={data.slice(0, 6)}
//             dataKey="amount"
//             nameKey="category"
//             cx="50%"
//             cy="50%"
//             outerRadius={100}
//             label={({ category, percent }) => `${category} ${(percent * 100).toFixed(0)}%`}
//             labelLine={{ stroke: NEUTRAL }}
//           >
//             {data.slice(0, 6).map((_, i) => (
//               <Cell key={i} fill={COLORS[i % COLORS.length]} stroke="#09090b" strokeWidth={2} />
//             ))}
//           </Pie>
//           <Tooltip formatter={(val) => fmt(val)} contentStyle={TOOLTIP_STYLE} labelStyle={TOOLTIP_LABEL_STYLE} />
//         </PieChart>
//       </ResponsiveContainer>
//     ),

//     type_distribution: (
//       <ResponsiveContainer width="100%" height={260}>
//         <BarChart data={data} margin={{ top: 10, right: 20, left: 20, bottom: 10 }}>
//           <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
//           <XAxis dataKey="type" tick={{ fill: NEUTRAL, fontSize: 12 }} />
//           <YAxis tick={{ fill: NEUTRAL, fontSize: 11 }} />
//           <Tooltip contentStyle={TOOLTIP_STYLE} labelStyle={TOOLTIP_LABEL_STYLE} />
//           <Bar dataKey="count" name="Transactions" radius={[4, 4, 0, 0]}>
//             {data.map((_, i) => (
//               <Cell key={i} fill={COLORS[i % COLORS.length]} />
//             ))}
//           </Bar>
//         </BarChart>
//       </ResponsiveContainer>
//     )
//   }

//   return (
//     <motion.div
//       initial={{ opacity: 0, y: 20 }}
//       animate={{ opacity: 1, y: 0 }}
//       transition={{ duration: 0.5 }}
//       className="bg-zinc-900/60 backdrop-blur-sm border border-zinc-800 rounded-3xl p-6 my-6"
//     >
//       <p className="text-zinc-400 text-sm font-medium mb-4">{title}</p>
//       {chartMap[chart_id] || null}
//     </motion.div>
//   )
// }


// function NarrativeBlock({ block, eda, currency }) {

//   if (block.type === "section_header") {
//     return (
//       <motion.h2
//         initial={{ opacity: 0, x: -20 }}
//         animate={{ opacity: 1, x: 0 }}
//         transition={{ duration: 0.4 }}
//         className="text-2xl font-bold mt-12 mb-4 text-white border-l-4 border-white pl-4"
//       >
//         {block.content}
//       </motion.h2>
//     )
//   }

//   if (block.type === "paragraph") {
//     return (
//       <motion.p
//         initial={{ opacity: 0 }}
//         animate={{ opacity: 1 }}
//         transition={{ duration: 0.4 }}
//         className="text-zinc-300 leading-relaxed mb-4"
//       >
//         {block.content}
//       </motion.p>
//     )
//   }

//   if (block.type === "chart") {
//     return (
//       <ChartBlock
//         chart_id={block.chart_id}
//         title={block.title}
//         eda={eda}
//         currency={currency}
//       />
//     )
//   }

//   return null
// }


// export default function FullReport({ reportData }) {

//   const { narrative, eda, risk_analysis, behavior_analysis } = reportData
//   const currency  = eda?.currency || "₦"
//   const reportRef = useRef(null)


//   const handleDownload = () => {
//     const html = `
//       <!DOCTYPE html>
//       <html lang="en">
//         <head>
//           <meta charset="UTF-8" />
//           <meta name="viewport" content="width=device-width, initial-scale=1.0" />
//           <title>FITI Financial Report</title>
//           <style>
//             * { box-sizing: border-box; margin: 0; padding: 0; }
//             body {
//               background: #09090b;
//               color: #ffffff;
//               font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
//               padding: 48px;
//               line-height: 1.6;
//             }
//             h1 { font-size: 2rem; font-weight: 700; margin-bottom: 8px; }
//             h2 {
//               font-size: 1.4rem;
//               font-weight: 700;
//               margin-top: 48px;
//               margin-bottom: 16px;
//               padding-left: 16px;
//               border-left: 4px solid #ffffff;
//             }
//             p {
//               color: #d4d4d8;
//               margin-bottom: 16px;
//               font-size: 0.95rem;
//             }
//             .subtitle {
//               color: #71717a;
//               font-size: 0.85rem;
//               margin-bottom: 48px;
//             }
//             .chart-placeholder {
//               background: #18181b;
//               border: 1px solid #3f3f46;
//               border-radius: 12px;
//               padding: 24px;
//               margin: 24px 0;
//               color: #71717a;
//               font-size: 0.8rem;
//               text-align: center;
//             }
//           </style>
//         </head>
//         <body>
//           <h1>FITI Financial Report</h1>
//           <p class="subtitle">AI-generated analysis — powered by FITI intelligence engine</p>
//           ${narrative.map(block => {
//             if (block.type === "section_header") return `<h2>${block.content}</h2>`
//             if (block.type === "paragraph")      return `<p>${block.content}</p>`
//             if (block.type === "chart")          return `<div class="chart-placeholder">[ Chart: ${block.title} ]</div>`
//             return ""
//           }).join("\n")}
//         </body>
//       </html>
//     `

//     const blob = new Blob([html], { type: "text/html" })
//     const url  = URL.createObjectURL(blob)
//     const a    = document.createElement("a")
//     a.href     = url
//     a.download = "FITI_Report.html"
//     a.click()
//     URL.revokeObjectURL(url)
//   }


//   return (
//     <motion.div
//       ref={reportRef}
//       initial={{ opacity: 0 }}
//       animate={{ opacity: 1 }}
//       transition={{ duration: 0.6 }}
//       className="max-w-4xl mx-auto pb-32 text-white"
//     >

//       <div className="mb-10 flex items-start justify-between">
//         <div>
//           <h1 className="text-4xl font-bold mb-2">Full Financial Report</h1>
//           <p className="text-zinc-500 text-sm">
//             AI-generated analysis — powered by FITI intelligence engine
//           </p>
//         </div>

//         <button
//           onClick={handleDownload}
//           className="flex items-center gap-2 text-sm font-semibold px-5 py-2.5 rounded-2xl border border-zinc-700 text-zinc-300 hover:text-white hover:border-white transition mt-1"
//         >
//           <FiDownload size={15} />
//           Download HTML
//         </button>
//       </div>

//       <div>
//         {narrative.map((block, i) => (
//           <NarrativeBlock
//             key={i}
//             block={block}
//             eda={eda}
//             currency={currency}
//           />
//         ))}
//       </div>

//       <ChatBot
//         eda={eda}
//         riskAnalysis={risk_analysis || {}}
//         behaviorAnalysis={behavior_analysis || []}
//         currency={currency}
//       />

//     </motion.div>
//   )
// }






// import { motion } from "framer-motion"
// import {
//   BarChart, Bar, LineChart, Line, AreaChart, Area,
//   PieChart, Pie, Cell,
//   XAxis, YAxis, CartesianGrid, Tooltip, Legend,
//   ResponsiveContainer, ReferenceLine
// } from "recharts"
// import ChatBot from "./ChatBot"


// const COLORS = [
//   "#ffffff", "#a1a1aa", "#71717a", "#52525b",
//   "#3f3f46", "#27272a", "#18181b"
// ]

// const ACCENT = "#ffffff"
// const POSITIVE = "#4ade80"
// const NEGATIVE = "#f87171"
// const NEUTRAL = "#a1a1aa"
// const BLUE = "#60a5fa"

// const TOOLTIP_STYLE = {
//   background: "#18181b",
//   border: "1px solid #3f3f46",
//   borderRadius: 12,
//   color: "#ffffff"
// }

// const TOOLTIP_LABEL_STYLE = {
//   color: "#a1a1aa",
//   fontSize: 11
// }


// function ChartBlock({ chart_id, title, eda, currency }) {

//   const data = eda[chart_id]

//   if (!data || data.length === 0) return null

//   const fmt = (val) => `${currency}${Number(val).toLocaleString()}`

//   const chartMap = {

//     monthly_flow: (
//       <ResponsiveContainer width="100%" height={300}>
//         <BarChart data={data} margin={{ top: 10, right: 20, left: 20, bottom: 40 }}>
//           <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
//           <XAxis dataKey="month" tick={{ fill: NEUTRAL, fontSize: 11 }} angle={-45} textAnchor="end" />
//           <YAxis tick={{ fill: NEUTRAL, fontSize: 11 }} tickFormatter={(v) => `${currency}${(v / 1000).toFixed(0)}k`} />
//           <Tooltip formatter={(val) => fmt(val)} contentStyle={TOOLTIP_STYLE} labelStyle={TOOLTIP_LABEL_STYLE} />
//           <Legend wrapperStyle={{ paddingTop: 20 }} />
//           <Bar dataKey="income" name="Income" fill={POSITIVE} radius={[4, 4, 0, 0]} />
//           <Bar dataKey="spending" name="Spending" fill={NEGATIVE} radius={[4, 4, 0, 0]} />
//         </BarChart>
//       </ResponsiveContainer>
//     ),

//     savings_margin: (
//       <ResponsiveContainer width="100%" height={280}>
//         <BarChart data={data} margin={{ top: 10, right: 20, left: 20, bottom: 40 }}>
//           <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
//           <XAxis dataKey="month" tick={{ fill: NEUTRAL, fontSize: 11 }} angle={-45} textAnchor="end" />
//           <YAxis tick={{ fill: NEUTRAL, fontSize: 11 }} tickFormatter={(v) => `${currency}${(v / 1000).toFixed(0)}k`} />
//           <Tooltip formatter={(val) => fmt(val)} contentStyle={TOOLTIP_STYLE} labelStyle={TOOLTIP_LABEL_STYLE} />
//           <ReferenceLine y={0} stroke={NEUTRAL} strokeDasharray="4 4" />
//           <Bar dataKey="margin" name="Savings Margin" radius={[4, 4, 0, 0]}>
//             {data.map((entry, i) => (
//               <Cell key={i} fill={entry.margin >= 0 ? POSITIVE : NEGATIVE} />
//             ))}
//           </Bar>
//         </BarChart>
//       </ResponsiveContainer>
//     ),

//     day_of_week_spending: (
//       <ResponsiveContainer width="100%" height={280}>
//         <BarChart data={data} margin={{ top: 10, right: 20, left: 20, bottom: 10 }}>
//           <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
//           <XAxis dataKey="day" tick={{ fill: NEUTRAL, fontSize: 11 }} />
//           <YAxis tick={{ fill: NEUTRAL, fontSize: 11 }} tickFormatter={(v) => `${currency}${(v / 1000).toFixed(0)}k`} />
//           <Tooltip formatter={(val) => fmt(val)} contentStyle={TOOLTIP_STYLE} labelStyle={TOOLTIP_LABEL_STYLE} />
//           <Bar dataKey="total_spending" name="Spending" fill={NEGATIVE} radius={[4, 4, 0, 0]} />
//         </BarChart>
//       </ResponsiveContainer>
//     ),

//     top_spending_days: (
//       <ResponsiveContainer width="100%" height={260}>
//         <BarChart data={data} layout="vertical" margin={{ top: 10, right: 30, left: 80, bottom: 10 }}>
//           <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
//           <XAxis type="number" tick={{ fill: NEUTRAL, fontSize: 11 }} tickFormatter={(v) => `${currency}${(v / 1000).toFixed(0)}k`} />
//           <YAxis type="category" dataKey="date" tick={{ fill: NEUTRAL, fontSize: 11 }} />
//           <Tooltip formatter={(val) => fmt(val)} contentStyle={TOOLTIP_STYLE} labelStyle={TOOLTIP_LABEL_STYLE} />
//           <Bar dataKey="total_spending" name="Spending" fill={NEGATIVE} radius={[0, 4, 4, 0]} />
//         </BarChart>
//       </ResponsiveContainer>
//     ),

//     top_credit_days: (
//       <ResponsiveContainer width="100%" height={260}>
//         <BarChart data={data} layout="vertical" margin={{ top: 10, right: 30, left: 80, bottom: 10 }}>
//           <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
//           <XAxis type="number" tick={{ fill: NEUTRAL, fontSize: 11 }} tickFormatter={(v) => `${currency}${(v / 1000).toFixed(0)}k`} />
//           <YAxis type="category" dataKey="date" tick={{ fill: NEUTRAL, fontSize: 11 }} />
//           <Tooltip formatter={(val) => fmt(val)} contentStyle={TOOLTIP_STYLE} labelStyle={TOOLTIP_LABEL_STYLE} />
//           <Bar dataKey="total_credit" name="Income" fill={POSITIVE} radius={[0, 4, 4, 0]} />
//         </BarChart>
//       </ResponsiveContainer>
//     ),

//     top_transactions: (
//       <ResponsiveContainer width="100%" height={400}>
//         <BarChart data={data.slice(0, 10)} layout="vertical" margin={{ top: 10, right: 30, left: 200, bottom: 10 }}>
//           <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
//           <XAxis type="number" tick={{ fill: NEUTRAL, fontSize: 11 }} tickFormatter={(v) => `${currency}${(v / 1000).toFixed(0)}k`} />
//           <YAxis
//             type="category"
//             dataKey="narration"
//             tick={{ fill: NEUTRAL, fontSize: 10 }}
//             width={190}
//             tickFormatter={(v) => v.length > 30 ? v.substring(0, 30) + "..." : v}
//           />
//           <Tooltip formatter={(val) => fmt(val)} contentStyle={TOOLTIP_STYLE} labelStyle={TOOLTIP_LABEL_STYLE} />
//           <Bar dataKey="amount" name="Amount" fill={NEGATIVE} radius={[0, 4, 4, 0]} />
//         </BarChart>
//       </ResponsiveContainer>
//     ),

//     mom_change: (
//       <ResponsiveContainer width="100%" height={280}>
//         <LineChart data={data} margin={{ top: 10, right: 20, left: 20, bottom: 40 }}>
//           <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
//           <XAxis dataKey="month" tick={{ fill: NEUTRAL, fontSize: 11 }} angle={-45} textAnchor="end" />
//           <YAxis tick={{ fill: NEUTRAL, fontSize: 11 }} tickFormatter={(v) => `${v}%`} />
//           <Tooltip formatter={(val) => `${val}%`} contentStyle={TOOLTIP_STYLE} labelStyle={TOOLTIP_LABEL_STYLE} />
//           <ReferenceLine y={0} stroke={NEUTRAL} strokeDasharray="4 4" />
//           <Line type="monotone" dataKey="change_percent" name="MoM Change" stroke={ACCENT} strokeWidth={2} dot={{ fill: ACCENT, r: 4 }} />
//         </LineChart>
//       </ResponsiveContainer>
//     ),

//     rolling_avg: (
//       <ResponsiveContainer width="100%" height={280}>
//         <LineChart data={data} margin={{ top: 10, right: 20, left: 20, bottom: 40 }}>
//           <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
//           <XAxis dataKey="month" tick={{ fill: NEUTRAL, fontSize: 11 }} angle={-45} textAnchor="end" />
//           <YAxis tick={{ fill: NEUTRAL, fontSize: 11 }} tickFormatter={(v) => `${currency}${(v / 1000).toFixed(0)}k`} />
//           <Tooltip formatter={(val) => fmt(val)} contentStyle={TOOLTIP_STYLE} labelStyle={TOOLTIP_LABEL_STYLE} />
//           <Legend wrapperStyle={{ paddingTop: 20 }} />
//           <Line type="monotone" dataKey="spending" name="Spending" stroke={NEGATIVE} strokeWidth={2} dot={{ fill: NEGATIVE, r: 3 }} />
//           <Line type="monotone" dataKey="rolling_avg" name="3M Avg" stroke={ACCENT} strokeWidth={2} strokeDasharray="6 3" dot={false} />
//         </LineChart>
//       </ResponsiveContainer>
//     ),

//     quarterly: (
//       <ResponsiveContainer width="100%" height={280}>
//         <BarChart data={data} margin={{ top: 10, right: 20, left: 20, bottom: 10 }}>
//           <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
//           <XAxis dataKey="quarter" tick={{ fill: NEUTRAL, fontSize: 11 }} />
//           <YAxis tick={{ fill: NEUTRAL, fontSize: 11 }} tickFormatter={(v) => `${currency}${(v / 1000).toFixed(0)}k`} />
//           <Tooltip formatter={(val) => fmt(val)} contentStyle={TOOLTIP_STYLE} labelStyle={TOOLTIP_LABEL_STYLE} />
//           <Legend />
//           <Bar dataKey="income" name="Income" fill={POSITIVE} radius={[4, 4, 0, 0]} />
//           <Bar dataKey="spending" name="Spending" fill={NEGATIVE} radius={[4, 4, 0, 0]} />
//         </BarChart>
//       </ResponsiveContainer>
//     ),

//     anomalies: (
//       <ResponsiveContainer width="100%" height={280}>
//         <BarChart data={data} margin={{ top: 10, right: 20, left: 20, bottom: 40 }}>
//           <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
//           <XAxis dataKey="date" tick={{ fill: NEUTRAL, fontSize: 9 }} angle={-45} textAnchor="end" interval={Math.floor(data.length / 10)} />
//           <YAxis tick={{ fill: NEUTRAL, fontSize: 11 }} tickFormatter={(v) => `${currency}${(v / 1000).toFixed(0)}k`} />
//           <Tooltip formatter={(val) => fmt(val)} contentStyle={TOOLTIP_STYLE} labelStyle={TOOLTIP_LABEL_STYLE} />
//           <ReferenceLine y={data[0]?.threshold} stroke="#fbbf24" strokeDasharray="4 4" label={{ value: "Threshold", fill: "#fbbf24", fontSize: 10 }} />
//           <Bar dataKey="total_spending" name="Daily Spending" radius={[2, 2, 0, 0]}>
//             {data.map((entry, i) => (
//               <Cell key={i} fill={entry.is_anomaly ? "#f87171" : "#3f3f46"} />
//             ))}
//           </Bar>
//         </BarChart>
//       </ResponsiveContainer>
//     ),

//     cumulative_flow: (
//       <ResponsiveContainer width="100%" height={300}>
//         <AreaChart data={data} margin={{ top: 10, right: 20, left: 20, bottom: 40 }}>
//           <defs>
//             <linearGradient id="positiveGrad" x1="0" y1="0" x2="0" y2="1">
//               <stop offset="5%" stopColor={POSITIVE} stopOpacity={0.3} />
//               <stop offset="95%" stopColor={POSITIVE} stopOpacity={0} />
//             </linearGradient>
//             <linearGradient id="negativeGrad" x1="0" y1="0" x2="0" y2="1">
//               <stop offset="5%" stopColor={NEGATIVE} stopOpacity={0.3} />
//               <stop offset="95%" stopColor={NEGATIVE} stopOpacity={0} />
//             </linearGradient>
//           </defs>
//           <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
//           <XAxis dataKey="date" tick={{ fill: NEUTRAL, fontSize: 9 }} angle={-45} textAnchor="end" interval={Math.floor(data.length / 8)} />
//           <YAxis tick={{ fill: NEUTRAL, fontSize: 11 }} tickFormatter={(v) => `${currency}${(v / 1000).toFixed(0)}k`} />
//           <Tooltip formatter={(val) => fmt(val)} contentStyle={TOOLTIP_STYLE} labelStyle={TOOLTIP_LABEL_STYLE} />
//           <ReferenceLine y={0} stroke={NEUTRAL} strokeDasharray="4 4" />
//           <Area
//             type="monotone"
//             dataKey="cumulative"
//             name="Cumulative Balance"
//             stroke={POSITIVE}
//             fill="url(#positiveGrad)"
//             strokeWidth={2}
//           />
//         </AreaChart>
//       </ResponsiveContainer>
//     ),

//     histogram: (
//       <ResponsiveContainer width="100%" height={280}>
//         <BarChart data={data} margin={{ top: 10, right: 20, left: 20, bottom: 40 }}>
//           <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
//           <XAxis dataKey="range" tick={{ fill: NEUTRAL, fontSize: 10 }} angle={-45} textAnchor="end" />
//           <YAxis tick={{ fill: NEUTRAL, fontSize: 11 }} />
//           <Tooltip contentStyle={TOOLTIP_STYLE} labelStyle={TOOLTIP_LABEL_STYLE} />
//           <Bar dataKey="count" name="Transactions" fill={BLUE} radius={[4, 4, 0, 0]} />
//         </BarChart>
//       </ResponsiveContainer>
//     ),

//     heatmap: (
//       <ResponsiveContainer width="100%" height={320}>
//         <BarChart data={data} margin={{ top: 10, right: 20, left: 20, bottom: 40 }}>
//           <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
//           <XAxis dataKey="day" tick={{ fill: NEUTRAL, fontSize: 11 }} angle={-45} textAnchor="end" />
//           <YAxis tick={{ fill: NEUTRAL, fontSize: 11 }} tickFormatter={(v) => `${currency}${(v / 1000).toFixed(0)}k`} />
//           <Tooltip formatter={(val) => fmt(val)} contentStyle={TOOLTIP_STYLE} labelStyle={TOOLTIP_LABEL_STYLE} />
//           <Legend />
//           <Bar dataKey="total_spending" name="Spending" fill={NEGATIVE} radius={[4, 4, 0, 0]} />
//         </BarChart>
//       </ResponsiveContainer>
//     ),

//     recurring_transactions: (
//       <ResponsiveContainer width="100%" height={400}>
//         <BarChart data={data.slice(0, 10)} layout="vertical" margin={{ top: 10, right: 30, left: 200, bottom: 10 }}>
//           <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
//           <XAxis type="number" tick={{ fill: NEUTRAL, fontSize: 11 }} tickFormatter={(v) => `${currency}${(v / 1000).toFixed(0)}k`} />
//           <YAxis
//             type="category"
//             dataKey="narration"
//             tick={{ fill: NEUTRAL, fontSize: 10 }}
//             width={190}
//             tickFormatter={(v) => v.length > 30 ? v.substring(0, 30) + "..." : v}
//           />
//           <Tooltip
//             formatter={(val, name) => name === "count" ? val : fmt(val)}
//             contentStyle={TOOLTIP_STYLE}
//             labelStyle={TOOLTIP_LABEL_STYLE}
//           />
//           <Legend />
//           <Bar dataKey="total_amount" name="Total Spent" fill={NEGATIVE} radius={[0, 4, 4, 0]} />
//         </BarChart>
//       </ResponsiveContainer>
//     ),

//     year_over_year: (
//       <ResponsiveContainer width="100%" height={280}>
//         <BarChart data={data} margin={{ top: 10, right: 20, left: 20, bottom: 10 }}>
//           <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
//           <XAxis dataKey="year" tick={{ fill: NEUTRAL, fontSize: 12 }} />
//           <YAxis tick={{ fill: NEUTRAL, fontSize: 11 }} tickFormatter={(v) => `${currency}${(v / 1000).toFixed(0)}k`} />
//           <Tooltip formatter={(val) => fmt(val)} contentStyle={TOOLTIP_STYLE} labelStyle={TOOLTIP_LABEL_STYLE} />
//           <Legend />
//           <Bar dataKey="income" name="Income" fill={POSITIVE} radius={[4, 4, 0, 0]} />
//           <Bar dataKey="spending" name="Spending" fill={NEGATIVE} radius={[4, 4, 0, 0]} />
//         </BarChart>
//       </ResponsiveContainer>
//     ),

//     seasonal_patterns: (
//       <ResponsiveContainer width="100%" height={280}>
//         <LineChart data={data} margin={{ top: 10, right: 20, left: 20, bottom: 10 }}>
//           <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
//           <XAxis dataKey="month" tick={{ fill: NEUTRAL, fontSize: 11 }} />
//           <YAxis tick={{ fill: NEUTRAL, fontSize: 11 }} tickFormatter={(v) => `${currency}${(v / 1000).toFixed(0)}k`} />
//           <Tooltip formatter={(val) => fmt(val)} contentStyle={TOOLTIP_STYLE} labelStyle={TOOLTIP_LABEL_STYLE} />
//           <Legend />
//           <Line type="monotone" dataKey="avg_spending" name="Avg Spending" stroke={NEGATIVE} strokeWidth={2} dot={{ fill: NEGATIVE, r: 3 }} />
//           <Line type="monotone" dataKey="avg_income" name="Avg Income" stroke={POSITIVE} strokeWidth={2} dot={{ fill: POSITIVE, r: 3 }} />
//         </LineChart>
//       </ResponsiveContainer>
//     ),

//     balance_trend: (
//       <ResponsiveContainer width="100%" height={280}>
//         <AreaChart data={data} margin={{ top: 10, right: 20, left: 20, bottom: 40 }}>
//           <defs>
//             <linearGradient id="balanceGrad" x1="0" y1="0" x2="0" y2="1">
//               <stop offset="5%" stopColor={BLUE} stopOpacity={0.3} />
//               <stop offset="95%" stopColor={BLUE} stopOpacity={0} />
//             </linearGradient>
//           </defs>
//           <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
//           <XAxis dataKey="date" tick={{ fill: NEUTRAL, fontSize: 9 }} angle={-45} textAnchor="end" interval={Math.floor(data.length / 8)} />
//           <YAxis tick={{ fill: NEUTRAL, fontSize: 11 }} tickFormatter={(v) => `${currency}${(v / 1000).toFixed(0)}k`} />
//           <Tooltip formatter={(val) => fmt(val)} contentStyle={TOOLTIP_STYLE} labelStyle={TOOLTIP_LABEL_STYLE} />
//           <Area type="monotone" dataKey="balance" name="Balance" stroke={BLUE} fill="url(#balanceGrad)" strokeWidth={2} />
//         </AreaChart>
//       </ResponsiveContainer>
//     ),

//     category_breakdown: (
//       <ResponsiveContainer width="100%" height={300}>
//         <PieChart>
//           <Pie
//             data={data.slice(0, 7)}
//             dataKey="amount"
//             nameKey="category"
//             cx="50%"
//             cy="50%"
//             outerRadius={110}
//             label={({ category, percent }) => `${category} ${(percent * 100).toFixed(0)}%`}
//             labelLine={{ stroke: NEUTRAL }}
//           >
//             {data.slice(0, 7).map((_, i) => (
//               <Cell key={i} fill={COLORS[i % COLORS.length]} stroke="#09090b" strokeWidth={2} />
//             ))}
//           </Pie>
//           <Tooltip formatter={(val) => fmt(val)} contentStyle={TOOLTIP_STYLE} labelStyle={TOOLTIP_LABEL_STYLE} />
//         </PieChart>
//       </ResponsiveContainer>
//     ),

//     bank_charges_breakdown: (
//       <ResponsiveContainer width="100%" height={280}>
//         <PieChart>
//           <Pie
//             data={data.slice(0, 6)}
//             dataKey="amount"
//             nameKey="category"
//             cx="50%"
//             cy="50%"
//             outerRadius={100}
//             label={({ category, percent }) => `${category} ${(percent * 100).toFixed(0)}%`}
//             labelLine={{ stroke: NEUTRAL }}
//           >
//             {data.slice(0, 6).map((_, i) => (
//               <Cell key={i} fill={COLORS[i % COLORS.length]} stroke="#09090b" strokeWidth={2} />
//             ))}
//           </Pie>
//           <Tooltip formatter={(val) => fmt(val)} contentStyle={TOOLTIP_STYLE} labelStyle={TOOLTIP_LABEL_STYLE} />
//         </PieChart>
//       </ResponsiveContainer>
//     ),

//     type_distribution: (
//       <ResponsiveContainer width="100%" height={260}>
//         <BarChart data={data} margin={{ top: 10, right: 20, left: 20, bottom: 10 }}>
//           <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
//           <XAxis dataKey="type" tick={{ fill: NEUTRAL, fontSize: 12 }} />
//           <YAxis tick={{ fill: NEUTRAL, fontSize: 11 }} />
//           <Tooltip contentStyle={TOOLTIP_STYLE} labelStyle={TOOLTIP_LABEL_STYLE} />
//           <Bar dataKey="count" name="Transactions" radius={[4, 4, 0, 0]}>
//             {data.map((_, i) => (
//               <Cell key={i} fill={COLORS[i % COLORS.length]} />
//             ))}
//           </Bar>
//         </BarChart>
//       </ResponsiveContainer>
//     )
//   }

//   return (
//     <motion.div
//       initial={{ opacity: 0, y: 20 }}
//       animate={{ opacity: 1, y: 0 }}
//       transition={{ duration: 0.5 }}
//       className="bg-zinc-900/60 backdrop-blur-sm border border-zinc-800 rounded-3xl p-6 my-6"
//     >
//       <p className="text-zinc-400 text-sm font-medium mb-4">{title}</p>
//       {chartMap[chart_id] || null}
//     </motion.div>
//   )
// }


// function NarrativeBlock({ block, eda, currency }) {

//   if (block.type === "section_header") {
//     return (
//       <motion.h2
//         initial={{ opacity: 0, x: -20 }}
//         animate={{ opacity: 1, x: 0 }}
//         transition={{ duration: 0.4 }}
//         className="text-2xl font-bold mt-12 mb-4 text-white border-l-4 border-white pl-4"
//       >
//         {block.content}
//       </motion.h2>
//     )
//   }

//   if (block.type === "paragraph") {
//     return (
//       <motion.p
//         initial={{ opacity: 0 }}
//         animate={{ opacity: 1 }}
//         transition={{ duration: 0.4 }}
//         className="text-zinc-300 leading-relaxed mb-4"
//       >
//         {block.content}
//       </motion.p>
//     )
//   }

//   if (block.type === "chart") {
//     return (
//       <ChartBlock
//         chart_id={block.chart_id}
//         title={block.title}
//         eda={eda}
//         currency={currency}
//       />
//     )
//   }

//   return null
// }


// export default function FullReport({ reportData }) {

//   const { narrative, eda, risk_analysis, behavior_analysis } = reportData
//   const currency = eda?.currency || "₦"

//   return (
//     <motion.div
//       initial={{ opacity: 0 }}
//       animate={{ opacity: 1 }}
//       transition={{ duration: 0.6 }}
//       className="max-w-4xl mx-auto pb-32 text-white"
//     >

//       <div className="mb-10">
//         <h1 className="text-4xl font-bold mb-2">Full Financial Report</h1>
//         <p className="text-zinc-500 text-sm">
//           AI-generated analysis — powered by FITI intelligence engine
//         </p>
//       </div>

//       <div>
//         {narrative.map((block, i) => (
//           <NarrativeBlock
//             key={i}
//             block={block}
//             eda={eda}
//             currency={currency}
//           />
//         ))}
//       </div>

//       <ChatBot
//         eda={eda}
//         riskAnalysis={risk_analysis || {}}
//         behaviorAnalysis={behavior_analysis || []}
//         currency={currency}
//       />

//     </motion.div>
//   )
// }