export interface PublicRoutePoint { readonly latitude: number; readonly longitude: number }
export interface PrivateRoutePoint extends PublicRoutePoint { readonly elevationMeters: number | null; readonly timestamp: string | null }
export interface PrivateRouteDto { readonly kind: "private"; readonly activityId: string; readonly routePolicyVersion: string; readonly points: readonly PrivateRoutePoint[]; readonly warnings: readonly unknown[] }
export interface PublicRouteDto { readonly kind: "public"; readonly activityId: string; readonly projectionPolicyVersion: "privacy-v1"; readonly segments: readonly (readonly PublicRoutePoint[])[] }
export type AuthorizedRouteDto = PrivateRouteDto | PublicRouteDto;