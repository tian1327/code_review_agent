# Code Review Agent Frontend

A beautiful React frontend for demonstrating the LLM Agents for Automatic Code Review workflow.

## Features

### 🎨 Beautiful UI Design
- **Professional Header**: Gradient background with your name and title
- **Workflow Progress**: Connected boxes with arrows showing step progression
- **Three-Section Layout**: Input tabs, visualization, and agent outputs
- **Responsive Design**: Works on desktop and mobile devices

### 📊 Interactive Components

#### Top Section - Workflow Progress
- **Connected Boxes**: Visual representation of the 4-agent workflow
- **Color Coding**: Green for completed steps, blue for current, grey for pending
- **Real-time Updates**: Progress updates as workflow executes
- **Status Indicators**: Clear status chips and progress tracking

#### Bottom Section - Three Vertical Panels

**Left Panel - Input Tabs**
- **Problem Statement**: Markdown-formatted problem description
- **Patch**: Git diff showing code changes
- **Test Patch**: Unit test code examples
- **Syntax Highlighting**: Proper code formatting

**Center Panel - Visualization**
- **Image Upload**: Drag-and-drop PNG file upload
- **Sample Images**: Pre-loaded visualization examples
- **Image Preview**: Full-size image display with descriptions
- **Interactive**: Click to switch between sample visualizations

**Right Panel - Agent Output Tabs**
- **Dynamic Tabs**: One tab per agent (Routing, Architect, Review, Test Generation)
- **Real-time Output**: JSON-formatted agent results
- **Status Indicators**: Completion status for each agent
- **Start Button**: Trigger workflow execution

### 🚀 Key Features
- **Real-time Updates**: Live progress tracking
- **Mock Data**: Sample outputs for demonstration
- **Professional Styling**: Material-UI components with custom theming
- **Responsive Layout**: Adapts to different screen sizes
- **Interactive Elements**: Hover effects, animations, and transitions

## Setup Instructions

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn package manager

### Installation

1. **Install Node.js** (if not already installed):
   ```bash
   # On macOS with Homebrew
   brew install node
   
   # Or download from https://nodejs.org/
   ```

2. **Install Dependencies**:
   ```bash
   cd frontend
   npm install
   ```

3. **Start Development Server**:
   ```bash
   npm start
   ```

4. **Access the Application**:
   - Open http://localhost:3000 in your browser
   - The app will automatically reload when you make changes

### Build for Production

```bash
npm run build
```

This creates an optimized production build in the `build` folder.

## Project Structure

```
frontend/
├── public/
│   ├── index.html          # Main HTML file
│   └── manifest.json       # PWA manifest
├── src/
│   ├── components/         # React components
│   │   ├── Header.tsx      # Professional header with background
│   │   ├── WorkflowProgress.tsx  # Progress visualization
│   │   ├── BottomSection.tsx     # Three-panel layout
│   │   ├── InputTabs.tsx   # Input file tabs
│   │   ├── ImageSection.tsx      # Image upload/display
│   │   └── AgentOutputTabs.tsx   # Agent output tabs
│   ├── types/
│   │   └── workflow.ts     # TypeScript type definitions
│   ├── App.tsx             # Main app component
│   └── index.tsx           # App entry point
├── package.json            # Dependencies and scripts
└── tsconfig.json          # TypeScript configuration
```

## Customization

### Styling
- **Theme**: Modify colors and styling in `src/index.tsx`
- **Components**: Each component uses Material-UI with custom styling
- **Responsive**: Built with responsive design principles

### Content
- **Sample Data**: Update sample content in component files
- **Images**: Replace sample images with your own visualizations
- **Agent Outputs**: Modify mock outputs to match your actual agent responses

### Integration
- **API Connection**: Ready to connect to the FastAPI backend
- **Real Data**: Replace mock data with actual API calls
- **WebSocket**: Can be extended for real-time updates

## Technologies Used

- **React 18**: Modern React with hooks
- **TypeScript**: Type-safe development
- **Material-UI**: Professional UI components
- **Styled Components**: Custom styling
- **React Router**: Navigation (if needed)
- **Axios**: HTTP client for API calls

## Browser Support

- Chrome (recommended)
- Firefox
- Safari
- Edge

## Development

### Available Scripts

- `npm start`: Start development server
- `npm test`: Run tests
- `npm run build`: Build for production
- `npm run eject`: Eject from Create React App

### Code Style

- TypeScript for type safety
- Material-UI for consistent design
- Functional components with hooks
- Proper error handling
- Responsive design principles

## Next Steps

1. **Connect to Backend**: Replace mock data with real API calls
2. **Add Authentication**: Implement user login if needed
3. **Real-time Updates**: Add WebSocket for live progress
4. **Deploy**: Deploy to production environment
5. **Customize**: Adapt to your specific workflow needs

The frontend is now ready for integration with your backend API! 🎉 