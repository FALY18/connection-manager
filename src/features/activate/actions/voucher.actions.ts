import { base_url } from "../../../constants/urls"
import { fetcher } from "@/utils/fetcher"
import type { ActivateVoucherResponse } from "../types/voucher"

/**
 * Active un voucher côté backend.
 * Cette fonction est volontairement pure :
 *  - aucun state
 *  - aucune dépendance UI
 *  - uniquement I/O réseau
 */
export const activateVoucher = async (
	code: string,
	deviceMac?: string,
	ipAddress?: string
): Promise<ActivateVoucherResponse> => {
	if (!code) {
		throw new Error("Voucher code is required")
	}

	const payload = {
		code,
		device_mac: deviceMac || "00:00:00:00:00:00",
		ip_address: ipAddress || "0.0.0.0",
	}

	return fetcher<ActivateVoucherResponse>(`${base_url}/vouchers/activate`, {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
		},
		body: JSON.stringify(payload),
	})
}
