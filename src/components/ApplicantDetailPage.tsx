import * as React from "react"
import { useNavigate, useParams } from "@tanstack/react-router"
import { useQuery } from "@tanstack/react-query"
import { ChevronDown, GraduationCap, BookOpen, FileText } from "lucide-react"
import { useAuth } from "@/contexts/AuthContext"
import patternImage from '../pattern.png'

// API configuration
const API_BASE_URL = 'http://localhost:3001/api'

// Global averages for comparison
const GLOBAL_AVERAGES = {
  professional: 4.117078410311493,
  willingness: 4.097744360902255,
  brotherhood: 3.925886143931257,
  teamwork: 4.0859291084855,
  contribution_personal: 4.134264232008593,
  contribution_akpsi: 3.9087003222341568,
  // Calculate overall average from the individual averages
  get overall() {
    return (this.professional + this.willingness + this.brotherhood + this.teamwork + this.contribution_personal + this.contribution_akpsi) / 6
  },
  // Calculate combined contribution average
  get contribution() {
    return (this.contribution_personal + this.contribution_akpsi) / 2
  }
}


// Types for applicant data
interface EvaluationData {
  _id: { $oid: string }
  Timestamp: { $date: string }
  brother_name: string
  applicant: string
  Event: string
  professional: number
  willingness: number
  brotherhood: number
  teamwork: number
  contribution_personal: number
  contribution_akpsi: number
  comment: string
}

interface EvalData {
  _id: string
  evals: number
  averageScore: number
  avg_rating: number
  data: EvaluationData[]
}

interface ApplicantData {
  _id: string | { $oid: string }
  "Full Name": string
  "Northeastern Email": string
  "Pronouns": string
  "Year": string
  "Major": string
  "Minor(s)"?: string
  "College(s)"?: string
  "Please attach a copy of your resume as a PDF"?: string
  "Please upload a clear photo of yourself": string
  "What events did you attend?"?: string
  "Please describe why you would like to become a brother of Alpha Kappa Psi (150 words or less)"?: string
  "What about Alpha Kappa Psi gets you excited and why? (150 words or less)"?: string
  "What do you think you can bring to our chapter? Why do you think you stand out from the other candidates? (150 words or less)"?: string
  "Share something you want us to know that would make you a stronger candidate and has yet to be fully represented through your resume or application (150 words or less)"?: string
  "Please list other organizations or time commitments you are involved with Include leadership positions you hold or plan on holding within the organization"?: string
  eval_data?: EvalData
}

// API function for fetching single applicant
const fetchApplicant = async (id: string): Promise<ApplicantData> => {
  const response = await fetch(`${API_BASE_URL}/applications/${id}`)
  const data = await response.json()
  
  if (!response.ok) {
    throw new Error(data.message || 'Failed to fetch applicant')
  }
  
  if (!data.success) {
    throw new Error(data.message || 'Applicant not found')
  }
  
  return data.data
}

// API function for fuzzy search of evaluations
const fetchFuzzyEvaluations = async (applicantName: string): Promise<EvalData | null> => {
  try {
    const response = await fetch(`${API_BASE_URL}/applications/${encodeURIComponent(applicantName)}/fuzzy-evals`)
    const data = await response.json()
    
    if (!response.ok) {
      console.warn('Fuzzy search failed:', data.message)
      return null
    }
    
    if (!data.success || !data.data || data.data.length === 0) {
      console.warn('No fuzzy search results found')
      return null
    }
    
    // Return the first match from fuzzy search
    return data.data[0]
  } catch (error) {
    console.warn('Fuzzy search error:', error)
    return null
  }
}


interface RatingCardProps {
  label: string
  score: number
  maxScore: number
  globalAverage?: number
}

function RatingCard({ label, score, maxScore, globalAverage }: RatingCardProps) {
  // Ensure score is a valid number
  const safeScore = typeof score === 'number' && !isNaN(score) ? score : 0
  
  const getScoreColor = () => {
    if (safeScore >= 4.5) {
      return 'bg-gradient-to-r from-[#4ade80] to-[#22c55e] bg-clip-text text-transparent' // muted green gradient
    } else if (safeScore >= 4.0) {
      return 'text-[#90ee90]' // light green
    } else if (safeScore >= 3.8) {
      return 'text-white' // white
    } else if (safeScore >= 3.5) {
      return 'text-[#ff6b6b]' // light red
    } else {
      return 'bg-gradient-to-r from-[#ef4444] to-[#dc2626] bg-clip-text text-transparent' // muted red gradient
    }
  }

  return (
    <div className="bg-[#232323] rounded-[12px] p-6 w-[174px] flex flex-col gap-3">
      <div className="font-['coolvetica',sans-serif] font-light text-[14px] text-[#999999] leading-[1.5] tracking-[0.42px] text-right">
        {label.toUpperCase()}
      </div>
      <div className="flex items-end justify-end gap-3">
        <div className={`font-['coolvetica',sans-serif] font-bold text-[36px] leading-none tracking-[1.08px] ${getScoreColor()}`}>
          {safeScore.toFixed(1)}
        </div>
        <div className="font-['coolvetica',sans-serif] font-light text-[13px] text-white leading-[1.5] tracking-[0.39px]">
          /{maxScore}
        </div>
      </div>
      {globalAverage && (
        <div className="font-['coolvetica',sans-serif] font-light text-[12px] text-[#666666] leading-[1.5] tracking-[0.36px] text-right">
          Avg: {globalAverage.toFixed(1)}
        </div>
      )}
    </div>
  )
}

interface InfoBadgeProps {
  icon: React.ReactNode
  text: string
}

function InfoBadge({ icon, text }: InfoBadgeProps) {
  return (
    <div className="bg-[#232323] rounded-[12px] px-6 py-3 flex items-center gap-2.5">
      <div className="w-6 h-6 text-white">
        {icon}
      </div>
      <span className="font-['coolvetica',sans-serif] font-light text-[14px] text-white leading-[1.5] tracking-[0.42px]">
        {text}
      </span>
    </div>
  )
}

interface EvaluationCardProps {
  evaluator: string
  comment: string
  ratings?: {
    professional: number
    willingness: number
    brotherhood: number
    teamwork: number
    contribution_personal: number
    contribution_akpsi: number
  }
}

function EvaluationCard({ evaluator, comment, ratings }: EvaluationCardProps) {
  // Calculate average if ratings are available
  const average = ratings ? 
    (ratings.professional + ratings.willingness + ratings.brotherhood + 
     ratings.teamwork + ratings.contribution_personal + ratings.contribution_akpsi) / 6 : null

  return (
    <div className="bg-[#232323] rounded-[12px] px-6 py-4 w-full">
      <div className="font-['coolvetica',sans-serif] font-light text-[16px] text-white leading-[1.5] tracking-[0.48px]">
        <div className="flex items-center justify-between mb-2">
          <span className="font-['coolvetica',sans-serif] font-normal text-[#7350ff]">{evaluator}</span>
          <div className="flex items-center gap-3">
            {average && (
              <span className="text-[12px] text-[#bbbbbb] font-medium">
                Avg: {average.toFixed(1)}
              </span>
            )}
            {ratings && (
              <div className="flex gap-2 text-[11px] text-[#888888]">
                <span>P:{ratings.professional}</span>
                <span>W:{ratings.willingness}</span>
                <span>B:{ratings.brotherhood}</span>
                <span>T:{ratings.teamwork}</span>
                <span>CP:{ratings.contribution_personal}</span>
                <span>CA:{ratings.contribution_akpsi}</span>
              </div>
            )}
          </div>
        </div>
        <span>{comment}</span>
      </div>
    </div>
  )
}

interface ApplicantPhotoProps {
  photoUrl?: string
  applicantName: string
}

function ApplicantPhoto({ photoUrl, applicantName }: ApplicantPhotoProps) {
  const [hasError, setHasError] = React.useState(false)

  // Memoize the image URL to prevent unnecessary re-computations
  const imageUrl = React.useMemo(() => {
    if (!photoUrl || !photoUrl.includes('drive.google.com')) {
      return null
    }

    let IMAGE_ID = ''
    
    // Extract ID - everything after 'id='
    if (photoUrl.includes('id=')) {
      const urlParts = photoUrl.split('id=');
      if (urlParts.length > 1) {
        IMAGE_ID = urlParts[1].split('&')[0]; // Remove any additional parameters
      }
    }

    if (!IMAGE_ID) return null

    // Use direct thumbnail URL
    const thumbnailUrl = `https://drive.google.com/thumbnail?id=${IMAGE_ID}&sz=w1000`
    console.log('Generated thumbnail URL:', thumbnailUrl)
    return thumbnailUrl
  }, [photoUrl])

  const handleImageError = React.useCallback(() => {
    setHasError(true)
  }, [])

  const handleImageLoad = React.useCallback(() => {
    setHasError(false)
  }, [])

  // Reset when photoUrl changes
  React.useEffect(() => {
    setHasError(false)
  }, [photoUrl])

  if (!photoUrl || hasError || !imageUrl) {
    return (
      <div className="w-full h-full bg-[#232323] flex flex-col items-center justify-center gap-4">
        <div className="w-16 h-16 bg-[#7350ff] rounded-full flex items-center justify-center">
          <span className="text-white text-2xl font-bold">
            {applicantName.charAt(0).toUpperCase()}
          </span>
        </div>
        {photoUrl && (
          <div className="text-center px-4">
            <p className="font-['coolvetica',sans-serif] font-normal text-[14px] text-white mb-2">
              Photo Available
            </p>
            <a 
              href={photoUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="font-['coolvetica',sans-serif] font-light text-[12px] text-[#7350ff] hover:text-white transition-colors underline"
            >
              View on Google Drive
            </a>
          </div>
        )}
      </div>
    )
  }

  return (
    <img 
      src={imageUrl}
      alt={applicantName}
      className="w-full h-full object-cover"
      referrerPolicy="no-referrer"
      onError={handleImageError}
      onLoad={handleImageLoad}
    />
  )
}

interface QASectionProps {
  question: string
  answer: string
  isExpanded?: boolean
}

function QASection({ question, answer, isExpanded = true }: QASectionProps) {
  const [expanded, setExpanded] = React.useState(isExpanded)

  return (
    <div className="w-full flex flex-col gap-[13px]">
      <div 
        className="flex items-center justify-between cursor-pointer"
        onClick={() => setExpanded(!expanded)}
      >
        <h3 className="font-['coolvetica',sans-serif] font-normal text-[20px] text-white leading-[1.5] tracking-[0.6px]">
          {question}
        </h3>
        <div className={`transition-transform duration-200 ${expanded ? 'rotate-180' : 'rotate-90'}`}>
          <ChevronDown className="w-6 h-6 text-white" />
        </div>
      </div>
      {expanded && (
        <div className="font-['coolvetica',sans-serif] font-light text-[16px] text-white leading-[1.5] tracking-[0.48px]">
          {answer}
        </div>
      )}
    </div>
  )
}

export function ApplicantDetailPage() {
  const navigate = useNavigate()
  const { name: applicantId } = useParams({ from: '/applicant/$name' })
  const [evalDataSource, setEvalDataSource] = React.useState<'original' | 'fuzzy' | 'hybrid'>('hybrid')
  const { user } = useAuth()

  // Redirect to home if user is not authenticated
  React.useEffect(() => {
    if (!user) {
      navigate({ to: '/' })
    }
  }, [user, navigate])

  // Don't render content if user is not authenticated
  if (!user) {
    return null
  }

  // Fetch applicant data using TanStack Query
  const {
    data: applicantData,
    isLoading,
    isError,
    error
  } = useQuery({
    queryKey: ['applicant', applicantId],
    queryFn: () => fetchApplicant(applicantId),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    retry: 3,
    enabled: !!applicantId, // Only run query if we have an ID
  })

  // Always perform fuzzy search to compare with existing data
  const {
    data: fuzzyEvalData,
    isLoading: fuzzyLoading,
  } = useQuery({
    queryKey: ['fuzzy-evals', applicantData?.["Full Name"]],
    queryFn: () => fetchFuzzyEvaluations(applicantData?.["Full Name"] || ''),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    retry: 2,
    enabled: !!applicantData?.["Full Name"],
  })

  // Select eval data based on user toggle
  const finalEvalData = React.useMemo(() => {
    const originalCount = applicantData?.eval_data?.evals || 0
    const fuzzyCount = fuzzyEvalData?.evals || 0
    
    console.log(`Original evals: ${originalCount}, Fuzzy evals: ${fuzzyCount}, Source: ${evalDataSource}`)
    
    switch (evalDataSource) {
      case 'original':
        console.log('Using original eval data (user selected)')
        return applicantData?.eval_data
      case 'fuzzy':
        console.log('Using fuzzy search data (user selected)')
        return fuzzyEvalData
      case 'hybrid':
      default:
        // Use fuzzy data if it has more evaluations, otherwise use original
        if (fuzzyCount > originalCount) {
          console.log('Using fuzzy search data (hybrid - more evaluations found)')
          return fuzzyEvalData
        } else {
          console.log('Using original eval data (hybrid - original has more/equal)')
          return applicantData?.eval_data
        }
    }
  }, [applicantData?.eval_data, fuzzyEvalData, evalDataSource])

  // Calculate ratings from eval_data
  const calculateRatings = (evalData?: EvalData) => {
    if (!evalData || !evalData.data || evalData.data.length === 0) {
      return {
        average: 0,
        contribution_personal: 0,
        contribution_akpsi: 0,
        professionalism: 0,
        willingness: 0,
        brotherhood: 0,
        teamwork: 0
      }
    }

    const evaluations = evalData.data
    const count = evaluations.length

    const totals = evaluations.reduce((acc, evaluation) => ({
      professional: acc.professional + evaluation.professional,
      willingness: acc.willingness + evaluation.willingness,
      brotherhood: acc.brotherhood + evaluation.brotherhood,
      teamwork: acc.teamwork + evaluation.teamwork,
      contribution_personal: acc.contribution_personal + evaluation.contribution_personal,
      contribution_akpsi: acc.contribution_akpsi + evaluation.contribution_akpsi
    }), {
      professional: 0,
      willingness: 0,
      brotherhood: 0,
      teamwork: 0,
      contribution_personal: 0,
      contribution_akpsi: 0
    })

    const averages = {
      professionalism: totals.professional / count,
      willingness: totals.willingness / count,
      brotherhood: totals.brotherhood / count,
      teamwork: totals.teamwork / count,
      contribution_personal: totals.contribution_personal / count,
      contribution_akpsi: totals.contribution_akpsi / count
    }

    const average = (averages.professionalism + averages.willingness + averages.brotherhood + averages.teamwork + averages.contribution_personal + averages.contribution_akpsi) / 6

    return {
      average,
      ...averages
    }
  }

  const ratings = calculateRatings(finalEvalData || undefined)

  // Get real evaluations from eval_data (including fuzzy search results)
  const evaluations = finalEvalData?.data?.map(evaluation => ({
    evaluator: evaluation.brother_name,
    comment: evaluation.comment,
    event: evaluation.Event,
    timestamp: evaluation.Timestamp,
    ratings: {
      professional: evaluation.professional,
      willingness: evaluation.willingness,
      brotherhood: evaluation.brotherhood,
      teamwork: evaluation.teamwork,
      contribution_personal: evaluation.contribution_personal,
      contribution_akpsi: evaluation.contribution_akpsi
    }
  })) || []

  const handleBack = () => {
    navigate({ to: '/dashboard' })
  }

  // Loading state - wait for both queries to complete
  if (isLoading || fuzzyLoading) {
    return (
      <div className="bg-[#1d1d1d] min-h-screen w-full flex items-center justify-center">
        <div className="font-['coolvetica',sans-serif] font-normal text-[16px] text-white">
          Loading applicant...
        </div>
      </div>
    )
  }

  // Error state
  if (isError || !applicantData) {
    return (
      <div className="bg-[#1d1d1d] min-h-screen w-full flex flex-col items-center justify-center gap-4">
        <div className="font-['coolvetica',sans-serif] font-normal text-[16px] text-red-400">
          {error instanceof Error ? error.message : 'Failed to load applicant'}
        </div>
        <button
          onClick={handleBack}
          className="font-['coolvetica',sans-serif] font-normal text-[14px] text-[#7350ff] hover:text-white transition-colors cursor-pointer border border-[#7350ff] hover:border-white px-4 py-2 rounded"
        >
          Back to Dashboard
        </button>
      </div>
    )
  }

  // Extract questions from applicant data
  const questions = [
    {
      question: "Why would you like to become a brother of Alpha Kappa Psi?",
      answer: applicantData["Please describe why you would like to become a brother of Alpha Kappa Psi (150 words or less)"] || "No response provided"
    },
    {
      question: "What about Alpha Kappa Psi gets you excited and why?",
      answer: applicantData["What about Alpha Kappa Psi gets you excited and why? (150 words or less)"] || "No response provided"
    },
    {
      question: "What do you think you can bring to our chapter?",
      answer: applicantData["What do you think you can bring to our chapter? Why do you think you stand out from the other candidates? (150 words or less)"] || "No response provided"
    },
    {
      question: "Share something that would make you a stronger candidate",
      answer: applicantData["Share something you want us to know that would make you a stronger candidate and has yet to be fully represented through your resume or application (150 words or less)"] || "No response provided"
    }
  ]

  return (
    <div className="bg-[#1d1d1d] min-h-screen w-full">
      {/* Background pattern overlay */}
      <div 
        className="absolute inset-0 bg-center bg-cover bg-no-repeat mix-blend-screen opacity-[0.01] pointer-events-none"
        style={{ backgroundImage: `url('${patternImage}')` }}
      />
      
      {/* Main Content */}
      <div className="relative z-10">
        {/* Top Right Fraternity Branding */}
        <div className="absolute top-[5%] right-[5%]">
          <div className="relative">
            <div className="absolute inset-x-0 bottom-0 h-0.5 bg-[#7350ff]" />
            <p className="font-['coolvetica',sans-serif] font-light text-[16px] text-white leading-none pb-2.5 px-2.5">
              ALPHA KAPPA PSI CHI SIGMA
            </p>
          </div>
        </div>

        {/* Back Button */}
        <button 
          onClick={handleBack}
          className="absolute top-[95px] left-11 font-['coolvetica',sans-serif] font-normal text-[14px] text-[#6b6b6b] leading-none hover:text-white transition-colors cursor-pointer"
        >
          back
        </button>

        {/* Header */}
        <div className="pt-[139px] pl-11">
          <h1 className="font-['coolvetica',sans-serif] font-normal text-[36px] text-white leading-none mb-20">
            {applicantData["Full Name"]} ({applicantData["Pronouns"]})
          </h1>
        </div>

        {/* Content Layout */}
        <div className="flex gap-8 pl-11 pr-11 pb-32">
          {/* Left Column - Photo */}
          <div className="flex-shrink-0 sticky top-[219px]">
            <div className="w-[354px] h-[472px] overflow-hidden rounded-lg">
              <ApplicantPhoto 
                photoUrl={applicantData["Please upload a clear photo of yourself"]}
                applicantName={applicantData["Full Name"]}
              />
            </div>
          </div>

          {/* Right Column - Content */}
          <div className="flex-1 max-w-[966px] flex flex-col gap-6">
            {/* Info Badges */}
            <div className="flex gap-4 flex-wrap">
              <InfoBadge 
                icon={<GraduationCap className="w-6 h-6" />}
                text={applicantData["Year"]}
              />
              <InfoBadge 
                icon={<BookOpen className="w-6 h-6" />}
                text={applicantData["Major"]}
              />
              {applicantData["Minor(s)"] && (
                <InfoBadge 
                  icon={<BookOpen className="w-6 h-6" />}
                  text={applicantData["Minor(s)"]}
                />
              )}
              {applicantData["College(s)"] && (
                <InfoBadge 
                  icon={<GraduationCap className="w-6 h-6" />}
                  text={applicantData["College(s)"]}
                />
              )}
              <InfoBadge 
                icon={<BookOpen className="w-6 h-6" />}
                text={applicantData["Northeastern Email"]}
              />
              {applicantData["Please attach a copy of your resume as a PDF"] && (
                <a
                  href={applicantData["Please attach a copy of your resume as a PDF"]}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 bg-[#232323] hover:bg-[#2a2a2a] transition-colors rounded-[4px] px-3 py-2 cursor-pointer"
                >
                  <FileText className="w-6 h-6 text-[#7350ff]" />
                  <span className="font-['coolvetica',sans-serif] font-normal text-[14px] text-white leading-none">
                    Resume
                  </span>
                </a>
              )}
            </div>

            {/* Rating Cards */}
            <div className="flex flex-wrap gap-6">
              <RatingCard 
                label="Average"
                score={ratings.average}
                maxScore={5}
                globalAverage={GLOBAL_AVERAGES.overall}
              />
              <RatingCard 
                label="Contribution Personal"
                score={ratings.contribution_personal}
                maxScore={5}
                globalAverage={GLOBAL_AVERAGES.contribution_personal}
              />
              <RatingCard 
                label="Contribution AKPsi"
                score={ratings.contribution_akpsi}
                maxScore={5}
                globalAverage={GLOBAL_AVERAGES.contribution_akpsi}
              />
              <RatingCard 
                label="Professionalism"
                score={ratings.professionalism}
                maxScore={5}
                globalAverage={GLOBAL_AVERAGES.professional}
              />
              <RatingCard 
                label="Willingness"
                score={ratings.willingness}
                maxScore={5}
                globalAverage={GLOBAL_AVERAGES.willingness}
              />
              <RatingCard 
                label="Brotherhood"
                score={ratings.brotherhood}
                maxScore={5}
                globalAverage={GLOBAL_AVERAGES.brotherhood}
              />
              <RatingCard 
                label="Teamwork"
                score={ratings.teamwork}
                maxScore={5}
                globalAverage={GLOBAL_AVERAGES.teamwork}
              />
            </div>

            {/* Evaluation Data Source Toggle */}
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-['coolvetica',sans-serif] font-normal text-[24px] text-white leading-none">
                Evaluation Comments
              </h2>
              <div className="flex border border-[#333333] rounded-[4px] overflow-hidden">
                <button
                  onClick={() => setEvalDataSource('original')}
                  className={`font-['coolvetica',sans-serif] font-normal text-[12px] px-4 py-2 transition-colors ${
                    evalDataSource === 'original'
                      ? 'bg-[#7350ff] text-white'
                      : 'bg-[#232323] text-[#666666] hover:text-white'
                  }`}
                >
                  Original ({applicantData?.eval_data?.evals || 0})
                </button>
                <button
                  onClick={() => setEvalDataSource('fuzzy')}
                  className={`font-['coolvetica',sans-serif] font-normal text-[12px] px-4 py-2 transition-colors border-l border-[#333333] ${
                    evalDataSource === 'fuzzy'
                      ? 'bg-[#7350ff] text-white'
                      : 'bg-[#232323] text-[#666666] hover:text-white'
                  }`}
                >
                  Fuzzy ({fuzzyEvalData?.evals || 0})
                </button>
                <button
                  onClick={() => setEvalDataSource('hybrid')}
                  className={`font-['coolvetica',sans-serif] font-normal text-[12px] px-4 py-2 transition-colors border-l border-[#333333] ${
                    evalDataSource === 'hybrid'
                      ? 'bg-[#7350ff] text-white'
                      : 'bg-[#232323] text-[#666666] hover:text-white'
                  }`}
                >
                  Hybrid ({finalEvalData?.evals || 0})
                </button>
              </div>
            </div>

            {/* Evaluation Comments */}
            <div className="flex flex-col gap-2">
              {evaluations.length > 0 ? (
                evaluations.map((evaluation, index) => (
                <EvaluationCard 
                  key={index}
                  evaluator={evaluation.evaluator}
                  comment={evaluation.comment}
                  ratings={evaluation.ratings}
                />
                ))
              ) : (
                <div className="bg-[#232323] rounded-[12px] px-6 py-4 w-full">
                  <div className="font-['coolvetica',sans-serif] font-light text-[16px] text-gray-400 leading-[1.5] tracking-[0.48px]">
                    No evaluations available yet.
                  </div>
                </div>
              )}
            </div>

            {/* Q&A Sections */}
            <div className="flex flex-col gap-6">
              {questions.map((qa, index) => (
                <QASection 
                  key={index}
                  question={qa.question}
                  answer={qa.answer}
                  isExpanded={true}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
