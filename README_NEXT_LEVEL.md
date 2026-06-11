# FITI — Financial Intelligence System

> Upload your bank statement. Understand your financial life.

**Live demo:** https://fiti-lemon.vercel.app

---

## What is FITI?

FITI is a behavioral financial intelligence platform that analyzes bank statements 
and surfaces deep insights about spending patterns, financial health, and behavioral 
tendencies — going beyond basic summaries to identify *why* someone spends the way they do.

---

## How it works

1. Upload a CSV or Excel bank statement
2. FITI parses, classifies, and analyzes every transaction
3. A full report is generated: spending breakdown, anomalies, savings margin, risk flags
4. An AI-powered chat interface lets you interrogate your own financial data

---

## Microsoft Foundry IQ Integration

FITI's conversational AI layer is powered by **Azure AI Foundry (Foundry IQ)** using 
GPT-4.1-mini. The chatbot receives a fully grounded financial context built from the 
user's verified transaction data — eliminating hallucination by anchoring every response 
to real, session-specific numbers.

This is Foundry IQ's core value proposition applied to personal finance: cited, grounded, 
permission-scoped answers from a user's own data.

---

## Tech Stack

**Frontend:** React, Tailwind CSS, Recharts — deployed on Vercel  
**Backend:** FastAPI — deployed on Render  
**AI — Chat:** Azure AI Foundry (GPT-4.1-mini) via Foundry IQ  
**AI — Classification:** Qwen3-32b via Groq  
**AI — Narrative:** Llama-3.3-70b via Groq  
**AI — Report:** Amazon Nova Pro via AWS Bedrock  

---

## Behavioral Engine (Phase 2)

9 deterministic behavioral functions that profile financial psychology:
- Payday Reactivity
- Present Bias Index
- Impulse Deficit Score
- Subscription Creep
- Financial Stress State
- Margin of Safety Depletion
- Income Entropy
- Poverty Premium Transition
- Fee Drain Velocity

Users are mapped to one of 7 archetypes: **The Survivor → The Architect**

---

## Track

🧠 Reasoning Agents — Microsoft Agents League Hackathon 2026  
💡 Microsoft IQ Layer: Foundry IQ
