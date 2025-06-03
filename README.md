# Craft Space - AI-Powered Knowledge Management System

## Overview

Craft Space is a modern knowledge management system designed to help users organize, connect, and enhance their content with AI-powered features. The application combines a powerful document editor with smart AI features like auto-linking, knowledge graph visualization, and automatic tag generation to create a seamless knowledge management experience.

## Key Features

### Content Management
- Rich text editing with Tailwind Advanced Editor (Novel) and Lexical Editor
- Page organization within workspaces
- Document versioning and history
- Responsive design for desktop and mobile use

### AI-Powered Features
- **AI Auto-Linker**: Suggests relevant links to other pages as you write
- **Knowledge Graph Builder**: Visualizes relationships between your pages as an interactive graph
- **Auto Tag Generator**: Creates semantic tags based on page content for smarter organization
- **AI Assistant**: Chat interface for asking questions about your content

### User Experience
- Clean, modern UI with Tailwind CSS
- Dark/light mode support
- Floating AI tools that appear contextually
- Workspace-based organization

## Project Structure

The project is divided into two main components:

### Frontend (React)
```
Frontend/
├── src/
│   ├── components/      # React components
│   │   ├── editor/      # Editor-related components
│   │   ├── layout/      # Layout components
│   │   ├── novel/       # Novel editor components
│   │   ├── smart/       # AI feature components
│   │   └── workspace/   # Workspace components
│   ├── contexts/        # React contexts
│   ├── editors/         # Editor implementations
│   ├── lib/             # Utility libraries
│   ├── pages/           # Page components
│   └── services/        # API services
└── public/              # Static assets
```

### Backend (Spring Boot)
```
Backend/
├── src/main/java/com/notus/
│   ├── config/          # Configuration classes
│   ├── controller/      # REST controllers
│   ├── service/         # Business logic
│   ├── repository/      # Data access layer
│   ├── entity/          # Database entities
│   ├── dto/             # Data transfer objects
│   ├── exception/       # Custom exceptions
│   └── util/            # Utility classes
└── src/main/resources/  # Configuration files
```

## Technologies Used

### Frontend
- React 18
- Tailwind CSS
- Novel Editor (based on TipTap/ProseMirror)
- Lexical Editor (by Meta)
- React Router
- Axios for API communication
- Lucide React for icons
- React Hot Toast for notifications
- React Force Graph for knowledge visualization

### Backend
- Spring Boot 3.2.0
- PostgreSQL 15
- JWT for authentication
- Maven for dependency management
- Spring Security
- Spring Data JPA

### AI Integration
- Custom AI services for content analysis
- Knowledge graph generation
- Semantic tagging
- Content linking suggestions

## Getting Started

### Prerequisites
- Node.js 16+ and npm/yarn for Frontend
- JDK 17 or higher for Backend
- PostgreSQL 15 or higher
- Maven 3.8+

### Frontend Setup
1. Navigate to the Frontend directory
2. Install dependencies:
   ```
   npm install
   ```
3. Start the development server:
   ```
   npm run dev
   ```
4. The application will be available at `http://localhost:5173`

### Backend Setup
1. Navigate to the Backend directory
2. Configure the database connection in `application.properties`
3. Build the project:
   ```
   mvn clean install
   ```
4. Run the application:
   ```
   mvn spring-boot:run
   ```
5. The API will be available at `http://localhost:8080`

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login and get JWT token

### Workspaces
- `GET /api/workspaces` - Get all workspaces
- `POST /api/workspaces` - Create a new workspace
- `GET /api/workspaces/{id}` - Get workspace by ID
- `PUT /api/workspaces/{id}` - Update workspace
- `DELETE /api/workspaces/{id}` - Delete workspace

### Pages
- `GET /api/workspaces/{workspaceId}/pages` - Get all pages in a workspace
- `POST /api/workspaces/{workspaceId}/pages` - Create a new page
- `GET /api/workspaces/{workspaceId}/pages/{pageId}` - Get page by ID
- `PUT /api/workspaces/{workspaceId}/pages/{pageId}` - Update page
- `DELETE /api/workspaces/{workspaceId}/pages/{pageId}` - Delete page

### AI Features
- `POST /api/workspaces/{workspaceId}/smart/suggest-links` - Get link suggestions
- `GET /api/workspaces/{workspaceId}/smart/knowledge-graph` - Get knowledge graph data
- `POST /api/workspaces/{workspaceId}/smart/generate-tags` - Generate tags from content
- `PUT /api/workspaces/{workspaceId}/pages/{pageId}/tags` - Update page tags
- `GET /api/ai/upload/{pageId}/tag` - Get AI-generated tags for a page

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Novel Editor - https://novel.sh/
- Lexical Editor - https://lexical.dev/
- React Force Graph - https://github.com/vasturiano/react-force-graph