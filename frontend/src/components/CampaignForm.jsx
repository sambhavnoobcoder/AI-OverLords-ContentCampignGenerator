import { useState } from 'react'
import axios from 'axios'
import { Sparkles, Loader2, Plus, X } from 'lucide-react'

const CampaignForm = ({ onStart }) => {
  const [formData, setFormData] = useState({
    product_name: '',
    target_audience: '',
    tone: 'professional',
    industry: '',
    key_features: [''],
    campaign_goals: [''],
    platforms: ['blog', 'twitter', 'linkedin', 'instagram']
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleArrayChange = (field, index, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].map((item, i) => i === index ? value : item)
    }))
  }

  const addArrayItem = (field) => {
    setFormData(prev => ({
      ...prev,
      [field]: [...prev[field], '']
    }))
  }

  const removeArrayItem = (field, index) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].filter((_, i) => i !== index)
    }))
  }

  const handlePlatformToggle = (platform) => {
    setFormData(prev => ({
      ...prev,
      platforms: prev.platforms.includes(platform)
        ? prev.platforms.filter(p => p !== platform)
        : [...prev.platforms, platform]
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      // Clean up empty array items
      const cleanedData = {
        ...formData,
        key_features: formData.key_features.filter(f => f.trim()),
        campaign_goals: formData.campaign_goals.filter(g => g.trim())
      }

      // Create campaign
      const response = await axios.post('/api/campaigns', cleanedData)
      const { campaign_id } = response.data

      // Start the campaign
      onStart(cleanedData, campaign_id)
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to create campaign')
      setLoading(false)
    }
  }

  const platforms = [
    { id: 'blog', name: 'Blog Posts' },
    { id: 'twitter', name: 'Twitter' },
    { id: 'linkedin', name: 'LinkedIn' },
    { id: 'instagram', name: 'Instagram' },
    { id: 'facebook', name: 'Facebook' }
  ]

  return (
    <div className="max-w-3xl mx-auto">
      <div className="bg-white rounded-2xl shadow-xl p-8">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Create Your Marketing Campaign
          </h2>
          <p className="text-gray-600">
            Our AI agents will research, strategize, write, and design your complete campaign
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Product Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Product/Service Name *
            </label>
            <input
              type="text"
              required
              value={formData.product_name}
              onChange={(e) => handleChange('product_name', e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="e.g., TaskMaster Pro"
            />
          </div>

          {/* Industry */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Industry *
            </label>
            <input
              type="text"
              required
              value={formData.industry}
              onChange={(e) => handleChange('industry', e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="e.g., SaaS, E-commerce, Healthcare"
            />
          </div>

          {/* Target Audience */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Target Audience *
            </label>
            <textarea
              required
              value={formData.target_audience}
              onChange={(e) => handleChange('target_audience', e.target.value)}
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="e.g., Small business owners and entrepreneurs aged 25-45 who need better project management tools"
            />
          </div>

          {/* Tone */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Content Tone
            </label>
            <select
              value={formData.tone}
              onChange={(e) => handleChange('tone', e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="professional">Professional</option>
              <option value="casual">Casual</option>
              <option value="friendly">Friendly</option>
              <option value="authoritative">Authoritative</option>
              <option value="playful">Playful</option>
            </select>
          </div>

          {/* Key Features */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Key Features/Benefits
            </label>
            {formData.key_features.map((feature, index) => (
              <div key={index} className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={feature}
                  onChange={(e) => handleArrayChange('key_features', index, e.target.value)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g., Real-time collaboration"
                />
                {formData.key_features.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeArrayItem('key_features', index)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                  >
                    <X className="w-5 h-5" />
                  </button>
                )}
              </div>
            ))}
            <button
              type="button"
              onClick={() => addArrayItem('key_features')}
              className="mt-2 flex items-center gap-2 text-blue-600 hover:text-blue-700 text-sm font-medium"
            >
              <Plus className="w-4 h-4" />
              Add Feature
            </button>
          </div>

          {/* Campaign Goals */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Campaign Goals
            </label>
            {formData.campaign_goals.map((goal, index) => (
              <div key={index} className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={goal}
                  onChange={(e) => handleArrayChange('campaign_goals', index, e.target.value)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g., Increase brand awareness"
                />
                {formData.campaign_goals.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeArrayItem('campaign_goals', index)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                  >
                    <X className="w-5 h-5" />
                  </button>
                )}
              </div>
            ))}
            <button
              type="button"
              onClick={() => addArrayItem('campaign_goals')}
              className="mt-2 flex items-center gap-2 text-blue-600 hover:text-blue-700 text-sm font-medium"
            >
              <Plus className="w-4 h-4" />
              Add Goal
            </button>
          </div>

          {/* Platforms */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Target Platforms
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {platforms.map(platform => (
                <button
                  key={platform.id}
                  type="button"
                  onClick={() => handlePlatformToggle(platform.id)}
                  className={`px-4 py-3 rounded-lg border-2 transition-all ${
                    formData.platforms.includes(platform.id)
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                >
                  {platform.name}
                </button>
              ))}
            </div>
          </div>

          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
              {error}
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white py-3 px-6 rounded-lg font-semibold hover:from-blue-600 hover:to-purple-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Creating Campaign...
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5" />
                Generate Campaign with AI
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  )
}

export default CampaignForm
