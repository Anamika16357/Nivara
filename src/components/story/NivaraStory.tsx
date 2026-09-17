import React from 'react';
import { StoryTransition } from './StoryTransition';
import { TextParallaxContentExample } from '../ui/text-parallax-content-scroll';
import InversionCircleScrollAnimation from '../ui/inversion-circle-scroll-animation';

interface NivaraStoryProps {
  onOpenChat?: () => void;
}

export const NivaraStory: React.FC<NivaraStoryProps> = ({ onOpenChat }) => {
  return (
    <div
      id="story"
      className="relative w-full bg-black text-slate-100 font-sans selection:bg-cyan-900 selection:text-white"
    >
      {/* Atmospheric Vignette */}
      <div className="fixed inset-0 pointer-events-none z-0 bg-radial from-transparent via-black/40 to-black opacity-90" />

      {/* ==========================================================
          NIVARA STORY: INVERSION CIRCLE SCROLL EXPERIENCE
          Adapted specifically for Nivara's Story Section
          ========================================================== */}
      <div className="relative z-10">
        <InversionCircleScrollAnimation
          useWindowScroll={true}
          title={"THE COLD DIDN'T CHOOSE HER.\nTHE WORLD DID."}
          subtitle="She freezes what the world forgets."
          bgImageUrl="https://images.unsplash.com/photo-1517411032315-54ef2cb783bb?auto=format&fit=crop&w=1920&q=80"
        />

        {/* Narrative Chapters Breakdown */}
        <div id="story-chapters">
          <TextParallaxContentExample onOpenChat={onOpenChat} />
        </div>
      </div>

      {/* Bridge from Story to Help Portal below */}
      <StoryTransition variant="story-to-portal" />
    </div>
  );
};

export default NivaraStory;
