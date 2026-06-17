import React, { useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, useScroll, useTransform } from 'framer-motion';
import { ReactLenis } from 'lenis/react';
import './Landing.css';

export default function Landing() {
  const navigate = useNavigate();

  // Scene 1: Gallery Entry
  const scene1Ref = useRef(null);
  const { scrollYProgress: scroll1 } = useScroll({
    target: scene1Ref,
    offset: ["start start", "end start"]
  });
  const y1 = useTransform(scroll1, [0, 1], ["0%", "50%"]);
  const opacity1 = useTransform(scroll1, [0, 0.8], [1, 0]);
  const scale1 = useTransform(scroll1, [0, 1], [1, 1.1]);

  // Scene 2: Artwork Focus
  const scene2Ref = useRef(null);
  const { scrollYProgress: scroll2 } = useScroll({
    target: scene2Ref,
    offset: ["start end", "end start"]
  });
  const opacity2 = useTransform(scroll2, [0, 0.3, 0.7, 1], [0, 1, 1, 0]);
  const scale2 = useTransform(scroll2, [0, 0.5, 1], [0.9, 1, 1.1]);
  const y2 = useTransform(scroll2, [0, 1], ["20%", "-20%"]);

  // Scene 3: Annotations Dolly
  const scene3Ref = useRef(null);
  const { scrollYProgress: scroll3 } = useScroll({
    target: scene3Ref,
    offset: ["start end", "end start"]
  });
  const opacity3 = useTransform(scroll3, [0, 0.3, 0.7, 1], [0, 1, 1, 0]);
  const x3 = useTransform(scroll3, [0, 1], ["10%", "-10%"]);

  // Scene 4: Bidding Focus
  const scene4Ref = useRef(null);
  const { scrollYProgress: scroll4 } = useScroll({
    target: scene4Ref,
    offset: ["start end", "center center"]
  });
  const opacity4 = useTransform(scroll4, [0, 0.6, 1], [0, 0, 1]);
  const blur4 = useTransform(scroll4, [0, 1], ["blur(10px)", "blur(0px)"]);
  const scale4 = useTransform(scroll4, [0, 1], [0.8, 1]);

  return (
    <ReactLenis root>
      <div className="landing-page cinematic-mode">
      
      {/* Scene 1: Gallery Entry */}
      <section ref={scene1Ref} className="cinematic-scene scene-1">
        <motion.div 
          className="scene-bg" 
          style={{ 
            backgroundImage: `url('/images/scene1_gallery_entry.png')`,
            y: y1, opacity: opacity1, scale: scale1 
          }} 
        />
        <motion.div 
          className="scene-content"
          style={{ opacity: opacity1 }}
        >
          <motion.h1 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.2, delay: 0.2 }}
            className="cinematic-title"
          >
           Auction HUB
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 1 }}
            className="cinematic-subtitle"
          >
             Explore the most exclusive digital artifacts which 
             one can buy or sell online .
          </motion.p>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 1.5 }}
            className="scroll-indicator"
          >
            Scroll to explore <br/> ↓
          </motion.div>
        </motion.div>
      </section>

      {/* Scene 2: Artwork Focus */}
      <section ref={scene2Ref} className="cinematic-scene scene-2">
        <motion.div 
          className="scene-bg" 
          style={{ 
            backgroundImage: `url('/images/scene2_artwork_focus.png')`,
            opacity: opacity2, scale: scale2, y: y2
          }} 
        />
        <motion.div 
          className="scene-content right-aligned"
          style={{ opacity: opacity2 }}
        >
          <h2 className="cinematic-heading text-gradient">Depth Layering</h2>
          <p className="cinematic-desc">
            Experience the layers. The frame detaches in 3D space, revealing the soul of the artwork through soft, realistic shadows.
          </p>
        </motion.div>
      </section>

      {/* Scene 3: Detailed Annotations */}
      <section ref={scene3Ref} className="cinematic-scene scene-3">
        <motion.div 
          className="scene-bg" 
          style={{ 
            backgroundImage: `url('/images/scene3_annotations.png')`,
            opacity: opacity3, x: x3
          }} 
        />
        <motion.div 
          className="scene-content left-aligned"
          style={{ opacity: opacity3 }}
        >
          <h2 className="cinematic-heading text-gradient">Narrative Scroll</h2>
          <p className="cinematic-desc">
            Discover the history. Elegant 3D text annotations stitched directly to the canvas highlight the medium, the provenance, and the legend.
          </p>
        </motion.div>
      </section>

      {/* Scene 4: Bidding Interface */}
      <section ref={scene4Ref} className="cinematic-scene scene-4">
        <motion.div 
          className="scene-bg" 
          style={{ 
            backgroundImage: `url('/images/scene4_bidding.png')`,
            filter: blur4,
            opacity: 1 // Background stays opaque, blur reduces as you scroll
          }} 
        />
        <motion.div 
          className="scene-content centered glass-overlay"
          style={{ opacity: opacity4, scale: scale4 }}
        >
          <h2 className="cinematic-heading">Final Focus</h2>
          <p className="cinematic-desc" style={{ marginBottom: '2rem' }}>
            A crisp, minimalist bidding sheet emerges from the depth-of-field blur. The auction begins now.
          </p>
          <button className="btn-primary cinematic-btn" onClick={() => navigate('/home')}>
            Enter the Auction
          </button>
        </motion.div>
      </section>

    </div>
    </ReactLenis>
  );
}
