export default function LoadingIndicator({ label = '読み込み中' }: { label?: string }) {
  return <div className="loading" role="status"><span className="loading__spinner" aria-hidden="true" /><span>{label}</span></div>
}
