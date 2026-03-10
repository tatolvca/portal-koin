import type { Severity, FinalDecision, UserStatus, RiskLevel } from '@/types/ato'

const severityStyles: Record<Severity, string> = {
  low: 'bg-gray-100 text-gray-700',
  medium: 'bg-amber-100 text-amber-800',
  high: 'bg-orange-100 text-orange-800',
  critical: 'bg-red-100 text-red-800',
}
const decisionStyles: Record<FinalDecision, string> = {
  ALLOW: 'bg-emerald-100 text-emerald-800',
  CHALLENGE: 'bg-amber-100 text-amber-800',
  BLOCK: 'bg-red-100 text-red-800',
}
const statusStyles: Record<UserStatus, string> = {
  active: 'bg-emerald-100 text-emerald-800',
  blocked: 'bg-red-100 text-red-800',
  under_review: 'bg-amber-100 text-amber-800',
  dormant: 'bg-gray-100 text-gray-600',
}

export function Badge({
  children,
  variant = 'neutral',
  severity,
  decision,
  status,
  riskLevel,
}: {
  children: React.ReactNode
  variant?: 'neutral' | 'severity' | 'decision' | 'status' | 'risk'
  severity?: Severity
  decision?: FinalDecision
  status?: UserStatus
  riskLevel?: RiskLevel
}) {
  let className = 'inline-flex items-center rounded-untitled-md px-2 py-0.5 text-xs font-medium '
  if (variant === 'severity' && severity) className += severityStyles[severity]
  else if (variant === 'decision' && decision) className += decisionStyles[decision]
  else if (variant === 'status' && status) className += statusStyles[status]
  else if (variant === 'risk' && riskLevel) className += severityStyles[riskLevel as Severity]
  else className += 'bg-gray-100 text-gray-700'
  return <span className={className}>{children}</span>
}
