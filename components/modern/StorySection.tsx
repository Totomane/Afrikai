import React from 'react';
import { motion } from 'framer-motion';
import { FileText, Users, Workflow } from 'lucide-react';

const stories = [
  {
    icon: FileText,
    title: 'Navigate the world through intelligent risk mapping',
    description: 'Explore countries and regions with our interactive 3D globe, powered by real-time data and AI-driven insights.',
  },
  {
    icon: Users,
    title: 'Voice-powered exploration for hands-free analysis',
    description: 'Simply speak the country name and risk type you want to explore. Our AI understands natural language commands.',
  },
  {
    icon: Workflow,
    title: 'Generate comprehensive reports automatically',
    description: 'AI creates detailed risk assessments, visualizations, and media content based on your selected parameters.',
  },
];

export const StorySection: React.FC = () => {
  return (
    <section className="py-32 bg-white overflow-hidden">
      <div className="max-w-6xl mx-auto px-6">
        {stories.map((story, index) => {
          const Icon = story.icon;
          const isEven = index % 2 === 0;

          return (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 60 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className={`flex flex-col ${isEven ? 'lg:flex-row' : 'lg:flex-row-reverse'} gap-16 items-center mb-32 last:mb-0`}
            >
              <div className="flex-1 space-y-6">
                <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center">
                  <Icon className="w-8 h-8 text-blue-600" />
                </div>

                <h3 className="text-4xl font-bold text-gray-900 leading-tight">
                  {story.title}
                </h3>

                <p className="text-xl text-gray-600 leading-relaxed">
                  {story.description}
                </p>
              </div>

              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 0.8, delay: 0.4 }}
                className="flex-1"
              >
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-400/20 to-blue-600/20 rounded-3xl blur-2xl"></div>
                  <div className="relative aspect-video bg-gradient-to-br from-blue-100 to-blue-200 rounded-3xl shadow-2xl flex items-center justify-center border border-blue-200">
                    <div className="text-gray-500 text-lg font-medium">Visual Preview</div>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
};
