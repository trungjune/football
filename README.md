# ⚽ Football Team Management System

A comprehensive web application for managing 7-a-side football teams, built with modern technologies and deployed on Vercel.

## 🌟 Features

### 👥 Member Management

- Complete member profiles with photos
- Skill level and position tracking
- Contact information management
- Member statistics and history

### 📅 Session Management

- Training sessions and match scheduling
- Registration and attendance tracking
- Automatic notifications
- Calendar integration

### 💰 Financial Management

- Income and expense tracking
- Member fee management
- Debt tracking and payment reminders
- Financial reports and analytics

### ⚽ Team Division

- Manual team selection
- Automatic team balancing algorithm
- Position-based team formation
- Save and reuse team formations

### 🔔 Real-time Features

- Live notifications
- Real-time attendance updates
- WebSocket-based communication
- Push notifications (PWA)

### 📱 Mobile-First Design

- Progressive Web App (PWA)
- Responsive design
- Offline support
- Mobile-optimized interface

### 🔒 Security & Compliance

- JWT authentication
- Role-based access control
- Data encryption
- GDPR compliance
- Audit logging

## 🛠️ Technology Stack

### Frontend

- **Next.js 15** - React framework with App Router
- **TypeScript 5.6** - Type-safe development
- **Tailwind CSS 3.4** - Utility-first styling
- **Shadcn/ui** - Modern UI components
- **React Query** - Data fetching and caching

### Backend

- **NestJS 10** - Scalable Node.js framework
- **Prisma** - Type-safe database ORM
- **PostgreSQL** - Robust relational database
- **JWT** - Secure authentication
- **Socket.io** - Real-time communication

### Infrastructure

- **Vercel** - Deployment and hosting
- **Neon** - Serverless PostgreSQL
- **Cloudinary** - Image storage and optimization
- **Upstash Redis** - Caching layer
- **Sentry** - Error tracking

## 🚀 Quick Start

### Prerequisites

- Node.js 18 or higher
- Git
- Vercel CLI (for deployment)

### Installation

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd football-team-management
   ```

2. **Install dependencies**

   ```bash
   npm install
   cd backend && npm install
   cd ../frontend && npm install
   cd ..
   ```

3. **Set up environment variables**

   ```bash
   # Copy environment templates
   cp backend/.env.example backend/.env
   cp frontend/.env.example frontend/.env

   # Or use the setup script
   ./scripts/setup-env.sh
   ```

4. **Set up the database**

   ```bash
   cd backend
   npx prisma migrate dev
   npx prisma generate
   npx prisma db seed
   ```

5. **Start development servers**

   ```bash
   # Backend (port 3001)
   cd backend && npm run start:dev

   # Frontend (port 3000)
   cd frontend && npm run dev
   ```

6. **Access the application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:3001/api
   - API Documentation: http://localhost:3001/api/docs

## 📖 Documentation

- **[User Guide](docs/USER_GUIDE.md)** - Complete user manual
- **[Admin Guide](docs/ADMIN_GUIDE.md)** - Administrator documentation
- **[API Documentation](docs/API_DOCUMENTATION.md)** - REST API reference
- **[Deployment Guide](docs/DEPLOYMENT_GUIDE.md)** - Production deployment

## 🏗️ Project Structure

```
football-team-management/
├── frontend/                 # Next.js frontend application
│   ├── app/                 # App Router pages
│   ├── components/          # Reusable UI components
│   ├── lib/                 # Utility functions and configs
│   └── public/              # Static assets
├── backend/                 # NestJS backend application
│   ├── src/                 # Source code
│   │   ├── auth/           # Authentication module
│   │   ├── members/        # Member management
│   │   ├── sessions/       # Session management
│   │   ├── finance/        # Financial management
│   │   ├── team-division/  # Team division logic
│   │   └── common/         # Shared utilities
│   └── prisma/             # Database schema and migrations
├── docs/                   # Documentation
├── scripts/                # Deployment and utility scripts
└── .github/                # GitHub Actions workflows
```

## 🔧 Development

### Available Scripts

#### Backend

```bash
npm run start:dev      # Start development server
npm run build          # Build for production
npm run test           # Run tests
npm run test:e2e       # Run end-to-end tests
npm run lint           # Lint code
```

#### Frontend

```bash
npm run dev            # Start development server
npm run build          # Build for production
npm run start          # Start production server
npm run test           # Run tests
npm run lint           # Lint code
```

### Database Management

```bash
# Generate Prisma client
npx prisma generate

# Run migrations
npx prisma migrate dev

# Reset database
npx prisma migrate reset

# View database
npx prisma studio
```

### Testing

```bash
# Run all tests
npm test

# Run tests with coverage
npm run test:cov

# Run E2E tests
npm run test:e2e
```

## 🚀 Deployment

### Quick Deployment

```bash
# Set up environment variables
./scripts/setup-env.sh

# Deploy to production
./scripts/deploy.sh production
```

### Manual Deployment

1. **Set up services**
   - Create Neon PostgreSQL database
   - Set up Cloudinary account
   - Configure Vercel project

2. **Configure environment variables**
   - Set all required environment variables in Vercel
   - Ensure database connection string is correct

3. **Deploy**
   ```bash
   vercel --prod
   ```

For detailed deployment instructions, see the [Deployment Guide](docs/DEPLOYMENT_GUIDE.md).

## 🔒 Security Features

- **Authentication**: JWT-based secure authentication
- **Authorization**: Role-based access control (Admin/Member)
- **Data Protection**: Encryption of sensitive data
- **Rate Limiting**: API abuse prevention
- **Input Validation**: Comprehensive data sanitization
- **Audit Logging**: Complete activity tracking
- **GDPR Compliance**: Data export and deletion capabilities

## 📊 Monitoring

The application includes comprehensive monitoring:

- **Health Checks**: System health monitoring
- **Performance Metrics**: Response times and resource usage
- **Error Tracking**: Sentry integration
- **Security Events**: Real-time security monitoring
- **Audit Logs**: Complete activity logging

Access monitoring dashboard at `/api/monitoring/dashboard` (Admin only).

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines

- Follow TypeScript best practices
- Write tests for new features
- Update documentation as needed
- Follow the existing code style
- Ensure all tests pass before submitting

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

### Getting Help

- **Documentation**: Check the docs folder for comprehensive guides
- **Issues**: Report bugs and request features on GitHub Issues
- **Discussions**: Join community discussions on GitHub Discussions

### Contact

- **Email**: support@footballteam.com
- **Website**: https://your-app.vercel.app

## 🙏 Acknowledgments

- Built with [Next.js](https://nextjs.org/) and [NestJS](https://nestjs.com/)
- UI components from [Shadcn/ui](https://ui.shadcn.com/)
- Deployed on [Vercel](https://vercel.com/)
- Database hosted on [Neon](https://neon.tech/)

---

**Made with ⚽ for football teams everywhere**
