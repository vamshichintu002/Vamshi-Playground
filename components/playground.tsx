'use client'

import { useState, useEffect, useRef } from 'react'
import { Send, ExternalLink, Copy, Trash, Maximize2, Image as ImageIcon, Type, Moon, Sun, StopCircle, Zap, Clock, Hash } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import dynamic from 'next/dynamic'
import Image from 'next/image'
import ReactMarkdown from 'react-markdown'

import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { ModelSelector } from './ModelSelector'
import { models } from './ModelSelector'
import '../styles/markdown-styles.css'

const TypeAnimation = dynamic(() => import('react-type-animation').then(mod => mod.TypeAnimation), {
  ssr: false,
  loading: () => <p>Loading...</p>
})

type Message = {
  role: 'user' | 'assistant'
  content: string
  image?: string
  metrics?: {
    tokensPerSecond: number
    totalTokens: number
    timeTaken: number
  }
}

const LoadingAnimation = () => (
  <div className="flex items-center space-x-2">
    {[0, 1, 2].map((index) => (
      <motion.div
        key={index}
        className="w-2 h-2 bg-blue-500 rounded-full"
        animate={{ y: [0, -10, 0] }}
        transition={{ duration: 0.6, repeat: Infinity, delay: index * 0.1 }}
      />
    ))}
  </div>
)

const MessageBubble = motion.div

const WelcomeMessage = () => (
  <TypeAnimation
    sequence={[
      "Hi there!\nWelcome to Vamshi's Playground. Explore the latest image and text generation models, all available for free.",
      100,
      "How can I assist you today?",
    ]}
    wrapper="div"
    speed={70}
    style={{ whiteSpace: 'pre-line', display: 'inline-block' }}
    repeat={0}
  />
)

const CodeBlock = ({ content }: { content: string }) => (
  <div className="my-2 overflow-hidden rounded-lg bg-gray-100 dark:bg-gray-800">
    <div className="bg-gray-200 dark:bg-gray-700 px-4 py-2 font-mono text-sm">Python Code Output</div>
    <pre className="p-4 overflow-x-auto">
      <code>{content}</code>
    </pre>
  </div>
)

const ResponseMetrics = ({ tokensPerSecond, totalTokens, timeTaken }: { tokensPerSecond: number, totalTokens: number, timeTaken: number }) => (
  <div className="flex flex-wrap justify-between items-center text-xs mt-2 px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded-md">
    <div className="flex items-center space-x-1 text-blue-500 dark:text-blue-400 mb-1 sm:mb-0">
      <Zap size={14} />
      <span>{tokensPerSecond.toFixed(2)} tokens/sec</span>
    </div>
    <div className="flex items-center space-x-1 text-purple-500 dark:text-purple-400 mb-1 sm:mb-0">
      <Hash size={14} />
      <span>{totalTokens} tokens</span>
    </div>
    <div className="flex items-center space-x-1 text-green-500 dark:text-green-400">
      <Clock size={14} />
      <span>{timeTaken.toFixed(2)} sec</span>
    </div>
  </div>
)

const MessageContent = ({ content }: { content: string }) => (
  <div className="message">
    <ReactMarkdown>{content}</ReactMarkdown>
  </div>
)

export function Playground() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: 'welcome'
    }
  ])
  const [inputValue, setInputValue] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [model, setModel] = useState('gemma2-9b-it')
  const [modalImage, setModalImage] = useState<string | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const [arliaiStream, setArliaiStream] = useState<ReadableStream | null>(null)
  const [darkMode, setDarkMode] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)
  const abortControllerRef = useRef<AbortController | null>(null)

  const isImageGenerationModel = model === 'XLabs-AI/flux-RealismLora'

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  useEffect(() => {
    document.body.classList.toggle('dark', darkMode)
  }, [darkMode])

  const handleSendMessage = async () => {
    if (inputValue.trim()) {
      const startTime = Date.now()
      const newUserMessage: Message = { role: 'user', content: inputValue }
      setMessages(prev => [...prev, newUserMessage])
      setInputValue('')
      setIsLoading(true)
      setIsGenerating(true)

      try {
        let apiEndpoint: string
        let body: any
        let headers: HeadersInit = {
          'Content-Type': 'application/json'
        }

        const arliAIModels = models.codeGeneration

        if (arliAIModels.includes(model)) {
          apiEndpoint = 'https://api.arliai.com/v1/chat/completions'
          headers['Authorization'] = `Bearer ${process.env.NEXT_PUBLIC_ARLIAI_API_KEY}`
          body = JSON.stringify({
            model: model,
            messages: [
              {"role": "system", "content": "You are a helpful assistant."},
              ...messages.map(msg => ({ role: msg.role, content: msg.content })),
              {"role": "user", "content": inputValue}
            ],
            repetition_penalty: 1.1,
            temperature: 0.7,
            top_p: 0.9,
            top_k: 40,
            max_tokens: 1024,
            stream: true
          })
        } else if (model.startsWith('microsoft/') || model === 'HuggingFaceH4/zephyr-7b-beta' || model === 'XLabs-AI/flux-RealismLora') {
          apiEndpoint = '/api/huggingface'
          body = JSON.stringify({ prompt: inputValue, model })
        } else {
          apiEndpoint = '/api/groq'
          body = JSON.stringify({ prompt: inputValue, model })
        }
        
        setMessages(prev => [...prev, { role: 'assistant', content: 'loading' }])

        abortControllerRef.current = new AbortController()
        const timeoutId = setTimeout(() => abortControllerRef.current?.abort(), 60000)

        const res = await fetch(apiEndpoint, {
          method: 'POST',
          headers: headers,
          body: body,
          signal: abortControllerRef.current.signal
        })

        clearTimeout(timeoutId)

        if (!res.ok) {
          const errorData = await res.json()
          throw new Error(errorData.error?.message || `Failed to generate response: ${res.status} ${res.statusText}`)
        }

        if (model === 'XLabs-AI/flux-RealismLora') {
          const data = await res.json()
          setMessages(prev => [
            ...prev.slice(0, -1),
            { role: 'assistant', content: 'Image generated:', image: data.image }
          ])
        } else {
          const reader = res.body?.getReader()
          const decoder = new TextDecoder()
          let assistantMessage = ''

          while (true) {
            const { done, value } = await reader!.read()
            if (done) break
            const chunk = decoder.decode(value)
            
            if (arliAIModels.includes(model)) {
              const lines = chunk.split('\n')
              for (const line of lines) {
                if (line.startsWith('data: ')) {
                  const data = line.slice(5).trim()
                  if (data === '[DONE]') {
                    break
                  }
                  if (data) {
                    try {
                      const parsed = JSON.parse(data)
                      assistantMessage += parsed.choices[0].delta.content || ''
                    } catch (e) {
                      console.error('Error parsing SSE data:', e)
                    }
                  }
                }
              }
            } else {
              const lines = chunk.split('\n\n')
              for (const line of lines) {
                if (line.startsWith('data: ')) {
                  const data = JSON.parse(line.slice(6))
                  if (data.error) {
                    throw new Error(data.details || 'An error occurred during streaming')
                  }
                  assistantMessage += data.content || data.token?.text || ''
                }
              }
            }

            setMessages(prev => [
              ...prev.slice(0, -1),
              { role: 'assistant', content: assistantMessage }
            ])
          }

          const endTime = Date.now()
          const timeTaken = (endTime - startTime) / 1000
          const totalTokens = assistantMessage.split(/\s+/).length
          const tokensPerSecond = totalTokens / timeTaken

          setMessages(prev => [
            ...prev.slice(0, -1),
            { 
              role: 'assistant', 
              content: assistantMessage,
              metrics: {
                tokensPerSecond,
                totalTokens,
                timeTaken
              }
            }
          ])
        }
      } catch (error) {
        if (error instanceof Error && error.name === 'AbortError') {
          console.log('Request was aborted')
          setMessages(prev => [
            ...prev.slice(0, -1),
            { 
              role: 'assistant', 
              content: 'The request was stopped.' 
            }
          ])
        } else {
          console.error('Error:', error)
          setMessages(prev => [
            ...prev.slice(0, -1),
            { 
              role: 'assistant', 
              content: `An error occurred: ${error instanceof Error ? error.message : String(error)}. Please try again or select a different model.` 
            }
          ])
        }
      } finally {
        setIsLoading(false)
        setIsGenerating(false)
        abortControllerRef.current = null
      }
    }
  }

  const handleCopyMessage = (content: string) => {
    navigator.clipboard.writeText(content)
  }

  const handleClearChat = () => {
    setMessages([])
  }

  const openImageModal = (imageSrc: string) => {
    setModalImage(imageSrc)
  }

  const closeImageModal = () => {
    setModalImage(null)
  }

  const toggleDarkMode = () => {
    setDarkMode(prev => !prev)
  }

  const handleStopGeneration = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
    }
  }

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className={`flex flex-col h-screen ${darkMode ? 'dark' : ''}`}
    >
      <motion.header
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.5 }}
        className="flex items-center justify-between p-2 sm:p-4 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-800 dark:text-white"
      >
        <div className="flex items-center space-x-2 sm:space-x-4">
          <motion.h1 
            className="text-base sm:text-lg md:text-xl font-semibold truncate"
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.5, type: "spring", stiffness: 200 }}
          >
            ⚡ Vamshi&apos;s Chatbot 
          </motion.h1>
          <span className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 hidden sm:inline">PLAYGROUND</span>
        </div>
        <div className="flex items-center space-x-2">
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="hidden sm:block"
          >
            <Button variant="outline" size="sm" className="text-xs sm:text-sm text-gray-600 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200">
              <ExternalLink className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
              API Docs
            </Button>
          </motion.div>
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Button variant="outline" size="icon" onClick={toggleDarkMode} className="text-gray-600 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200">
              {darkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </Button>
          </motion.div>
        </div>
      </motion.header>
      <main className="flex-grow overflow-auto p-2 sm:p-4 space-y-2 sm:space-y-4 bg-gray-50  dark:bg-gray-900">
        <AnimatePresence>
          {messages.map((message, index) => (
            <MessageBubble
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className={`flex ${message.role === 'assistant' ? 'justify-start' : 'justify-end'}`}
            >
              <motion.div 
                className={`max-w-[85%] sm:max-w-2xl p-3 sm:p-4 rounded-3xl shadow-lg ${
                  message.role === 'assistant' 
                    ? 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700' 
                    : 'bg-gradient-to-br from-blue-500 to-blue-600 text-white'
                } transition-transform transform hover:scale-105 duration-300 ease-in-out`}
                whileHover={{ scale: 1.02, boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)' }}
                transition={{ duration: 0.2 }}
              >
                {message.content === 'loading' ? (
                  <LoadingAnimation />
                ) : message.content === 'welcome' ? (
                  <WelcomeMessage />
                ) : (
                  <>
                    <MessageContent content={message.content} />
                    {message.image && ( 
                      <motion.div 
                        className="mt-2 relative"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.2, duration: 0.3 }}
                      >
                        <Image 
                          src={message.image}
                          alt="Generated image"
                          width={500}
                          height={300}
                          className="w-full h-auto rounded cursor-pointer transition-transform duration-200 hover:scale-105"
                          style={{ maxHeight: '200px', objectFit: 'contain' }}
                          onClick={() => openImageModal(message.image!)}
                        />
                        <motion.div
                          whileHover={{ scale: 1.1}}
                          whileTap={{scale: 0.9}}
                        >
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="absolute top-1 right-1 sm:top-2 sm:right-2 bg-white dark:bg-gray-800 bg-opacity-50 hover:bg-opacity-75 transition-colors duration-200"
                            onClick={() => openImageModal(message.image!)}
                          >
                            <Maximize2 className="w-3 h-3 sm:w-4 sm:h-4" />
                          </Button>
                        </motion.div>
                      </motion.div>
                    )}
                    {message.role === 'assistant' && message.metrics && (
                      <ResponseMetrics 
                        tokensPerSecond={message.metrics.tokensPerSecond}
                        totalTokens={message.metrics.totalTokens}
                        timeTaken={message.metrics.timeTaken}
                      />
                    )}
                    {message.role === 'assistant' && (
                      <motion.div
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <Button variant="ghost" size="sm" className="mt-1 sm:mt-2 text-xs sm:text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors duration-200" onClick={() => handleCopyMessage(message.content)}>
                          <Copy className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                          Copy
                        </Button>
                      </motion.div>
                    )}
                  </>
                )}
              </motion.div>
            </MessageBubble>
          ))}
        </AnimatePresence>
        <div ref={messagesEndRef} />
      </main>
      <motion.footer
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.5 }}
        className="p-2 sm:p-4 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800"
      >
        <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-2 mb-2">
          <ModelSelector onSelectModel={setModel} />
          <motion.div
            animate={{ rotate: isImageGenerationModel ? 360 : 0 }}
            transition={{ duration: 0.5 }}
            className="flex items-center"
          >
            {isImageGenerationModel ? (
              <ImageIcon className="w-4 h-4 sm:w-5 sm:h-5 text-blue-500" />
            ) : (
              <Type className="w-4 h-4 sm:w-5 sm:h-5 text-green-500" />
            )}
            <span className="ml-1 text-xs sm:text-sm text-gray-500 dark:text-gray-400">
              {isImageGenerationModel ? 'Image' : 'Text'}
            </span>
          </motion.div>
        </div>
        <div className="flex items-center space-x-2">
          <motion.div
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <Button variant="ghost" size="icon" className="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors duration-200" onClick={handleClearChat}>
              <Trash className="w-4 h-4 sm:w-5 sm:h-5" />
            </Button>
          </motion.div>
          <Textarea
            className="flex-grow bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-800 dark:text-white resize-none focus:ring-2 focus:ring-blue-500 transition-all duration-200 text-sm sm:text-base"
            placeholder={isImageGenerationModel ? "Describe the image..." : "Ask anything..."}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault()
                handleSendMessage()
              }
            }}
            rows={1}
          />
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Button
              variant="default"
              onClick={isGenerating ? handleStopGeneration : handleSendMessage}
              disabled={isLoading && !isGenerating}
              className={`bg-green-600 hover:bg-green-700 transition-colors duration-200 text-xs sm:text-sm text-white ${
                isGenerating ? 'bg-red-600 hover:bg-red-700' : ''
              }`}
            >
              {isLoading ? (
                isGenerating ? (
                  <>
                    <StopCircle className="w-4 h-4 sm:w-5 sm:h-5 mr-1 sm:mr-2" />
                    <span className="hidden sm:inline">Stop</span>
                  </>
                ) : (
                  <LoadingAnimation />
                )
              ) : (
                <>
                  <Send className="w-4 h-4 sm:w-5 sm:h-5 mr-1 sm:mr-2" />
                  <span className="hidden sm:inline">{isImageGenerationModel ? 'Generate' : 'Submit'}</span>
                </>
              )}
            </Button>
          </motion.div>
        </div>
      </motion.footer>

      <AnimatePresence>
        {modalImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50"
            onClick={closeImageModal}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="max-w-4xl max-h-[90vh] p-4 bg-white dark:bg-gray-800 rounded-lg overflow-auto"
            >
              <Image 
                src={modalImage}
                alt="Full size"
                width={1200}
                height={800}
                className="max-w-full max-h-full object-contain"
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}