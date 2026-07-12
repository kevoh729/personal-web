# Knowledge Base - Personal Documentation Website

A production-ready personal documentation website for recording inspiring content across various topics. Built with vanilla JavaScript, HTML5, and CSS3. No dependencies, no build process, no database required.

## Features

- **Dark Futuristic Theme**: Modern, tech-focused design with neon accents and glass-morphism effects
- **Responsive Design**: Works seamlessly on desktop, tablet, and mobile devices
- **Admin Panel**: Web-based interface to add, edit, and delete entries without touching code
- **Dynamic Sections**: Automatically detects and creates navigation for new sections added to JSON
- **Full-Text Search Ready**: Entry titles and content are easily filterable
- **Rich Media Support**: Images, videos (YouTube, Vimeo, HTML5), and external links
- **Modal Detail View**: Seamless full-entry viewing with keyboard navigation
- **Reverse Chronological Order**: Newest entries appear first
- **Accessibility**: ARIA labels, keyboard navigation, focus indicators
- **Performance**: Lazy loading for images, optimized CSS animations
- **Import/Export**: Backup and sync your entries
- **Zero Dependencies**: Pure HTML, CSS, and JavaScript - no frameworks or libraries

## Project Structure

```
personal-web/
├── index.html              # Home page (all entries)
├── engineering.html        # Engineering section
├── finance.html            # Finance section
├── business.html           # Business section
├── inspiration.html        # Inspiration section
├── admin.html              # Admin panel for managing entries
├── styles.css              # All styling (main + admin)
├── script.js               # Application logic
├── admin.js                # Admin panel functionality
├── admin.css               # Admin panel styles
└── entries.json            # Content data
```

## Quick Start

1. **Download/Clone Files**: Place all files in your project directory
2. **Open in Browser**: Open `index.html` in your web browser
3. **Add Content**: Click the "Admin" button in the navigation to open the admin panel
4. **Create Entries**: Use the web form to add entries (no code required)
5. **Sync Changes**: Export your JSON and replace entries.json to sync changes to the public site
6. **Automatic Updates**: Refresh the page to see changes

## How to Add Content

### Option 1: Admin Panel (Recommended)

The easiest way to manage your knowledge base:

1. Click the **Admin** button in the top navigation
2. Create entries using the web form:
   - Add Entry: Fill in the form with title, section, date, content, and optional media
   - Manage Entries: View, search, and delete entries
   - Import/Export: Backup your data or sync with entries.json

3. After making changes, export your JSON:
   - Go to Import/Export panel
   - Click "Download JSON"
   - Replace your existing entries.json file with the downloaded file
   - Refresh your site to see the changes

**How it works:**
- Changes are automatically saved in your browser's local storage
- You can add/delete entries without touching code
- Export the data whenever you want to sync it to entries.json
- All data is stored locally in your browser (no cloud, no tracking)

### Option 2: Manual JSON Editing

If you prefer editing JSON directly:

1. Open entries.json in any text editor
2. Add, modify, or delete entries in the JSON array
3. Save the file
4. Refresh your site in the browser

### JSON Entry Structure

Each entry in entries.json has this format:

### Field Definitions

- **id**: Unique numeric identifier for the entry
- **title**: Entry headline
- **section**: Category name (creates new navigation link automatically)
- **date**: Publication date (YYYY-MM-DD format)
- **content**: Full HTML content (can include `<p>`, `<ul>`, `<li>`, `<strong>`, `<em>`, etc.)
- **media_type**: Type of media - `"image"`, `"video"`, `"link"`, or `null` for none
- **media_url**: URL to media file (images, videos) or `null`
- **link_url**: External link URL or `null`

### Example Entries

#### Image Entry
```json
{
  "id": 1,
  "title": "Understanding Neural Networks",
  "section": "Engineering",
  "date": "2026-07-12",
  "content": "<p>Neural networks are computational models...</p>",
  "media_type": "image",
  "media_url": "https://example.com/neural-net.jpg",
  "link_url": null
}
```

#### Video Entry (YouTube)
```json
{
  "id": 2,
  "title": "Web Development Tutorial",
  "section": "Engineering",
  "date": "2026-07-11",
  "content": "<p>Check out this tutorial on modern web development...</p>",
  "media_type": "video",
  "media_url": "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
  "link_url": null
}
```

#### Link Entry
```json
{
  "id": 3,
  "title": "The Psychology of Money",
  "section": "Finance",
  "date": "2026-07-10",
  "content": "<p>Key insights from the book...</p>",
  "media_type": "link",
  "media_url": null,
  "link_url": "https://www.amazon.com/Psychology-Money"
}
```

#### Text-Only Entry
```json
{
  "id": 4,
  "title": "Building Scalable Systems",
  "section": "Engineering",
  "date": "2026-07-08",
  "content": "<p>Scalability requires...</p><p>Key approaches:</p><ul><li>Vertical scaling</li><li>Horizontal scaling</li></ul>",
  "media_type": null,
  "media_url": null,
  "link_url": null
}
```

## Admin Panel Features

The admin panel (`admin.html`) provides a complete web interface for managing your knowledge base:

### Overview Dashboard
- View total entries, sections, and entries from this month
- See recent entries at a glance

### Add Entry
- Web form to create new entries without editing JSON
- Supports all entry fields: title, section, date, content, media
- HTML editor-friendly content field
- Optional media upload support (images, videos, links)

### Manage Entries
- Search entries by title or content
- Filter by section
- Delete entries with confirmation
- Quick overview of all entries

### Import/Export
- **Export**: Download your entries as a JSON file for backup
- **Import**: Upload a JSON file to restore or merge entries
- Browser-based storage: All changes are saved in localStorage
- Easy sync: Export to JSON file and replace entries.json

### How It Works
1. All changes are saved in your browser's localStorage
2. No server or database needed
3. Export your data anytime to sync with entries.json
4. Changes persist between sessions

## Dynamic Section Creation

Sections are **automatically created** when you add a new section name:

1. Add an entry with a new section name: `"section": "Leadership"`
2. Refresh the page
3. "Leadership" appears automatically in the navigation
4. Click it to view all entries in that section

No code changes needed!

## Deployment Options

### Local File System
- Simply open `index.html` in a browser
- Works offline

### Local Server (Python)
```bash
python3 -m http.server 8000
# Then visit: http://localhost:8000
```

### Local Server (Node.js)
```bash
npx http-server
```

### Web Hosting
Upload all files to any web host:
- GitHub Pages
- Vercel
- Netlify
- Traditional shared hosting

The site requires no backend - it's 100% static files + JSON.

## Customization

### Change the Site Title
In all `.html` files, replace:
```html
<h1>Knowledge Base</h1>
```
with your preferred title.

### Change Colors
Edit CSS variables in `styles.css`:
```css
:root {
    --bg-primary: #0a0a0f;
    --accent-cyan: #00f0ff;
    --accent-blue: #0066ff;
    --accent-purple: #7c3aed;
    /* etc */
}
```

### Change Typography
Update font-family in `styles.css`:
```css
font-family: 'Your Font', fallback-font, system fonts;
```

### Change Grid Layout
Modify grid columns in `styles.css`:
```css
.entries-grid {
    grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
    gap: 2rem;
}
```

## Browser Support

- Chrome/Edge: Latest 2 versions
- Firefox: Latest 2 versions
- Safari: Latest 2 versions
- Mobile browsers: iOS Safari 12+, Chrome Android

**Admin Panel Requirements:**
- Requires localStorage support (all modern browsers)
- LocalStorage typically allows 5-10MB of data
- For large knowledge bases (1000+ entries), export regularly for backup

## Performance Tips

1. **Image Optimization**: Use compressed images (WebP or optimized JPG/PNG)
2. **Lazy Loading**: Images load only when needed
3. **CDN**: Host images on a CDN for faster delivery
4. **External Videos**: Embed YouTube/Vimeo instead of self-hosting video files

## Accessibility Features

- **Semantic HTML**: Proper heading hierarchy
- **ARIA Labels**: Interactive elements properly labeled
- **Keyboard Navigation**: 
  - Tab through entries and buttons
  - Enter/Space to open entries
  - Escape to close modals
- **Focus Indicators**: Clear visual feedback for keyboard users
- **Color Contrast**: Meets WCAG AA standards
- **Reduced Motion**: Respects `prefers-reduced-motion` preference

## Content Guidelines

### HTML Allowed in Content
Safe HTML tags you can use:
- `<p>` - Paragraphs
- `<h1>` through `<h6>` - Headings
- `<strong>`, `<em>`, `<u>` - Text formatting
- `<ul>`, `<ol>`, `<li>` - Lists
- `<blockquote>` - Quotes
- `<code>` - Inline code
- `<pre>` - Code blocks
- `<a>` - Links
- `<br>` - Line breaks

### Example Rich Content
```json
"content": "<h2>Main Idea</h2><p>This is the introduction.</p><p><strong>Key point:</strong> Something important.</p><ul><li>First item</li><li>Second item</li></ul><p>Conclusion: <em>Make it count.</em></p>"
```

## Troubleshooting

### Entries Not Showing
1. Check `entries.json` is valid JSON (use jsonlint.com)
2. Verify browser console for errors (F12 -> Console)
3. Ensure entries.json is in the same folder as HTML files

### Styles Not Loading
1. Ensure `styles.css` is in the same folder
2. Clear browser cache (Ctrl+Shift+Delete)
3. Check file paths match exactly

### Modal Not Opening
1. Check browser console for JavaScript errors
2. Verify entries.json has valid content field
3. Try a different browser

### Images Not Showing
1. Verify image URLs are correct and accessible
2. Check media_type is "image"
3. For CORS issues, host images on same server or CORS-enabled CDN

## File Size Considerations

- Optimal JSON file size: < 5MB
- For large sites (1000+ entries): Consider pagination or splitting JSON
- Images: Keep individual files < 500KB when possible

## Security Notes

- Never store sensitive information in entries.json
- User edits entries.json directly - no authentication needed
- For shared hosting: Add `.htaccess` to restrict file downloads
- No user input is sanitized since you're the only editor

## Advanced Usage

### Adding Custom Sections with Filters
The navigation automatically builds from unique section names in entries.json. To add a custom section page, add entries with that section name and refresh.

### Local Development
Serve files with Python or Node.js for proper local testing (file:// protocol has CORS restrictions).

### Search/Filter Enhancement
Entries are loaded in JavaScript - you can extend `script.js` to add search functionality.

## License

This project is provided as-is for personal use. Customize and deploy freely.

## Support & Contributions

For questions or improvements, refer to the inline comments in:
- `script.js` - All application logic explained
- `styles.css` - All styling sections documented

---

**Ready to use!** Simply edit `entries.json`, refresh your browser, and your knowledge base updates instantly. No build process, no complexity, no unnecessary overhead.
