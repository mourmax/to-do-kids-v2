
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://kwstslqrnnzaqllyxrxx.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt3c3RzbHFybm56YXFsbHl4cnh4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njc3Nzc2MDksImV4cCI6MjA4MzM1MzYwOX0.cbpkpnrCOFAbkNE8yL7y29_YSsAGRu4TYn2yCoZgl3k'

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function inspectSchema() {
    console.log("Inspecting Schema...")

    const tables = ['families', 'profiles', 'missions', 'challenges']

    for (const table of tables) {
        const { data, error } = await supabase.from(table).select().limit(1)
        if (error) {
            console.error(`Error reading table ${table}:`, error.message)
            continue
        }
        if (data && data.length > 0) {
            console.log(`--- TABLE: ${table} ---`)
            console.log(Object.keys(data[0]).sort().join('\n'))
            console.log('------------------------\n')
        } else {
            console.log(`\nTable: ${table} (Empty, trying to get columns via a dummy query...)`)
            // If table is empty, we can try to insert and rollback or just look at other evidence.
        }
    }
}

inspectSchema()
