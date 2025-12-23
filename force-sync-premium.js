// Script para forçar sincronização do status Premium
// Cole no console do navegador (F12)

(async () => {
    // Buscar do Supabase
    const { createClient } = supabase;

    // Valores do .env
    const SUPABASE_URL = 'https://ohofwvzntzcvptoxpuqf.supabase.co';
    const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9ob2Z3dnpudHpjdnB0b3hwdXFmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzI0OTQ3NTksImV4cCI6MjA0ODA3MDc1OX0.9BPhgDR8Ds1E5nOdZf_Nq72DsVv8fQhiNoCidjc6Tw8';

    const sb = createClient(SUPABASE_URL, SUPABASE_KEY);

    const userId = localStorage.getItem('ayra_user_id');

    const { data } = await sb
        .from('ayra_cadastro')
        .select('plano')
        .eq('id', userId)
        .single();

    const isPremium = data?.plano === 'premium';

    console.log('Status Premium do Supabase:', isPremium);

    // Atualizar localStorage
    localStorage.setItem('ayra_user_premium', isPremium.toString());

    // Atualizar ayra_user_data
    const userData = JSON.parse(localStorage.getItem('ayra_user_data'));
    userData.premium = isPremium;
    localStorage.setItem('ayra_user_data', JSON.stringify(userData));

    console.log('✅ Sincronizado! Recarregue a página.');
})();
