Collecting Data
        </h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 max-w-sm mb-5">
          We are still evaluating {anchorName}. We need <strong>{remaining}</strong> more outcome{remaining !== 1 ? 's' : ''} to generate a reliable, statistically significant reputation score.
        </p>
        <div className="inline-flex items-center px-3 py-1.5 text-xs font-medium text-gray-600 bg-gray-200/70 rounded-full dark:bg-gray-700 dark:text-gray-300">
          Expected scorecard generation: {timeEstimate}
        </div>
      </div>
    );
  }

  // RENDER FULL SCORECARD: If threshold is met
  return (
    <div className="border rounded-xl p-6 bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700">
      {/* Existing Scorecard UI goes here */}
      <h3 className="text-lg font-semibold mb-2">{anchorName} Scorecard</h3>
      <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
        Based on {outcomesCount} verified outcomes.
      </p>
      
      {/* ... data visualizations, composite bands, etc. ... */}
    </div>
  );
};
