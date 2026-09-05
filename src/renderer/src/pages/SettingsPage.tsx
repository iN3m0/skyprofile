import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { api } from '../lib/api'
import SketchBox from '../components/sketch/SketchBox'
import SketchButton from '../components/sketch/SketchButton'
import s from './SettingsPage.module.css'

export default function SettingsPage(): React.JSX.Element {
  const queryClient = useQueryClient()
  const [apiKeyInput, setApiKeyInput] = useState('')
  const [feedback, setFeedback] = useState<{ ok: boolean; message: string } | null>(null)

  const statusQuery = useQuery({
    queryKey: ['settings', 'apiKey'],
    queryFn: () => api.settings.getApiKey()
  })

  const invalidateStatus = () => {
    queryClient.invalidateQueries({ queryKey: ['settings', 'apiKey'] })
    queryClient.invalidateQueries({ queryKey: ['app', 'status'] })
  }

  const saveMutation = useMutation({
    mutationFn: (apiKey: string) => api.settings.setApiKey(apiKey),
    onSuccess: (result) => {
      setFeedback(
        result.ok
          ? { ok: true, message: 'API key saved and verified.' }
          : { ok: false, message: result.error ?? 'Could not verify this key.' }
      )
      if (result.ok) setApiKeyInput('')
      invalidateStatus()
    }
  })

  const testMutation = useMutation({
    mutationFn: () => api.settings.testConnection(),
    onSuccess: (result) => {
      setFeedback(
        result.ok
          ? { ok: true, message: 'Connection OK.' }
          : { ok: false, message: result.error ?? 'Connection failed.' }
      )
    }
  })

  const clearMutation = useMutation({
    mutationFn: () => api.settings.clearApiKey(),
    onSuccess: () => {
      setFeedback({ ok: true, message: 'API key cleared.' })
      invalidateStatus()
    }
  })

  const hasApiKey = statusQuery.data?.hasApiKey ?? false

  return (
    <div className={s.page}>
      <div>
        <h1 className={s.title}>Settings</h1>
        <p className={s.subtitle}>
          Needs a personal Hypixel API key to fetch player data. Get one at{' '}
          <span className={s.subtitleLink}>developer.hypixel.net</span> — it's free.
        </p>
      </div>

      <SketchBox className={s.card} rotate={-0.3}>
        <div className={s.cardInner}>
          <div className={s.status}>
            <span className={hasApiKey ? s.statusDotOn : s.statusDotOff} />
            <span className={`font-hand ${s.statusText}`}>
              {statusQuery.isLoading
                ? 'checking…'
                : hasApiKey
                  ? 'api key configured'
                  : 'no api key configured yet'}
            </span>
          </div>

          <label htmlFor="apiKey" className={s.label}>
            Hypixel API key
          </label>
          <div className={s.keyRow}>
            <input
              id="apiKey"
              type="password"
              value={apiKeyInput}
              onChange={(e) => setApiKeyInput(e.target.value)}
              placeholder="00000000-0000-0000-0000-000000000000"
              className={`ruled-input font-tabular ${s.keyInput}`}
            />
            <SketchButton
              variant="primary"
              disabled={!apiKeyInput.trim() || saveMutation.isPending}
              onClick={() => saveMutation.mutate(apiKeyInput)}
              className={s.saveButton}
            >
              {saveMutation.isPending ? 'Saving…' : 'Save'}
            </SketchButton>
          </div>

          <div className={s.actionsRow}>
            <SketchButton
              disabled={!hasApiKey || testMutation.isPending}
              onClick={() => testMutation.mutate()}
              className={s.actionButton}
            >
              {testMutation.isPending ? 'Testing…' : 'Test connection'}
            </SketchButton>
            <SketchButton
              variant="danger"
              disabled={!hasApiKey || clearMutation.isPending}
              onClick={() => clearMutation.mutate()}
              className={s.actionButton}
            >
              Clear
            </SketchButton>
          </div>

          {feedback && (
            <p className={`font-hand ${feedback.ok ? s.feedbackOk : s.feedbackError}`}>{feedback.message}</p>
          )}
        </div>
      </SketchBox>
    </div>
  )
}
