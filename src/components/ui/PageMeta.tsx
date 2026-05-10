// src/components/ui/PageMeta.tsx
import { Helmet } from 'react-helmet-async'

interface PageMetaProps {
  title?: string
  description?: string
  /** Canonical path, e.g. "/year/2/subject/os-101" */
  path?: string
  /** og:image absolute URL (falls back to default OG image) */
  image?: string
}

const SITE_NAME = 'Exam League — JSS University'
const DEFAULT_DESC =
  'AI-summarized notes, gamified quizzes, a doubt forum, and a live leaderboard — built for JSS University students.'
const BASE_URL = 'https://examleague.jss.ac.in'
const DEFAULT_OG = `${BASE_URL}/og-cover.png`

export default function PageMeta({
  title,
  description = DEFAULT_DESC,
  path = '',
  image = DEFAULT_OG,
}: PageMetaProps) {
  const fullTitle = title ? `${title} | ${SITE_NAME}` : SITE_NAME
  const canonical = `${BASE_URL}${path}`

  return (
    <Helmet>
      {/* Primary */}
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={canonical} />

      {/* Open Graph */}
      <meta property="og:type" content="website" />
      <meta property="og:url" content={canonical} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={image} />
      <meta property="og:site_name" content={SITE_NAME} />

      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />

      {/* Misc */}
      <meta name="theme-color" content="#406aff" />
      <meta name="application-name" content="Exam League" />
    </Helmet>
  )
}
