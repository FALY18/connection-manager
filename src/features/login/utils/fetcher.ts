export const fetcher = async (url: string, options?: RequestInit) => {
	const res = await fetch(url, options)
	if (!res.ok) throw new Error("Network response was not ok")
	return res.json()
}
