import { STATUS_COLORS, STATUS_LABELS } from "../constants/colors"

export const getStatusColor = (status: string) => STATUS_COLORS[status] ?? STATUS_COLORS.expired
export const getStatusLabel = (status: string) => STATUS_LABELS[status] ?? status
