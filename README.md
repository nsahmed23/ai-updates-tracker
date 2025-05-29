# AI Updates Tracker

A modern, real-time dashboard that tracks the latest updates from major AI companies including OpenAI, Anthropic, Google DeepMind, Meta AI, Microsoft, and more.

## 🚀 Features

- **Real-time Updates**: Automatically fetches and displays the latest AI news and announcements
- **Beautiful Timeline View**: Modern, vertical scrolling interface with company-specific color coding
- **Dark/Light Mode**: Seamless theme switching with persistent preferences
- **Search & Filter**: Search through updates and filter by company or date range
- **Responsive Design**: Works perfectly on desktop and mobile devices
- **Backend API**: Express.js backend with SQLite database for data persistence
- **Multiple Data Sources**: RSS feeds, web scraping, and arXiv integration

## 🛠️ Tech Stack

### Frontend
- **Eleventy (11ty)**: Static site generator
- **Vanilla JavaScript**: No framework dependencies
- **CSS3**: Modern styling with CSS variables
- **Responsive Design**: Mobile-first approach

### Backend
- **Node.js & Express**: RESTful API server
- **SQLite**: Lightweight database for storing updates
- **RSS Parser**: For fetching RSS feeds
- **Cheerio**: Web scraping capabilities
- **Axios**: HTTP client for API requests

## 📁 Project Structure

```
ai-updates-tracker/
├── _data/                  # Eleventy data files
│   └── updates.js         # Sample update data
├── _site/                 # Generated static files (git ignored)
├── backend/               # Express backend
│   ├── config/           # Configuration files
│   │   └── sources.json  # Data source definitions
│   ├── scripts/          # Data fetching scripts
│   │   ├── scrapers/     # Web scraping modules
│   │   ├── trackers/     # RSS and API trackers
│   │   └── utils/        # Utility functions
│   ├── server.js         # Express server
│   └── package.json      # Backend dependencies
├── frontend/             # Frontend assets
│   └── index.html        # New API-connected interface
├── .eleventy.js          # Eleventy configuration
├── index.njk             # Original Eleventy template
├── timeline.htm          # Current timeline interface
├── styles.css            # Global styles
└── package.json          # Frontend dependencies
```

## 🚀 Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone https://github.com/nsahmed23/ai-updates-tracker.git
cd ai-updates-tracker
```

2. Install frontend dependencies:
```bash
npm install
```

3. Install backend dependencies:
```bash
cd backend
npm install
cd ..
```

4. Create a `.env` file in the backend directory:
```env
PORT=3000
NODE_ENV=development
```

### Running the Application

#### Option 1: Run Eleventy Frontend (Static Site)

```bash
npm start
```

Visit `http://localhost:8081/timeline.htm` to see the timeline interface.

#### Option 2: Run Full Stack Application

1. Start the backend server:
```bash
cd backend
npm start
```

2. In a new terminal, start the frontend:
```bash
npm start
```

3. Visit `http://localhost:8081/frontend/` to see the API-connected interface.

### Fetching Real Updates

To manually trigger data fetching:

```bash
cd backend
npm run fetch
```

## 📊 Data Sources

The tracker collects data from multiple sources:

### RSS Feeds
- Cohere Blog
- Stability AI Blog
- Google Research Blog
- Meta AI Research
- AWS Machine Learning Blog

### Web Scraping Targets
- OpenAI Blog
- Anthropic News
- Google DeepMind
- Microsoft AI Blog
- And more...

### Research Papers
- arXiv integration for latest AI research papers

## 🎨 Features in Detail

### Timeline View
- Vertical scrolling layout with latest updates on top
- Company-specific color coding
- Smooth animations and hover effects
- Modal views for detailed information

### Search and Filtering
- Real-time search across titles and descriptions
- Filter by company
- Date range slider
- Instant results

### Dark/Light Mode
- System preference detection
- Manual toggle with persistent storage
- Smooth transitions
- Optimized color schemes for both modes

## 🔧 Configuration

### Adding New Data Sources

Edit `backend/config/sources.json` to add new RSS feeds or scraping targets:

```json
{
  "rss_feeds": {
    "new_source": {
      "url": "https://example.com/rss",
      "name": "New Source",
      "active": true
    }
  }
}
```

### Customizing the Timeline

The timeline interface can be customized by editing:
- `timeline.htm` for structure
- `styles.css` for styling
- Company colors in CSS variables

## 📈 Future Enhancements

- [ ] Real-time WebSocket updates
- [ ] Email notifications for important updates
- [ ] Advanced analytics and trends
- [ ] API rate limiting and caching
- [ ] User accounts and personalization
- [ ] Mobile app version
- [ ] Integration with more AI companies
- [ ] Sentiment analysis of updates

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- Built with [Eleventy](https://www.11ty.dev/)
- Inspired by the rapid pace of AI development
- Thanks to all the AI companies making their updates publicly available

## 📧 Contact

Project Link: [https://github.com/nsahmed23/ai-updates-tracker](https://github.com/nsahmed23/ai-updates-tracker)

---

Made with ❤️ by [nsahmed23](https://github.com/nsahmed23)