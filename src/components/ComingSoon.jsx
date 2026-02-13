import React from 'react';
import { motion } from 'framer-motion';

const ComingSoon = () => {
  // Animation variants for staggered text
  const fadeInUp = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut" } }
  };

  return (
    <div className="coming-soon-container">
      {/* Animated Background Glow */}
      <motion.div 
        className="glow-circle"
        animate={{ 
          scale: [1, 1.2, 1],
          opacity: [0.15, 0.25, 0.15] 
        }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
      />
      
      <motion.div 
        className="content-wrapper"
        initial="hidden"
        animate="visible"
        transition={{ staggerChildren: 0.2 }} // Elements appear one after another
      >
        <motion.div className="badge" variants={fadeInUp}>
          <motion.span 
            animate={{ rotate: [0, 15, -15, 0] }} 
            transition={{ repeat: Infinity, duration: 2 }}
            className="sparkle"
          >✨</motion.span>
          Something extraordinary is brewing
        </motion.div>

        <motion.h1 className="title-white" variants={fadeInUp}>
          Coming
        </motion.h1>
        
        <motion.h1 
          className="title-yellow" 
          variants={fadeInUp}
          style={{ textShadow: "0 0 30px rgba(255, 174, 0, 0.3)" }}
        >
          Soon
        </motion.h1>

        {/* <motion.p className="description" variants={fadeInUp}>
          We're crafting something special. This page isn't<br />
          available just yet — but it will be worth the wait.
        </motion.p> */}

        <motion.div className="pagination-dots" variants={fadeInUp}>
          <span></span>
          <motion.span 
            className="active"
            animate={{ opacity: [0.4, 1, 0.4] }}
            transition={{ repeat: Infinity, duration: 2 }}
          ></motion.span>
          <span></span>
        </motion.div>

        <motion.div className="footer-text" variants={fadeInUp}>
          STAY TUNED
        </motion.div>
      </motion.div>
    </div>
  );
};

export default ComingSoon;