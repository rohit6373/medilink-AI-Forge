import React, { useState, useEffect } from 'react';
import {
  Search,
  X,
  ExternalLink,
  MapPin,
  Building2,
  ShieldCheck,
  Globe,
  Phone,
  AlertTriangle,
  Sparkles,
  ArrowRight,
  Filter,
  CheckCircle2,
  Clock,
  Droplet,
  Bed,
  Layers,
  HeartPulse,
  BookOpen,
  Ambulance as AmbulanceIcon,
  HelpCircle,
  RefreshCw,
  Send,
  Navigation,
} from 'lucide-react';
import { useMediLink } from '../../context/MediLinkContext';
import {
  SearchCategory,
  ExternalSearchResultItem,
  HealthcareSearchResponse,
  Hospital,
} from '../../types';
import { VerificationBadge } from '../common/StatusBadge';

interface HealthcareSearchViewProps {
  onNavigateTab: (tab: any) => void;
  onSelectHospital?: (hospitalId: string) => void;
  onRequestTransfer?: (hospital: Hospital) => void;
}

const CATEGORIES: { id: SearchCategory; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { id: 'all', label: 'All Resources', icon: Globe },
  { id: 'hospitals', label: 'Hospitals', icon: Building2 },
  { id: 'blood_banks', label: 'Blood Banks', icon: Droplet },
  { id: 'ambulances', label: 'Ambulances', icon: AmbulanceIcon },
  { id: 'emergency_centers', label: 'Emergency Centers', icon: HeartPulse },
  { id: 'specialists', label: 'Specialists', icon: Layers },
  { id: 'government', label: 'Government Portals', icon: ShieldCheck },
  { id: 'guidelines', label: 'Medical Guidelines', icon: BookOpen },
  { id: 'healthcare_services', label: 'Healthcare Services', icon: HelpCircle },
];

const SUGGESTED_QUERIES = [
  'Trauma center with emergency ICU',
  'e-RaktKosh national blood bank portal',
  'National Emergency Ambulance Service 108',
  'AIIMS New Delhi emergency helpline',
  'MoHFW emergency triage protocols',
  'Burn care specialty hospital',
  'Stroke thrombolysis clinical guidelines',
  'NIMHANS neurosurgery emergency care',
];

export const HealthcareSearchView: React.FC<HealthcareSearchViewProps> = ({
  onNavigateTab,
  onSelectHospital,
}) => {
  const { hospitals, currentHospital, switchHospital } = useMediLink();

  const [query, setQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<SearchCategory>('all');
  const [searchResponse, setSearchResponse] = useState<HealthcareSearchResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState(false);

  // Recent Searches saved locally (PII-free)
  const [recentSearches, setRecentSearches] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('medilink_recent_searches');
      return saved ? JSON.parse(saved).slice(0, 6) : [
        'Trauma emergency center',
        'e-RaktKosh blood bank',
        'MoHFW triage protocol',
      ];
    } catch {
      return ['Trauma emergency center', 'e-RaktKosh blood bank'];
    }
  });

  const saveRecentSearch = (term: string) => {
    if (!term.trim()) return;
    try {
      const updated = [term.trim(), ...recentSearches.filter((s) => s.toLowerCase() !== term.trim().toLowerCase())].slice(0, 6);
      setRecentSearches(updated);
      localStorage.setItem('medilink_recent_searches', JSON.stringify(updated));
    } catch {
      // Storage fallback
    }
  };

  const executeSearch = async (searchTerm: string, category: SearchCategory = selectedCategory) => {
    const trimmed = searchTerm.trim();
    if (!trimmed) return;

    setIsLoading(true);
    setErrorMessage(null);
    setHasSearched(true);
    saveRecentSearch(trimmed);

    try {
      const res = await fetch('/api/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: trimmed,
          category,
          locationContext: currentHospital ? `${currentHospital.city}, ${currentHospital.state}` : 'National Metro',
        }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || `Search failed with status ${res.status}`);
      }

      const data: HealthcareSearchResponse = await res.json();
      setSearchResponse(data);
    } catch (err: any) {
      console.warn('Search execution error:', err);
      setErrorMessage(
        err.message || 'External search service is temporarily busy. Internal hospital network remains fully operational.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    executeSearch(query, selectedCategory);
  };

  const handleCategorySelect = (cat: SearchCategory) => {
    setSelectedCategory(cat);
    if (query.trim()) {
      executeSearch(query, cat);
    }
  };

  const handleSuggestedClick = (text: string) => {
    setQuery(text);
    executeSearch(text, selectedCategory);
  };

  const handleClear = () => {
    setQuery('');
    setSearchResponse(null);
    setHasSearched(false);
    setErrorMessage(null);
  };

  // Internal MediLink Verified Network Matches
  const matchedInternalHospitals = React.useMemo(() => {
    if (!query.trim()) return [];
    const q = query.toLowerCase();

    return hospitals.filter((h) => {
      const matchName = h.name.toLowerCase().includes(q);
      const matchCity = h.city.toLowerCase().includes(q);
      const matchType = h.type.toLowerCase().includes(q);
      const matchService = h.services.some((s) => s.toLowerCase().includes(q));
      const matchSpecialist = h.specialists.some((s) => s.specialty.toLowerCase().includes(q));
      const matchBlood = q.includes('blood') || q.includes('o-') || q.includes('o+') || q.includes('a+') || q.includes('b+');
      const matchIcu = (q.includes('icu') || q.includes('bed') || q.includes('critical')) && h.resources.some((r) => r.type === 'icu' && r.availableQuantity > 0);
      const matchVentilator = q.includes('ventilator') && h.resources.some((r) => r.type === 'ventilator' && r.availableQuantity > 0);
      const matchTrauma = (q.includes('trauma') || q.includes('emergency')) && h.hasEmergencyDepartment;

      return (
        matchName ||
        matchCity ||
        matchType ||
        matchService ||
        matchSpecialist ||
        matchBlood ||
        matchIcu ||
        matchVentilator ||
        matchTrauma
      );
    });
  }, [query, hospitals]);

  const isEmergencySearch = React.useMemo(() => {
    const q = query.toLowerCase();
    return (
      q.includes('icu') ||
      q.includes('trauma') ||
      q.includes('blood') ||
      q.includes('ventilator') ||
      q.includes('emergency') ||
      q.includes('cardiac') ||
      q.includes('ambulance') ||
      q.includes('stroke') ||
      q.includes('critical') ||
      matchedInternalHospitals.length > 0
    );
  }, [query, matchedInternalHospitals]);

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* View Title & Architecture Banner */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#EAE4D8] text-[#5F8575] text-xs font-bold uppercase tracking-wider mb-2">
            <Globe className="w-3.5 h-3.5" />
            Layer 3 — Google Search Intelligence
          </div>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-[#3A3D34] tracking-tight">
            Healthcare Intelligence Search
          </h1>
          <p className="text-xs sm:text-sm text-[#707565] mt-1 max-w-2xl">
            Find external healthcare facilities, government health portals, official ambulance registries, and clinical guidelines. Real-time resource inventory is strictly verified by MediLink.
          </p>
        </div>

        {/* 3-Layer Indicator Badge */}
        <div className="hidden lg:flex items-center gap-2 bg-white border border-[#E5E0D5] p-2.5 rounded-2xl shadow-xs text-[11px] text-[#707565]">
          <div className="flex items-center gap-1 font-semibold text-[#5F8575]">
            <span className="w-2 h-2 rounded-full bg-[#5F8575]"></span>
            <span>1. Database (Live)</span>
          </div>
          <span className="text-[#DCD7CD]">|</span>
          <div className="flex items-center gap-1 font-semibold text-blue-600">
            <span className="w-2 h-2 rounded-full bg-blue-500"></span>
            <span>2. Maps (Routes)</span>
          </div>
          <span className="text-[#DCD7CD]">|</span>
          <div className="flex items-center gap-1 font-semibold text-amber-700">
            <span className="w-2 h-2 rounded-full bg-amber-500"></span>
            <span>3. Search (External)</span>
          </div>
        </div>
      </div>

      {/* Main Search Bar Card */}
      <div className="bg-white rounded-3xl p-4 sm:p-6 border border-[#E5E0D5] shadow-sm space-y-4">
        <form onSubmit={handleFormSubmit} className="relative">
          <div className="flex items-center bg-[#F9F7F2] border-2 border-[#DCD7CD] focus-within:border-[#8C947A] focus-within:bg-white rounded-2xl transition-all overflow-hidden px-4 py-2 sm:py-3 shadow-xs">
            <Search className="w-5 h-5 text-[#707565] shrink-0 mr-3" />
            <input
              id="healthcare-search-input"
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search hospitals, services, emergency information, guidelines, blood banks..."
              className="w-full bg-transparent text-sm sm:text-base text-[#3A3D34] placeholder:text-[#9A9E8F] focus:outline-none"
            />
            {query && (
              <button
                type="button"
                onClick={handleClear}
                className="p-1 text-[#707565] hover:text-[#3A3D34] rounded-full hover:bg-[#EAE4D8] mr-2"
                title="Clear search"
              >
                <X className="w-4 h-4" />
              </button>
            )}
            <button
              type="submit"
              disabled={isLoading || !query.trim()}
              className="bg-[#8C947A] hover:bg-[#788069] disabled:bg-[#DCD7CD] text-[#F9F7F2] px-5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all flex items-center gap-2 cursor-pointer shadow-xs disabled:cursor-not-allowed shrink-0"
            >
              {isLoading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span className="hidden sm:inline">Searching...</span>
                </>
              ) : (
                <>
                  <span>Search</span>
                  <ArrowRight className="w-4 h-4 hidden sm:inline" />
                </>
              )}
            </button>
          </div>
        </form>

        {/* Category Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          <div className="flex items-center gap-1.5 text-xs text-[#707565] font-semibold shrink-0 pr-1">
            <Filter className="w-3.5 h-3.5" />
            <span>Filter:</span>
          </div>
          {CATEGORIES.map((cat) => {
            const Icon = cat.icon;
            const isSelected = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => handleCategorySelect(cat.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer shrink-0 border ${
                  isSelected
                    ? 'bg-[#8C947A] text-[#F9F7F2] border-[#8C947A] shadow-xs'
                    : 'bg-[#F9F7F2] text-[#5A5E50] border-[#E5E0D5] hover:bg-[#EAE4D8]'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{cat.label}</span>
              </button>
            );
          })}
        </div>

        {/* Recent Searches & Location Context */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-[#F1EDE4] text-xs text-[#707565]">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-semibold text-[11px] uppercase tracking-wider text-[#9A9E8F]">Recent:</span>
            {recentSearches.map((term, index) => (
              <button
                key={index}
                onClick={() => handleSuggestedClick(term)}
                className="bg-[#F1EDE4] hover:bg-[#EAE4D8] text-[#3A3D34] px-2.5 py-0.5 rounded-lg transition-colors cursor-pointer text-xs"
              >
                {term}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-1.5 text-[11px] text-[#707565]">
            <MapPin className="w-3 h-3 text-[#8C947A]" />
            <span>Search Area: <strong>{currentHospital ? `${currentHospital.city}, ${currentHospital.state}` : 'National Context'}</strong></span>
          </div>
        </div>
      </div>

      {/* Loading Skeleton */}
      {isLoading && (
        <div className="space-y-4">
          <div className="bg-white rounded-2xl p-6 border border-[#E5E0D5] animate-pulse space-y-3">
            <div className="h-4 bg-[#EAE4D8] rounded-md w-1/4"></div>
            <div className="h-3 bg-[#F1EDE4] rounded-md w-3/4"></div>
            <div className="h-3 bg-[#F1EDE4] rounded-md w-1/2"></div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-white rounded-2xl p-5 border border-[#E5E0D5] animate-pulse space-y-3">
                <div className="h-5 bg-[#EAE4D8] rounded-md w-3/5"></div>
                <div className="h-3 bg-[#F1EDE4] rounded-md w-full"></div>
                <div className="h-3 bg-[#F1EDE4] rounded-md w-4/5"></div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Error Notice */}
      {errorMessage && (
        <div className="bg-amber-50 border border-amber-200 text-amber-900 rounded-2xl p-4 flex items-start gap-3 text-xs">
          <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="font-semibold">{errorMessage}</p>
            <p className="text-amber-800">
              You can still search and interact with verified network hospitals in the MediLink Internal Database.
            </p>
          </div>
        </div>
      )}

      {/* Dual Results View: Internal MediLink Network vs External Search */}
      {hasSearched && !isLoading && (
        <div className="space-y-8">
          {/* SECTION 1: MEDILINK VERIFIED NETWORK (Internal Database) */}
          {matchedInternalHospitals.length > 0 && (
            <div className="space-y-3 bg-[#F4F1EA] p-4 sm:p-6 rounded-3xl border border-[#DCD7CD]">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-[#5F8575] animate-pulse"></div>
                  <h2 className="text-lg font-serif font-bold text-[#3A3D34]">
                    MediLink Verified Network (Real-Time Resource Telemetry)
                  </h2>
                </div>
                <span className="text-xs font-semibold bg-[#5F8575] text-white px-3 py-1 rounded-full w-fit">
                  {matchedInternalHospitals.length} Internal Hospital{matchedInternalHospitals.length > 1 ? 's' : ''} Matched
                </span>
              </div>
              <p className="text-xs text-[#707565]">
                Verified operational nodes in MediLink's real-time coordination database. Capacity is confirmed by hospital coordinators.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-2">
                {matchedInternalHospitals.map((h) => {
                  const icuResource = h.resources.find((r) => r.type === 'icu');
                  const ventResource = h.resources.find((r) => r.type === 'ventilator');
                  const oNegBlood = h.bloodInventory.find((b) => b.group === 'O-');
                  const availAmbulances = h.ambulances.filter((a) => a.status === 'Available').length;

                  return (
                    <div
                      key={h.id}
                      className="bg-white rounded-2xl p-4 border border-[#DCD7CD] shadow-xs flex flex-col justify-between hover:border-[#8C947A] transition-all space-y-3"
                    >
                      <div className="space-y-2">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <h3 className="font-serif font-bold text-sm text-[#3A3D34] line-clamp-1">{h.name}</h3>
                            <p className="text-[11px] text-[#707565]">{h.type} • {h.city}</p>
                          </div>
                          <VerificationBadge status={h.verificationStatus} />
                        </div>

                        {/* Resource Snapshot Grid */}
                        <div className="grid grid-cols-2 gap-2 text-[11px] bg-[#F9F7F2] p-2.5 rounded-xl border border-[#E5E0D5]">
                          <div className="flex items-center gap-1.5">
                            <Bed className="w-3.5 h-3.5 text-[#5F8575]" />
                            <span>ICU Beds: <strong>{icuResource?.availableQuantity || 0}</strong></span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <Layers className="w-3.5 h-3.5 text-blue-600" />
                            <span>Ventilators: <strong>{ventResource?.availableQuantity || 0}</strong></span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <Droplet className="w-3.5 h-3.5 text-rose-600" />
                            <span>O- Blood: <strong>{oNegBlood?.units || 0}u</strong></span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <AmbulanceIcon className="w-3.5 h-3.5 text-amber-600" />
                            <span>Ambulances: <strong>{availAmbulances}</strong></span>
                          </div>
                        </div>
                      </div>

                      {/* Action Buttons for Internal MediLink Hospital */}
                      <div className="grid grid-cols-3 gap-2 pt-2 border-t border-[#F1EDE4]">
                        <button
                          onClick={() => {
                            switchHospital(h.id);
                            if (onSelectHospital) onSelectHospital(h.id);
                            onNavigateTab('profile');
                          }}
                          className="px-2 py-1.5 rounded-lg bg-[#F1EDE4] hover:bg-[#EAE4D8] text-[10px] font-bold text-[#3A3D34] transition-colors cursor-pointer text-center"
                        >
                          View Hospital
                        </button>
                        <button
                          onClick={() => onNavigateTab('create_request')}
                          className="px-2 py-1.5 rounded-lg bg-[#5F8575] hover:bg-[#4E6F62] text-[10px] font-bold text-white transition-colors cursor-pointer text-center"
                        >
                          Request Resource
                        </button>
                        <button
                          onClick={() => onNavigateTab('network_map')}
                          className="px-2 py-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 text-[10px] font-bold transition-colors cursor-pointer text-center flex items-center justify-center gap-1"
                        >
                          <Navigation className="w-2.5 h-2.5" />
                          <span>Route</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* SECTION 2: EXTERNAL SEARCH RESULTS (Google Search) */}
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <div>
                <div className="flex items-center gap-2">
                  <Globe className="w-4 h-4 text-amber-600" />
                  <h2 className="text-lg font-serif font-bold text-[#3A3D34]">
                    External Search Results (Google Search)
                  </h2>
                </div>
                <p className="text-xs text-[#707565]">
                  Public healthcare institutions, official portals, and research directories retrieved via Google Search grounding.
                </p>
              </div>

              {/* Warning Disclaimer Badge */}
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-[11px] font-medium">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                <span>External information may be outdated. Verify directly with provider.</span>
              </div>
            </div>

            {/* AI Summary Card with Grounding Citations */}
            {searchResponse?.aiSummary && (
              <div className="bg-white rounded-3xl p-5 border border-[#E5E0D5] shadow-xs space-y-3">
                <div className="flex items-center gap-2 text-xs font-bold text-[#5F8575] uppercase tracking-wider">
                  <Sparkles className="w-4 h-4 text-[#8C947A]" />
                  <span>Public Healthcare Intelligence Summary</span>
                </div>
                <p className="text-xs sm:text-sm text-[#3A3D34] leading-relaxed">
                  {searchResponse.aiSummary}
                </p>

                {searchResponse.groundingSources && searchResponse.groundingSources.length > 0 && (
                  <div className="pt-3 border-t border-[#F1EDE4] space-y-1.5">
                    <div className="text-[11px] font-semibold text-[#707565] uppercase tracking-wider">
                      Grounding References:
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {searchResponse.groundingSources.map((source, idx) => (
                        <a
                          key={idx}
                          href={source.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#F9F7F2] hover:bg-[#EAE4D8] border border-[#E5E0D5] text-[11px] text-[#3A3D34] transition-colors"
                        >
                          <ExternalLink className="w-3 h-3 text-[#8C947A]" />
                          <span className="max-w-[200px] truncate">{source.title}</span>
                        </a>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* External Result Cards Grid */}
            {searchResponse?.results && searchResponse.results.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {searchResponse.results.map((item) => (
                  <ExternalResultCard key={item.id} item={item} />
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-3xl p-8 border border-[#E5E0D5] text-center space-y-3">
                <Globe className="w-8 h-8 text-[#9A9E8F] mx-auto" />
                <h3 className="font-serif font-bold text-[#3A3D34]">No external results found</h3>
                <p className="text-xs text-[#707565] max-w-md mx-auto">
                  Try adjusting your keywords, selecting "All Resources", or querying specific facilities like AIIMS, e-RaktKosh, or MoHFW.
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Default Initial State / Suggested Exploration */}
      {!hasSearched && (
        <div className="space-y-6">
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#E5E0D5] shadow-xs space-y-6">
            <div>
              <h2 className="text-lg font-serif font-bold text-[#3A3D34]">
                Explore Verified Healthcare Portals & Guidelines
              </h2>
              <p className="text-xs text-[#707565] mt-1">
                Select a topic below to search public health resources, or enter any query in the search bar above.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {SUGGESTED_QUERIES.map((q, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSuggestedClick(q)}
                  className="bg-[#F9F7F2] hover:bg-[#F1EDE4] hover:border-[#8C947A] border border-[#E5E0D5] rounded-2xl p-4 text-left transition-all group cursor-pointer flex flex-col justify-between space-y-3"
                >
                  <span className="text-xs font-semibold text-[#3A3D34] group-hover:text-[#5F8575] line-clamp-2">
                    {q}
                  </span>
                  <div className="flex items-center justify-between text-[11px] text-[#707565] pt-2 border-t border-[#EAE4D8]/60">
                    <span>Search Google</span>
                    <ArrowRight className="w-3.5 h-3.5 text-[#8C947A] group-hover:translate-x-0.5 transition-transform" />
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Explanatory Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white rounded-2xl p-5 border border-[#E5E0D5] shadow-xs space-y-2">
              <div className="w-8 h-8 rounded-xl bg-emerald-50 text-[#5F8575] flex items-center justify-center font-bold text-sm">
                1
              </div>
              <h3 className="font-serif font-bold text-sm text-[#3A3D34]">Layer 1: Real-Time Database</h3>
              <p className="text-xs text-[#707565] leading-relaxed">
                Live ICU beds, ventilators, blood stock, and medical specialist shifts verified directly across participating network hospitals.
              </p>
            </div>

            <div className="bg-white rounded-2xl p-5 border border-[#E5E0D5] shadow-xs space-y-2">
              <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-sm">
                2
              </div>
              <h3 className="font-serif font-bold text-sm text-[#3A3D34]">Layer 2: Autonomous Regional Mesh</h3>
              <p className="text-xs text-[#707565] leading-relaxed">
                Emergency corridor distance calculations, prioritized ambulance transit ETAs, and interactive facility route navigation.
              </p>
            </div>

            <div className="bg-white rounded-2xl p-5 border border-[#E5E0D5] shadow-xs space-y-2">
              <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center font-bold text-sm">
                3
              </div>
              <h3 className="font-serif font-bold text-sm text-[#3A3D34]">Layer 3: Google Search</h3>
              <p className="text-xs text-[#707565] leading-relaxed">
                External healthcare intelligence: official hospital portals, government health initiatives, clinical triage guidelines, and ambulance contacts.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// ----------------------------------------------------
// External Search Result Card Component
// ----------------------------------------------------
const ExternalResultCard: React.FC<{ item: ExternalSearchResultItem }> = ({ item }) => {
  const getSourceBadgeColor = (type: string) => {
    switch (type) {
      case 'Government Healthcare Portal':
        return 'bg-emerald-50 text-emerald-800 border-emerald-200';
      case 'Official Hospital Website':
        return 'bg-blue-50 text-blue-800 border-blue-200';
      case 'Academic & Clinical Guideline':
        return 'bg-purple-50 text-purple-800 border-purple-200';
      case 'Emergency Service Registry':
        return 'bg-rose-50 text-rose-800 border-rose-200';
      default:
        return 'bg-slate-50 text-slate-700 border-slate-200';
    }
  };

  const mapSearchUrl = `https://www.openstreetmap.org/search?query=${encodeURIComponent(
    `${item.title} ${item.locationName || ''}`
  )}`;

  return (
    <div className="bg-white rounded-2xl p-5 border border-[#E5E0D5] shadow-xs flex flex-col justify-between hover:border-[#8C947A] transition-all space-y-4">
      <div className="space-y-2.5">
        {/* Source Badge & Category */}
        <div className="flex flex-wrap items-center justify-between gap-2">
          <span
            className={`inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${getSourceBadgeColor(
              item.sourceType
            )}`}
          >
            {item.isOfficialOrGovernment && <CheckCircle2 className="w-3 h-3" />}
            <span>{item.sourceType}</span>
          </span>

          <span className="text-[11px] font-semibold text-[#707565] bg-[#F9F7F2] px-2 py-0.5 rounded-md border border-[#E5E0D5]">
            {item.source}
          </span>
        </div>

        {/* Title */}
        <h3 className="font-serif font-bold text-sm sm:text-base text-[#3A3D34] leading-snug">
          {item.title}
        </h3>

        {/* Snippet / Description (Safe escaped plain text) */}
        <p className="text-xs text-[#5A5E50] leading-relaxed line-clamp-3">
          {item.snippet}
        </p>

        {/* Location / Phone Meta if present */}
        <div className="flex flex-wrap items-center gap-3 pt-1 text-[11px] text-[#707565]">
          {item.locationName && (
            <div className="flex items-center gap-1">
              <MapPin className="w-3 h-3 text-[#8C947A]" />
              <span>{item.locationName}</span>
            </div>
          )}
          {item.phone && (
            <div className="flex items-center gap-1 text-emerald-800 font-semibold">
              <Phone className="w-3 h-3 text-emerald-600" />
              <span>{item.phone}</span>
            </div>
          )}
        </div>
      </div>

      {/* Action Buttons: OPEN SOURCE and VIEW ON MAP (NO REQUEST RESOURCE for external entities) */}
      <div className="grid grid-cols-2 gap-2 pt-3 border-t border-[#F1EDE4]">
        <a
          href={item.url}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-[#8C947A] hover:bg-[#788069] text-white text-xs font-semibold transition-colors cursor-pointer"
        >
          <ExternalLink className="w-3.5 h-3.5" />
          <span>Open Source</span>
        </a>

        <a
          href={mapSearchUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-[#F1EDE4] hover:bg-[#EAE4D8] text-[#3A3D34] text-xs font-semibold transition-colors cursor-pointer"
        >
          <MapPin className="w-3.5 h-3.5 text-[#8C947A]" />
          <span>View on Map</span>
        </a>
      </div>
    </div>
  );
};
