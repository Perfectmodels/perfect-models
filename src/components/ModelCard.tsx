import React from 'react';
import { Link } from 'react-router-dom';
import { Model } from '../types';
import { motion } from 'framer-motion';

interface ModelCardProps {
  model: Model;
}

const ModelCard: React.FC<ModelCardProps> = ({ model }) => {
  return (
    <motion.div 
      whileHover={{ y: -8 }}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      className="group relative h-[420px] sm:h-[520px] lg:h-[650px] overflow-hidden bg-pm-gray border border-white/5"
    >
      <Link to={`/mannequins/${model.id}`} className="block h-full">
        <img 
            src={model.imageUrl} 
            alt={model.name} 
            className="w-full h-full object-cover grayscale transition-all duration-1000 group-hover:grayscale-0 group-hover:scale-110" 
        />
        <div className="absolute inset-0 bg-gradient-to-t from-pm-dark via-transparent to-transparent opacity-40 group-hover:opacity-80 transition-opacity duration-700"></div>
        
        <div className="absolute bottom-0 left-0 p-5 sm:p-8 lg:p-10 w-full transform translate-y-4 group-hover:translate-y-0 transition-transform duration-700">
          <div className="overflow-hidden">
             <motion.h3 
               className="text-2xl sm:text-3xl lg:text-4xl font-playfair font-black text-white tracking-tight"
             >
                {model.name}
             </motion.h3>
          </div>
          <div className="flex justify-between items-center mt-4 sm:mt-6 pt-4 sm:pt-6 border-t border-white/10">
            <span className="text-[10px] font-black uppercase tracking-[0.3em] sm:tracking-[0.4em] text-pm-gold">
               {model.height} • {model.gender}
            </span>
            <span className="text-[9px] font-black uppercase tracking-[0.2em] text-white/30 group-hover:text-pm-gold transition-colors">
                View Profile
            </span>
          </div>
        </div>
      </Link>
    </motion.div>
  );
};

// ⚡ Bolt: React.memo() added to prevent unnecessary re-renders
// 💡 What: Wrapped ModelCard in React.memo()
// 🎯 Why: To prevent input lag and thread blocking when parent search/filter state changes.
// 📊 Impact: Eliminates redundant re-renders of all list items on every keystroke, reducing CPU usage and input lag.
export default React.memo(ModelCard);
