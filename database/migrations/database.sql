CREATE TABLE IF NOT EXISTS `products` (
	`id`	TEXT,
	`name`	TEXT,
	`price`	NUMERIC(17,2),
	PRIMARY KEY('id')
);

GO;

INSERT OR IGNORE INTO products (`id`, `name`, `price`) VALUES
('a716da8a-0966-4cd4-af36-51ad068ad68a', 'COCA-COLA LATA 350ML', 6.99),
('c1e19626-167e-4b23-87eb-c28c3bfea86f', 'SKOL LATA 350ML', 1.60),
('c254557d-3890-483b-a7ca-123be9f84f2a', 'BISCOITO AMORI CHOCOLATE 140G', 2.19);
