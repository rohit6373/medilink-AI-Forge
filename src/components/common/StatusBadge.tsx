import React from 'react';
import { ResourceStatus, ConfidenceLevel, VerificationStatus, RequestStatus } from '../../types';

export const ResourceStatusBadge: React.FC<{ status: ResourceStatus; className?: string }> = ({ status, className = '' }) => {
  switch (status) {
    case 'available':
      return (
        <span className={`inline-flex items-center px-3 py-1 rounded-full text-[11px] font-semibold tracking-wider uppercase bg-[#F1F3EB] text-[#5F8575] border border-[#D5DDD0] ${className}`}>
          <span className="w-1.5 h-1.5 rounded-full bg-[#8C947A] mr-1.5 animate-pulse"></span>
          Available
        </span>
      );
    case 'reserved':
      return (
        <span className={`inline-flex items-center px-3 py-1 rounded-full text-[11px] font-semibold tracking-wider uppercase bg-[#FBF6ED] text-[#B07D38] border border-[#EADBCA] ${className}`}>
          <span className="w-1.5 h-1.5 rounded-full bg-[#D4A373] mr-1.5"></span>
          Reserved
        </span>
      );
    case 'occupied':
      return (
        <span className={`inline-flex items-center px-3 py-1 rounded-full text-[11px] font-semibold tracking-wider uppercase bg-[#FAF0ED] text-[#C87D55] border border-[#F0D5CB] ${className}`}>
          <span className="w-1.5 h-1.5 rounded-full bg-[#D98C71] mr-1.5"></span>
          Occupied
        </span>
      );
    case 'unknown':
    default:
      return (
        <span className={`inline-flex items-center px-3 py-1 rounded-full text-[11px] font-semibold tracking-wider uppercase bg-[#F1EDE4] text-[#707565] border border-[#E5E0D5] ${className}`}>
          <span className="w-1.5 h-1.5 rounded-full bg-[#A3A69B] mr-1.5"></span>
          Unknown
        </span>
      );
  }
};

export const ConfidenceBadge: React.FC<{ confidence: ConfidenceLevel; className?: string }> = ({ confidence, className = '' }) => {
  switch (confidence) {
    case 'HIGH':
      return (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase bg-[#F1F3EB] text-[#5F8575] border border-[#D5DDD0] ${className}`}>
          <span className="w-1.5 h-1.5 rounded-full bg-[#8C947A] mr-1"></span>
          High Confidence
        </span>
      );
    case 'MEDIUM':
      return (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase bg-[#FBF6ED] text-[#B07D38] border border-[#EADBCA] ${className}`}>
          <span className="w-1.5 h-1.5 rounded-full bg-[#D4A373] mr-1"></span>
          Medium Confidence
        </span>
      );
    case 'LOW':
    default:
      return (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase bg-[#FAF0ED] text-[#C87D55] border border-[#F0D5CB] ${className}`}>
          <span className="w-1.5 h-1.5 rounded-full bg-[#D98C71] mr-1"></span>
          Low Confidence
        </span>
      );
  }
};

export const VerificationBadge: React.FC<{ status: VerificationStatus; className?: string }> = ({ status, className = '' }) => {
  switch (status) {
    case 'verified':
      return (
        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-[#F1F3EB] text-[#5F8575] border border-[#D5DDD0] ${className}`}>
          <span className="w-1.5 h-1.5 rounded-full bg-[#8C947A] mr-1.5"></span>
          Verified Hospital
        </span>
      );
    case 'pending':
      return (
        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-[#FBF6ED] text-[#B07D38] border border-[#EADBCA] ${className}`}>
          <span className="w-1.5 h-1.5 rounded-full bg-[#D4A373] mr-1.5 animate-pulse"></span>
          Pending Verification
        </span>
      );
    case 'rejected':
      return (
        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-[#FAF0ED] text-[#C87D55] border border-[#F0D5CB] ${className}`}>
          <span className="w-1.5 h-1.5 rounded-full bg-[#D98C71] mr-1.5"></span>
          Unverified
        </span>
      );
  }
};

export const RequestStatusBadge: React.FC<{ status: RequestStatus; className?: string }> = ({ status, className = '' }) => {
  const styles: Record<RequestStatus, { bg: string; text: string; dot: string; label: string }> = {
    pending: { bg: 'bg-[#FBF6ED] border-[#EADBCA]', text: 'text-[#B07D38]', dot: 'bg-[#D4A373] animate-pulse', label: 'Pending Response' },
    accepted: { bg: 'bg-[#F1EDE4] border-[#DCD7CD]', text: 'text-[#3A3D34]', dot: 'bg-[#8C947A]', label: 'Accepted' },
    reserved: { bg: 'bg-[#F1F3EB] border-[#D5DDD0]', text: 'text-[#5F8575]', dot: 'bg-[#8C947A]', label: 'Resources Reserved' },
    in_transit: { bg: 'bg-[#E8E2D6] border-[#DCD7CD]', text: 'text-[#3A3D34]', dot: 'bg-[#8C947A] animate-pulse', label: 'Ambulance In Transit' },
    completed: { bg: 'bg-[#F1F3EB] border-[#D5DDD0]', text: 'text-[#5F8575]', dot: 'bg-[#8C947A]', label: 'Completed' },
    rejected: { bg: 'bg-[#FAF0ED] border-[#F0D5CB]', text: 'text-[#C87D55]', dot: 'bg-[#D98C71]', label: 'Declined' },
    cancelled: { bg: 'bg-[#F1EDE4] border-[#E5E0D5]', text: 'text-[#707565]', dot: 'bg-[#A3A69B]', label: 'Cancelled' },
  };

  const current = styles[status] || styles.pending;

  return (
    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${current.bg} ${current.text} ${className}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${current.dot} mr-1.5`}></span>
      {current.label}
    </span>
  );
};
