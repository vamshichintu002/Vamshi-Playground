'use client'

import { useState, useEffect, useRef } from 'react'
import { Send, ExternalLink, Copy, Trash, Maximize2, Image as ImageIcon, Type } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import dynamic from 'next/dynamic'
import Image from 'next/image'

import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { ModelSelector } from './ModelSelector'

const TypeAnimation = dynamic(() => import('react-type-animation').then(mod => mod.TypeAnimation), {
  ssr: false,
  loading: () => <p>Loading...</p>
})

type Message = {
  role: 'user' | 'assistant'
  content: string
  image?: string
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

const MessageBubble = motion(motion.div)

const WelcomeMessage = () => (
  <TypeAnimation
    sequence={[
      "Hi there!\nWelcome to Vamshi's Playground. Explore the latest image and text generation models, all available for free.",
      100, // Reduced delay from 500 to 100
      "How can I assist you today?",
    ]}
    wrapper="div"
    speed={70} // Increased speed from 1 to 50 (higher number means faster typing)
    style={{ whiteSpace: 'pre-line', display: 'inline-block' }}
    repeat={0}
  />
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

  const isImageGenerationModel = model === 'XLabs-AI/flux-RealismLora'

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSendMessage = async () => {
    if (inputValue.trim()) {
      const newUserMessage: Message = { role: 'user', content: inputValue }
      setMessages(prev => [...prev, newUserMessage])
      setInputValue('')
      setIsLoading(true)

      try {
        const apiEndpoint = model.startsWith('microsoft/') || model === 'HuggingFaceH4/zephyr-7b-beta' || model === 'XLabs-AI/flux-RealismLora' ? '/api/huggingface' : '/api/groq';
        
        setMessages(prev => [...prev, { role: 'assistant', content: 'loading' }])

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 60000);

        const res = await fetch(apiEndpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ prompt: inputValue, model }),
          signal: controller.signal
        })

        clearTimeout(timeoutId);

        if (!res.ok) {
          const errorData = await res.json()
          throw new Error(errorData.details || `Failed to generate response: ${res.status} ${res.statusText}`)
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
            const lines = chunk.split('\n\n')
            for (const line of lines) {
              if (line.startsWith('data: ')) {
                const data = JSON.parse(line.slice(6))
                if (data.error) {
                  throw new Error(data.details || 'An error occurred during streaming')
                }
                assistantMessage += data.content || data.token?.text || ''
                setMessages(prev => [
                  ...prev.slice(0, -1),
                  { role: 'assistant', content: assistantMessage }
                ])
              }
            }
          }
        }
      } catch (error) {
        console.error('Error:', error)
        setMessages(prev => [
          ...prev.slice(0, -1),
          { 
            role: 'assistant', 
            content: `An error occurred: ${error instanceof Error ? error.message : String(error)}` 
          }
        ])
      } finally {
        setIsLoading(false)
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

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="flex flex-col h-screen bg-gradient-to-br from-gray-900 to-gray-800 text-white"
    >
      <motion.header
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.5 }}
        className="flex items-center justify-between p-2 sm:p-4 border-b border-gray-700 bg-gray-800 bg-opacity-50 backdrop-blur-sm"
      >
        <div className="flex items-center space-x-2 sm:space-x-4">
          <motion.h1 
            className="text-lg sm:text-xl font-semibold"
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.5, type: "spring", stiffness: 200 }}
          >
            ⚡ Vamshi&apos;s Chatbot 
          </motion.h1>
          <span className="text-xs sm:text-sm text-gray-400">PLAYGROUND</span>
        </div>
        <motion.div
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Button variant="outline" size="sm" className="text-xs sm:text-sm text-gray-400 border-gray-700 hover:bg-gray-700 transition-colors duration-200">
            <ExternalLink className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
            API Docs
          </Button>
        </motion.div>
      </motion.header>
      <main className="flex-grow overflow-auto p-2 sm:p-4 space-y-2 sm:space-y-4">
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
                className={`max-w-[85%] sm:max-w-2xl p-2 sm:p-3 rounded-lg ${message.role === 'assistant' ? 'bg-gray-800' : 'bg-blue-600'} shadow-lg`}
                whileHover={{ scale: 1.02 }}
                transition={{ duration: 0.2 }}
              >
                {message.content === 'loading' ? (
                  <LoadingAnimation />
                ) : message.content === 'welcome' ? (
                  <WelcomeMessage />
                ) : (
                  <>
                    <p className="whitespace-pre-wrap">
                      {message.content.replace(/'/g, "&apos;")}
                    </p>
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
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                        >
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="absolute top-1 right-1 sm:top-2 sm:right-2 bg-gray-800 bg-opacity-50 hover:bg-opacity-75 transition-colors duration-200"
                            onClick={() => openImageModal(message.image!)}
                          >
                            <Maximize2 className="w-3 h-3 sm:w-4 sm:h-4" />
                          </Button>
                        </motion.div>
                      </motion.div>
                    )}
                    {message.role === 'assistant' && (
                      <motion.div
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <Button variant="ghost" size="sm" className="mt-1 sm:mt-2 text-xs sm:text-sm text-gray-400 hover:text-white transition-colors duration-200" onClick={() => handleCopyMessage(message.content)}>
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
        className="p-2 sm:p-4 border-t border-gray-700 bg-gray-800 bg-opacity-50 backdrop-blur-sm"
      >
        <div className="flex items-center space-x-2 mb-2">
          <ModelSelector onSelectModel={setModel} />
          <motion.div
            animate={{ rotate: isImageGenerationModel ? 360 : 0 }}
            transition={{ duration: 0.5 }}
          >
            {isImageGenerationModel ? (
              <ImageIcon className="w-4 h-4 sm:w-5 sm:h-5 text-blue-500" />
            ) : (
              <Type className="w-4 h-4 sm:w-5 sm:h-5 text-green-500" />
            )}
          </motion.div>
        </div>
        <div className="flex items-center space-x-2">
          <motion.div
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <Button variant="ghost" size="icon" className="text-gray-400 hover:text-white transition-colors duration-200" onClick={handleClearChat}>
              <Trash className="w-4 h-4 sm:w-5 sm:h-5" />
            </Button>
          </motion.div>
          <Textarea
            className="flex-grow bg-gray-800 border-gray-700 text-white resize-none focus:ring-2 focus:ring-blue-500 transition-all duration-200 text-sm sm:text-base"
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
              onClick={handleSendMessage}
              disabled={isLoading}
              className="bg-blue-600 hover:bg-blue-700 transition-colors duration-200 text-xs sm:text-sm"
            >
              {isLoading ? <LoadingAnimation /> : <Send className="w-4 h-4 sm:w-5 sm:h-5 mr-1 sm:mr-2" />}
              {isLoading ? 'Generating...' : (isImageGenerationModel ? 'Generate' : 'Submit')}
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
              className="max-w-4xl max-h-[90vh] p-4 bg-gray-800 rounded-lg overflow-auto"
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