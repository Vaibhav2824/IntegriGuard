const fs = require('fs');
const path = require('path');

const structure = {
  'public': ['placeholder.svg'],
  'src/components/admin': ['StudentDataCollect.tsx', 'StudentSearchBox.tsx'],
  'src/components/dashboard': ['DashboardCard.tsx'],
  'src/components/exams': ['ExamCard.tsx', 'ExamSubmissionForm.tsx'],
  'src/components/layout': ['Footer.tsx', 'Navbar.tsx'],
  'src/components/students': ['StudentActivityMonitor.tsx', 'StudentBehaviorChart.tsx'],
  'src/components/ui': [
    'accordion.tsx', 'alert-dialog.tsx', 'alert.tsx', 'aspect-ratio.tsx',
    'avatar.tsx', 'badge.tsx', 'breadcrumb.tsx', 'button.tsx', 'calendar.tsx',
    'card.tsx', 'carousel.tsx', 'chart.tsx', 'checkbox.tsx', 'collapsible.tsx',
    'command.tsx', 'context-menu.tsx', 'dialog.tsx', 'drawer.tsx', 'dropdown-menu.tsx',
    'form.tsx', 'hover-card.tsx', 'input-otp.tsx', 'input.tsx', 'label.tsx',
    'menubar.tsx', 'navigation-menu.tsx', 'pagination.tsx', 'popover.tsx', 'progress.tsx',
    'radio-group.tsx', 'resizable.tsx', 'scroll-area.tsx', 'select.tsx', 'separator.tsx',
    'sheet.tsx', 'sidebar.tsx', 'skeleton.tsx', 'slider.tsx', 'sonner.tsx',
    'switch.tsx', 'table.tsx', 'tabs.tsx', 'textarea.tsx', 'toast.tsx',
    'toaster.tsx', 'toggle-group.tsx', 'toggle.tsx', 'tooltip.tsx', 'use-toast.ts'
  ],
  'src/hooks': ['use-mobile.tsx', 'use-toast.ts'],
  'src/lib': ['utils.ts'],
  'src/pages': [
    'CreateExam.tsx', 'Dashboard.tsx', 'ExamResults.tsx', 'Index.tsx',
    'Login.tsx', 'NotFound.tsx', 'StudentAnalysis.tsx', 'TakeExam.tsx'
  ],
  'src': ['App.css', 'App.tsx', 'index.css', 'main.tsx'],
  '': [
    '.gitignore', 'components.json', 'eslint.config.js', 'index.html',
    'package.json', 'postcss.config.js', 'README.md', 'tailwind.config.ts',
    'tsconfig.app.json', 'tsconfig.json', 'tsconfig.node.json', 'vite.config.ts'
  ]
};

const createFiles = (base, files) => {
  files.forEach(file => {
    const filePath = path.join(base, file);
    fs.writeFileSync(filePath, `// ${file} generated file`, 'utf8');
  });
};

Object.entries(structure).forEach(([folder, files]) => {
  if (folder) fs.mkdirSync(folder, { recursive: true });
  createFiles(folder || '.', files);
});

console.log('Project structure created successfully!');
