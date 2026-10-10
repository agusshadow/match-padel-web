import { Notice } from '@match-padel/ui'
import { getErrorMessage, getErrorProblems } from '@/lib/errors'

/** An API error with its individual problems (validation errors list what is wrong). */
export function ErrorNotice({ error }: { error: unknown }) {
  const problems = getErrorProblems(error)
  return (
    <Notice>
      <p>{getErrorMessage(error)}</p>
      {problems.length > 0 && (
        <ul className="list-disc pl-5 mt-1 space-y-0.5">
          {problems.map((p) => (
            <li key={p}>{p}</li>
          ))}
        </ul>
      )}
    </Notice>
  )
}

/** Client-side validation problems, shown before the request is made. */
export function ProblemNotice({ problems }: { problems: string[] }) {
  if (problems.length === 0) return null
  return (
    <Notice>
      <ul className="list-disc pl-5 space-y-0.5">
        {problems.map((p) => (
          <li key={p}>{p}</li>
        ))}
      </ul>
    </Notice>
  )
}
