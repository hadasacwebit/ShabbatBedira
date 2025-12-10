# ShabbatBedira - מערכת שיווק דירות נופש

מערכת לשיווק דירות נופש הכוללת Backend ב-ASP.NET Core ו-Frontend ב-React.

## תכונות

- 🔍 **חיפוש מתקדם** - חיפוש דירות לפי כתובת או עיר
- 🎛️ **סינון** - סינון לפי מחיר, מספר מיטות ומספר חדרים
- 👁️ **צפייה חופשית** - ניתן לצפות בדירות ללא התחברות
- 🔐 **אזור אישי** - התחברות באמצעות אימייל או Google
- 💳 **תשלום** - הוספת דירה בעלות של ₪10 באמצעות Grow
- 📊 **ניהול** - צפייה וניהול הדירות שהוספת

## טכנולוגיות

- **Backend**: ASP.NET Core (.NET 10)
- **Frontend**: React with TypeScript
- **Database**: SQL Server
- **Authentication**: JWT + Google OAuth
- **Payment**: Grow Payment API

## התקנה והפעלה

### דרישות מקדימות

- .NET 10 SDK
- Node.js 18+
- SQL Server (או LocalDB)

### Backend

```bash
cd backend/VacationRentals

# Configure connection string in appsettings.json
# Configure JWT key, Google Client ID, and Grow API keys

# Run the application
dotnet run
```

### Frontend

```bash
cd frontend/vacation-rentals

# Install dependencies
npm install

# Copy environment file and configure
cp .env.example .env

# Run development server
npm start
```

## הגדרות

### Backend (appsettings.json)

```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Server=localhost;Database=VacationRentals;Trusted_Connection=True;TrustServerCertificate=True"
  },
  "Jwt": {
    "Key": "your-256-bit-secret-key",
    "Issuer": "VacationRentals",
    "Audience": "VacationRentals"
  },
  "Google": {
    "ClientId": "your-google-client-id"
  },
  "Grow": {
    "ApiKey": "your-grow-api-key",
    "TerminalId": "your-grow-terminal-id",
    "CallbackUrl": "http://your-domain/api/payments/callback"
  }
}
```

### Frontend (.env)

```
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_GOOGLE_CLIENT_ID=your-google-client-id
```

## API Endpoints

### Authentication

- `POST /api/auth/register` - הרשמה עם אימייל וסיסמה
- `POST /api/auth/login` - התחברות עם אימייל וסיסמה
- `POST /api/auth/google` - התחברות עם Google

### Apartments

- `GET /api/apartments` - חיפוש דירות עם סינונים
- `GET /api/apartments/{id}` - קבלת פרטי דירה
- `GET /api/apartments/cities` - רשימת ערים
- `GET /api/apartments/my` - הדירות שלי (דורש הזדהות)
- `POST /api/apartments` - הוספת דירה חדשה (דורש הזדהות)
- `PUT /api/apartments/{id}` - עדכון דירה (דורש הזדהות)
- `DELETE /api/apartments/{id}` - מחיקת דירה (דורש הזדהות)

### Payments

- `POST /api/payments/create` - יצירת תשלום לדירה
- `POST /api/payments/callback` - Callback מ-Grow
- `POST /api/payments/verify/{transactionId}` - אימות תשלום

## מבנה הפרויקט

```
ShabbatBedira/
├── backend/
│   └── VacationRentals/
│       ├── Controllers/
│       ├── Data/
│       ├── DTOs/
│       ├── Models/
│       ├── Services/
│       └── Program.cs
└── frontend/
    └── vacation-rentals/
        ├── public/
        └── src/
            ├── components/
            ├── context/
            ├── pages/
            ├── services/
            └── types/
```

## רישיון

MIT License