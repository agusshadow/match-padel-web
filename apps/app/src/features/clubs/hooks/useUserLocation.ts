import { useEffect, useState } from 'react'

export type UserLocationState =
  | { status: 'loading'; coords: null }
  | { status: 'granted'; coords: [number, number] }
  | { status: 'unavailable'; coords: null }

// Browser geolocation, once per mount. Never blocks the map forever: a
// denied/unsupported/timed-out request just falls back to 'unavailable' so
// the caller can use its own default center instead.
export function useUserLocation(): UserLocationState {
  const [state, setState] = useState<UserLocationState>({ status: 'loading', coords: null })

  useEffect(() => {
    if (!('geolocation' in navigator)) {
      setState({ status: 'unavailable', coords: null })
      return
    }

    navigator.geolocation.getCurrentPosition(
      (position) =>
        setState({
          status: 'granted',
          coords: [position.coords.latitude, position.coords.longitude],
        }),
      () => setState({ status: 'unavailable', coords: null }),
      { timeout: 5000, maximumAge: 60_000 },
    )
  }, [])

  return state
}

// Haversine distance in kilometers — good enough for "clubs near me"
// sorting/display, no need for anything more precise at this scale.
export function distanceKm(
  [lat1, lng1]: [number, number],
  [lat2, lng2]: [number, number],
): number {
  const R = 6371
  const dLat = ((lat2 - lat1) * Math.PI) / 180
  const dLng = ((lng2 - lng1) * Math.PI) / 180
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLng / 2) ** 2
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}
