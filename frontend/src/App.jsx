import { useState } from 'react'
import CampaignForm from './components/CampaignForm'
import CampaignProgress from './components/CampaignProgress'
import CampaignResults from './components/CampaignResults'
import { Sparkles } from 'lucide-react'

function App() {
  const [currentStep, setCurrentStep] = useState('form') // form, progress, results
  const [campaignId, setCampaignId] = useState(null)
  const [campaignData, setCampaignData] = useState(null)
  const [results, setResults] = useState(null)

  const handleStartCampaign = (data, id) => {
    setCampaignData(data)
    setCampaignId(id)
    setCurrentStep('progress')
  }

  const handleCampaignComplete = (resultData) => {
    setResults(resultData)
    setCurrentStep('results')
  }

  const handleReset = () => {
    setCurrentStep('form')
    setCampaignId(null)
    setCampaignData(null)
    setResults(null)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="bg-gradient-to-br from-blue-500 to-purple-600 p-2 rounded-lg">
                <Sparkles className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  AI Content Campaign Generator
                </h1>
                <p className="text-sm text-gray-600 mt-1">
                  Multi-Agent AI System for Automated Marketing
                </p>
              </div>
            </div>
            {currentStep !== 'form' && (
              <button
                onClick={handleReset}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors"
              >
                New Campaign
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {currentStep === 'form' && (
          <CampaignForm onStart={handleStartCampaign} />
        )}

        {currentStep === 'progress' && (
          <CampaignProgress
            campaignId={campaignId}
            campaignData={campaignData}
            onComplete={handleCampaignComplete}
          />
        )}

        {currentStep === 'results' && (
          <CampaignResults
            results={results}
            onReset={handleReset}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="mt-12 py-6 border-t border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-gray-600 text-sm">
          <p>Powered by Multi-Agent AI Architecture</p>
          <p className="mt-1">Gemini AI • Stable Diffusion • FastAPI • React</p>
        </div>
      </footer>
    </div>
  )
}

export default App
