// Funções para interação com o Supabase

async function saveOrganogramState() {
    try {
        // Antes de salvar, atualiza o conteúdo das textareas no HTML
        orgChart.querySelectorAll('textarea').forEach(textarea => {
            textarea.innerHTML = textarea.value;
        });

        const { error } = await supabase
            .from('organograma')
            .upsert({ id: 1, html_content: orgChart.innerHTML });
        if (error) throw error;
    } catch (error) {
        console.error('Erro ao salvar no Supabase:', error);
    }
}

async function loadInitialState() {
    try {
        const { data, error } = await supabase
            .from('organograma')
            .select('html_content')
            .eq('id', 1)
            .single();

        if (error && error.code !== 'PGRST116') { // PGRST116 = row not found
            throw error;
        }

        if (data && data.html_content) {
            loadState(data.html_content);
        } else {
            loadState(initialStateHTML);
        }
    } catch (error) {
        console.error('Erro ao carregar do Supabase:', error);
        loadState(initialStateHTML); // Carrega o padrão em caso de erro
    }
} 