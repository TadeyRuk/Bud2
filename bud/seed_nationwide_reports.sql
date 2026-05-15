-- Seed 400 visible nationwide pet reports for the current Bud schema.
--
-- Run this after supabase/migrations/001_initial_schema.sql.
-- The app's Community Board reads from public.pets, so these rows are inserted
-- as pet reports instead of sightings. The script uses the first existing
-- profile as reporter_id. Sign up once in the app before running this if your
-- profiles table is empty.

DO $$
DECLARE
  seed_reporter_id UUID;
BEGIN
  SELECT id INTO seed_reporter_id
  FROM profiles
  ORDER BY created_at
  LIMIT 1;

  IF seed_reporter_id IS NULL THEN
    RAISE EXCEPTION 'No profiles found. Sign up once in the app, then rerun this seed.';
  END IF;

  WITH city_reports(seq, island_group, city, landmark, lat, lng) AS (
    VALUES
    (1, 'Luzon', 'Laoag City, Ilocos Norte', 'Aurora Park', 18.1960, 120.5927),
    (2, 'Luzon', 'Vigan City, Ilocos Sur', 'Calle Crisologo', 17.5747, 120.3869),
    (3, 'Luzon', 'San Fernando, La Union', 'Poro Point', 16.6186, 120.3100),
    (4, 'Luzon', 'Dagupan City, Pangasinan', 'Tondaligan Beach', 16.0431, 120.3333),
    (5, 'Luzon', 'Baguio City, Benguet', 'Burnham Park', 16.4023, 120.5960),
    (6, 'Luzon', 'Tabuk City, Kalinga', 'City Hall area', 17.4084, 121.4442),
    (7, 'Luzon', 'Tuguegarao City, Cagayan', 'Rizal Park', 17.6132, 121.7269),
    (8, 'Luzon', 'Cauayan City, Isabela', 'SM City Cauayan', 16.9355, 121.7723),
    (9, 'Luzon', 'Bayombong, Nueva Vizcaya', 'Capitol Park', 16.4812, 121.1497),
    (10, 'Luzon', 'Baler, Aurora', 'Sabang Beach', 15.7589, 121.5625),
    (11, 'Luzon', 'Tarlac City, Tarlac', 'Maria Cristina Park', 15.4865, 120.5897),
    (12, 'Luzon', 'Cabanatuan City, Nueva Ecija', 'Freedom Park', 15.4869, 120.9730),
    (13, 'Luzon', 'San Fernando, Pampanga', 'Capitol grounds', 15.0333, 120.6833),
    (14, 'Luzon', 'Angeles City, Pampanga', 'Marquee Mall', 15.1640, 120.6092),
    (15, 'Luzon', 'Olongapo City, Zambales', 'SM Olongapo Central', 14.8370, 120.2842),
    (16, 'Luzon', 'Balanga City, Bataan', 'Plaza Mayor', 14.6760, 120.5362),
    (17, 'Luzon', 'Malolos City, Bulacan', 'Barasoain Church', 14.8436, 120.8114),
    (18, 'Luzon', 'Quezon City, Metro Manila', 'Quezon Memorial Circle', 14.6514, 121.0493),
    (19, 'Luzon', 'Manila, Metro Manila', 'Rizal Park', 14.5826, 120.9787),
    (20, 'Luzon', 'Makati City, Metro Manila', 'Ayala Triangle', 14.5569, 121.0234),
    (21, 'Luzon', 'Pasig City, Metro Manila', 'Capitol Commons', 14.5755, 121.0656),
    (22, 'Luzon', 'Taguig City, Metro Manila', 'BGC High Street', 14.5507, 121.0507),
    (23, 'Luzon', 'Pasay City, Metro Manila', 'Mall of Asia complex', 14.5352, 120.9822),
    (24, 'Luzon', 'Antipolo City, Rizal', 'Hinulugang Taktak', 14.5886, 121.1757),
    (25, 'Luzon', 'Calamba City, Laguna', 'The Plaza', 14.2117, 121.1653),
    (26, 'Luzon', 'Santa Rosa City, Laguna', 'Solenad Nuvali', 14.2386, 121.0574),
    (27, 'Luzon', 'Tagaytay City, Cavite', 'Picnic Grove', 14.1097, 120.9836),
    (28, 'Luzon', 'Dasmarinas City, Cavite', 'Promenade area', 14.3294, 120.9367),
    (29, 'Luzon', 'Batangas City, Batangas', 'Plaza Mabini', 13.7565, 121.0583),
    (30, 'Luzon', 'Lipa City, Batangas', 'SM City Lipa', 13.9411, 121.1623),
    (31, 'Luzon', 'Lucena City, Quezon', 'Perez Park', 13.9414, 121.6239),
    (32, 'Luzon', 'Boac, Marinduque', 'Boac Cathedral', 13.4469, 121.8400),
    (33, 'Luzon', 'Calapan City, Oriental Mindoro', 'City Plaza', 13.4105, 121.1803),
    (34, 'Luzon', 'Puerto Princesa, Palawan', 'Baywalk Park', 9.7439, 118.7353),
    (35, 'Luzon', 'Coron, Palawan', 'Town plaza', 11.9986, 120.2043),
    (36, 'Luzon', 'Legazpi City, Albay', 'Penaranda Park', 13.1391, 123.7438),
    (37, 'Luzon', 'Naga City, Camarines Sur', 'SM City Naga terminal', 13.6218, 123.1948),
    (38, 'Luzon', 'Sorsogon City, Sorsogon', 'Rompeolas Baywalk', 12.9742, 124.0058),
    (39, 'Luzon', 'Daet, Camarines Norte', 'Bagasbas Beach', 14.1292, 122.9821),
    (40, 'Luzon', 'Virac, Catanduanes', 'Capitol grounds', 13.5799, 124.2306),
    (41, 'Visayas', 'Catbalogan City, Samar', 'Pier area', 11.7753, 124.8861),
    (42, 'Visayas', 'Tacloban City, Leyte', 'Balyuan Amphitheater', 11.2443, 125.0050),
    (43, 'Visayas', 'Ormoc City, Leyte', 'City plaza', 11.0064, 124.6075),
    (44, 'Visayas', 'Maasin City, Southern Leyte', 'City hall grounds', 10.1336, 124.8447),
    (45, 'Visayas', 'Borongan City, Eastern Samar', 'Baybay Boulevard', 11.6070, 125.4310),
    (46, 'Visayas', 'Naval, Biliran', 'Port area', 11.5606, 124.3972),
    (47, 'Visayas', 'Roxas City, Capiz', 'People''s Park', 11.5853, 122.7511),
    (48, 'Visayas', 'Kalibo, Aklan', 'Magsaysay Park', 11.7061, 122.3648),
    (49, 'Visayas', 'Malay, Aklan', 'Caticlan Jetty Port', 11.9253, 121.9497),
    (50, 'Visayas', 'San Jose de Buenavista, Antique', 'Evelio Javier Freedom Park', 10.7469, 121.9441),
    (51, 'Visayas', 'Iloilo City, Iloilo', 'Iloilo Esplanade', 10.7057, 122.5644),
    (52, 'Visayas', 'Passi City, Iloilo', 'City plaza', 11.1078, 122.6419),
    (53, 'Visayas', 'Bacolod City, Negros Occidental', 'Capitol Lagoon', 10.6765, 122.9509),
    (54, 'Visayas', 'Talisay City, Negros Occidental', 'The Ruins', 10.7310, 122.9700),
    (55, 'Visayas', 'Dumaguete City, Negros Oriental', 'Rizal Boulevard', 9.3068, 123.3054),
    (56, 'Visayas', 'Bayawan City, Negros Oriental', 'Bayawan Boulevard', 9.3649, 122.8040),
    (57, 'Visayas', 'Cebu City, Cebu', 'IT Park', 10.3318, 123.9066),
    (58, 'Visayas', 'Mandaue City, Cebu', 'Parkmall area', 10.3342, 123.9381),
    (59, 'Visayas', 'Lapu-Lapu City, Cebu', 'Mactan Shrine', 10.3103, 124.0152),
    (60, 'Visayas', 'Toledo City, Cebu', 'Port area', 10.3773, 123.6386),
    (61, 'Visayas', 'Tagbilaran City, Bohol', 'Plaza Rizal', 9.6496, 123.8536),
    (62, 'Visayas', 'Panglao, Bohol', 'Public market', 9.5787, 123.7459),
    (63, 'Visayas', 'Siquijor, Siquijor', 'Port terminal', 9.2140, 123.5150),
    (64, 'Visayas', 'Bantayan, Cebu', 'Municipal plaza', 11.1674, 123.7228),
    (65, 'Mindanao', 'Zamboanga City, Zamboanga del Sur', 'Paseo del Mar', 6.9047, 122.0760),
    (66, 'Mindanao', 'Pagadian City, Zamboanga del Sur', 'Rotonda', 7.8257, 123.4370),
    (67, 'Mindanao', 'Dipolog City, Zamboanga del Norte', 'Boulevard', 8.5883, 123.3409),
    (68, 'Mindanao', 'Dapitan City, Zamboanga del Norte', 'Rizal Shrine', 8.6544, 123.4243),
    (69, 'Mindanao', 'Ipil, Zamboanga Sibugay', 'Municipal plaza', 7.7844, 122.5867),
    (70, 'Mindanao', 'Isabela City, Basilan', 'Port area', 6.7041, 121.9712),
    (71, 'Mindanao', 'Jolo, Sulu', 'Capitol grounds', 6.0522, 121.0022),
    (72, 'Mindanao', 'Bongao, Tawi-Tawi', 'Chinese Pier', 5.0292, 119.7731),
    (73, 'Mindanao', 'Cagayan de Oro, Misamis Oriental', 'Limketkai Center', 8.4822, 124.6472),
    (74, 'Mindanao', 'El Salvador City, Misamis Oriental', 'Divine Mercy Shrine road', 8.5630, 124.5218),
    (75, 'Mindanao', 'Malaybalay City, Bukidnon', 'Capitol grounds', 8.1575, 125.1278),
    (76, 'Mindanao', 'Valencia City, Bukidnon', 'City oval', 7.9042, 125.0928),
    (77, 'Mindanao', 'Iligan City, Lanao del Norte', 'Paseo de Santiago', 8.2280, 124.2452),
    (78, 'Mindanao', 'Marawi City, Lanao del Sur', 'Provincial capitol area', 8.0034, 124.2839),
    (79, 'Mindanao', 'Ozamiz City, Misamis Occidental', 'Cotta Fort', 8.1465, 123.8443),
    (80, 'Mindanao', 'Oroquieta City, Misamis Occidental', 'City plaza', 8.4859, 123.8048),
    (81, 'Mindanao', 'Butuan City, Agusan del Norte', 'Guingona Park', 8.9475, 125.5406),
    (82, 'Mindanao', 'Cabadbaran City, Agusan del Norte', 'City plaza', 9.1226, 125.5355),
    (83, 'Mindanao', 'Bayugan City, Agusan del Sur', 'Rotonda', 8.7561, 125.7675),
    (84, 'Mindanao', 'Surigao City, Surigao del Norte', 'City boulevard', 9.7890, 125.4950),
    (85, 'Mindanao', 'Tandag City, Surigao del Sur', 'Capitol grounds', 9.0783, 126.1986),
    (86, 'Mindanao', 'Bislig City, Surigao del Sur', 'Baywalk', 8.2153, 126.3167),
    (87, 'Mindanao', 'Davao City, Davao del Sur', 'People''s Park', 7.0644, 125.6082),
    (88, 'Mindanao', 'Tagum City, Davao del Norte', 'City hall grounds', 7.4478, 125.8076),
    (89, 'Mindanao', 'Panabo City, Davao del Norte', 'Freedom Park', 7.3081, 125.6841),
    (90, 'Mindanao', 'Digos City, Davao del Sur', 'Rizal Park', 6.7497, 125.3572),
    (91, 'Mindanao', 'Mati City, Davao Oriental', 'Baywalk', 6.9551, 126.2166),
    (92, 'Mindanao', 'Nabunturan, Davao de Oro', 'Municipal plaza', 7.6078, 125.9665),
    (93, 'Mindanao', 'Kidapawan City, Cotabato', 'City plaza', 7.0083, 125.0894),
    (94, 'Mindanao', 'Koronadal City, South Cotabato', 'City hall grounds', 6.4997, 124.8469),
    (95, 'Mindanao', 'General Santos City, South Cotabato', 'Oval Plaza', 6.1164, 125.1716),
    (96, 'Mindanao', 'Tacurong City, Sultan Kudarat', 'City plaza', 6.6925, 124.6764),
    (97, 'Mindanao', 'Cotabato City, Maguindanao del Norte', 'People''s Palace', 7.2236, 124.2464),
    (98, 'Mindanao', 'Midsayap, Cotabato', 'Municipal plaza', 7.1910, 124.5305),
    (99, 'Mindanao', 'Polomolok, South Cotabato', 'Public market', 6.2217, 125.0639),
    (100, 'Mindanao', 'Alabel, Sarangani', 'Capitol complex', 6.1018, 125.2905)
  ),
  ring0_slots AS (
    SELECT gs AS slot_index, ((gs - 1) % 100) + 1 AS city_seq, 0 AS ring
    FROM generate_series(1, 100) AS gs
  ),
  ring1_slots AS (
    SELECT gs + 100 AS slot_index, ((gs - 1) % 100) + 1 AS city_seq, 1 AS ring
    FROM generate_series(1, 100) AS gs
  ),
  ring2_slots AS (
    SELECT gs + 200 AS slot_index, ((gs - 1) % 100) + 1 AS city_seq, 2 AS ring
    FROM generate_series(1, 100) AS gs
  ),
  metro_slots AS (
    SELECT
      300 + ROW_NUMBER() OVER (ORDER BY city_reports.seq, bonus.ring) AS slot_index,
      city_reports.seq AS city_seq,
      bonus.ring
    FROM city_reports
    CROSS JOIN (VALUES (1), (2)) AS bonus(ring)
    WHERE
      city_reports.city LIKE '%Metro Manila%'
      OR city_reports.city LIKE '%Cebu City, Cebu%'
      OR city_reports.city LIKE '%Davao City, Davao%'
      OR city_reports.city LIKE '%Iloilo City, Iloilo%'
      OR city_reports.city LIKE '%Cagayan de Oro, Misamis Oriental%'
      OR city_reports.city LIKE '%Zamboanga City, Zamboanga del Sur%'
  ),
  rural_slots AS (
    SELECT
      322 + gs AS slot_index,
      ((gs - 1) % 100) + 1 AS city_seq,
      3 AS ring
    FROM generate_series(1, 78) AS gs
  ),
  all_slots AS (
    SELECT * FROM ring0_slots
    UNION ALL SELECT * FROM ring1_slots
    UNION ALL SELECT * FROM ring2_slots
    UNION ALL SELECT * FROM metro_slots
    UNION ALL SELECT * FROM rural_slots
  ),
  seed_rows AS (
    SELECT
      all_slots.slot_index,
      city_reports.*,
      all_slots.ring,
      (
        substr(md5('bud-visible-report-' || all_slots.slot_index), 1, 8) || '-' ||
        substr(md5('bud-visible-report-' || all_slots.slot_index), 9, 4) || '-' ||
        substr(md5('bud-visible-report-' || all_slots.slot_index), 13, 4) || '-' ||
        substr(md5('bud-visible-report-' || all_slots.slot_index), 17, 4) || '-' ||
        substr(md5('bud-visible-report-' || all_slots.slot_index), 21, 12)
      )::uuid AS report_id,
      (ARRAY['Mochi','Kape','Tala','Puti','Bantay','Saging','Panda','Ming','Nori','Datu','Kiko','Bituin'])[((all_slots.slot_index - 1) % 12) + 1] AS pet_name,
      (ARRAY['Shih Tzu','Aspin','Siamese mix','Puspin','Labrador mix','Domestic Shorthair','Corgi','Puspin','Persian','German Shepherd','Beagle','Domestic Longhair'])[((all_slots.slot_index - 1) % 12) + 1] AS breed,
      (ARRAY['White and tan','Brown','Cream and gray','White','Black','Ginger','Black, white, and tan','Calico','Gray','Black and tan','Tri-color','Tortoiseshell'])[((all_slots.slot_index - 1) % 12) + 1] AS fur_color,
      (ARRAY['Pink harness','Blue collar','Purple collar','No collar','Green collar','Yellow ribbon','Red bandana','No collar','Teal collar','Black collar','Orange leash','Bell collar'])[((all_slots.slot_index - 1) % 12) + 1] AS color,
      (ARRAY['dog','dog','cat','cat','dog','cat','dog','cat','cat','dog','dog','cat'])[((all_slots.slot_index - 1) % 12) + 1] AS pet_type,
      (ARRAY['Female','Male','Female','Male','Male','Male','Female','Female','Male','Male','Male','Female'])[((all_slots.slot_index - 1) % 12) + 1] AS gender,
      CASE WHEN all_slots.slot_index % 3 = 0 THEN 'FOUND' ELSE 'LOST' END AS pet_status,
      (
        sin(all_slots.slot_index * 127.1 + all_slots.slot_index * 311.7) * 43758.5453
        - trunc(sin(all_slots.slot_index * 127.1 + all_slots.slot_index * 311.7) * 43758.5453)
      ) AS unit_a,
      (
        sin((all_slots.slot_index + 1) * 127.1 + (all_slots.slot_index + 1) * 311.7) * 43758.5453
        - trunc(sin((all_slots.slot_index + 1) * 127.1 + (all_slots.slot_index + 1) * 311.7) * 43758.5453)
      ) AS unit_b
    FROM all_slots
    JOIN city_reports ON city_reports.seq = all_slots.city_seq
  )
  INSERT INTO pets (
    id,
    reporter_id,
    name,
    breed,
    color,
    fur_color,
    gender,
    status,
    type,
    location_text,
    lat,
    lng,
    image_url,
    description,
    created_at,
    updated_at
  )
  SELECT
    report_id,
    seed_reporter_id,
    pet_name || ' #' || lpad(slot_index::text, 3, '0'),
    breed,
    color,
    fur_color,
    gender,
    pet_status::pet_status,
    pet_type::pet_type,
    landmark || ', ' || city,
  ROUND(
    (
      lat + (
        (
          CASE
            WHEN ring = 0 THEN 0
            WHEN ring = 3 THEN 0.15
            ELSE 0.04
          END
        ) + (
          CASE
            WHEN ring = 0 THEN unit_b * 0.5 * 0.003
            WHEN ring = 3 THEN unit_b * (0.35 - 0.15)
            ELSE unit_b * (0.12 - 0.04)
          END
        )
      ) * cos(unit_a * 2 * pi())
    )::numeric,
    6
  ),
  ROUND(
    (
      lng + (
        (
          CASE
            WHEN ring = 0 THEN 0
            WHEN ring = 3 THEN 0.15
            ELSE 0.04
          END
        ) + (
          CASE
            WHEN ring = 0 THEN unit_b * 0.5 * 0.003
            WHEN ring = 3 THEN unit_b * (0.35 - 0.15)
            ELSE unit_b * (0.12 - 0.04)
          END
        )
      ) * sin(unit_a * 2 * pi())
    )::numeric,
    6
  ),
    CASE pet_type
      WHEN 'dog' THEN 'https://images.unsplash.com/photo-1587300003388-59208cc962cb?auto=format&fit=crop&w=1200&q=80'
      ELSE 'https://images.unsplash.com/photo-1573865526739-10659fec78a5?auto=format&fit=crop&w=1200&q=80'
    END,
    'Nationwide seed report in ' || island_group || ': ' || pet_name || ' was ' ||
      CASE WHEN pet_status = 'FOUND' THEN 'found near ' ELSE 'last seen near ' END ||
      landmark || ', ' || city || '.',
    now() - (slot_index || ' hours')::interval,
    now() - (slot_index || ' hours')::interval
  FROM seed_rows
  ON CONFLICT (id) DO UPDATE SET
    reporter_id = EXCLUDED.reporter_id,
    name = EXCLUDED.name,
    breed = EXCLUDED.breed,
    color = EXCLUDED.color,
    fur_color = EXCLUDED.fur_color,
    gender = EXCLUDED.gender,
    status = EXCLUDED.status,
    type = EXCLUDED.type,
    location_text = EXCLUDED.location_text,
    lat = EXCLUDED.lat,
    lng = EXCLUDED.lng,
    image_url = EXCLUDED.image_url,
    description = EXCLUDED.description,
    updated_at = now();
END $$;

SELECT
  count(*) AS seeded_nationwide_pet_reports
FROM pets
WHERE id IN (
  SELECT (
    substr(md5('bud-visible-report-' || seq), 1, 8) || '-' ||
    substr(md5('bud-visible-report-' || seq), 9, 4) || '-' ||
    substr(md5('bud-visible-report-' || seq), 13, 4) || '-' ||
    substr(md5('bud-visible-report-' || seq), 17, 4) || '-' ||
    substr(md5('bud-visible-report-' || seq), 21, 12)
  )::uuid
  FROM generate_series(1, 400) AS seq
);
