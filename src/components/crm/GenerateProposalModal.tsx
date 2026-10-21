import React from 'react';
import { TkpTzGeneratorView } from './TkpTzGeneratorView';
import { ExtendedDeal, ProjectDocument } from '../../data/mockCrmData';
import { CommercialProposal } from '../../types';
import { PriceItem } from '../../data/priceListsData';

export interface GenerateProposalModalProps {
  isOpen: boolean;
  onClose: () => void;
  deal?: ExtendedDeal | null;
  proposal?: CommercialProposal | null;
  initialPriceItem?: PriceItem | null;
  onSaveDocumentToDeal?: (dealId: string, doc: ProjectDocument, proposalData: any) => void;
  currentManagerName?: string;
}

/**
 * Unified Commercial Proposal (ТКП / ТЗ) Generator Modal
 * Delegates directly to the single source of truth: TkpTzGeneratorView
 * Provides Fullscreen Studio mode with 100% feature parity, live A4 preview, dynamic VAT & export 0% support.
 */
export const GenerateProposalModal: React.FC<GenerateProposalModalProps> = ({
  isOpen,
  onClose,
  deal,
  proposal,
  initialPriceItem,
  onSaveDocumentToDeal
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] bg-slate-100 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col w-screen h-screen overflow-hidden animate-in fade-in duration-150">
      <TkpTzGeneratorView
        onBack={onClose}
        initialDealId={deal?.id}
        initialProposalId={proposal?.id}
        initialPriceItem={initialPriceItem}
        onSaveDocumentToDeal={onSaveDocumentToDeal}
        isFullscreenDefault={true}
      />
    </div>
  );
};
