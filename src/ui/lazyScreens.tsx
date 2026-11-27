// Screens and dialogs that are not needed to paint the first page. Each lives
// in its own chunk and loads on first use; the wrapper supplies the Suspense
// boundary so call sites stay unchanged.
import { lazy, Suspense, type ComponentType } from 'react'

function split<P extends object>(load: () => Promise<ComponentType<P>>): ComponentType<P> {
  const Lazy = lazy(async () => ({ default: await load() })) as unknown as ComponentType<P>
  return function Split(props: P) {
    return (
      <Suspense fallback={null}>
        <Lazy {...props} />
      </Suspense>
    )
  }
}

export const ExportDialog = split(() => import('./ExportDialog').then((m) => m.ExportDialog))
export const Settings = split(() => import('./Settings').then((m) => m.Settings))
export const Shelf = split(() => import('./Shelf').then((m) => m.Shelf))
export const CalendarView = split(() => import('./CalendarView').then((m) => m.CalendarView))
export const Tutorial = split(() => import('./Tutorial').then((m) => m.Tutorial))
export const Journal = split(() => import('./Journal').then((m) => m.Journal))
export const Notes = split(() => import('./Notes').then((m) => m.Notes))
export const ImportDialog = split(() => import('./ImportDialog').then((m) => m.ImportDialog))
export const NewCampaign = split(() => import('./NewCampaign').then((m) => m.NewCampaign))
