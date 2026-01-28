
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://kwstslqrnnzaqllyxrxx.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt3c3RzbHFybm56YXFsbHl4cnh4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njc3Nzc2MDksImV4cCI6MjA4MzM1MzYwOX0.cbpkpnrCOFAbkNE8yL7y29_YSsAGRu4TYn2yCoZgl3k'

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function diagnostic() {
    const today = new Date().toISOString().split('T')[0]
    console.log(`[DATE] ${today}`)

    const { data: profiles } = await supabase.from('profiles').select('id, child_name, role, family_id')
    const marie = profiles?.find(p => p.child_name.toLowerCase().includes('marie'))
    if (!marie) { console.log("[ERROR] Marie not found"); return; }

    console.log(`[TARGET] Marie ID: ${marie.id}`)

    const { data: missions } = await supabase.from('missions').select('id, title, assigned_to').eq('family_id', marie.family_id)
    const { data: logs } = await supabase.from('daily_logs').select('*').eq('profile_id', marie.id).eq('date', today)

    console.log(`[LOG_COUNT] ${logs?.length || 0}`)

    logs?.forEach(l => {
        const m = missions?.find(mi => mi.id === l.mission_id)
        console.log("-------------------")
        console.log(`LOG_ID: ${l.id}`)
        console.log(`MISSION: ${m?.title || l.mission_id}`)
        console.log(`CHILD_OK: ${l.child_validated}`)
        console.log(`PARENT_OK: ${l.parent_validated}`)
        console.log(`REQ: ${l.validation_requested}`)
        console.log(`RES: ${l.validation_result}`)
    })
    console.log("-------------------")
}

diagnostic()
