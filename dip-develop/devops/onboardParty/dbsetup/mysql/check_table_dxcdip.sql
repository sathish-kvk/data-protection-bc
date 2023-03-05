
SELECT count(table_name)
FROM information_schema.tables
WHERE table_schema = 'DIP'
AND table_name in ('agreement', 'element', 'rule', 'party', 'agreement_has_party')
;
