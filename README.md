# Research Opportunity Portal

A web app that lets faculty post, view, update, and manage research opportunities
in one place, instead of scattering them across email, WhatsApp, and noticeboards.

- **Backend:** Node.js + Express REST API
- **Database:** MySQL
- **Frontend:** HTML, CSS, and vanilla JavaScript (no build step)

## GitHub Repository
https://github.com/YOUR_USERNAME/research-opportunity-portal

*(Replace this with your actual repository link before submitting.)*

## Project Structure

```
research-opportunity-portal/
├── backend/
│   ├── config/db.js
│   ├── controllers/opportunitiesController.js
│   ├── routes/opportunities.js
│   ├── database/schema.sql
│   ├── server.js
│   ├── package.json
│   └── .env.example
├── frontend/
│   ├── index.html
│   ├── css/style.css
│   └── js/app.js
├── postman/
│   └── research-opportunity-portal.postman_collection.json
└── README.md
```

## 1. Prerequisites

- Node.js (v18 or later)
- MySQL Server (running locally or accessible remotely)
- Postman or Bruno (for API testing)

## 2. Database Setup

1. Open a MySQL client (MySQL Workbench, `mysql` CLI, etc.).
2. Run the schema file to create the database, table, and a few sample rows:

   ```bash
   mysql -u root -p < backend/database/schema.sql
   ```

   This creates a database called `research_opportunity_portal` with an
   `opportunities` table.

## 3. Backend Setup

```bash
cd backend
npm install
cp .env.example .env
```

Open `.env` and fill in your own MySQL credentials:

```
PORT=5000
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=research_opportunity_portal
```

Start the server:

```bash
npm start
```

You should see:

```
Server running on http://localhost:5000
```

Visit `http://localhost:5000` in a browser — you should see a small JSON
message confirming the API is running.

## 4. Frontend Setup

The frontend is plain HTML/CSS/JS, so it doesn't need a build step. The
easiest way to run it is with a simple local server (opening `index.html`
directly also works, but a server avoids browser file:// restrictions).

Using VS Code's **Live Server** extension:
- Right-click `frontend/index.html` → "Open with Live Server".

Or using Node's `http-server`:

```bash
cd frontend
npx http-server -p 5500
```

Then open `http://localhost:5500` in your browser. Make sure the backend
(step 3) is running at the same time — the frontend calls it at
`http://localhost:5000/api/opportunities`.

If you serve the frontend from a different port or host, update `API_BASE`
at the top of `frontend/js/app.js`.

## 5. API Reference

| Method | Endpoint                  | Description                          |
|--------|----------------------------|---------------------------------------|
| POST   | `/api/opportunities`       | Create a new opportunity              |
| GET    | `/api/opportunities`       | Get all opportunities                 |
| GET    | `/api/opportunities/:id`   | Get one opportunity by ID             |
| PUT    | `/api/opportunities/:id`   | Update an opportunity (partial OK)    |
| DELETE | `/api/opportunities/:id`   | Delete an opportunity                 |

### Request body (POST / PUT)

```json
{
  "title": "Machine Learning for Crop Yield Prediction",
  "description": "Build ML models that predict crop yield from satellite imagery.",
  "research_area": "Machine Learning",
  "faculty_name": "Dr. Ayesha Khan",
  "department": "Computer Science",
  "required_skills": "Python, scikit-learn, remote sensing basics",
  "positions_available": 2,
  "application_deadline": "2026-11-15",
  "status": "Open"
}
```

### Status codes used

- `200 OK` – successful GET, PUT, DELETE
- `201 Created` – successful POST
- `400 Bad Request` – missing or invalid fields
- `404 Not Found` – opportunity ID doesn't exist
- `500 Internal Server Error` – unexpected server/database error

## 6. Testing with Postman / Bruno

Import `postman/research-opportunity-portal.postman_collection.json` into
Postman (or Bruno). It includes requests for:

1. Creating three sample opportunities
2. Retrieving all opportunities
3. Retrieving one opportunity by ID
4. Updating an opportunity
5. Closing an opportunity (status → Closed)
6. Deleting an opportunity
7. Re-requesting the deleted opportunity (expects 404)
8. Sending invalid/missing data (expects 400)

Update the collection's `baseUrl` variable if your server isn't running on
`http://localhost:5000`.

## 7. Notes

- No data is hard-coded in the frontend; everything is fetched from the API.
- `.env` is git-ignored — never commit real database credentials.
- Sample rows in `schema.sql` are optional and can be deleted before your demo.
