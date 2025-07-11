import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Upload, Brain, Sparkles, Loader2, Eye, Download, Camera, Zap, Shield, Star } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { blink } from '@/blink/client'
import toast, { Toaster } from 'react-hot-toast'

interface AnalysisResult {
  analysis: string
  confidence?: string
  timestamp: Date
}

function App() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [, setSelectedImage] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [imageUrl, setImageUrl] = useState<string | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null)
  const [customQuestion, setCustomQuestion] = useState('')

  // Auth state management
  useEffect(() => {
    const unsubscribe = blink.auth.onAuthStateChanged((state) => {
      setUser(state.user)
      setLoading(state.isLoading)
    })
    return unsubscribe
  }, [])

  // Upload image to Blink Storage and get HTTPS URL
  const handleImageSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        toast.error('Image must be smaller than 10MB')
        return
      }
      setSelectedImage(file)
      setAnalysisResult(null)
      setImageUrl(null)
      setIsUploading(true)
      try {
        // Show preview
        const reader = new FileReader()
        reader.onload = (e) => {
          setImagePreview(e.target?.result as string)
        }
        reader.readAsDataURL(file)
        // Upload to Blink Storage
        const { publicUrl } = await blink.storage.upload(
          file,
          `uploads/${file.name}`,
          { upsert: true }
        )
        setImageUrl(publicUrl)
        toast.success('Image uploaded!')
      } catch {
        toast.error('Failed to upload image')
        setImagePreview(null)
        setSelectedImage(null)
      } finally {
        setIsUploading(false)
      }
    }
  }

  const analyzeImage = async () => {
    if (!imageUrl) return
    setIsAnalyzing(true)
    try {
      const prompt = customQuestion.trim() 
        ? `${customQuestion} Analyze this image in detail.`
        : "Analyze this image in detail. Describe what you see, identify objects, people, text, colors, composition, mood, and any interesting details. Be thorough and insightful."

      const { text } = await blink.ai.generateText({
        messages: [
          {
            role: "user",
            content: [
              { type: "text", text: prompt },
              { type: "image", image: imageUrl }
            ]
          }
        ],
        model: 'gpt-4o'
      })

      setAnalysisResult({
        analysis: text,
        timestamp: new Date()
      })
      toast.success('Image analyzed successfully!')
    } catch (error) {
      console.error('Analysis failed:', error)
      toast.error('Failed to analyze image. Please try again.')
    } finally {
      setIsAnalyzing(false)
    }
  }

  const clearImage = () => {
    setSelectedImage(null)
    setImagePreview(null)
    setImageUrl(null)
    setAnalysisResult(null)
    setCustomQuestion('')
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center">
        <motion.div 
          className="text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="w-16 h-16 bg-gradient-to-br from-slate-600 via-slate-700 to-slate-800 rounded-2xl mx-auto mb-6 flex items-center justify-center shadow-premium">
            <Loader2 className="w-8 h-8 animate-spin text-white" />
          </div>
          <h1 className="text-2xl font-display font-semibold text-slate-900 mb-2">AI Vision Pro</h1>
          <p className="text-slate-600">Initializing intelligent analysis...</p>
        </motion.div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
          className="w-full max-w-md"
        >
          <Card className="glass shadow-premium-lg border-0">
            <CardContent className="p-8 text-center">
              <div className="mb-8">
                <div className="w-20 h-20 bg-gradient-to-br from-slate-600 via-slate-700 to-slate-800 rounded-3xl mx-auto mb-6 flex items-center justify-center shadow-premium">
                  <Brain className="w-10 h-10 text-white" />
                </div>
                <h1 className="text-3xl font-display font-bold text-slate-900 mb-3">AI Vision Pro</h1>
                <p className="text-slate-600 text-lg">Upload images and get intelligent AI-powered visual analysis with unprecedented accuracy.</p>
              </div>
              
              {/* Features */}
              <div className="grid grid-cols-3 gap-4 mb-8">
                <div className="text-center">
                  <div className="w-12 h-12 bg-emerald-100 rounded-xl mx-auto mb-2 flex items-center justify-center">
                    <Zap className="w-6 h-6 text-emerald-600" />
                  </div>
                  <p className="text-xs font-medium text-slate-700">Instant Analysis</p>
                </div>
                <div className="text-center">
                  <div className="w-12 h-12 bg-blue-100 rounded-xl mx-auto mb-2 flex items-center justify-center">
                    <Shield className="w-6 h-6 text-blue-600" />
                  </div>
                  <p className="text-xs font-medium text-slate-700">Private & Secure</p>
                </div>
                <div className="text-center">
                  <div className="w-12 h-12 bg-purple-100 rounded-xl mx-auto mb-2 flex items-center justify-center">
                    <Star className="w-6 h-6 text-purple-600" />
                  </div>
                  <p className="text-xs font-medium text-slate-700">AI Powered</p>
                </div>
              </div>
              
              <Button 
                onClick={() => blink.auth.login()} 
                className="w-full h-12 bg-gradient-to-r from-slate-700 to-slate-800 hover:from-slate-800 hover:to-slate-900 text-white font-semibold shadow-premium"
              >
                Get Started
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Header */}
      <header className="glass sticky top-0 z-50 border-b border-white/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <motion.div 
              className="flex items-center space-x-4"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div className="w-12 h-12 bg-gradient-to-br from-slate-600 via-slate-700 to-slate-800 rounded-2xl flex items-center justify-center shadow-premium">
                <Brain className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-display font-bold text-slate-900">AI Vision Pro</h1>
                <p className="text-sm text-slate-600">Intelligent visual analysis</p>
              </div>
            </motion.div>
            <motion.div 
              className="flex items-center space-x-4"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <Badge variant="secondary" className="hidden sm:flex font-medium bg-white/50 text-slate-700">
                {user.email}
              </Badge>
              <Button variant="outline" onClick={() => blink.auth.logout()} className="bg-white/50 border-white/20">
                Sign Out
              </Button>
            </motion.div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <motion.div 
          className="grid grid-cols-1 lg:grid-cols-2 gap-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          
          {/* Upload Section */}
          <Card className="glass shadow-premium-lg border-0">
            <CardContent className="p-8">
              <div className="mb-8">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center">
                    <Upload className="w-5 h-5 text-emerald-600" />
                  </div>
                  <div>
                    <h2 className="text-xl font-display font-semibold text-slate-900">Upload Image</h2>
                    <p className="text-sm text-slate-600">Select an image to analyze</p>
                  </div>
                </div>
                <p className="text-sm text-slate-500">
                  Supports JPG, PNG, WebP formats up to 10MB
                </p>
              </div>

              {!imagePreview ? (
                <motion.div 
                  className="border-2 border-dashed border-slate-200 rounded-2xl p-12 text-center hover:border-emerald-300 hover:bg-emerald-50/30 transition-all duration-300 cursor-pointer group"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="w-16 h-16 bg-slate-100 rounded-2xl mx-auto mb-6 flex items-center justify-center group-hover:bg-emerald-100 transition-colors">
                    <Camera className="w-8 h-8 text-slate-400 group-hover:text-emerald-500 transition-colors" />
                  </div>
                  <label htmlFor="image-upload" className="cursor-pointer">
                    <span className="text-xl font-semibold text-slate-700 group-hover:text-emerald-600 transition-colors">
                      Click to upload an image
                    </span>
                    <p className="text-slate-500 mt-2">or drag and drop your file here</p>
                  </label>
                  <input
                    id="image-upload"
                    type="file"
                    accept="image/*"
                    onChange={handleImageSelect}
                    className="hidden"
                  />
                </motion.div>
              ) : (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5 }}
                  className="space-y-6"
                >
                  <div className="relative rounded-2xl overflow-hidden bg-slate-100 shadow-premium">
                    <img
                      src={imagePreview}
                      alt="Selected"
                      className="w-full h-80 object-cover"
                    />
                    <div className="absolute top-4 right-4">
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={clearImage}
                        className="bg-white/90 backdrop-blur-sm hover:bg-white/95 shadow-premium"
                      >
                        ✕ Clear
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-semibold text-slate-700 mb-3 block">
                        Custom Question (Optional)
                      </label>
                      <Textarea
                        placeholder="Ask a specific question about the image..."
                        value={customQuestion}
                        onChange={(e) => setCustomQuestion(e.target.value)}
                        className="resize-none bg-white/50 border-white/20 focus:bg-white/80 transition-all"
                        rows={3}
                      />
                    </div>

                    <Button
                      onClick={analyzeImage}
                      disabled={isAnalyzing || isUploading || !imageUrl}
                      className="w-full h-12 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white font-semibold shadow-premium"
                    >
                      {(isAnalyzing || isUploading) ? (
                        <>
                          <Loader2 className="w-5 h-5 mr-3 animate-spin" />
                          {isUploading ? 'Uploading image...' : 'Analyzing with AI...'}
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-5 h-5 mr-3" />
                          Analyze Image
                        </>
                      )}
                    </Button>
                  </div>
                </motion.div>
              )}
            </CardContent>
          </Card>

          {/* Results Section */}
          <Card className="glass shadow-premium-lg border-0">
            <CardContent className="p-8">
              <div className="mb-8">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                    <Eye className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <h2 className="text-xl font-display font-semibold text-slate-900">AI Analysis</h2>
                    <p className="text-sm text-slate-600">Detailed insights and observations</p>
                  </div>
                </div>
              </div>

              <AnimatePresence mode="wait">
                {!analysisResult ? (
                  <motion.div
                    key="empty"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="text-center py-16"
                  >
                    <div className="w-20 h-20 bg-slate-100 rounded-3xl mx-auto mb-6 flex items-center justify-center">
                      <Brain className="w-10 h-10 text-slate-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-slate-900 mb-2">Ready to analyze</h3>
                    <p className="text-slate-500">Upload an image to see AI-powered insights</p>
                  </motion.div>
                ) : (
                  <motion.div
                    key="result"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.5 }}
                    className="space-y-6"
                  >
                    <div className="flex items-center justify-between">
                      <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200 font-medium">
                        ✨ Analysis Complete
                      </Badge>
                      <span className="text-sm text-slate-500 font-medium">
                        {analysisResult.timestamp.toLocaleTimeString()}
                      </span>
                    </div>
                    
                    <Separator className="bg-slate-200" />
                    
                    <div className="bg-white/50 rounded-xl p-6 border border-white/20">
                      <div className="prose prose-slate max-w-none">
                        <div className="whitespace-pre-wrap text-slate-700 leading-relaxed font-medium">
                          {analysisResult.analysis}
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-3">
                      <Button
                        variant="outline"
                        onClick={() => {
                          navigator.clipboard.writeText(analysisResult.analysis)
                          toast.success('Analysis copied to clipboard!')
                        }}
                        className="bg-white/50 border-white/20 hover:bg-white/80"
                      >
                        <Download className="w-4 h-4 mr-2" />
                        Copy Analysis
                      </Button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </CardContent>
          </Card>
        </motion.div>

        {/* Footer */}
        <motion.div 
          className="mt-16 text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.8 }}
        >
          <div className="flex items-center justify-center space-x-6 text-sm text-slate-500">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
              <span>Powered by advanced AI models</span>
            </div>
            <div className="flex items-center space-x-2">
              <Shield className="w-4 h-4" />
              <span>Secure & private analysis</span>
            </div>
          </div>
        </motion.div>
      </main>
      <Toaster />
    </div>
  )
}

export default App