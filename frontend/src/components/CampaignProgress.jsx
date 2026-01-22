import { useEffect, useState } from 'react'
import { CheckCircle, Clock, Loader2, AlertCircle } from 'lucide-react'

const CampaignProgress = ({ campaignId, campaignData, onComplete }) => {
  const [logs, setLogs] = useState([])
  const [status, setStatus] = useState('connecting')
  const [ws, setWs] = useState(null)

  useEffect(() => {
    // Connect to WebSocket
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:'
    const wsUrl = `${protocol}//${window.location.hostname}:8000/ws/${campaignId}`
    const websocket = new WebSocket(wsUrl)

    websocket.onopen = () => {
      console.log('WebSocket connected')
      setStatus('connected')

      // Send start command
      websocket.send(JSON.stringify({
        action: 'start',
        campaign_request: campaignData
      }))

      setLogs(prev => [...prev, {
        agent_name: 'System',
        status: 'working',
        message: 'Campaign generation started...',
        timestamp: new Date().toISOString()
      }])
    }

    websocket.onmessage = (event) => {
      const data = JSON.parse(event.data)
      console.log('WebSocket message:', data)

      if (data.type === 'agent_update') {
        setLogs(prev => [...prev, data.data])
      } else if (data.type === 'completed') {
        setStatus('completed')
        setLogs(prev => [...prev, {
          agent_name: 'System',
          status: 'completed',
          message: `Campaign completed! Generated ${data.data.content_count} pieces of content.`,
          timestamp: new Date().toISOString()
        }])

        // Fetch final results
        fetch(`/api/campaigns/${campaignId}`)
          .then(res => res.json())
          .then(results => {
            setTimeout(() => onComplete(results), 1500)
          })
      } else if (data.type === 'error') {
        setStatus('error')
        setLogs(prev => [...prev, {
          agent_name: 'System',
          status: 'error',
          message: data.message,
          timestamp: new Date().toISOString()
        }])
      } else if (data.type === 'status') {
        setLogs(prev => [...prev, {
          agent_name: 'System',
          status: 'working',
          message: data.message,
          timestamp: new Date().toISOString()
        }])
      }
    }

    websocket.onerror = (error) => {
      console.error('WebSocket error:', error)
      setStatus('error')
      setLogs(prev => [...prev, {
        agent_name: 'System',
        status: 'error',
        message: 'Connection error. Please check if the backend is running.',
        timestamp: new Date().toISOString()
      }])
    }

    websocket.onclose = () => {
      console.log('WebSocket closed')
      if (status !== 'completed' && status !== 'error') {
        setStatus('disconnected')
      }
    }

    setWs(websocket)

    return () => {
      if (websocket.readyState === WebSocket.OPEN) {
        websocket.close()
      }
    }
  }, [campaignId, campaignData, onComplete])

  const getStatusIcon = (agentStatus) => {
    switch (agentStatus) {
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-green-500" />
      case 'working':
        return <Loader2 className="w-5 h-5 text-blue-500 animate-spin" />
      case 'error':
        return <AlertCircle className="w-5 h-5 text-red-500" />
      default:
        return <Clock className="w-5 h-5 text-gray-400" />
    }
  }

  const getStatusColor = (agentStatus) => {
    switch (agentStatus) {
      case 'completed':
        return 'bg-green-50 border-green-200'
      case 'working':
        return 'bg-blue-50 border-blue-200'
      case 'error':
        return 'bg-red-50 border-red-200'
      default:
        return 'bg-gray-50 border-gray-200'
    }
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-2xl shadow-xl p-8">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            AI Agents at Work
          </h2>
          <p className="text-gray-600">
            Watch as our specialized AI agents collaborate to create your campaign
          </p>
        </div>

        {/* Status Banner */}
        <div className={`mb-6 p-4 rounded-lg border-2 ${
          status === 'completed' ? 'bg-green-50 border-green-200' :
          status === 'error' ? 'bg-red-50 border-red-200' :
          'bg-blue-50 border-blue-200'
        }`}>
          <div className="flex items-center justify-center gap-3">
            {status === 'completed' ? (
              <CheckCircle className="w-6 h-6 text-green-600" />
            ) : status === 'error' ? (
              <AlertCircle className="w-6 h-6 text-red-600" />
            ) : (
              <Loader2 className="w-6 h-6 text-blue-600 animate-spin" />
            )}
            <span className="font-semibold text-gray-900">
              {status === 'completed' ? 'Campaign Generation Complete!' :
               status === 'error' ? 'An Error Occurred' :
               'Generating Your Campaign...'}
            </span>
          </div>
        </div>

        {/* Agent Logs */}
        <div className="space-y-3 max-h-96 overflow-y-auto scrollbar-hide">
          {logs.map((log, index) => (
            <div
              key={index}
              className={`p-4 rounded-lg border ${getStatusColor(log.status)} transition-all duration-300`}
            >
              <div className="flex items-start gap-3">
                <div className="mt-0.5">
                  {getStatusIcon(log.status)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-semibold text-gray-900">
                      {log.agent_name}
                    </span>
                    <span className="text-xs text-gray-500">
                      {new Date(log.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                  <p className="text-sm text-gray-700">
                    {log.message}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Progress Info */}
        {status === 'working' && (
          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-600 text-center">
              This may take 2-3 minutes as AI agents research, strategize, write, and design your campaign
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

export default CampaignProgress
