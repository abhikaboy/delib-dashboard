import * as React from "react"
import { useNavigate } from "@tanstack/react-router"
import { useQuery } from "@tanstack/react-query"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useAuth } from "@/contexts/AuthContext"
import patternImage from '../pattern.png'

// API configuration
const API_BASE_URL = 'http://localhost:3001/api'

// Global averages for comparison (Spring 2026 - based on 840 evaluations)
const GLOBAL_AVERAGES = {
  professional: 3.454761904761905,
  willingness: 3.4464285714285716,
  brotherhood: 3.2654761904761904,
  teamwork: 3.355952380952381,
  contribution_personal: 3.4726190476190477,
  contribution_akpsi: 3.261904761904762,
}

// Types for applicant data
interface Applicant {
  _id: string | { $oid: string }
  "Full Name": string
  "Northeastern Email": string
  "Pronouns": string
  "Year": string
  "Major": string
  "Minor(s)"?: string
  "College(s)"?: string
  "Please upload a clear photo of yourself": string
  eval_data?: {
    _id: string
    evals: number
    averageScore: number
    avg_rating: number
  }
}

// Types for evaluation data
interface Evaluation {
  _id: string | { $oid: string }
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
  unmatched?: boolean
}

// API functions
const applicantsApi = {
  getAll: async (): Promise<Applicant[]> => {
    const response = await fetch(`${API_BASE_URL}/applications`)
    const data = await response.json()
    
    if (!response.ok) {
      throw new Error(data.message || 'Failed to fetch applicants')
    }
    
    if (!data.success) {
      throw new Error(data.message || 'API returned unsuccessful response')
    }
    
    return data.data
  },
  
  search: async (query: string): Promise<Applicant[]> => {
    if (!query.trim()) {
      return applicantsApi.getAll()
    }
    
    const response = await fetch(`${API_BASE_URL}/applications/search/${encodeURIComponent(query)}`)
    const data = await response.json()
    
    if (!response.ok) {
      throw new Error(data.message || 'Failed to search applicants')
    }
    
    if (!data.success) {
      throw new Error(data.message || 'Search API returned unsuccessful response')
    }
    
    return data.data
  }
}

// API functions for evaluations
const evaluationsApi = {
  getAll: async (): Promise<Evaluation[]> => {
    const response = await fetch(`${API_BASE_URL}/evaluations`)
    const data = await response.json()
    
    if (!response.ok) {
      throw new Error(data.message || 'Failed to fetch evaluations')
    }
    
    if (!data.success) {
      throw new Error(data.message || 'API returned unsuccessful response')
    }
    
    return data.data
  },
  
  search: async (query: string): Promise<Evaluation[]> => {
    if (!query.trim()) {
      return evaluationsApi.getAll()
    }
    
    const response = await fetch(`${API_BASE_URL}/evaluations/search/${encodeURIComponent(query)}`)
    const data = await response.json()
    
    if (!response.ok) {
      throw new Error(data.message || 'Failed to search evaluations')
    }
    
    if (!data.success) {
      throw new Error(data.message || 'Search API returned unsuccessful response')
    }
    
    return data.data
  },

  getByBrother: async (brotherName: string): Promise<Evaluation[]> => {
    const response = await fetch(`${API_BASE_URL}/evaluations/brother/${encodeURIComponent(brotherName)}`)
    const data = await response.json()
    
    if (!response.ok) {
      throw new Error(data.message || 'Failed to fetch evaluations by brother')
    }
    
    if (!data.success) {
      throw new Error(data.message || 'API returned unsuccessful response')
    }
    
    return data.data
  },

  searchByBrother: async (brotherName: string, query: string): Promise<Evaluation[]> => {
    if (!query.trim()) {
      return evaluationsApi.getByBrother(brotherName)
    }
    
    const response = await fetch(`${API_BASE_URL}/evaluations/brother/${encodeURIComponent(brotherName)}/search/${encodeURIComponent(query)}`)
    const data = await response.json()
    
    if (!response.ok) {
      throw new Error(data.message || 'Failed to search evaluations by brother')
    }
    
    if (!data.success) {
      throw new Error(data.message || 'Search API returned unsuccessful response')
    }
    
    return data.data
  }
}

function EvaluationCard({ evaluation }: { evaluation: Evaluation }) {
  const navigate = useNavigate()

  const handleClick = () => {
    if (evaluation.applicant) {
      // Navigate to applicant detail page - we'll need to find the applicant by name
      // For now, we'll use the applicant name as the ID (this might need adjustment based on your routing)
      navigate({ to: '/applicant/$name', params: { name: evaluation.applicant } })
    }
  }
  // Calculate average score with safety checks
  const professional = evaluation.professional || 0
  const willingness = evaluation.willingness || 0
  const brotherhood = evaluation.brotherhood || 0
  const teamwork = evaluation.teamwork || 0
  const contribution_personal = evaluation.contribution_personal || 0
  const contribution_akpsi = evaluation.contribution_akpsi || 0
  
  const average = (professional + willingness + brotherhood + teamwork + contribution_personal + contribution_akpsi) / 6

  // Helper function to get color based on rating vs global average
  const getRatingColor = (rating: number, globalAvg: number) => {
    const diff = rating - globalAvg
    if (diff >= 1.0) return 'text-[#4ade80]' // bright green
    if (diff >= 0.5) return 'text-[#90ee90]' // light green
    if (diff >= -0.5) return 'text-[#888888]' // gray (near average)
    if (diff >= -1.0) return 'text-[#fca5a5]' // light red
    return 'text-[#ef4444]' // red
  }

  // Format timestamp with safety check
  const formattedDate = evaluation.Timestamp?.$date 
    ? new Date(evaluation.Timestamp.$date).toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    : 'Unknown Date'

  return (
    <div 
      onClick={handleClick}
      className={`bg-[#232323] rounded-[4px] px-6 py-4 flex-1 min-w-0 hover:bg-[#2a2a2a] transition-colors cursor-pointer ${
        evaluation.unmatched ? 'border border-red-500/30' : ''
      }`}
    >
      <div className="flex items-start justify-between mb-3">
        <div>
          <p className="font-['coolvetica',sans-serif] font-normal text-[14px] text-white leading-none mb-1">
            {evaluation.applicant?.toUpperCase() || 'UNKNOWN APPLICANT'}
          </p>
          <p className="font-['coolvetica',sans-serif] font-light text-[14px] text-[#7350ff] leading-none">
            by {evaluation.brother_name || 'Unknown Brother'}
          </p>
        </div>
        <div className="text-right">
          <p className="font-['coolvetica',sans-serif] font-medium text-[14px] text-[#bbbbbb] leading-none mb-1">
            Avg: {average.toFixed(1)}
          </p>
          <p className="font-['coolvetica',sans-serif] font-light text-[14px] text-[#666666] leading-none">
            {formattedDate}
          </p>
        </div>
      </div>
      
      <div className="flex gap-2 text-[14px] mb-3">
        <span className={getRatingColor(professional, GLOBAL_AVERAGES.professional)}>
          P:{professional}
        </span>
        <span className={getRatingColor(willingness, GLOBAL_AVERAGES.willingness)}>
          W:{willingness}
        </span>
        <span className={getRatingColor(brotherhood, GLOBAL_AVERAGES.brotherhood)}>
          B:{brotherhood}
        </span>
        <span className={getRatingColor(teamwork, GLOBAL_AVERAGES.teamwork)}>
          T:{teamwork}
        </span>
        <span className={getRatingColor(contribution_personal, GLOBAL_AVERAGES.contribution_personal)}>
          CP:{contribution_personal}
        </span>
        <span className={getRatingColor(contribution_akpsi, GLOBAL_AVERAGES.contribution_akpsi)}>
          CA:{contribution_akpsi}
        </span>
      </div>
      
      <p className="font-['coolvetica',sans-serif] font-light text-[14px] text-[#cccccc] leading-[1.3]">
        {evaluation.comment || 'No comment provided'}
      </p>
      
      <p className="font-['coolvetica',sans-serif] font-light text-[14px] text-[#666666] leading-none mt-2">
        Event: {evaluation.Event || 'Unknown Event'}
      </p>
    </div>
  )
}

function ApplicantCard({ applicant }: { applicant: Applicant }) {
  const navigate = useNavigate()
  
  const handleClick = () => {
    console.log('Card clicked! Applicant data:', applicant) // Debug log
    
    // Use the MongoDB ObjectId for navigation
    const urlId = typeof applicant._id === 'string' 
      ? applicant._id 
      : applicant._id?.$oid
    console.log('Extracted URL ID:', urlId) // Debug log
    
    if (urlId) {
      console.log('Attempting to navigate to:', `/applicant/${urlId}`) // Debug log
      try {
        navigate({ to: '/applicant/$name', params: { name: urlId } })
        console.log('Navigation called successfully') // Debug log
      } catch (error) {
        console.error('Navigation error:', error)
      }
    } else {
      console.error('No valid ID found for applicant:', applicant)
    }
  }

  // Check if applicant has evaluation data
  const hasEvalData = applicant.eval_data && applicant.eval_data.evals > 0

  return (
    <div 
      onClick={handleClick}
      className={`bg-[#232323] rounded-[4px] px-6 py-3 flex-1 min-w-0 hover:bg-[#2a2a2a] transition-colors cursor-pointer ${
        !hasEvalData ? 'border-2 border-[#8b5a5a]' : ''
      }`}
    >
      <div className="flex items-center justify-between">
        <p className="font-['coolvetica',sans-serif] font-normal text-[14px] text-white leading-none">
          {applicant["Full Name"].toUpperCase()}
        </p>
        <span className="font-['coolvetica',sans-serif] font-light text-[12px] text-[#666666] leading-none">
          {applicant.eval_data?.evals || 0}
        </span>
      </div>
    </div>
  )
}

function GalleryCard({ applicant }: { applicant: Applicant }) {
  const navigate = useNavigate()
  const [hasError, setHasError] = React.useState(false)
  
  const handleClick = () => {
    const urlId = typeof applicant._id === 'string' 
      ? applicant._id 
      : applicant._id?.$oid
    
    if (urlId) {
      navigate({ to: '/applicant/$name', params: { name: urlId } })
    }
  }

  // Use the same image URL logic as ApplicantDetailPage
  const imageUrl = React.useMemo(() => {
    const photoUrl = applicant["Please upload a clear photo of yourself"]
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

    // Use direct thumbnail URL (same as detail page)
    return `https://drive.google.com/thumbnail?id=${IMAGE_ID}&sz=w1000`
  }, [applicant])

  const avgRating = applicant.eval_data?.avg_rating
  const hasEvals = applicant.eval_data && applicant.eval_data.evals > 0

  return (
    <div 
      onClick={handleClick}
      className="bg-[#232323] rounded-[8px] overflow-hidden hover:bg-[#2a2a2a] transition-all cursor-pointer hover:scale-[1.02] group flex-1 min-w-0"
    >
      {/* Photo */}
      <div className="aspect-[3/4] bg-[#1a1a1a] relative overflow-hidden">
        {!hasError && imageUrl ? (
          <img 
            src={imageUrl} 
            alt={applicant["Full Name"]}
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
            onError={() => setHasError(true)}
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center bg-[#232323]">
            <div className="text-[#666666] font-['coolvetica',sans-serif] text-[48px] font-light">
              {applicant["Full Name"].split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
            </div>
          </div>
        )}
        
        {/* Rating Badge */}
        {hasEvals && avgRating && (
          <div className="absolute top-3 right-3 bg-[#7350ff] text-white px-3 py-1.5 rounded-full font-['coolvetica',sans-serif] text-[14px] font-medium shadow-lg">
            {avgRating.toFixed(1)}
          </div>
        )}
        
        {/* Eval Count Badge */}
        <div className="absolute bottom-3 left-3 bg-black/60 backdrop-blur-sm text-white px-3 py-1.5 rounded-full font-['coolvetica',sans-serif] text-[12px] font-light">
          {applicant.eval_data?.evals || 0} evals
        </div>
      </div>
      
      {/* Name */}
      <div className="p-4">
        <h3 className="font-['coolvetica',sans-serif] font-normal text-[16px] text-white leading-tight">
          {applicant["Full Name"]}
        </h3>
        <p className="font-['coolvetica',sans-serif] font-light text-[12px] text-[#888888] mt-1">
          {applicant.Year} • {applicant.Major}
        </p>
      </div>
    </div>
  )
}

export function DashboardPage() {
  const [activeTab, setActiveTab] = React.useState<'applications' | 'evaluations' | 'my-evaluations' | 'gallery'>('applications')
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const currentUser = user || "Unknown User"

  // Redirect to home if user is not authenticated
  React.useEffect(() => {
    if (!user) {
      navigate({ to: '/' })
    }
  }, [user, navigate])

  const handleLogout = () => {
    logout()
    navigate({ to: '/' })
  }

  // Don't render content if user is not authenticated
  if (!user) {
    return null
  }
  const [searchQuery, setSearchQuery] = React.useState("")
  const [debouncedSearchQuery, setDebouncedSearchQuery] = React.useState("")
  const [sortBy, setSortBy] = React.useState<string>("name-asc")
  const [filterYear, setFilterYear] = React.useState<string>("all")
  const [filterEvals, setFilterEvals] = React.useState<string>("all")

  // Debounce search query to avoid excessive API calls
  React.useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery)
    }, 300)

    return () => clearTimeout(timer)
  }, [searchQuery])

  // Reset search and filters when switching tabs
  React.useEffect(() => {
    setSearchQuery("")
    setDebouncedSearchQuery("")
    setSortBy("name-asc")
    setFilterYear("all")
    setFilterEvals("all")
  }, [activeTab])

  // Use TanStack Query for applicants data fetching
  const {
    data: applicants = [],
    isLoading: applicantsLoading,
    isError: applicantsError,
    error: applicantsErrorMsg,
    refetch: refetchApplicants
  } = useQuery({
    queryKey: ['applicants', debouncedSearchQuery],
    queryFn: () => debouncedSearchQuery.trim() 
      ? applicantsApi.search(debouncedSearchQuery)
      : applicantsApi.getAll(),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    enabled: activeTab === 'applications'
  })

  // Use TanStack Query for evaluations data fetching
  const {
    data: evaluations = [],
    isLoading: evaluationsLoading,
    isError: evaluationsError,
    error: evaluationsErrorMsg,
    refetch: refetchEvaluations
  } = useQuery({
    queryKey: ['evaluations', debouncedSearchQuery],
    queryFn: () => debouncedSearchQuery.trim() 
      ? evaluationsApi.search(debouncedSearchQuery)
      : evaluationsApi.getAll(),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    enabled: activeTab === 'evaluations'
  })

  // Use TanStack Query for my evaluations data fetching
  const {
    data: myEvaluations = [],
    isLoading: myEvaluationsLoading,
    isError: myEvaluationsError,
    error: myEvaluationsErrorMsg,
    refetch: refetchMyEvaluations
  } = useQuery({
    queryKey: ['my-evaluations', currentUser, debouncedSearchQuery],
    queryFn: () => debouncedSearchQuery.trim() 
      ? evaluationsApi.searchByBrother(currentUser, debouncedSearchQuery)
      : evaluationsApi.getByBrother(currentUser),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    enabled: activeTab === 'my-evaluations'
  })

  // Current data based on active tab
  const currentData = activeTab === 'applications' || activeTab === 'gallery' ? applicants : 
                     activeTab === 'evaluations' ? evaluations : myEvaluations
  const isLoading = (activeTab === 'applications' || activeTab === 'gallery') ? applicantsLoading : 
                   activeTab === 'evaluations' ? evaluationsLoading : myEvaluationsLoading
  const isError = (activeTab === 'applications' || activeTab === 'gallery') ? applicantsError : 
                 activeTab === 'evaluations' ? evaluationsError : myEvaluationsError
  const error = (activeTab === 'applications' || activeTab === 'gallery') ? applicantsErrorMsg : 
               activeTab === 'evaluations' ? evaluationsErrorMsg : myEvaluationsErrorMsg
  const refetch = (activeTab === 'applications' || activeTab === 'gallery') ? refetchApplicants : 
                 activeTab === 'evaluations' ? refetchEvaluations : refetchMyEvaluations

  // Sort and filter applicants
  const sortedAndFilteredApplicants = React.useMemo(() => {
    if (activeTab !== 'applications' && activeTab !== 'gallery') return applicants
    
    let filtered = [...applicants]
    
    // Filter by year
    if (filterYear !== 'all') {
      filtered = filtered.filter(app => app.Year === filterYear)
    }
    
    // Filter by eval count
    if (filterEvals === 'with-evals') {
      filtered = filtered.filter(app => app.eval_data && app.eval_data.evals > 0)
    } else if (filterEvals === 'without-evals') {
      filtered = filtered.filter(app => !app.eval_data || app.eval_data.evals === 0)
    }
    
    // Sort
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'name-asc':
          return a["Full Name"].localeCompare(b["Full Name"])
        case 'name-desc':
          return b["Full Name"].localeCompare(a["Full Name"])
        case 'evals-desc':
          return (b.eval_data?.evals || 0) - (a.eval_data?.evals || 0)
        case 'evals-asc':
          return (a.eval_data?.evals || 0) - (b.eval_data?.evals || 0)
        case 'rating-desc':
          return (b.eval_data?.avg_rating || 0) - (a.eval_data?.avg_rating || 0)
        case 'rating-asc':
          return (a.eval_data?.avg_rating || 0) - (b.eval_data?.avg_rating || 0)
        default:
          return 0
      }
    })
    
    return filtered
  }, [applicants, activeTab, sortBy, filterYear, filterEvals])

  // Group data into rows based on active tab
  const dataRows = React.useMemo(() => {
    const data = (activeTab === 'applications' || activeTab === 'gallery') ? sortedAndFilteredApplicants : 
                activeTab === 'evaluations' ? evaluations : myEvaluations
    const itemsPerRow = activeTab === 'applications' ? 6 : 
                       activeTab === 'gallery' ? 4 : 3 // Different grid sizes
    const rows = []
    for (let i = 0; i < data.length; i += itemsPerRow) {
      rows.push(data.slice(i, i + itemsPerRow))
    }
    return rows
  }, [sortedAndFilteredApplicants, evaluations, myEvaluations, activeTab])

  return (
    <div className="bg-[#1d1d1d] min-h-screen w-full">
      {/* Background pattern overlay */}
      <div 
        className="absolute inset-0 bg-center bg-cover bg-no-repeat mix-blend-screen opacity-[0.01] pointer-events-none"
        style={{ backgroundImage: `url('${patternImage}')` }}
      />
      
              {/* Top Right Fraternity Branding */}
              <div className="absolute top-[5%] right-[5%]">
          <div className="relative">
            <div className="absolute inset-x-0 bottom-0 h-0.5 bg-[#7350ff]" />
            <p className="font-['coolvetica',sans-serif] font-light text-[16px] text-white leading-none pb-2.5 px-2.5">
              ALPHA KAPPA PSI CHI SIGMA
            </p>
          </div>
        </div>
      {/* Main Content */}
      <div className="relative z-10">


        {/* Header */}
        <div className="pt-[170px] pl-16 pr-16">
          <div className="flex items-center justify-between mb-[74px]">
            <h1 className="font-['coolvetica',sans-serif] font-normal text-[36px] text-white leading-none">
              hey, {currentUser.toLowerCase()}
            </h1>
            <button
              onClick={handleLogout}
              className="font-['coolvetica',sans-serif] font-normal text-[14px] text-[#666666] hover:text-white transition-colors cursor-pointer"
            >
              logout
            </button>
          </div>
          
          {/* Tabs */}
          <div className="mb-8">
            <div className="flex border-b border-[#333333]">
              <button
                onClick={() => setActiveTab('applications')}
                className={`font-['coolvetica',sans-serif] font-normal text-[16px] px-6 py-3 border-b-2 transition-colors ${
                  activeTab === 'applications'
                    ? 'text-white border-[#7350ff]'
                    : 'text-[#666666] border-transparent hover:text-white'
                }`}
              >
                Applications
              </button>
              <button
                onClick={() => setActiveTab('gallery')}
                className={`font-['coolvetica',sans-serif] font-normal text-[16px] px-6 py-3 border-b-2 transition-colors ${
                  activeTab === 'gallery'
                    ? 'text-white border-[#7350ff]'
                    : 'text-[#666666] border-transparent hover:text-white'
                }`}
              >
                Gallery
              </button>
              <button
                onClick={() => setActiveTab('evaluations')}
                className={`font-['coolvetica',sans-serif] font-normal text-[16px] px-6 py-3 border-b-2 transition-colors ${
                  activeTab === 'evaluations'
                    ? 'text-white border-[#7350ff]'
                    : 'text-[#666666] border-transparent hover:text-white'
                }`}
              >
                Evaluations
              </button>
              <button
                onClick={() => setActiveTab('my-evaluations')}
                className={`font-['coolvetica',sans-serif] font-normal text-[16px] px-6 py-3 border-b-2 transition-colors ${
                  activeTab === 'my-evaluations'
                    ? 'text-white border-[#7350ff]'
                    : 'text-[#666666] border-transparent hover:text-white'
                }`}
              >
                My Evaluations
              </button>
            </div>
          </div>
          
          {/* Search Bar and Filters */}
          <div className="mb-[69px]">
            <div className="flex gap-4 items-end">
              {/* Search Input */}
              <div className="flex-1 max-w-[976px]">
                <Input
                  type="text"
                  placeholder={activeTab === 'applications' || activeTab === 'gallery' ? "Search for an applicant" : "Search by applicant name"}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="bg-[#181818] border-[#222222] rounded-[8px] h-[49px] text-white placeholder:text-[#5c5c5c] placeholder:font-['coolvetica',sans-serif] placeholder:font-light placeholder:text-[14px] focus-visible:ring-[#4d47f6]/50 focus-visible:border-[#4d47f6] px-6 py-3"
                />
              </div>
              
              {/* Sorting and Filtering - For Applications and Gallery tabs */}
              {(activeTab === 'applications' || activeTab === 'gallery') && (
                <>
                  {/* Sort By */}
                  <div className="w-[200px]">
                    <label className="font-['coolvetica',sans-serif] font-light text-[12px] text-[#888888] mb-2 block">
                      Sort By
                    </label>
                    <Select value={sortBy} onValueChange={setSortBy}>
                      <SelectTrigger className="h-[49px] font-['coolvetica',sans-serif]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="name-asc">Name (A-Z)</SelectItem>
                        <SelectItem value="name-desc">Name (Z-A)</SelectItem>
                        <SelectItem value="evals-desc">Most Evals</SelectItem>
                        <SelectItem value="evals-asc">Least Evals</SelectItem>
                        <SelectItem value="rating-desc">Highest Rating</SelectItem>
                        <SelectItem value="rating-asc">Lowest Rating</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  {/* Filter by Year */}
                  <div className="w-[180px]">
                    <label className="font-['coolvetica',sans-serif] font-light text-[12px] text-[#888888] mb-2 block">
                      Year
                    </label>
                    <Select value={filterYear} onValueChange={setFilterYear}>
                      <SelectTrigger className="h-[49px] font-['coolvetica',sans-serif]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Years</SelectItem>
                        <SelectItem value="First Year">First Year</SelectItem>
                        <SelectItem value="Second Year">Second Year</SelectItem>
                        <SelectItem value="Third Year">Third Year</SelectItem>
                        <SelectItem value="Fourth Year">Fourth Year</SelectItem>
                        <SelectItem value="Fifth Year+">Fifth Year+</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  {/* Filter by Evals */}
                  <div className="w-[180px]">
                    <label className="font-['coolvetica',sans-serif] font-light text-[12px] text-[#888888] mb-2 block">
                      Evaluations
                    </label>
                    <Select value={filterEvals} onValueChange={setFilterEvals}>
                      <SelectTrigger className="h-[49px] font-['coolvetica',sans-serif]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All</SelectItem>
                        <SelectItem value="with-evals">With Evals</SelectItem>
                        <SelectItem value="without-evals">Without Evals</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </>
              )}
            </div>
          </div>
          
            {/* Content Grid */}
            <div className="w-full">
              {isLoading ? (
                <div className="flex items-center justify-center py-20">
                  <div className="font-['coolvetica',sans-serif] font-normal text-[16px] text-white">
                    {debouncedSearchQuery ? 'Searching...' : `Loading ${activeTab}...`}
                  </div>
                </div>
              ) : isError ? (
                <div className="flex flex-col items-center justify-center py-20 gap-4">
                  <div className="font-['coolvetica',sans-serif] font-normal text-[16px] text-red-400">
                    {error instanceof Error ? error.message : `Failed to load ${activeTab}`}
                  </div>
                  <button
                    onClick={() => refetch()}
                    className="font-['coolvetica',sans-serif] font-normal text-[14px] text-[#7350ff] hover:text-white transition-colors cursor-pointer border border-[#7350ff] hover:border-white px-4 py-2 rounded"
                  >
                    Try Again
                  </button>
                </div>
              ) : (
                <div className="flex flex-col gap-6">
                  {dataRows.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 gap-2">
                      <div className="font-['coolvetica',sans-serif] font-normal text-[16px] text-white">
                        {debouncedSearchQuery ? `No ${activeTab} found matching your search` : `No ${activeTab} found`}
                      </div>
                      {debouncedSearchQuery && (
                        <div className="font-['coolvetica',sans-serif] font-light text-[14px] text-gray-400">
                          Try a different search term
                        </div>
                      )}
                    </div>
                  ) : (
                    <>
                      {debouncedSearchQuery && (
                        <div className="font-['coolvetica',sans-serif] font-light text-[14px] text-gray-400 mb-2">
                          Found {currentData.length} {activeTab === 'applications' || activeTab === 'gallery' ? 'applicant' : 'evaluation'}{currentData.length !== 1 ? 's' : ''} matching "{debouncedSearchQuery}"
                        </div>
                      )}
                      {dataRows.map((row, rowIndex) => (
                        <div key={rowIndex} className={`flex gap-${activeTab === 'gallery' ? '6' : '3'}`}>
                          {row.map((item) => (
                            activeTab === 'applications' ? (
                              <ApplicantCard 
                                key={typeof item._id === 'string' ? item._id : item._id.$oid} 
                                applicant={item as Applicant} 
                              />
                            ) : activeTab === 'gallery' ? (
                              <GalleryCard 
                                key={typeof item._id === 'string' ? item._id : item._id.$oid} 
                                applicant={item as Applicant} 
                              />
                            ) : (
                              <EvaluationCard 
                                key={typeof item._id === 'string' ? item._id : item._id.$oid} 
                                evaluation={item as Evaluation} 
                              />
                            )
                          ))}
                          {/* Fill remaining slots with empty divs to maintain grid */}
                          {Array.from({ length: (activeTab === 'applications' ? 6 : activeTab === 'gallery' ? 4 : 3) - row.length }).map((_, index) => (
                            <div key={`empty-${index}`} className="flex-1 min-w-0" />
                          ))}
                        </div>
                      ))}
                    </>
                  )}
                </div>
              )}
            </div>
        </div>
      </div>
    </div>
  )
}
