
import { Page, Component } from '../store/WebsiteStore';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';

export const generateCode = (pages: Page[], components: Component[]) => {
  const generateComponentCode = (component: Component, allComponents: Component[], indentLevel = 1): string => {
    const indent = '  '.repeat(indentLevel);
    const ComponentClass = component.type;

    // Get child components
    const children = allComponents.filter(c => c.parentId === component.id);

    // Format props
    const propsStr = Object.entries(component.props || {})
      .filter(([key]) => key !== 'children')
      .map(([key, value]) => {
        if (typeof value === 'string') {
          return `${key}="${value}"`;
        } else if (Array.isArray(value)) {
          return `${key}={${JSON.stringify(value)}}`;
        } else {
          return `${key}={${value}}`;
        }
      })
      .join(' ');

    // Generate code with children
    if (children.length > 0) {
      const childrenCode = children
        .map(child => generateComponentCode(child, allComponents, indentLevel + 1))
        .join('\n');

      return `${indent}<${ComponentClass} ${propsStr}>\n${childrenCode}\n${indent}</${ComponentClass}>`;
    } else {
      // Text content for simple components
      const textContent = component.props?.text ? component.props.text : '';

      if (textContent) {
        return `${indent}<${ComponentClass} ${propsStr}>${textContent}</${ComponentClass}>`;
      } else {
        return `${indent}<${ComponentClass} ${propsStr} />`;
      }
    }
  };

  // Generate React component for each page
  const pageComponents = pages.map(page => {
    const pageComponentsData = components.filter(c => c.pageId === page.id);
    const rootComponents = pageComponentsData.filter(c => !c.parentId);

    const componentsCode = rootComponents
      .map(comp => generateComponentCode(comp, pageComponentsData))
      .join('\n');

    return `// ${page.name}.jsx
import React from 'react';
import { Helmet } from 'react-helmet';
${getImports(pageComponentsData)}

const ${formatPageName(page.name)} = () => {
  return (
    <>
      <Helmet>
        <title>${page.name}</title>
      </Helmet>
      <div className="page-container">
${componentsCode}
      </div>
    </>
  );
};

export default ${formatPageName(page.name)};
`;
  }).join('\n\n');

  // Generate main App.jsx and index imports
  const appCode = `// App.jsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
${pages.map(page => `import ${formatPageName(page.name)} from './${formatPageName(page.name)}';`).join('\n')}

const App = () => {
  return (
    <Router>
      <Routes>
        ${pages.map((page, i) =>
          `<Route path="${i === 0 ? '/' : `/${page.name.toLowerCase()}`}" element={<${formatPageName(page.name)} />} />`
        ).join('\n        ')}
      </Routes>
    </Router>
  );
};

export default App;
`;

  // Generate index.js
  const indexCode = `// index.js
import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
`;

  // Generate CSS
  const cssCode = `/* index.css */
@tailwind base;
@tailwind components;
@tailwind utilities;

body {
  margin: 0;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen',
    'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue',
    sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

code {
  font-family: source-code-pro, Menlo, Monaco, Consolas, 'Courier New',
    monospace;
}

.page-container {
  min-height: 100vh;
}
`;

  // Generate package.json
  const packageJson = `{
  "name": "website-builder-export",
  "version": "0.1.0",
  "private": true,
  "dependencies": {
    "@testing-library/jest-dom": "^5.16.5",
    "@testing-library/react": "^13.4.0",
    "@testing-library/user-event": "^13.5.0",
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-helmet": "^6.1.0",
    "react-router-dom": "^6.10.0",
    "react-scripts": "5.0.1",
    "web-vitals": "^2.1.4"
  },
  "scripts": {
    "start": "react-scripts start",
    "build": "react-scripts build",
    "test": "react-scripts test",
    "eject": "react-scripts eject"
  },
  "eslintConfig": {
    "extends": [
      "react-app",
      "react-app/jest"
    ]
  },
  "browserslist": {
    "production": [
      ">0.2%",
      "not dead",
      "not op_mini all"
    ],
    "development": [
      "last 1 chrome version",
      "last 1 firefox version",
      "last 1 safari version"
    ]
  },
  "devDependencies": {
    "autoprefixer": "^10.4.14",
    "postcss": "^8.4.21",
    "tailwindcss": "^3.3.1"
  }
}`;

  // Generate tailwind.config.js
  const tailwindConfig = `/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}`;

  // Generate postcss.config.js
  const postcssConfig = `module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}`;

  // Generate components.js for component reuse
  const componentsCode = `// Components.js
import React from 'react';

// Basic Components
export const Heading = ({ text, level, textAlign, color, className, children }) => {
  const Tag = level || 'h2';
  return React.createElement(
    Tag,
    {
      className: \`\${className || ''} text-\${textAlign}\`,
      style: { color },
    },
    text || children
  );
};

export const Paragraph = ({ text, textAlign, color, className, children }) => {
  return (
    <p
      className={\`\${className || ''} text-\${textAlign}\`}
      style={{ color }}
    >
      {text || children}
    </p>
  );
};

// Add more component exports...
`;

  // Create a zip file with all the code
  const zip = new JSZip();
  const src = zip.folder("src");
  
  // Add page components
  pages.forEach(page => {
    src?.file(`${formatPageName(page.name)}.jsx`, pageComponents);
  });
  
  // Add other files
  src?.file("App.jsx", appCode);
  src?.file("index.js", indexCode);
  src?.file("index.css", cssCode);
  src?.file("components.js", componentsCode);
  
  // Add config files
  zip.file("package.json", packageJson);
  zip.file("tailwind.config.js", tailwindConfig);
  zip.file("postcss.config.js", postcssConfig);
  
  // Generate zip file
  return zip.generateAsync({ type: "blob" }).then(content => {
    saveAs(content, "website-builder-export.zip");
  });
};

// Helper functions for code generation
const formatPageName = (name: string): string => {
  return name
    .replace(/[^a-zA-Z0-9]/g, ' ')
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join('');
};

const getImports = (components: Component[]): string => {
  // Get unique component types used on the page
  const componentTypes = [...new Set(components.map(c => c.type))];
  return 'import { ' + componentTypes.join(', ') + ' } from "./components";';
};
