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
