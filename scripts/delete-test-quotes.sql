-- Script para eliminar cotizaciones de prueba
-- Este script elimina registros que tienen patrones típicos de datos de prueba

-- Eliminar cotizaciones con emails de prueba
DELETE FROM public.quotes 
WHERE 
  -- Emails de prueba comunes
  email ILIKE '%test%' 
  OR email ILIKE '%prueba%'
  OR email ILIKE '%ejemplo%'
  OR email ILIKE '%demo%'
  OR email ILIKE '%fake%'
  OR email ILIKE '%temp%'
  OR email LIKE '%@test.com'
  OR email LIKE '%@example.com'
  OR email LIKE '%@prueba.com'
  
  -- Nombres de prueba comunes
  OR nombres ILIKE '%test%'
  OR nombres ILIKE '%prueba%'
  OR nombres ILIKE '%ejemplo%'
  OR nombres ILIKE '%demo%'
  
  -- Teléfonos de prueba (números secuenciales o repetidos)
  OR telefono IN ('1111111111', '2222222222', '3333333333', '4444444444', '5555555555', 
                  '6666666666', '7777777777', '8888888888', '9999999999', '0000000000',
                  '1234567890', '0123456789')
  OR telefono LIKE '111%'
  OR telefono LIKE '222%'
  OR telefono LIKE '999%'
  OR telefono LIKE '000%';

-- Mostrar cuántos registros quedan
SELECT COUNT(*) as total_cotizaciones_restantes FROM public.quotes;
