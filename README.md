# AI LaptopWala - WhatsApp Sales Agent Admin Panel

A modern, responsive admin dashboard for managing a WhatsApp-based AI Sales Agent. Built with React, TypeScript, and Tailwind CSS.

![Admin Panel](https://img.shields.io/badge/Admin-Panel-blue) ![React](https://img.shields.io/badge/React-18-61DAFB) ![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6) ![Tailwind](https://img.shields.io/badge/Tailwind-CSS-38B2AC)

---

## 🚀 Features

### 📊 Dashboard Overview
- Real-time statistics and analytics
- Quick view of products, conversations, and system status
- Visual metrics with charts and graphs

### 💬 Conversations Panel
- View all WhatsApp customer conversations
- Real-time message sync with n8n workflows
- Contact management and chat history

### 📦 Products Management
- Full CRUD operations for:
  - **Laptops** - With specifications (processor, RAM, storage, graphics)
  - **Desktops** - With monitor size and component details
  - **Accessories** - With pricing and availability
- **Grid & Table Views** - Switch between card and table layouts
- **Status Filtering** - Filter by In Stock, Low Stock, Out of Stock
- **Category Filtering** - Filter by product category
- **Search & Sort** - Find products quickly
- **Quick Stock Edit** - Update inventory inline
- **Image Upload** - Cloudinary integration for product images

### 🖼️ Product Images
- Bulk image upload to Cloudinary
- Image management and preview
- Drag & drop support

### 🔴 Live Chat
- Real-time chat testing interface
- Simulate customer-agent conversations
- Debug AI agent responses

---

## 🔐 Login Credentials

```
Username: Ailaptop
Password: Laptop@9165
```

---

## 🛠️ Tech Stack

| Technology | Purpose |
|------------|---------|
| React 18 | UI Framework |
| TypeScript | Type Safety |
| Tailwind CSS | Styling |
| Vite | Build Tool |
| TanStack Query | Data Fetching |
| Lucide React | Icons |
| Sonner | Toast Notifications |
| shadcn/ui | UI Components |

---

## 📁 Project Structure

```
src/
├── components/
│   ├── chat/           # Chat and conversation components
│   ├── dashboard/      # Dashboard widgets and stats
│   ├── images/         # Image upload panel
│   ├── layout/         # Sidebar and navigation
│   ├── live/           # Live chat testing
│   ├── products/       # Product management (CRUD dialogs)
│   └── ui/             # shadcn/ui components
├── hooks/
│   ├── useAuth.tsx     # Authentication context
│   ├── useN8nData.ts   # Data fetching hooks
│   └── ...
├── pages/
│   ├── Index.tsx       # Main dashboard page
│   ├── Login.tsx       # Login page
│   └── NotFound.tsx    # 404 page
└── integrations/
    └── supabase/       # Backend connection
```

---

## 🔧 Backend Integration

### Edge Functions

| Function | Purpose |
|----------|---------|
| `postgres-api` | Direct PostgreSQL connection for CRUD operations |
| `cloudinary-upload` | Image upload handling |
| `n8n-proxy` | n8n workflow integration |

### Environment Variables

The following secrets are configured:

- `EXTERNAL_POSTGRES_URL` - External PostgreSQL database connection
- `CLOUDINARY_CLOUD_NAME` - Cloudinary cloud name
- `CLOUDINARY_API_KEY` - Cloudinary API key
- `CLOUDINARY_API_SECRET` - Cloudinary API secret
- `N8N_WEBHOOK_URL` - n8n webhook endpoint

---

## 📱 Responsive Design

- **Desktop** - Full sidebar with collapsible option
- **Tablet** - Adaptive layout
- **Mobile** - Bottom navigation and hamburger menu

---

## 🎨 UI Features

- **Glassmorphism Design** - Modern glass-panel aesthetic
- **Dark Theme** - Eye-friendly dark mode
- **Animations** - Smooth transitions with Tailwind
- **Status Indicators** - Color-coded product status
  - 🟢 Green - In Stock
  - 🟠 Orange - Low Stock
  - 🔴 Red - Out of Stock

---

## 📋 Database Schema

### Laptops Table
```
- row_number (ID)
- brand, model
- processor, generation
- ram_gb, storage_type, storage_gb
- screen_size, graphics
- condition, price_range
- stock_quantity
- image_url_1, image_url_2
```

### Desktops Table
```
- row_number (ID)
- brand, model
- processor, generation
- ram_gb, ram_type, storage_gb
- monitor_size, graphics
- condition, price_range
- stock_quantity
- image_url_1, image_url_2
```

### Accessories Table
```
- row_number (ID)
- accessories_name
- price_range_inr
- stock_quantity
- image_url_1, image_url_2
```

---

## 🚀 Getting Started

1. **Clone the repository**
2. **Install dependencies**: `npm install`
3. **Start development server**: `npm run dev`
4. **Open**: `http://localhost:5173`

---

## 👨‍💻 Developer

**MLHK Infotech**  
Built with ❤️ by Hariom Vishwkarma

---

## 📄 License

This project is proprietary software. All rights reserved.
