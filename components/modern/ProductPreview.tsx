import React from 'react';
import { motion } from 'framer-motion';
import { Folder, Edit, Workflow, BarChart3 } from 'lucide-react';

const previews = [
  { icon: Folder, title: 'Globe Navigator', color: 'from-blue-400 to-blue-600' },
  { icon: Edit, title: 'Risk Selector', color: 'from-blue-500 to-blue-700' },
  { icon: Workflow, title: 'AI Report Generator', color: 'from-blue-600 to-blue-800' },
  { icon: BarChart3, title: 'Time Analytics', color: 'from-blue-400 to-blue-700' },
];

export const ProductPreview: React.FC = () => {
  return (
    <section className="py-24 bg-gradient-to-b from-blue-50 to-white">
      <div className="max-w-7xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-5xl font-bold text-gray-900 mb-4">Platform Components</h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Discover the integrated tools that power global risk intelligence and analysis.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-6">
          {previews.map((preview, index) => {
            const Icon = preview.icon;
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                whileHover={{ scale: 1.03 }}
                className="group relative aspect-video bg-white rounded-3xl shadow-xl overflow-hidden cursor-pointer border-2 border-transparent hover:border-blue-500 transition-all duration-300"
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${preview.color} opacity-10 group-hover:opacity-20 transition-opacity duration-300`}></div>

                <div className="relative h-full flex flex-col items-center justify-center p-8">
                  <div className="w-20 h-20 bg-blue-100 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                    <Icon className="w-10 h-10 text-blue-600" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900">{preview.title}</h3>
                </div>

                <div className="absolute top-4 right-4 w-3 h-3 bg-blue-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
