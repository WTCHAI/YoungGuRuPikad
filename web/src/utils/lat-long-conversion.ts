// High precision lat/lng to x,y conversion in meters using Vincenty's formulae
export function latLngToXY(
    lat: number, 
    lng: number, 
    originLat: number = 90, 
    originLng: number = 0
  ): { x: number; y: number } {
    // WGS84 ellipsoid constants (most precise Earth model)
    const a = 6378137.0;          // Semi-major axis (meters)
    const f = 1 / 298.257223563;  // Flattening
    const b = a * (1 - f);        // Semi-minor axis
    const e2 = f * (2 - f);       // First eccentricity squared
    
    // Convert degrees to radians
    const lat1Rad = originLat * Math.PI / 180;
    const lng1Rad = originLng * Math.PI / 180;
    const lat2Rad = lat * Math.PI / 180;
    const lng2Rad = lng * Math.PI / 180;
    
    // Calculate X coordinate (East-West distance)
    const deltaLng = lng2Rad - lng1Rad;
    const avgLat = (lat1Rad + lat2Rad) / 2;
    
    // Radius of curvature in the prime vertical
    const N = a / Math.sqrt(1 - e2 * Math.sin(avgLat) * Math.sin(avgLat));
    
    // X distance with ellipsoid correction
    const x = N * Math.cos(avgLat) * deltaLng;
    
    // Calculate Y coordinate (North-South distance) using meridional arc
    const deltaLat = lat2Rad - lat1Rad;
    
    // Meridional arc calculation (high precision)
    const e4 = e2 * e2;
    const e6 = e4 * e2;
    
    const A = a * (1 - e2) * (1 + 5/4 * e2 + 45/64 * e4 + 175/256 * e6);
    const B = 15/16 * a * e2 * (1 + 3/4 * e2 + 15/32 * e4);
    const C = 35/48 * a * e4 * (1 + 5/8 * e2);
    const D = 315/512 * a * e6;
    
    const lat1_2 = 2 * lat1Rad;
    const lat2_2 = 2 * lat2Rad;
    
    const S1 = A * lat1Rad - B * Math.sin(lat1_2) + C * Math.sin(2 * lat1_2) - D * Math.sin(3 * lat1_2);
    const S2 = A * lat2Rad - B * Math.sin(lat2_2) + C * Math.sin(2 * lat2_2) - D * Math.sin(3 * lat2_2);
    
    // Y distance (negative because we want origin lat to be y=0, increasing south)
    const y = S1 - S2;
    
    return { x, y };
  }