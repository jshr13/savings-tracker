import { createClient } from '@/utils/supabase/server'

export default async function Home() {
  const supabase = await createClient()

  const { data: banks, error } = await supabase.from('banks').select('*')

  if (error) {
    return <div>Error loading banks: {error.message}</div>
  }

  return (
    <main>
      <h1>Banks</h1>
      {banks?.length === 0 ? (
        <p>No banks found.</p>
      ) : (
        <ul>
          {banks.map((bank) => (
            <li key={bank.id}>
              {bank.name} - {bank.annual_interest_rate}
            </li>
          ))}
        </ul>
      )}
    </main>
  )
}