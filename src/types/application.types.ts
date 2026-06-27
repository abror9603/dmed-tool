export type ApplicationType = 'CLINIC' | 'LAB'

export const APPLICATION_TYPES = ['CLINIC', 'LAB'] as const satisfies readonly ApplicationType[]
