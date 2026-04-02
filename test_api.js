const mysql = require('mysql2/promise');
const http = require('http');
require('dotenv').config();

const SERVER_URL = `http://localhost:${process.env.PORT || 3000}`;

async function runTests() {
    console.log('==================================================');
    console.log('🌱 PlantSync Search & Detail API Test Suite');
    console.log('==================================================\n');

    let pool;
    try {
        // 1. Connect to local DB to get test data
        console.log('[1/5] Connecting to local MySQL database...');
        pool = mysql.createPool({
            host: process.env.DB_HOST || '127.0.0.1',
            port: process.env.DB_PORT || 3307,
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASSWORD,
            database: process.env.DB_NAME || 'rhs_data',
        });
        console.log('✅ Database connected successfully.\n');

        // 2. Fetch 5 random plants with common names
        console.log('[2/5] Fetching 5 random plants for testing...');
        const [rows] = await pool.query('SELECT id, common_name, botanical_name FROM plant_rhs_info WHERE common_name IS NOT NULL AND common_name != "" LIMIT 5');
        
        if (rows.length === 0) {
            throw new Error('No test data found in database.');
        }
        
        const testPlants = rows;
        console.log(`✅ Selected ${testPlants.length} plants for testing:\n`);
        testPlants.forEach((p, i) => console.log(`  ${i+1}. ID: ${p.id}, Name: ${p.common_name} (${p.botanical_name})`));
        console.log('');

        // 3. Test Search API
        console.log('[3/5] Testing Search API (/api/v1/search)...');
        let searchPassed = 0;
        for (const plant of testPlants) {
            const queryWord = encodeURIComponent(plant.common_name);
            const url = `${SERVER_URL}/api/v1/search?q=${queryWord}`;
            
            const result = await fetchJson(url);
            if (result && result.success && result.data.length > 0) {
                console.log(`  ✅ PASS: Searched for "${plant.common_name}" -> Found ${result.data.length} results.`);
                searchPassed++;
            } else {
                console.error(`  ❌ FAIL: Searched for "${plant.common_name}" -> No results or error.`);
            }
        }
        console.log(`\n  Search API Result: ${searchPassed}/${testPlants.length} passed.\n`);

        // 4. Test Filter API (Faceted Search)
        console.log('[4/5] Testing Faceted Search Filters...');
        const filterTests = [
            { name: 'Shrubs', url: `${SERVER_URL}/api/v1/search?plant_type=Shrubs` },
            { name: 'Full sun', url: `${SERVER_URL}/api/v1/search?sunlight=Full%20sun` },
            { name: 'Low Maintenance', url: `${SERVER_URL}/api/v1/search?low_maintenance=1` }
        ];

        let filterPassed = 0;
        for (const test of filterTests) {
            const result = await fetchJson(test.url);
            if (result && result.success && result.data.length >= 0) {
                 console.log(`  ✅ PASS: Filter by "${test.name}" -> Found ${result.data.length} results.`);
                 filterPassed++;
            } else {
                 console.error(`  ❌ FAIL: Filter by "${test.name}" failed.`);
            }
        }
        console.log(`\n  Filter API Result: ${filterPassed}/${filterTests.length} passed.\n`);

        // 5. Test Plant Detail API
        console.log('[5/5] Testing Plant Detail API (/api/v1/plants/:id)...');
        let detailPassed = 0;
        for (const plant of testPlants) {
            const url = `${SERVER_URL}/api/v1/plants/${plant.id}`;
            const result = await fetchJson(url);
            if (result && result.success && result.data && result.data.id === plant.id) {
                console.log(`  ✅ PASS: Fetched details for ID ${plant.id} (${result.data.common_name})`);
                detailPassed++;
            } else {
                console.error(`  ❌ FAIL: Failed to fetch details for ID ${plant.id}`);
            }
        }
        console.log(`\n  Detail API Result: ${detailPassed}/${testPlants.length} passed.\n`);

        // Summary
        console.log('==================================================');
        console.log('🎉 ALL TESTS COMPLETED.');
        console.log('==================================================');

    } catch (error) {
        console.error('❌ TEST SCRIPT FAILED:', error);
    } finally {
        if (pool) await pool.end();
    }
}

// Helper to wrap HTTP GET into Promise
function fetchJson(url) {
    return new Promise((resolve, reject) => {
        http.get(url, (res) => {
            let data = '';
            res.on('data', (chunk) => { data += chunk; });
            res.on('end', () => {
                try {
                    resolve(JSON.parse(data));
                } catch (e) {
                    reject(new Error(`Failed to parse JSON from ${url}. Status: ${res.statusCode}`));
                }
            });
        }).on('error', reject);
    });
}

runTests();