# Rockfall Risk Prediction System

<div align="center">

![Next.js](https://img.shields.io/badge/Next.js-15.5.2-black?style=for-the-badge&logo=next.js)
![React](https://img.shields.io/badge/React-19.1.0-blue?style=for-the-badge&logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=for-the-badge&logo=typescript)
![Prisma](https://img.shields.io/badge/Prisma-6.15.0-2D3748?style=for-the-badge&logo=prisma)
![Python](https://img.shields.io/badge/Python-3.x-3776AB?style=for-the-badge&logo=python)

**A comprehensive AI-powered system for predicting rockfall risks in mining and construction environments**

[Live Demo](#quick-start) • [Documentation](#documentation) • [Contributing](#contributing) • [License](#license)

</div>

---

## Overview

The **Rockfall Risk Prediction System** is an advanced web application that leverages machine learning to assess and predict rockfall risks in mining operations, construction sites, and geological monitoring scenarios. Built with modern web technologies, it provides both real-time single predictions and bulk analysis capabilities for comprehensive risk management.

### Key Features

- **Real-time Risk Assessment** - Instant predictions with 13 geotechnical parameters
- **Bulk Analysis** - Process multiple scenarios via CSV upload
- **AI-Powered Predictions** - Machine learning model with feature importance analysis
- **Interactive Dashboard** - Beautiful, responsive UI with real-time data visualization
- **Data Persistence** - PostgreSQL database with Prisma ORM
- **Alert System** - Automatic notifications for high-risk scenarios
- **Responsive Design** - Works seamlessly on desktop and mobile devices

---

## Architecture

```mermaid
graph TB
    A[Frontend Dashboard] --> B[Next.js API Routes]
    B --> C[Python ML Model]
    B --> D[PostgreSQL Database]
    C --> E[Risk Prediction]
    D --> F[Data Storage]
    E --> G[Risk Assessment]
    F --> H[Historical Data]
    G --> I[Alert Generation]
    H --> J[Analytics & Reporting]
```

### Tech Stack

| Component | Technology | Purpose |
|-----------|------------|---------|
| **Frontend** | Next.js 15.5.2 + React 19 | Modern web application framework |
| **Styling** | Tailwind CSS + shadcn/ui | Responsive design system |
| **Forms** | React Hook Form + Zod | Type-safe form validation |
| **Backend** | Next.js API Routes | Serverless API endpoints |
| **Database** | PostgreSQL + Prisma | Data persistence and ORM |
| **ML Engine** | Python + scikit-learn | Risk prediction model |
| **Type Safety** | TypeScript | End-to-end type safety |

---

## Quick Start

### Prerequisites

- **Node.js** 18+ and npm
- **Python** 3.8+ with pip
- **PostgreSQL** 13+
- **Git**

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/rockfall-risk-prediction.git
cd rockfall-risk-prediction
```

### 2. Install Dependencies

```bash
# Install Node.js dependencies
npm install

# Install Python dependencies
cd ml
pip install -r requirements.txt
cd ..
```

### 3. Environment Setup

Create a `.env.local` file in the root directory:

```env
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/rockfall_db"

# Optional: Add other environment variables
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

### 4. Database Setup

```bash
# Generate Prisma client
npx prisma generate

# Run database migrations
npx prisma db push

# (Optional) Seed the database
npx prisma db seed
```

### 5. Start the Application

```bash
# Start the development server
npm run dev
```

Visit `http://localhost:3000` to see the application in action!

---

## Documentation

### Single Prediction Mode

Use the manual analysis form to input 13 geotechnical parameters:

| Parameter | Unit | Description |
|-----------|------|-------------|
| **Rainfall** | mm/day | Daily precipitation impacting slope saturation |
| **Depth to Groundwater** | m | Vertical distance to the water table |
| **Pore Water Pressure** | kPa | Water pressure within soil/rock pores |
| **Surface Runoff** | m³/s | Overland flow affecting erosion/loading |
| **Unit Weight** | kN/m³ | Material density × gravity |
| **Cohesion** | kPa | Shear strength independent of normal stress |
| **Internal Friction Angle** | ° | Shear resistance due to particle friction |
| **Slope Angle** | ° | Inclination of slope face |
| **Slope Height** | m | Vertical height of slope |
| **Pore Water Pressure Ratio** | 0–1 | Ru ratio for saturation effects |
| **Bench Height** | m | Vertical dimension of a bench |
| **Bench Width** | m | Horizontal width of a bench |
| **Inter-Ramp Angle** | ° | Angle between benches across ramps |

### Bulk Analysis Mode

1. **Prepare CSV File**: Create a CSV with headers matching the parameter names above
2. **Upload**: Drag and drop or click to upload your CSV file
3. **Process**: Click "Process X Records" to run bulk predictions
4. **Review**: Analyze results with risk level distribution and detailed breakdowns

#### Example CSV Format

```csv
rainfall,depthToGroundwater,poreWaterPressure,surfaceRunoff,unitWeight,cohesion,internalFrictionAngle,slopeAngle,slopeHeight,pwpRatio,benchHeight,benchWidth,interRampAngle
15.5,2.3,45.2,0.8,18.5,25.0,35.0,45.0,12.0,0.3,3.0,4.0,15.0
8.2,1.8,38.7,0.6,19.2,28.5,32.0,38.0,10.5,0.25,2.8,3.5,12.0
```

### API Endpoints

#### Single Prediction
```http
POST /api/predict
Content-Type: application/json

{
  "features": [15.5, 2.3, 45.2, 0.8, 18.5, 25.0, 35.0, 45.0, 12.0, 0.3, 3.0, 4.0, 15.0]
}
```

#### Bulk Prediction
```http
POST /api/predict/bulk
Content-Type: application/json

{
  "rows": [
    [15.5, 2.3, 45.2, 0.8, 18.5, 25.0, 35.0, 45.0, 12.0, 0.3, 3.0, 4.0, 15.0],
    [8.2, 1.8, 38.7, 0.6, 19.2, 28.5, 32.0, 38.0, 10.5, 0.25, 2.8, 3.5, 12.0]
  ]
}
```

#### Get Predictions
```http
GET /api/predictions
```

---

## Testing

### Run Test Suite

```bash
# Test single prediction API
node test_api.js

# Test bulk prediction API
node test_bulk_api.js

# Run TypeScript checks
npm run build
```

### Manual Testing

1. **Start the development server**: `npm run dev`
2. **Open the dashboard**: Navigate to `http://localhost:3000/dashboard`
3. **Test single prediction**: Fill out the form and click "Analyze Risk"
4. **Test bulk analysis**: Upload a CSV file and process it

---

## Database Schema

The application uses a well-structured PostgreSQL database with the following entities:

- **MonitoredLocation**: Represents specific monitoring sites
- **SensorReading**: Stores time-series sensor data
- **Prediction**: Contains AI model predictions and risk assessments
- **Alert**: Logs high-risk alerts and notifications

### Database Diagram

```mermaid
erDiagram
    MonitoredLocation ||--o{ SensorReading : has
    MonitoredLocation ||--o{ Prediction : generates
    SensorReading ||--o| Prediction : triggers
    Prediction ||--o{ Alert : creates
    
    MonitoredLocation {
        int id PK
        string name UK
        string description
        datetime createdAt
    }
    
    SensorReading {
        bigint id PK
        datetime timestamp
        int locationId FK
        float rainfall
        float depthToGroundwater
        float poreWaterPressure
        float surfaceRunoff
        float unitWeight
        float cohesion
        float internalFrictionAngle
        float slopeAngle
        float slopeHeight
        float poreWaterPressureRatio
        float benchHeight
        float benchWidth
        float interRampAngle
    }
    
    Prediction {
        bigint id PK
        datetime predictionTimestamp
        float riskScore
        enum riskLevel
        json contributingFactors
        int locationId FK
        bigint sourceReadingId FK
    }
    
    Alert {
        int id PK
        datetime alertTimestamp
        string message
        bigint predictionId FK
    }
```

---

## Configuration

### Environment Variables

| Variable | Description | Required | Default |
|----------|-------------|----------|---------|
| `DATABASE_URL` | PostgreSQL connection string | ✅ | - |
| `NEXT_PUBLIC_APP_URL` | Application URL | ❌ | `http://localhost:3000` |

### Python Dependencies

The ML model requires the following Python packages:

```
numpy>=1.21.0
scikit-learn>=1.0.0
pandas>=1.3.0
```

---

## Deployment

### Vercel (Recommended)

1. **Connect your repository** to Vercel
2. **Set environment variables** in the Vercel dashboard
3. **Deploy** with automatic builds on push

### Docker

```dockerfile
# Build the application
docker build -t rockfall-risk-app .

# Run with PostgreSQL
docker-compose up -d
```

### Manual Deployment

1. **Build the application**: `npm run build`
2. **Start the production server**: `npm start`
3. **Configure reverse proxy** (nginx/Apache)
4. **Set up SSL certificates**

---

## Contributing

We welcome contributions! Please follow these steps:

1. **Fork the repository**
2. **Create a feature branch**: `git checkout -b feature/amazing-feature`
3. **Commit your changes**: `git commit -m 'Add amazing feature'`
4. **Push to the branch**: `git push origin feature/amazing-feature`
5. **Open a Pull Request**

### Development Guidelines

- Follow TypeScript best practices
- Write tests for new features
- Update documentation as needed
- Follow the existing code style

---

## Performance

- **Single Prediction**: < 2 seconds
- **Bulk Processing**: ~100 records/minute
- **Database Queries**: Optimized with Prisma
- **Frontend**: Server-side rendering with Next.js

---

## Security

- Input validation with Zod schemas
- SQL injection protection via Prisma ORM
- CORS configuration
- Environment variable security
- Rate limiting on API endpoints

---

## Roadmap

- [ ] **Real-time Monitoring** - WebSocket integration for live data
- [ ] **Advanced Analytics** - Historical trend analysis
- [ ] **Mobile App** - React Native companion app
- [ ] **API Documentation** - OpenAPI/Swagger integration
- [ ] **Multi-tenant Support** - Organization-based data isolation
- [ ] **Machine Learning Pipeline** - Automated model retraining

---

## Troubleshooting

### Common Issues

**Database Connection Error**
```bash
# Check if PostgreSQL is running
sudo service postgresql status

# Verify connection string
echo $DATABASE_URL
```

**Python Model Not Found**
```bash
# Ensure model.pkl exists
ls -la ml/model.pkl

# Check Python dependencies
pip install -r ml/requirements.txt
```

**Build Errors**
```bash
# Clear Next.js cache
rm -rf .next

# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
```

---

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## Acknowledgments

- **Geotechnical Engineering Community** for domain expertise
- **Next.js Team** for the amazing framework
- **Prisma Team** for the excellent ORM
- **Open Source Contributors** who made this possible

---

## Support

- **Documentation**: [Wiki](https://github.com/your-username/rockfall-risk-prediction/wiki)
- **Issues**: [GitHub Issues](https://github.com/your-username/rockfall-risk-prediction/issues)
- **Discussions**: [GitHub Discussions](https://github.com/your-username/rockfall-risk-prediction/discussions)
- **Email**: support@rockfall-risk.com

---

<div align="center">

**Built with care for safer mining and construction operations**

[Star this repo](https://github.com/your-username/rockfall-risk-prediction) • [Report Bug](https://github.com/your-username/rockfall-risk-prediction/issues) • [Request Feature](https://github.com/your-username/rockfall-risk-prediction/issues)

</div>
