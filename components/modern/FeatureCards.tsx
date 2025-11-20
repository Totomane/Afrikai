import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Layout, Shield, Zap } from 'lucide-react';

const features = [
  {
    icon: Sparkles,
    title: 'AI-Powered Analysis',
    description: 'Advanced AI generates comprehensive risk reports and media content automatically from global data.',
  },
  {
    icon: Layout,
    title: '3D Globe Interface',
    description: 'Interactive 3D globe with intuitive navigation, country selection, and real-time risk visualization.',
  },
  {
    icon: Shield,
    title: 'Voice Navigation',
    description: 'Hands-free exploration using voice commands to navigate countries and analyze specific risks.',
  },
  {
    icon: Zap,
    title: 'Time-Based Insights',
    description: 'Explore historical trends and future projections with our advanced time slider functionality.',
  },
];

export const FeatureCards: React.FC = () => {
  return (
    <section className="py-24 bg-gradient-to-b from-white to-blue-50">
      <div className="max-w-7xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-5xl font-bold text-gray-900 mb-4">Why AfrikAI?</h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Everything you need to understand and analyze global risks with cutting-edge technology.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                whileHover={{ y: -8, scale: 1.02 }}
                className="group relative bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-100"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/0 to-blue-600/0 group-hover:from-blue-500/5 group-hover:to-blue-600/10 rounded-2xl transition-all duration-300"></div>

                <div className="relative z-10">
                  <div className="w-14 h-14 bg-blue-100 rounded-xl flex items-center justify-center mb-6 group-hover:bg-blue-600 transition-colors duration-300">
                    <Icon className="w-7 h-7 text-blue-600 group-hover:text-white transition-colors duration-300" />
                  </div>

                  <h3 className="text-xl font-bold text-gray-900 mb-3">{feature.title}</h3>
                  <p className="text-gray-600 leading-relaxed">{feature.description}</p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
