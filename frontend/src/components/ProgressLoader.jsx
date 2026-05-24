// import { useState, useEffect, useRef } from "react"
// import { motion } from "framer-motion"


// const CLASSIFY_STEPS = [
//   { at: 5,  message: "Reading your statement",               delay: 1500  },
//   { at: 10, message: "Detecting bank format and schema",     delay: 4000  },
//   { at: 20, message: "Classifying transactions",             delay: 8000  },
//   { at: 35, message: "Still classifying — this takes a moment", delay: 8000 },
//   { at: 50, message: "Halfway there",                        delay: 8000  },
//   { at: 65, message: "Analysing spending behaviour",         delay: 6000  },
//   { at: 75, message: "Running risk analysis",                delay: 4000  },
//   { at: 85, message: "Generating AI insights",               delay: 4000  },
//   { at: 99, message: "Putting it all together",              delay: 99999 },
// ]

// const REPORT_STEPS = [
//   { at: 5,  message: "Loading transaction data",             delay: 1500  },
//   { at: 15, message: "Running exploratory data analysis",    delay: 5000  },
//   { at: 30, message: "Computing trends and patterns",        delay: 6000  },
//   { at: 50, message: "AI is writing your report",            delay: 10000 },
//   { at: 65, message: "Deciding which charts to include",     delay: 8000  },
//   { at: 80, message: "Finalising narrative sections",        delay: 6000  },
//   { at: 99, message: "Almost ready",                         delay: 99999 },
// ]

// export { CLASSIFY_STEPS, REPORT_STEPS }


// // When realPct + realMessage are passed in (SSE mode), the loader
// // follows the real backend progress instead of the fake timer steps.
// // When they are undefined (report/generate mode), it falls back to
// // the original timer-driven animation.

// export default function ProgressLoader({ active, steps, realPct, realMessage }) {

//   const [percent, setPercent]   = useState(0)
//   const [message, setMessage]   = useState("")
//   const stepIndexRef            = useRef(0)
//   const tickerRef               = useRef(null)
//   const stepTimerRef            = useRef(null)
//   const displayPctRef           = useRef(0)  // smooth-scroll toward realPct

//   const isRealMode = realPct !== undefined && realPct !== null


//   // ── REAL MODE: follow SSE stream ──────────────────────────────────────────
//   useEffect(() => {
//     if (!isRealMode) return

//     if (!active) {
//       clearInterval(tickerRef.current)
//       setPercent(0)
//       setMessage("")
//       displayPctRef.current = 0
//       return
//     }

//     if (realMessage) setMessage(realMessage)

//     // Smoothly animate display percent toward realPct
//     clearInterval(tickerRef.current)
//     tickerRef.current = setInterval(() => {
//       if (displayPctRef.current < realPct) {
//         displayPctRef.current = Math.min(displayPctRef.current + 1, realPct)
//         setPercent(displayPctRef.current)
//       } else {
//         clearInterval(tickerRef.current)
//       }
//     }, 40)

//     return () => clearInterval(tickerRef.current)

//   }, [realPct, realMessage, active, isRealMode])


//   // ── FAKE MODE: timer-driven steps (report/generate, no SSE) ───────────────
//   useEffect(() => {
//     if (isRealMode) return

//     if (!active) {
//       clearInterval(tickerRef.current)
//       clearTimeout(stepTimerRef.current)
//       setPercent(0)
//       setMessage("")
//       stepIndexRef.current = 0
//       return
//     }

//     const runStep = () => {
//       const i = stepIndexRef.current
//       if (i >= steps.length) return

//       const current = steps[i]
//       setMessage(current.message)

//       clearInterval(tickerRef.current)
//       tickerRef.current = setInterval(() => {
//         setPercent(prev => {
//           if (prev >= current.at) {
//             clearInterval(tickerRef.current)
//             return current.at
//           }
//           return prev + 1
//         })
//       }, 80)

//       stepIndexRef.current += 1
//       const isLast = stepIndexRef.current >= steps.length
//       if (!isLast) {
//         stepTimerRef.current = setTimeout(runStep, current.delay)
//       }
//     }

//     runStep()

//     return () => {
//       clearInterval(tickerRef.current)
//       clearTimeout(stepTimerRef.current)
//     }

//   }, [active, steps, isRealMode])


//   if (!active && percent === 0) return null

//   return (
//     <motion.div
//       initial={{ opacity: 0 }}
//       animate={{ opacity: 1 }}
//       exit={{ opacity: 0 }}
//       className="mt-10 text-center"
//     >
//       <p className="text-zinc-300 text-lg">
//         {message}
//         <span className="text-zinc-500">..... </span>
//         <span className="font-mono font-semibold text-white">{percent}%</span>
//       </p>
//     </motion.div>
//   )
// }


import { useState, useEffect, useRef } from "react"
import { motion } from "framer-motion"


const CLASSIFY_STEPS = [
  { at: 5, message: "Reading your statement", delay: 1500 },
  { at: 10, message: "Detecting bank format and schema", delay: 4000 },
  { at: 20, message: "Classifying transactions", delay: 8000 },
  { at: 35, message: "Still classifying — this takes a moment", delay: 8000 },
  { at: 50, message: "Halfway there", delay: 8000 },
  { at: 65, message: "Analysing spending behaviour", delay: 6000 },
  { at: 75, message: "Running risk analysis", delay: 4000 },
  { at: 85, message: "Generating AI insights", delay: 4000 },
  { at: 99, message: "Putting it all together", delay: 99999 },
]

const REPORT_STEPS = [
  { at: 5, message: "Loading transaction data", delay: 1500 },
  { at: 15, message: "Running exploratory data analysis", delay: 5000 },
  { at: 30, message: "Computing trends and patterns", delay: 6000 },
  { at: 50, message: "AI is writing your report", delay: 10000 },
  { at: 65, message: "Deciding which charts to include", delay: 8000 },
  { at: 80, message: "Finalising narrative sections", delay: 6000 },
  { at: 99, message: "Almost ready", delay: 99999 },
]

export { CLASSIFY_STEPS, REPORT_STEPS }


export default function ProgressLoader({ active, steps }) {

  const [percent, setPercent] = useState(0)
  const [message, setMessage] = useState("")
  const stepIndexRef = useRef(0)
  const tickerRef = useRef(null)
  const stepTimerRef = useRef(null)


  useEffect(() => {

    if (!active) {
      clearInterval(tickerRef.current)
      clearTimeout(stepTimerRef.current)
      setPercent(0)
      setMessage("")
      stepIndexRef.current = 0
      return
    }

    const runStep = () => {

      const i = stepIndexRef.current
      if (i >= steps.length) return

      const current = steps[i]

      setMessage(current.message)

      clearInterval(tickerRef.current)

      tickerRef.current = setInterval(() => {
        setPercent(prev => {
          if (prev >= current.at) {
            clearInterval(tickerRef.current)
            return current.at
          }
          return prev + 1
        })
      }, 80)

      stepIndexRef.current += 1

      const isLast = stepIndexRef.current >= steps.length
      if (!isLast) {
        stepTimerRef.current = setTimeout(runStep, current.delay)
      }
    }

    runStep()

    return () => {
      clearInterval(tickerRef.current)
      clearTimeout(stepTimerRef.current)
    }

  }, [active, steps])


  if (!active && percent === 0) return null


  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="mt-10 text-center"
    >
      <p className="text-zinc-300 text-lg">
        {message}
        <span className="text-zinc-500">..... </span>
        <span className="font-mono font-semibold text-white">{percent}%</span>
      </p>
    </motion.div>
  )
}