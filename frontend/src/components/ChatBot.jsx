import { useState, useRef, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { FiMessageCircle, FiX, FiSend } from "react-icons/fi"


export default function ChatBot({
  eda,
  riskAnalysis,
  behaviorAnalysis,
  currency
}) {

  const [open, setOpen] = useState(false)
  const [message, setMessage] = useState("")
  const [history, setHistory] = useState([])
  const [loading, setLoading] = useState(false)
  const [streaming, setStreaming] = useState("")
  const bottomRef = useRef(null)


  useEffect(() => {
    if (bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: "smooth" })
    }
  }, [history, streaming, loading])


  const sendMessage = async () => {

    if (!message.trim() || loading) return

    const userMessage = message.trim()
    setMessage("")
    setStreaming("")

    const newHistory = [
      ...history,
      { role: "user", content: userMessage }
    ]

    setHistory(newHistory)
    setLoading(true)

    try {

      const response = await fetch(`${import.meta.env.VITE_API_URL || "http://127.0.0.1:8000"}/chat/message`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          message: userMessage,
          conversation_history: history,
          eda: eda,
          risk_analysis: riskAnalysis,
          behavior_analysis: behaviorAnalysis,
          currency: currency
        })
      })

      if (!response.ok) {
        throw new Error("Stream request failed")
      }

      const reader = response.body.getReader()
      const decoder = new TextDecoder()
      let fullResponse = ""

      setLoading(false)

      while (true) {

        const { done, value } = await reader.read()

        if (done) break

        const chunk = decoder.decode(value, { stream: true })
        fullResponse += chunk
        setStreaming(fullResponse)
      }

      setHistory([
        ...newHistory,
        {
          role: "assistant",
          content: fullResponse
        }
      ])

      setStreaming("")

    } catch (err) {

      console.error(err)
      setLoading(false)
      setStreaming("")

      setHistory([
        ...newHistory,
        {
          role: "assistant",
          content: "Something went wrong. Try again."
        }
      ])

    }
  }


  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }


  return (

    <div className="fixed bottom-8 right-8 z-50">

      <AnimatePresence>
        {open && (

          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.3 }}
            className="absolute bottom-20 right-0 w-96 bg-zinc-900 border border-zinc-800 rounded-3xl shadow-2xl overflow-hidden"
          >

            {/* HEADER */}

            <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-800">

              <div>
                <p className="font-semibold text-sm">FITI AI</p>
                <p className="text-zinc-500 text-xs">Ask me about your transactions</p>
              </div>

              <button
                onClick={() => setOpen(false)}
                className="text-zinc-500 hover:text-white transition"
              >
                <FiX size={18} />
              </button>

            </div>


            {/* MESSAGES */}

            <div className="h-80 overflow-y-auto px-4 py-4 space-y-4">

              {history.length === 0 && !streaming && (

                <div className="text-center mt-8">
                  <p className="text-zinc-500 text-sm">
                    Hey! Ask me anything about your finances.
                  </p>
                  <div className="mt-4 space-y-2">
                    {[
                      "What did I spend the most on?",
                      "Was April a good month?",
                      "Where is my money going?"
                    ].map((suggestion, i) => (
                      <button
                        key={i}
                        onClick={() => setMessage(suggestion)}
                        className="block w-full text-left text-xs text-zinc-400 bg-zinc-800 hover:bg-zinc-700 px-3 py-2 rounded-xl transition"
                      >
                        {suggestion}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {history.map((msg, i) => (

                <div
                  key={i}
                  className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                >

                  <div
                    className={`max-w-xs px-4 py-3 rounded-2xl text-sm leading-relaxed ${
                      msg.role === "user"
                        ? "bg-white text-black rounded-br-sm"
                        : "bg-zinc-800 text-zinc-200 rounded-bl-sm"
                    }`}
                  >
                    {msg.content}
                  </div>

                </div>
              ))}

              {/* STREAMING RESPONSE */}

              {streaming && (

                <div className="flex justify-start">
                  <div className="max-w-xs px-4 py-3 rounded-2xl rounded-bl-sm bg-zinc-800 text-zinc-200 text-sm leading-relaxed">
                    {streaming}
                    <span className="inline-block w-1.5 h-3.5 bg-zinc-400 ml-0.5 animate-pulse rounded-sm" />
                  </div>
                </div>
              )}

              {/* LOADING DOTS */}

              {loading && !streaming && (

                <div className="flex justify-start">
                  <div className="bg-zinc-800 px-4 py-3 rounded-2xl rounded-bl-sm">
                    <div className="flex gap-1">
                      <span className="w-1.5 h-1.5 bg-zinc-500 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                      <span className="w-1.5 h-1.5 bg-zinc-500 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                      <span className="w-1.5 h-1.5 bg-zinc-500 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                    </div>
                  </div>
                </div>
              )}

              <div ref={bottomRef} />

            </div>


            {/* INPUT */}

            <div className="px-4 py-3 border-t border-zinc-800 flex gap-2">

              <input
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask about your finances..."
                className="flex-1 bg-zinc-800 text-white text-sm px-4 py-2.5 rounded-xl outline-none placeholder-zinc-500"
              />

              <button
                onClick={sendMessage}
                disabled={!message.trim() || loading}
                className="bg-white text-black p-2.5 rounded-xl hover:scale-105 transition disabled:opacity-40"
              >
                <FiSend size={16} />
              </button>

            </div>

          </motion.div>
        )}
      </AnimatePresence>


      {/* TOGGLE BUTTON */}

      <motion.button
        onClick={() => setOpen(!open)}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="bg-white text-black p-4 rounded-full shadow-lg"
      >
        {open ? <FiX size={22} /> : <FiMessageCircle size={22} />}
      </motion.button>

    </div>
  )
}

