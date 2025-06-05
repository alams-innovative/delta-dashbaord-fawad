CREATE TABLE IF NOT EXISTS google_campaigns (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  budget DECIMAL(10,2) NOT NULL DEFAULT 0,
  start_date DATE,
  end_date DATE,
  status VARCHAR(50) DEFAULT 'Active',
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert some sample data
INSERT INTO google_campaigns (name, budget, start_date, end_date, status, notes) VALUES
('Search Campaign 2024', 50000, '2024-01-01', '2024-12-31', 'Active', 'Main search advertising campaign'),
('Display Campaign Q1', 25000, '2024-01-01', '2024-03-31', 'Completed', 'Q1 display advertising'),
('YouTube Ads Campaign', 75000, '2024-02-01', '2024-11-30', 'Active', 'Video advertising on YouTube');
