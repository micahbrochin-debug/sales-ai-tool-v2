'use client';

export function LoadingOverlay() {
  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in">
      <div className="card-elevated max-w-sm mx-4 p-8 text-center">
        <div className="w-12 h-12 mx-auto mb-6 relative">
          <div className="absolute inset-0 rounded-full border-4 border-primary-200"></div>
          <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-primary-600 animate-spin"></div>
        </div>
        <h3 className="heading-md text-gray-900 mb-3">Processing Request</h3>
        <p className="text-muted">
          Our AI systems are analyzing your data...
        </p>
        <div className="mt-4 flex justify-center">
          <div className="loading-dots">
            <div style={{'--delay': '0'} as React.CSSProperties}></div>
            <div style={{'--delay': '1'} as React.CSSProperties}></div>
            <div style={{'--delay': '2'} as React.CSSProperties}></div>
          </div>
        </div>
      </div>
    </div>
  );
}