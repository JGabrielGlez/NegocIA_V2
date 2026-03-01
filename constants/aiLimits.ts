/**
 * Límites de consultas de IA por plan
 *
 * Este archivo es la fuente de verdad única para los límites.
 * Debe ser importado tanto en el frontend como en el backend.
 */

export const PLAN_LIMITS = {
    GRATIS: 3, // 3 consultas por mes
    PRO: 30, // 30 consultas por mes
} as const;

export type Plan = keyof typeof PLAN_LIMITS;
