-- Research Opportunity Portal - Database Schema
-- Run this once against your MySQL server to create the database and table.

CREATE DATABASE IF NOT EXISTS research_opportunity_portal;
USE research_opportunity_portal;

CREATE TABLE IF NOT EXISTS opportunities (
    id                   INT AUTO_INCREMENT PRIMARY KEY,
    title                VARCHAR(200)  NOT NULL,
    description          TEXT          NOT NULL,
    research_area        VARCHAR(150)  NOT NULL,
    faculty_name         VARCHAR(150)  NOT NULL,
    department           VARCHAR(150)  NOT NULL,
    required_skills      VARCHAR(500)  NOT NULL,
    positions_available  INT           NOT NULL DEFAULT 1,
    application_deadline DATE          NOT NULL,
    status               ENUM('Open', 'Closed') NOT NULL DEFAULT 'Open',
    created_at           TIMESTAMP     DEFAULT CURRENT_TIMESTAMP,
    updated_at           TIMESTAMP     DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Optional sample data. Safe to delete before the real demo.
INSERT INTO opportunities
    (title, description, research_area, faculty_name, department, required_skills, positions_available, application_deadline, status)
VALUES
    ('Machine Learning for Crop Yield Prediction',
     'Build ML models that predict crop yield from satellite imagery and weather data for smallholder farms.',
     'Machine Learning',
     'Dr. Ayesha Khan',
     'Computer Science',
     'Python, scikit-learn, basic remote sensing',
     2,
     '2026-11-15',
     'Open'),
    ('Low-Cost Water Quality Sensors',
     'Design and field-test low-cost IoT sensors for monitoring water quality in rural communities.',
     'IoT / Embedded Systems',
     'Dr. Bilal Ahmed',
     'Electrical Engineering',
     'Arduino, C++, basic circuit design',
     3,
     '2026-10-30',
     'Open'),
    ('Urdu Sentiment Analysis on Social Media',
     'Collect and annotate Urdu-language social media posts and train sentiment classification models.',
     'Natural Language Processing',
     'Dr. Sana Riaz',
     'Computer Science',
     'Python, NLP basics, willingness to annotate data',
     4,
     '2026-09-20',
     'Closed'),
    ('Air Quality Monitoring with Low-Cost Sensors',
     'Deploy and calibrate low-cost sensors to track urban air pollution across the city.',
     'Environmental Science', 'Dr. Farah Naeem', 'Environmental Sciences',
     'Data analysis, basic electronics, Python', 2, '2026-09-30', 'Closed');