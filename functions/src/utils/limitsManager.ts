/**
 * Utilidad para gestionar límites de uso de IA
 */

/**
 * Verificar si el usuario puede hacer una consulta
 * @param userId - UID del usuario
 * @param plan - Plan del usuario ("GRATIS" | "PRO")
 * @returns true si puede hacer consulta, false si ha alcanzado el límite
 */
export async function checkIfCanQuery(
    userId: string,
    plan: string,
): Promise<boolean> {
    // TODO: Implementar lógica de verificación de límites
    throw new Error("checkIfCanQuery no implementado aún");
}

/**
 * Incrementar el contador de consultas del usuario
 * @param userId - UID del usuario
 */
export async function incrementQueryCount(userId: string): Promise<void> {
    // TODO: Implementar lógica para incrementar contador
    throw new Error("incrementQueryCount no implementado aún");
}

/**
 * Obtener cantidad de consultas restantes en el ciclo actual
 * @param userId - UID del usuario
 * @param plan - Plan del usuario ("GRATIS" | "PRO")
 * @returns Número de consultas restantes
 */
export async function getQueriesRemaining(
    userId: string,
    plan: string,
): Promise<number> {
    // TODO: Implementar lógica para obtener consultas restantes
    throw new Error("getQueriesRemaining no implementado aún");
}
