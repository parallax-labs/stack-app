-- need to test this in a real instance
-- DOES NOT WORK
SELECT 
  in as chat,
  out as resource
FROM has_resource
WHERE out.id IN (
  SELECT id 
  FROM resource 
  WHERE url 
  IN ["https://us-east-1.console.aws.amazon.com/route53/v2/home?region=us-east-1#Dashboard"]
);



SELECT in.* as chat, out.* as resource FROM has_resource WHERE out.url IN ["https://us-east-1.console.aws.amazon.com/route53/v2/home?region=us-east-1#Dashboard"];
