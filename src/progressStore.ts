// The desk-wide progress record, kept in localStorage under one key.
// Every access is wrapped: play never depends on it.
import { emptyProgress, sanitizeProgress, type Progress } from '@questender/engine/progress'

const KEY = 'questender.progress'

export function loadProgress(): Progress {
  try {
    const raw = localStorage.getItem(KEY)
    return raw ? sanitizeProgress(JSON.parse(raw)) : emptyProgress()
  } catch {
    return emptyProgress()
  }
}

export function saveProgress(p: Progress) {
  try {
    localStorage.setItem(KEY, JSON.stringify(p))
  } catch {
    /* storage unavailable: progress lasts for this session only */
  }
}
