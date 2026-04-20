// src/components/explorer/model-viewer-wrapper.tsx
"use client";

// This component is necessary because <model-viewer> is a custom element
// and Next.js SSR might not handle it correctly without specific configurations.
// Using React.lazy and Suspense for dynamic import helps.

import React from 'react';

// Define the props for <model-viewer>
// You might need to expand this based on the attributes you use.
interface ModelViewerProps extends React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> {
  src: string;
  alt?: string;
  poster?: string;
  ar?: boolean;
  ["camera-controls"]?: boolean;
  ["auto-rotate"]?: boolean;
  exposure?: string;
  ["shadow-intensity"]?: string;
  ["camera-target"]?: string;
  ["camera-orbit"]?: string;
  // Add other <model-viewer> attributes as needed
}

// Declare the custom element type for TypeScript
declare global {
  namespace JSX {
    interface IntrinsicElements {
      'model-viewer': ModelViewerProps;
    }
  }
}

const ModelViewerComponent = React.forwardRef<HTMLElement, ModelViewerProps>((props, ref) => {
  // React.useEffect(() => {
  //   // Dynamically import the <model-viewer> library if it's not already loaded globally
  //   // This is often handled by a script tag in the main HTML layout for web components.
  //   // If using a npm package, it might register itself.
  //   // For this example, we assume it's globally available via a script tag in _document.tsx or layout.tsx
  //   // e.g., <script type="module" src="https://unpkg.com/@google/model-viewer/dist/model-viewer.min.js"></script>
  // }, []);

  return <model-viewer ref={ref} {...props} />;
});

ModelViewerComponent.displayName = 'ModelViewerComponent';

export default ModelViewerComponent;
