import React from 'react';
import { motion } from 'framer-motion';

const GrammarTableComponent = ({ table }) => {
  const getCaseStyle = (caseType) => {
    switch (caseType?.toLowerCase()) {
      case 'nominativ':
        return 'bg-red-50 border-red-200 text-red-900';
      case 'akkusativ':
        return 'bg-green-50 border-green-200 text-green-900';
      case 'dativ':
        return 'bg-yellow-50 border-yellow-200 text-yellow-900';
      case 'genitiv':
        return 'bg-red-50 border-red-200 text-red-900';
      default:
        return 'bg-white border-gray-200 text-gray-800';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="my-6 overflow-hidden rounded-xl border border-gray-200 shadow-sm"
    >
      {table.title && (
        <div className="bg-gray-50 px-4 py-3 border-b border-gray-200 font-bold text-gray-700">
          {table.title}
        </div>
      )}
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-right">
          <thead className="text-xs text-gray-700 uppercase bg-gray-50">
            <tr>
              {table.headers.map((header, index) => (
                <th key={index} scope="col" className="px-6 py-3 border-b">
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {table.rows.map((row, rowIndex) => {
              // Extract columns dynamically based on row object keys that aren't 'case'
              // Assuming row keys like col1, col2, etc. or specific named keys
              const cells = Object.keys(row).filter(key => key !== 'case' && key !== 'gender' && key !== 'nominativ' && key !== 'dativ' && key !== 'genitiv' && key !== 'article' && key !== 'example');

              // Handle structured rows (gender/article/example) vs generic col1/col2
              let cellValues = [];
              if (row.gender) {
                 // Specific format for article tables
                 cellValues = [row.gender, row.article || row.nominativ, row.example || row.dativ || row.genitiv];
              } else {
                 // Generic columns
                 cellValues = Object.keys(row)
                  .filter(k => k.startsWith('col'))
                  .sort()
                  .map(k => row[k]);
              }

              const rowStyle = getCaseStyle(row.case);

              return (
                <tr key={rowIndex} className={`border-b last:border-0 hover:bg-opacity-80 transition-colors ${rowStyle}`}>
                  {cellValues.map((cell, cellIndex) => (
                    <td key={cellIndex} className="px-6 py-4 font-medium whitespace-nowrap" dir="ltr">
                      {cell}
                    </td>
                  ))}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </motion.div>
  );
};

export default GrammarTableComponent;