"use client"

import { useEffect } from "react"

export function MetadataManager() {
    useEffect(() => {
        async function fetchSettings() {
            try {
                const res = await fetch("/api/admin/settings")
                const data = await res.json()
                if (!data.error) {
                    if (data.siteTitle) {
                        document.title = data.siteTitle
                    }
                    if (data.faviconUrl) {
                        let link: HTMLLinkElement | null = document.querySelector("link[rel~='icon']")
                        if (!link) {
                            link = document.createElement('link')
                            link.rel = 'icon'
                            document.getElementsByTagName('head')[0].appendChild(link)
                        }
                        link.href = data.faviconUrl
                    }
                }
            } catch (error) {
                console.error("Failed to fetch site metadata", error)
            }
        }
        fetchSettings()
    }, [])

    return null
}
