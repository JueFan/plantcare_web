const express = require('express');
const mysql = require('mysql2/promise');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3000;

// Enable CORS and JSON parsing
app.use(cors());
app.use(express.json());

// Serve static files from the website directory
app.use(express.static(path.join(__dirname)));

// Create MySQL connection pool
const pool = mysql.createPool({
    host: process.env.DB_HOST || '127.0.0.1',
    port: process.env.DB_PORT || 3307,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME || 'rhs_data',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// Search API Endpoint
app.get('/api/v1/search', async (req, res) => {
    try {
        const { q, plant_type, sunlight, hardiness_level, limit = 20, offset = 0 } = req.query;
        
        let query = 'SELECT * FROM plant_rhs_info WHERE 1=1';
        const params = [];

        // 1. Keyword search (LIKE)
        if (q) {
            query += ' AND (botanical_name LIKE ? OR common_name LIKE ? OR common_names LIKE ?)';
            const likeTerm = `%${q}%`;
            params.push(likeTerm, likeTerm, likeTerm);
        }

        // 2. Faceted filters
        if (plant_type) {
            // Data in DB looks like: ["Shrubs", "Trees"]
            query += ' AND plant_type LIKE ?';
            params.push(`%${plant_type}%`);
        }
        if (sunlight) {
            // Data in DB looks like: ["Full sun", "Partial shade"]
            query += ' AND sunlight LIKE ?';
            params.push(`%${sunlight}%`);
        }
        if (hardiness_level) {
            // DB has complex strings like: "H5 (很耐寒（-15--10°C），适合寒冷北方)"
            query += ' AND hardiness_level LIKE ?';
            params.push(`${hardiness_level}%`);
        }
        if (req.query.low_maintenance) {
            query += ' AND low_maintenance = 1';
        }

        // 3. Sorting (Default: keyword relevance/hotness, but here we just order by ID or nurseries_count as a proxy for hotness if no q)
        if (!q) {
            query += ' ORDER BY nurseries_count DESC, id ASC';
        }

        // 4. Pagination
        query += ' LIMIT ? OFFSET ?';
        params.push(parseInt(limit), parseInt(offset));

        const [rows] = await pool.query(query, params);
        
        // Format response
        res.json({
            success: true,
            data: rows,
            pagination: {
                limit: parseInt(limit),
                offset: parseInt(offset),
                count: rows.length
            }
        });
    } catch (error) {
        console.error('Database query error:', error);
        res.status(500).json({ success: false, error: 'Internal Server Error' });
    }
});

// Plant Detail API Endpoint
app.get('/api/v1/plants/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const [rows] = await pool.query('SELECT * FROM plant_rhs_info WHERE id = ?', [id]);
        
        if (rows.length === 0) {
            return res.status(404).json({ success: false, error: 'Plant not found' });
        }
        
        res.json({ success: true, data: rows[0] });
    } catch (error) {
        console.error('Database query error:', error);
        res.status(500).json({ success: false, error: 'Internal Server Error' });
    }
});

// Start server
const server = app.listen(port, () => {
    console.log(`=================================`);
    console.log(`🌱 PlantSync Local Dev Server 🏃`);
    console.log(`Server running at: http://localhost:${port}`);
    console.log(`Search page available at: http://localhost:${port}/search.html`);
    console.log(`=================================`);
});

// Handle graceful shutdown to keep process alive correctly
process.on('SIGINT', () => {
    server.close(() => {
        console.log('Server closed');
        process.exit(0);
    });
});
