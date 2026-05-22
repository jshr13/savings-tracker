export type RegisterPayload = {
  first_name: string
  last_name: string
  age: string
  email: string
  phone_number: string
  address: string
  password: string
}

export type ProfileRow = {
  id: string
  first_name: string
  last_name: string
  age: number
  email: string
  phone_number: string
  address: string
}

export type ProfileFormValues = {
  first_name: string
  last_name: string
  age: string
  email: string
  phone_number: string
  address: string
}

type UserMetadataLike = {
  first_name?: unknown
  last_name?: unknown
  age?: unknown
  email?: unknown
  phone_number?: unknown
  address?: unknown
}

function getMetadataString(value: unknown) {
  return typeof value === 'string' ? value : ''
}

export function getProfileFormValuesFromSources(params: {
  fallbackEmail?: string | null
  profile?: Partial<ProfileRow> | null
  userMetadata?: UserMetadataLike
}): ProfileFormValues {
  const { fallbackEmail, profile, userMetadata } = params
  const profileAge =
    typeof profile?.age === 'number' ? String(profile.age) : undefined
  const metadataAge =
    typeof userMetadata?.age === 'number'
      ? String(userMetadata.age)
      : typeof userMetadata?.age === 'string'
        ? userMetadata.age
        : undefined
  const metadataEmail = getMetadataString(userMetadata?.email)

  return {
    first_name:
      profile?.first_name ??
      getMetadataString(userMetadata?.first_name),
    last_name:
      profile?.last_name ??
      getMetadataString(userMetadata?.last_name),
    age: profileAge ?? metadataAge ?? '',
    email: profile?.email ?? (metadataEmail || fallbackEmail || ''),
    phone_number:
      profile?.phone_number ??
      getMetadataString(userMetadata?.phone_number),
    address:
      profile?.address ??
      getMetadataString(userMetadata?.address),
  }
}
