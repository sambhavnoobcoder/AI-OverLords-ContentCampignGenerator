import { useState } from 'react'
import { Download, FileText, Image, MessageSquare, TrendingUp, Target, Calendar } from 'lucide-react'

const CampaignResults = ({ results, onReset }) => {
  const [selectedContent, setSelectedContent] = useState(null)
  const [activeTab, setActiveTab] = useState('overview')

  const contentPieces = results?.content_pieces || []
  const research = results?.research || {}
  const strategy = results?.strategy || {}

  const blogPosts = contentPieces.filter(c => c.type === 'blog_post')
  const socialPosts = contentPieces.filter(c => c.type === 'social_media')
  const images = contentPieces.filter(c => c.type === 'image')

  const handleDownload = (content) => {
    const blob = new Blob([content.content], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${content.title.replace(/\s+/g, '_')}.txt`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const handleDownloadAll = () => {
    let allContent = '# Marketing Campaign Content\n\n'

    blogPosts.forEach(post => {
      allContent += `## ${post.title}\n\n${post.content}\n\n---\n\n`
    })

    socialPosts.forEach(post => {
      allContent += `## ${post.title} (${post.platform})\n\n${post.content}\n\n`
      if (post.metadata?.hashtags) {
        allContent += `Hashtags: ${post.metadata.hashtags.join(', ')}\n\n`
      }
      allContent += `---\n\n`
    })

    const blob = new Blob([allContent], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'campaign_content.txt'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="bg-white rounded-2xl shadow-xl p-8 mb-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              Campaign Generated Successfully! 🎉
            </h2>
            <p className="text-gray-600">
              {contentPieces.length} pieces of content ready for your marketing campaign
            </p>
          </div>
          <button
            onClick={handleDownloadAll}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all"
          >
            <Download className="w-5 h-5" />
            Download All
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="flex items-center gap-3">
              <FileText className="w-8 h-8 text-blue-600" />
              <div>
                <div className="text-2xl font-bold text-gray-900">{blogPosts.length}</div>
                <div className="text-sm text-gray-600">Blog Posts</div>
              </div>
            </div>
          </div>
          <div className="bg-purple-50 p-4 rounded-lg">
            <div className="flex items-center gap-3">
              <MessageSquare className="w-8 h-8 text-purple-600" />
              <div>
                <div className="text-2xl font-bold text-gray-900">{socialPosts.length}</div>
                <div className="text-sm text-gray-600">Social Posts</div>
              </div>
            </div>
          </div>
          <div className="bg-green-50 p-4 rounded-lg">
            <div className="flex items-center gap-3">
              <Image className="w-8 h-8 text-green-600" />
              <div>
                <div className="text-2xl font-bold text-gray-900">{images.length}</div>
                <div className="text-sm text-gray-600">Images</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-t-2xl shadow-xl">
        <div className="border-b border-gray-200">
          <div className="flex gap-4 px-8 pt-6">
            {[
              { id: 'overview', label: 'Overview', icon: TrendingUp },
              { id: 'blog', label: 'Blog Posts', icon: FileText },
              { id: 'social', label: 'Social Media', icon: MessageSquare },
              { id: 'strategy', label: 'Strategy', icon: Target }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-3 border-b-2 transition-colors ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-600 hover:text-gray-900'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        <div className="p-8">
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5" />
                  Market Insights
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-gray-900 mb-2">Market Trends</h4>
                    <ul className="space-y-1 text-sm text-gray-700">
                      {research.market_trends?.slice(0, 5).map((trend, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <span className="text-blue-500 mt-1">•</span>
                          <span>{trend}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-gray-900 mb-2">Top Keywords</h4>
                    <div className="flex flex-wrap gap-2">
                      {research.keywords?.slice(0, 10).map((keyword, i) => (
                        <span key={i} className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-sm">
                          {keyword}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <Target className="w-5 h-5" />
                  Content Strategy
                </h3>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-gray-900 mb-2">Content Pillars</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    {strategy.content_pillars?.map((pillar, i) => (
                      <div key={i} className="bg-white p-3 rounded-lg border border-gray-200">
                        {pillar}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Blog Posts Tab */}
          {activeTab === 'blog' && (
            <div className="space-y-4">
              {blogPosts.map((post, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="text-xl font-bold text-gray-900 flex-1">
                      {post.title}
                    </h3>
                    <button
                      onClick={() => handleDownload(post)}
                      className="ml-4 flex items-center gap-2 px-3 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors"
                    >
                      <Download className="w-4 h-4" />
                      Download
                    </button>
                  </div>
                  {post.metadata && (
                    <div className="flex gap-4 text-sm text-gray-600 mb-3">
                      <span>{post.metadata.word_count} words</span>
                      <span>•</span>
                      <span>{post.metadata.estimated_read_time} read</span>
                    </div>
                  )}
                  <div className="prose max-w-none">
                    <div className="text-gray-700 whitespace-pre-wrap line-clamp-6">
                      {post.content}
                    </div>
                  </div>
                  <button
                    onClick={() => setSelectedContent(post)}
                    className="mt-4 text-blue-600 hover:text-blue-700 font-medium text-sm"
                  >
                    Read More →
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Social Media Tab */}
          {activeTab === 'social' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {socialPosts.map((post, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <MessageSquare className="w-4 h-4 text-gray-600" />
                      <span className="font-semibold text-gray-900 capitalize">
                        {post.platform}
                      </span>
                    </div>
                    <button
                      onClick={() => handleDownload(post)}
                      className="p-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors"
                    >
                      <Download className="w-4 h-4" />
                    </button>
                  </div>
                  <p className="text-gray-700 text-sm mb-3 whitespace-pre-wrap">
                    {post.content}
                  </p>
                  {post.metadata?.hashtags && (
                    <div className="flex flex-wrap gap-2">
                      {post.metadata.hashtags.map((tag, i) => (
                        <span key={i} className="text-blue-600 text-sm">
                          {tag.startsWith('#') ? tag : `#${tag}`}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Strategy Tab */}
          {activeTab === 'strategy' && (
            <div className="space-y-6">
              <div className="bg-gray-50 p-6 rounded-lg">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Key Messages</h3>
                <ul className="space-y-2">
                  {strategy.key_messages?.map((message, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <span className="text-blue-500 font-bold">•</span>
                      <span className="text-gray-700">{message}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {strategy.posting_schedule && (
                <div className="bg-gray-50 p-6 rounded-lg">
                  <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <Calendar className="w-5 h-5" />
                    Posting Schedule
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {Object.entries(strategy.posting_schedule).map(([week, items]) => (
                      <div key={week} className="bg-white p-4 rounded-lg border border-gray-200">
                        <h4 className="font-semibold text-gray-900 mb-2 capitalize">
                          {week.replace('_', ' ')}
                        </h4>
                        <ul className="space-y-1 text-sm text-gray-700">
                          {items.map((item, i) => (
                            <li key={i} className="flex items-start gap-2">
                              <span className="text-blue-500">•</span>
                              <span>{item}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Content Modal */}
      {selectedContent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
            <div className="p-6 border-b border-gray-200 flex items-center justify-between">
              <h3 className="text-2xl font-bold text-gray-900">
                {selectedContent.title}
              </h3>
              <button
                onClick={() => setSelectedContent(null)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                ✕
              </button>
            </div>
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
              <div className="prose max-w-none">
                <div className="text-gray-700 whitespace-pre-wrap">
                  {selectedContent.content}
                </div>
              </div>
            </div>
            <div className="p-6 border-t border-gray-200 flex justify-end gap-3">
              <button
                onClick={() => setSelectedContent(null)}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Close
              </button>
              <button
                onClick={() => handleDownload(selectedContent)}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center gap-2"
              >
                <Download className="w-4 h-4" />
                Download
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default CampaignResults
